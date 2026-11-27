import { listGames } from '$lib/server/games-api';
import { duelSetup } from '$lib/server/games/access';
import { currentGameDate } from '$lib/server/games/results';
import { compareGamePair, gameResultScore } from '$lib/utils/game-result-summary';
import { games, puzzleDay, type Game, type GameRecord } from '$lib/utils/games';
import type { PageServerLoad } from './$types';

const gameIds = Object.keys(games) as Game[];

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
    setHeaders({ 'Cache-Control': 'private, no-store' });
    const viewerId = locals.user?.id;
    const pairing = await duelSetup(viewerId);
    if (!pairing) return { today: null };

    const { players } = pairing;
    const date = currentGameDate();
    const reader = viewerId ?? 'public-games';
    const matches = await Promise.allSettled(gameIds.map(async game => {
        const records = await listGames<GameRecord>(games[game].endpoint, reader,
            game === 'isaaconnect' ? { day: String(puzzleDay(game, date)) } : { date });
        return compareGamePair(game, records, [players[0].id, players[1].id]);
    }));
    const matchups = matches.map((match, index) => ({
        game: gameIds[index],
        available: match.status === 'fulfilled',
        outcome: match.status === 'fulfilled' ? match.value.outcome : null,
        scores: match.status === 'fulfilled'
            ? match.value.results.map(record => record ? gameResultScore(record) : null)
            : [null, null]
    }));

    const points = [
        matchups.filter(matchup => matchup.outcome === 'first').length,
        matchups.filter(matchup => matchup.outcome === 'second').length
    ];
    return { today: { date, players, matchups, points, available: matchups.every(matchup => matchup.available) } };
};
