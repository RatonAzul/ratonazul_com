import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';

export async function POST({ request }) {
    const { userIds }: { userIds: string[] } = await request.json();

    const users = await db
        .select({ id: user.id, username: user.username, name: user.name })
        .from(user)
        .where(inArray(user.id, userIds));

    const usernameMap = Object.fromEntries(
        users.map(u => [u.id, u.username ?? u.name ?? 'user'])
    );

    return json(usernameMap);
}