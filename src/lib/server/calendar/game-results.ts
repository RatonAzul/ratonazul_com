import { inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { listGames } from '$lib/server/games-api';
import { games, isaacDay, recordDate, type Game, type GameRecord } from '$lib/utils/games';
import { gameResultSummary } from '$lib/utils/game-result-summary';
import { calendarDate, calendarEventsRequest } from './events';

type CalendarTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function withCalendarGameLock<T>(game: Game, run: (tx: CalendarTransaction) => Promise<T>) {
    return db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`calendar-game-result:${game}`})::bigint)`);
        return run(tx);
    });
}

async function playerNames(tx: CalendarTransaction, records: GameRecord[]) {
    const ids = [...new Set(records.map((record) => record.user_id))];
    if (!ids.length) return new Map<string, string>();
    const players = await tx.select({ id: user.id, name: user.name }).from(user).where(inArray(user.id, ids));
    return new Map(players.map((player) => [player.id, player.name]));
}

function summarize(game: Game, records: GameRecord[], names: Map<string, string>) {
    if (records.some((record) => !names.has(record.user_id))) return '';
    return gameResultSummary(game, records, (id) => names.get(id)!);
}

async function publish(game: Game, date: string, summary: string, actor: string) {
    await calendarEventsRequest(`/game-results/${game}/${date}`, actor, 'PUT', { summary });
}

type GameResultType = { game: Game; type_id: number };

export async function calendarGameResultTypes(actor: string) {
    return calendarEventsRequest<GameResultType[]>('/game-result-types', actor);
}

export async function syncCalendarGameResults(game: Game, dates: string[], actor: string) {
    const calendarDates = [...new Set(dates)].filter(calendarDate);
    if (!calendarDates.length) return;

    // Serialize the read-and-publish step for concurrent saves of the same game.
    await withCalendarGameLock(game, async (tx) => {
        for (const date of calendarDates) {
            const filters: Record<string, string> = game === 'isaaconnect' ? { day: String(isaacDay(date)) } : { date };
            const records = await listGames<GameRecord>(games[game].endpoint, actor, filters);
            const names = await playerNames(tx, records);
            await publish(game, date, summarize(game, records, names), actor);
        }
    });
}

export async function populateCalendarGameResults(game: Game, actor: string) {
    return withCalendarGameLock(game, async (tx) => {
        const mappings = await calendarGameResultTypes(actor);
        if (!mappings.some((mapping) => mapping.game === game)) return null;

        const today = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: 'Europe/Madrid' }).format();
        const records = await listGames<GameRecord>(games[game].endpoint, actor);
        const lastIsaacDay = isaacDay(today);
        const byDate = new Map<string, GameRecord[]>();
        for (const record of records) {
            if (!('date' in record) && record.day > lastIsaacDay) continue;
            const date = recordDate(record);
            if (!calendarDate(date) || date > today) continue;
            const daily = byDate.get(date);
            if (daily) daily.push(record);
            else byDate.set(date, [record]);
        }

        const names = await playerNames(tx, [...byDate.values()].flat());
        const summaries = [...byDate].flatMap(([date, daily]) => {
            const summary = summarize(game, daily, names);
            return summary ? [{ date, summary }] : [];
        });

        // Bound parallel requests and wait for all writes in each batch before
        // releasing the lock. A retry updates the same game/date events.
        const batchSize = 8;
        for (let offset = 0; offset < summaries.length; offset += batchSize) {
            const outcomes = await Promise.allSettled(summaries.slice(offset, offset + batchSize).map(
                ({ date, summary }) => publish(game, date, summary, actor)
            ));
            const failure = outcomes.find((outcome) => outcome.status === 'rejected');
            if (failure) throw failure.reason;
        }
        return summaries.length;
    });
}
