import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user, calendarMember } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

async function requireAdmin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.role !== 'admin') error(403, 'Forbidden');
}

export const load: PageServerLoad = async ({ request }) => {
    await requireAdmin(request);
    const users = await db.select({ id: user.id, name: user.name, username: user.username, email: user.email, image: user.image, member: calendarMember.userId })
        .from(user).leftJoin(calendarMember, eq(user.id, calendarMember.userId)).orderBy(user.name);
    return { users };
};

export const actions: Actions = {
    update: async ({ request }) => {
        await requireAdmin(request);
        const form = await request.formData();
        const id = String(form.get('userId') ?? '');
        const action = String(form.get('access') ?? '');
        if (!id || !['grant', 'revoke'].includes(action)) return fail(400, { message: 'Choose a valid user and action.' });
        const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
        if (!existing) return fail(404, { message: 'User not found.' });
        if (action === 'grant') await db.insert(calendarMember).values({ userId: id }).onConflictDoNothing();
        else await db.delete(calendarMember).where(eq(calendarMember.userId, id));
        return { message: action === 'grant' ? 'Calendar access granted.' : 'Calendar access removed.' };
    }
};
