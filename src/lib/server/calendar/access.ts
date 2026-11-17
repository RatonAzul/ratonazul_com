import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { calendarMember } from '$lib/server/db/schema';

// Call from every calendar load, action, and endpoint, not just its layout.
export async function requireCalendarMember(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    const [membership] = await db.select().from(calendarMember).where(eq(calendarMember.userId, session.user.id)).limit(1);
    if (!membership) error(403, 'Calendar access required');
    return session.user;
}
