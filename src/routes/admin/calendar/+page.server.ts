import { requireCalendarAdmin } from '$lib/server/calendar/access';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    await requireCalendarAdmin(request);
};
