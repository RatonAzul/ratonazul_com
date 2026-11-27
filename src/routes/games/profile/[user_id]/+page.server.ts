import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const [player] = await db.select({ username: user.username, name: user.name }).from(user)
        .where(eq(user.id, params.user_id));
    if (!player) error(404, 'Player not found.');

    return { title: player.username || player.name };
};
