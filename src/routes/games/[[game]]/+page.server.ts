import { error } from '@sveltejs/kit';
import { listGames } from '$lib/server/games-api';
import { gamePairForViewer } from '$lib/server/games/access';
import { gameResultOutcome, rankGameResults } from '$lib/utils/game-result-summary';
import { games, isGame, recordDate, validDate, type Game, type GameRecord } from '$lib/utils/games';
import { calendarMonths, calendarWeekRange } from '$lib/utils/shared/calendar';
import type { PageServerLoad } from './$types';

const firstDate = '2026-08-01';
const madridDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', dateStyle: 'short' });
const gameIds = Object.keys(games) as Game[];

function displayResult(record: GameRecord | undefined) {
    if (!record) return null;
    if ('points' in record) {
        const minutes = String(Math.floor(record.time / 60)).padStart(2, '0');
        const seconds = String(record.time % 60).padStart(2, '0');
        return { rows: record.board, score: record.points + '/4', points: record.points, lives: record.lifes, time: minutes + ':' + seconds };
    }
    return {
        score: (record.score === 7 ? 'X' : record.score) + '/6',
        rows: record.board.match(/.{5}/g) ?? [],
        words: record.words ?? []
    };
}

export const load: PageServerLoad = async ({ locals, params, url, setHeaders }) => {
    const game = params.game;
    if (game !== undefined && !isGame(game)) error(404, 'Game not found.');
    const tab = url.searchParams.get('tab');
    const period = tab === 'weekly' || tab === 'monthly' || tab === 'global' ? tab : 'daily';
    const scope = { game, period } as const;
    setHeaders({ 'Cache-Control': 'private, no-store' });
    if (!locals.user) return { ...scope, matchup: null };
    const viewer = locals.user.id;
    const players = await gamePairForViewer(viewer);
    if (!players) return { ...scope, matchup: null };

    const today = madridDate.format(new Date());
    const date = url.searchParams.get('date') ?? today;
    if (!validDate(date) || date < firstDate || date > today) error(400, 'Choose a past or current game date.');

    const year = date.slice(0, 4);
    const selectedGames = game ? [game] : gameIds;
    const results = await Promise.allSettled(selectedGames.map(async game => {
        const histories = await Promise.all(players.map(player =>
            listGames<GameRecord>(games[game].endpoint, viewer, { user_id: player.id })
        ));
        const byDate = new Map<string, GameRecord[]>();
        for (const record of histories.flat()) {
            const day = recordDate(record);
            if (day < firstDate || day > today) continue;
            const records = byDate.get(day);
            if (records) records.push(record);
            else byDate.set(day, [record]);
        }

        return new Map([...byDate].map(([day, records]) => {
            const ordered = rankGameResults(game, records);
            const first = ordered.find(record => record.user_id === players[0].id);
            const second = ordered.find(record => record.user_id === players[1].id);
            return [day, {
                outcome: first && second ? gameResultOutcome(first, second) : null,
                results: [first, second]
            }] as const;
        }));
    }));

    const scores = new Map<string, [number, number]>();
    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const [day, { outcome }] of result.value) {
            if (!outcome) continue;
            const score = scores.get(day) ?? [0, 0];
            if (outcome === 'first') score[0]++;
            if (outcome === 'second') score[1]++;
            scores.set(day, score);
        }
    }

    function matchupsForDay(day: string, wordlesOnly = false) {
        return results.flatMap((result, index) => {
            const game = selectedGames[index];
            if (wordlesOnly && game === 'isaaconnect') return [];
            const matchup = result.status === 'fulfilled' ? result.value.get(day) : undefined;
            return [{
                game,
                available: result.status === 'fulfilled',
                outcome: matchup?.outcome ?? null,
                results: matchup?.results.map(displayResult) ?? [null, null]
            }];
        });
    }

    const matchups = matchupsForDay(date);
    const { start, end } = calendarWeekRange(date);
    const month = date.slice(0, 7);
    let dates: string[] = [];
    if (period === 'weekly' && game !== 'isaaconnect') {
        dates = Array.from({ length: 7 }, (_, index) => {
            const day = new Date(start);
            day.setUTCDate(day.getUTCDate() + index);
            return day.toISOString().slice(0, 10);
        });
    } else if (period === 'monthly') {
        dates = calendarMonths(Number(year))[Number(date.slice(5, 7)) - 1].dates;
    } else if (period === 'global') {
        const recordedDates = new Set<string>();
        for (const result of results) {
            if (result.status === 'fulfilled') {
                for (const day of result.value.keys()) recordedDates.add(day);
            }
        }
        dates = [...recordedDates].sort().reverse();
    }

    const pageSize = 7;
    const pageCount = Math.max(1, Math.ceil(dates.length / pageSize));
    const requestedPage = Number(url.searchParams.get('page'));
    const pageNumber = Number.isSafeInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
    const pageStart = (pageNumber - 1) * pageSize;
    const days = dates.slice(pageStart, pageStart + pageSize).map(date => ({
        date,
        matchups: date >= firstDate && date <= today ? matchupsForDay(date, period === 'weekly') : []
    }));
    const complete = matchups.every(matchup => matchup.available);
    const calendar: Record<string, 'first' | 'second' | 'draw'> = {};
    const totals = {
        daily: scores.get(date) ?? [0, 0],
        weekly: [0, 0],
        monthly: [0, 0],
        global: [0, 0]
    };
    if (complete) {
        for (const [day, [left, right]] of scores) {
            if (day.startsWith(year + '-')) {
                calendar[day] = left === right ? 'draw' : left > right ? 'first' : 'second';
            }
            if (left === right) continue;

            const winner = left > right ? 0 : 1;
            totals.global[winner]++;
            if (day.startsWith(month + '-')) totals.monthly[winner]++;
            if (day >= start && day < end) totals.weekly[winner]++;
        }
    }

    return { ...scope, matchup: { date, today, firstDate, players, matchups, days, pageNumber, pageCount, totals, calendar: complete ? calendar : null } };
};
