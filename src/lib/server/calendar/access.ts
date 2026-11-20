import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { calendarMember } from '$lib/server/db/schema';

export async function hasCalendarAccess(userId: string): Promise<boolean> {
    const [membership] = await db.select({ userId: calendarMember.userId })
        .from(calendarMember).where(eq(calendarMember.userId, userId)).limit(1);
    return !!membership;
}

// Call from every calendar load, action, and endpoint, not just its layout.
export async function requireCalendarMember(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (!await hasCalendarAccess(session.user.id)) error(403, 'Calendar access required');
    return session.user;
}

export async function requireCalendarAdmin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.role !== 'admin') error(403, 'Forbidden');
    return session.user;
}
