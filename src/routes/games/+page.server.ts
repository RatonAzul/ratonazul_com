import { error } from '@sveltejs/kit';
import { listGames } from '$lib/server/games-api';
import { duelSetup, setGamePreference } from '$lib/server/games/access';
import { rankingRows, submittedGameDates } from '$lib/server/games/result-visibility';
import { submitResult } from '$lib/server/games/submit-result';
import { currentGameDate, firstGameDate } from '$lib/server/games/results';
import { compareGamePair, displayGameResult, gameResultScore, rankGameResults } from '$lib/utils/game-result-summary';
import { games, isGame, puzzleDay, recordDate, type Game, type GameRecord } from '$lib/utils/games';
import { calendarWeekRange } from '$lib/utils/shared/calendar';
import type { Actions, PageServerLoad } from './$types';

const gameIds = Object.keys(games) as Game[];
const previewLimit = 3;

function readPeriod(value: string | null): 'daily' | 'weekly' | 'monthly' | 'global' {
    return value === 'weekly' || value === 'monthly' || value === 'global' ? value : 'daily';
}

export const load: PageServerLoad = async ({ locals, setHeaders, url }) => {
    setHeaders({ 'Cache-Control': 'private, no-store' });
    const viewerId = locals.user?.id;
    const date = currentGameDate();
    const duelPeriod = readPeriod(url.searchParams.get('duel'));
    const resultsPeriod = readPeriod(url.searchParams.get('results'));
    const reader = viewerId ?? 'public-games';
    const { start, end } = calendarWeekRange(date);

    function inPeriod(day: string, period: ReturnType<typeof readPeriod>) {
        if (period === 'daily') return day === date;
        if (period === 'weekly') return day >= start && day < end;
        if (period === 'monthly') return day.slice(0, 7) === date.slice(0, 7);
        return true;
    }

    const [pairing, matches] = await Promise.all([
        duelSetup(viewerId),
        Promise.allSettled(gameIds.map(game => listGames<GameRecord>(games[game].endpoint, reader,
            duelPeriod !== 'daily' || resultsPeriod !== 'daily' ? undefined
                : game === 'isaaconnect' ? { day: String(puzzleDay(game, date)) } : { date })))
    ]);
    const { roster, players, commonGames } = pairing;
    const profiles = new Map(roster.map(player => [player.id, player]));
    const preferredGames = profiles.get(viewerId ?? '')?.preferredGames ?? [];
    const shownGames = gameIds.flatMap((game, index) => {
        if (viewerId && !preferredGames.includes(game)) return [];
        const match = matches[index];
        const records = match.status === 'fulfilled' ? match.value.filter(record => {
            const day = recordDate(record);
            return day >= firstGameDate && day <= date;
        }) : [];
        return [{ game, available: match.status === 'fulfilled', records, visibleDates: submittedGameDates(records, viewerId) }];
    });

    const results = shownGames.map(({ game, available, records, visibleDates }) => ({
        game,
        available,
        rows: rankingRows(records.filter(record => profiles.has(record.user_id) && inPeriod(recordDate(record), resultsPeriod)),
            profiles, visibleDates, resultsPeriod !== 'daily').slice(0, previewLimit)
    }));
    const submissions = viewerId ? shownGames.map(({ game, available, records }) => {
        const saved = rankGameResults(game, records.filter(record => record.user_id === viewerId && recordDate(record) === date))[0];
        return { game, available, result: displayGameResult(saved) };
    }) : null;
    const availableGames = viewerId ? gameIds.filter(game => !preferredGames.includes(game)) : [];
    const previews = { results, date, submissions, availableGames, duelPeriod, resultsPeriod };
    if (!players) return { ...previews, duel: null };

    const totalsByDay = new Map<string, [number, number]>();
    const playerIds = [players[0].id, players[1].id] as const;
    const matchups = shownGames.filter(match => commonGames.includes(match.game)).map(({ game, available, records, visibleDates }) => {
        const byDay = new Map<string, GameRecord[]>();
        for (const record of records) {
            const day = recordDate(record);
            if (!inPeriod(day, duelPeriod) || !playerIds.includes(record.user_id)) continue;
            const entries = byDay.get(day) ?? [];
            entries.push(record);
            byDay.set(day, entries);
        }

        if (duelPeriod === 'daily') {
            const hidden = available && !visibleDates.has(date);
            const outcome = available && !hidden ? compareGamePair(game, byDay.get(date) ?? [], playerIds) : null;
            const hiddenScore = game === 'isaaconnect' ? '?/4' : '?/6';
            return {
                game, available, hidden, outcome: outcome?.outcome ?? null,
                scores: hidden ? [hiddenScore, hiddenScore] : outcome?.results.map(record => record ? gameResultScore(record) : null) ?? [null, null]
            };
        }

        const hidden = available && (!viewerId || [...byDay.keys()].some(day => !visibleDates.has(day)));
        if (!available || hidden) return { game, available, hidden, outcome: null, scores: [null, null] };

        const wins = [0, 0];
        for (const [day, entries] of byDay) {
            const { outcome } = compareGamePair(game, entries, playerIds);
            if (outcome !== 'first' && outcome !== 'second') continue;
            const index = outcome === 'first' ? 0 : 1;
            const totals = totalsByDay.get(day) ?? [0, 0];
            wins[index]++;
            totals[index]++;
            totalsByDay.set(day, totals);
        }
        return {
            game, available, hidden, scores: wins,
            outcome: wins[0] === wins[1] ? null : wins[0] > wins[1] ? 'first' as const : 'second' as const
        };
    });
    if (!matchups.length) return { ...previews, duel: null };

    const points = duelPeriod === 'daily'
        ? [matchups.filter(match => match.outcome === 'first').length, matchups.filter(match => match.outcome === 'second').length]
        : [
            [...totalsByDay.values()].filter(([left, right]) => left > right).length,
            [...totalsByDay.values()].filter(([left, right]) => right > left).length
        ];
    const showPoints = matchups.every(matchup => matchup.available && !matchup.hidden);
    return { ...previews, duel: { players, matchups, points: showPoints ? points : null } };
};

export const actions = {
    submitResult,
    async gamePreference({ locals, request }) {
        if (!locals.user) error(403, 'Sign in to set your preferred games.');
        const form = await request.formData();
        const game = form.get('game');
        const mode = form.get('mode');
        if (typeof game !== 'string' || !isGame(game) || (mode !== 'add' && mode !== 'remove')) {
            error(400, 'Choose a valid game preference.');
        }
        await setGamePreference(locals.user.id, game, mode === 'add');
        return { game, preferenceSaved: true as const };
    }
} satisfies Actions;
