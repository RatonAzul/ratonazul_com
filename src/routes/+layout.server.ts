import { hasCalendarAccess } from '$lib/server/calendar/access';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
    canAccessCalendar: locals.user ? await hasCalendarAccess(locals.user.id) : false
});
