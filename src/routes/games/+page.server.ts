import { listGames } from '$lib/server/games-api';
import { duelSetup, registeredGamePlayers } from '$lib/server/games/access';
import { submitResult } from '$lib/server/games/submit-result';
import { currentGameDate } from '$lib/server/games/results';
import { leaderboard } from '$lib/utils/game-leaderboard';
import { compareGamePair, displayGameResult, gameResultScore, rankGameResults } from '$lib/utils/game-result-summary';
import { games, puzzleDay, type Game, type GameRecord } from '$lib/utils/games';
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
    const roster = pairing?.roster ?? await registeredGamePlayers();
    const profiles = new Map(roster.map(player => [player.id, player]));
    const results = matches.map((match, index) => ({
        game: gameIds[index],
        available: match.status === 'fulfilled',
        rows: match.status === 'fulfilled'
            ? leaderboard(match.value.filter(record => profiles.has(record.user_id))).slice(0, previewLimit)
                .map(row => ({ ...row, player: profiles.get(row.id)! }))
            : []
    }));

    const submissions = viewerId ? matches.map((match, index) => {
        const game = gameIds[index];
        const saved = match.status === 'fulfilled'
            ? rankGameResults(game, match.value.filter(record => record.user_id === viewerId))[0]
            : undefined;
        return { game, available: match.status === 'fulfilled', result: displayGameResult(saved) };
    }) : null;

    if (!pairing) return { today: null, results, date, submissions };

    const { players } = pairing;
    const matchups = matches.map((match, index) => {
        const game = gameIds[index];
        const outcome = match.status === 'fulfilled'
            ? compareGamePair(game, match.value, [players[0].id, players[1].id])
            : null;
        return {
            game,
            available: outcome !== null,
            outcome: outcome?.outcome ?? null,
            scores: outcome?.results.map(record => record ? gameResultScore(record) : null) ?? [null, null]
        };
    });
    const points = [
        matchups.filter(matchup => matchup.outcome === 'first').length,
        matchups.filter(matchup => matchup.outcome === 'second').length
    ];
    return { today: { date, players, matchups, points, available: matchups.every(matchup => matchup.available) }, results, date, submissions };
};

export const actions = { submitResult } satisfies Actions;
