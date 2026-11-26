import { fail } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { gamePlayers, user } from '$lib/server/db/schema';
import { gamePair, requireGamesAdmin } from '$lib/server/games/access';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    await requireGamesAdmin(request);
    const [pair, users] = await Promise.all([
        gamePair(),
        db.select({ id: user.id, name: user.name, username: user.username, email: user.email })
            .from(user).orderBy(user.name, user.id)
    ]);
    return { pair, users };
};

export const actions: Actions = {
    save: async ({ request }) => {
        await requireGamesAdmin(request);
        const form = await request.formData();
        const firstUserId = String(form.get('firstUserId') ?? '').trim() || null;
        const secondUserId = String(form.get('secondUserId') ?? '').trim() || null;
        const values = { firstUserId, secondUserId };
        if (firstUserId && firstUserId === secondUserId) {
            return fail(400, { message: 'Choose a different user for each slot.', values });
        }
        const ids = [firstUserId, secondUserId].filter((id): id is string => id !== null);
        try {
            if (ids.length) {
                const existing = await db.select({ id: user.id }).from(user).where(inArray(user.id, ids));
                if (existing.length !== ids.length) return fail(400, { message: 'Choose registered users.', values });
            }
            await db.insert(gamePlayers).values({ id: 1, ...values })
                .onConflictDoUpdate({ target: gamePlayers.id, set: values });
        } catch {
            return fail(503, { message: 'Unable to save games access. Try again.', values });
        }
        return { success: true, message: 'Games access saved.' };
    }
};
