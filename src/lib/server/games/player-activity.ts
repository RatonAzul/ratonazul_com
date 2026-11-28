import { listGames } from '$lib/server/games-api';
import { games, type Game, type GameRecord } from '$lib/utils/games';

export async function playerResultCounts(actor: string, loaded?: { game: Game; records: Promise<GameRecord[]> }) {
    const histories = await Promise.allSettled((Object.keys(games) as Game[]).map(game =>
        loaded?.game === game ? loaded.records : listGames<GameRecord>(games[game].endpoint, actor)
    ));
    const counts = new Map<string, number>();
    for (const history of histories) {
        if (history.status !== 'fulfilled') continue;
        for (const { user_id } of history.value) counts.set(user_id, (counts.get(user_id) ?? 0) + 1);
    }
    return counts;
}

export function byResultCount(counts: Map<string, number>) {
    return (a: { id: string }, b: { id: string }) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
}
