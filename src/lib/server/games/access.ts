import { error, redirect } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { gameOpponent, user } from '$lib/server/db/schema';

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

export async function duelSetup(viewerId?: string, firstId: string | null = null, secondId: string | null = null) {
    const [roster, opponentId] = await Promise.all([
        registeredGamePlayers(),
        viewerId ? preferredOpponent(viewerId) : undefined
    ]);
    if (roster.length < 2) return null;

    const first = firstId === null
        ? roster.find(player => player.id === viewerId && player.id !== secondId) ?? roster.find(player => player.id !== secondId)
        : roster.find(player => player.id === firstId);
    const second = secondId === null
        ? roster.find(player => player.id === opponentId && player.id !== first?.id) ?? roster.find(player => player.id !== first?.id)
        : roster.find(player => player.id === secondId);
    if (!first || !second || first.id === second.id) error(400, 'Choose two different players.');
    return { roster, players: [first, second] as const };
}
