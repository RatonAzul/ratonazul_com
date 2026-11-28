import { error, redirect } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { sharedGames, type Game } from '$lib/utils/games';
import { gameOpponent, gamePreference, user } from '$lib/server/db/schema';

export async function requireGamesAdmin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.role !== 'admin') error(403, 'Forbidden');
    return session.user.id;
}

export function registeredGamePlayers() {
    return db.select({ id: user.id, name: user.name, username: user.username, image: sql<string | null>`case when ${user.showImage} then ${user.image} end`, showImage: user.showImage, color: user.color })
        .from(user).orderBy(asc(user.createdAt), asc(user.id));
}

export async function preferredOpponent(userId: string) {
    const [preference] = await db.select({ opponentId: gameOpponent.opponentId }).from(gameOpponent)
        .where(eq(gameOpponent.userId, userId));
    return preference?.opponentId;
}

export async function gamePreferenceRoster() {
    const [players, preferences] = await Promise.all([registeredGamePlayers(), db.select().from(gamePreference)]);
    const byUser = new Map<string, Game[]>();
    for (const { userId, game } of preferences) {
        const list = byUser.get(userId) ?? [];
        list.push(game);
        byUser.set(userId, list);
    }
    return players.map(player => ({ ...player, preferredGames: byUser.get(player.id) ?? [] }));
}

export async function preferredGamesFor(userId: string) {
    const preferences = await db.select({ game: gamePreference.game }).from(gamePreference)
        .where(eq(gamePreference.userId, userId));
    return preferences.map(({ game }) => game);
}

export async function prefersGame(userId: string, game: Game) {
    const [preference] = await db.select({ game: gamePreference.game }).from(gamePreference)
        .where(and(eq(gamePreference.userId, userId), eq(gamePreference.game, game)));
    return Boolean(preference);
}

export async function setGamePreference(userId: string, game: Game, selected: boolean) {
    if (selected) await db.insert(gamePreference).values({ userId, game }).onConflictDoNothing();
    else await db.delete(gamePreference).where(and(eq(gamePreference.userId, userId), eq(gamePreference.game, game)));
}

export async function duelSetup(viewerId?: string, firstId: string | null = null, secondId: string | null = null) {
    const [roster, opponentId] = await Promise.all([
        gamePreferenceRoster(),
        viewerId ? preferredOpponent(viewerId) : undefined
    ]);
    const first = roster.find(player => player.id === firstId);
    const second = roster.find(player => player.id === secondId);
    if ((firstId !== null && !first) || (secondId !== null && !second) || (first && first.id === second?.id)) {
        error(400, 'Choose two different players.');
    }
    function opponentsFor(player: (typeof roster)[number]) {
        if (!player.preferredGames.length) return [];
        return roster.filter(candidate => candidate.id !== player.id &&
            sharedGames(player.preferredGames, candidate.preferredGames).length > 0);
    }

    const viewer = roster.find(player => player.id === viewerId);
    const secondOpponents = second ? opponentsFor(second) : [];
    const left = first ?? (second ? secondOpponents.find(player => player.id === viewerId) ?? secondOpponents[0]
        : viewer && opponentsFor(viewer).length ? viewer : roster.find(player => opponentsFor(player).length));
    const opponents = left ? opponentsFor(left) : [];
    const right = second ?? opponents.find(player => player.id === opponentId) ?? opponents[0];
    const commonGames = left && right ? sharedGames(left.preferredGames, right.preferredGames) : [];
    if (first && second && !commonGames.length) error(400, 'These players have no preferred games in common.');
    return { roster, players: left && right && commonGames.length ? [left, right] as const : null, commonGames };
}
