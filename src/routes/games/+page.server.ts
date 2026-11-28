import { error } from '@sveltejs/kit';
import { listGames } from '$lib/server/games-api';
import { duelSetup, setGamePreference } from '$lib/server/games/access';
import { rankingRows, submittedGameDates } from '$lib/server/games/result-visibility';
import { submitResult } from '$lib/server/games/submit-result';
import { currentGameDate } from '$lib/server/games/results';
import { compareGamePair, displayGameResult, gameResultScore, rankGameResults } from '$lib/utils/game-result-summary';
import { games, isGame, puzzleDay, recordDate, type Game, type GameRecord } from '$lib/utils/games';
import type { Actions, PageServerLoad } from './$types';

const gameIds = Object.keys(games) as Game[];
const previewLimit = 3;

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
    setHeaders({ 'Cache-Control': 'private, no-store' });
    const viewerId = locals.user?.id;
    const date = currentGameDate();
    const reader = viewerId ?? 'public-games';
    const [pairing, matches] = await Promise.all([
        duelSetup(viewerId),
        Promise.allSettled(gameIds.map(game => listGames<GameRecord>(games[game].endpoint, reader,
            game === 'isaaconnect' ? { day: String(puzzleDay(game, date)) } : { date })))
    ]);
    const { roster, players, commonGames } = pairing;
    const profiles = new Map(roster.map(player => [player.id, player]));
    const gamesToday = matches.map((match, index) => {
        const records = match.status === 'fulfilled' ? match.value.filter(record => recordDate(record) === date) : [];
        return {
            game: gameIds[index],
            available: match.status === 'fulfilled',
            hidden: !submittedGameDates(records, viewerId).has(date),
            records
        };
    });
    const preferredGames = profiles.get(viewerId ?? '')?.preferredGames ?? [];
    const shownGames = viewerId ? gamesToday.filter(match => preferredGames.includes(match.game)) : gamesToday;
    const results = shownGames.map(({ game, available, hidden, records }) => ({
        game,
        available,
        rows: rankingRows(records.filter(record => profiles.has(record.user_id)), profiles,
            new Set(hidden ? [] : [date])).slice(0, previewLimit)
    }));

    const submissions = viewerId ? shownGames.map(({ game, available, records }) => {
        const saved = rankGameResults(game, records.filter(record => record.user_id === viewerId))[0];
        return { game, available, result: displayGameResult(saved) };
    }) : null;
    const availableGames = viewerId ? gameIds.filter(game => !preferredGames.includes(game)) : [];

    if (!players) return { today: null, results, date, submissions, availableGames };

    const matchups = shownGames.filter(match => commonGames.includes(match.game)).map(({ game, available, hidden, records }) => {
        const outcome = available && !hidden ? compareGamePair(game, records, [players[0].id, players[1].id]) : null;
        const hiddenScore = game === 'isaaconnect' ? '?/4' : '?/6';
        return {
            game,
            available,
            hidden: available && hidden,
            outcome: outcome?.outcome ?? null,
            scores: available && hidden ? [hiddenScore, hiddenScore] : outcome?.results.map(record => record ? gameResultScore(record) : null) ?? [null, null]
        };
    });
    if (!matchups.length) return { today: null, results, date, submissions, availableGames };

    const points = [
        matchups.filter(matchup => matchup.outcome === 'first').length,
        matchups.filter(matchup => matchup.outcome === 'second').length
    ];
    const showPoints = matchups.every(matchup => matchup.available && !matchup.hidden);
    return { today: { date, players, matchups, points: showPoints ? points : null }, results, date, submissions, availableGames };
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
