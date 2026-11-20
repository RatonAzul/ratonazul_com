import { fail } from '@sveltejs/kit';
import { requireCalendarAdmin } from '$lib/server/calendar/access';
import { calendarEventFailure, calendarEventsRequest, positiveID, type CalendarEventType } from '$lib/server/calendar/events';
import { calendarGameResultTypes, populateCalendarGameResults, withCalendarGameLock } from '$lib/server/calendar/game-results';
import { isGame } from '$lib/utils/games';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const admin = await requireCalendarAdmin(request);
    try {
        const [types, mappings] = await Promise.all([
            calendarEventsRequest<CalendarEventType[]>('/types', admin.id),
            calendarGameResultTypes(admin.id)
        ]);
        return { types, mappings, loadError: '' };
    } catch {
        return { types: [], mappings: [], loadError: 'Unable to load game result settings.' };
    }
};

export const actions: Actions = {
    save: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const form = await request.formData();
        const game = String(form.get('game') ?? '');
        const selection = form.get('typeId');
        const typeID = positiveID(selection);
        if (!isGame(game) || (selection !== '' && !typeID)) {
            return fail(400, { message: 'Choose a game and an event type.' });
        }
        try {
            await withCalendarGameLock(game, () =>
                calendarEventsRequest(`/game-result-types/${game}`, admin.id, 'PUT', { type_id: typeID })
            );
        } catch (cause) {
            return calendarEventFailure(cause, 'This event type is unavailable.');
        }
        return { success: true, message: 'Game result settings saved.' };
    },

    populate: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const game = String((await request.formData()).get('game') ?? '');
        if (!isGame(game)) return fail(400, { message: 'Choose a game.' });

        try {
            const count = await populateCalendarGameResults(game, admin.id);
            if (count === null) return fail(400, { message: 'Save an event type for this game before populating past results.' });
            return { success: true, message: count
                ? `Populated ${count} calendar ${count === 1 ? 'event' : 'events'}.`
                : 'No past days with results from both players were found.' };
        } catch {
            return fail(503, { message: 'Unable to finish populating past results. Run it again to retry.' });
        }
    }
};
