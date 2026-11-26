import { error, redirect } from '@sveltejs/kit';
import { and, eq, inArray, or } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { gamePlayers, user } from '$lib/server/db/schema';

export async function requireGamesAdmin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.role !== 'admin') error(403, 'Forbidden');
    return session.user.id;
}

export async function gamePair() {
    const [pair] = await db.select().from(gamePlayers).where(eq(gamePlayers.id, 1));
    return pair;
}

export async function gamePairForViewer(viewerId: string) {
    const [pair] = await db.select().from(gamePlayers).where(and(
        eq(gamePlayers.id, 1),
        or(eq(gamePlayers.firstUserId, viewerId), eq(gamePlayers.secondUserId, viewerId))
    ));
    if (!pair?.firstUserId || !pair.secondUserId) return;

    const players = await db.select({ id: user.id, name: user.name, username: user.username, image: user.image, color: user.color })
        .from(user).where(inArray(user.id, [pair.firstUserId, pair.secondUserId]));
    const first = players.find(player => player.id === pair.firstUserId);
    const second = players.find(player => player.id === pair.secondUserId);
    if (first && second) return [first, second] as const;
}
