import { fail } from '@sveltejs/kit';
import { requireCalendarAdmin } from '$lib/server/calendar/access';
import { calendarEventFailure, calendarEventsRequest, maxEventTypeName, positiveID, readEventType, type CalendarEventType } from '$lib/server/calendar/events';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const admin = await requireCalendarAdmin(request);
    try {
        const types = await calendarEventsRequest<CalendarEventType[]>('/types', admin.id);
        return { types, maxEventTypeName, loadError: '' };
    } catch {
        return { types: [], maxEventTypeName, loadError: 'Unable to load event types.' };
    }
};

export const actions: Actions = {
    save: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const form = await request.formData();
        const id = positiveID(form.get('id'));
        const input = readEventType(form);
        if ((form.has('id') && !id) || !input) return fail(400, { message: 'Enter a name and choose a color.' });
        try {
            await calendarEventsRequest(id ? `/types/${id}` : '/types', admin.id, id ? 'PUT' : 'POST', input);
        } catch (cause) {
            return calendarEventFailure(cause, 'An event type with this name already exists.');
        }
        return { success: true, message: id ? 'Event type saved.' : 'Event type added.' };
    },
    remove: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const id = positiveID((await request.formData()).get('id'));
        if (!id) return fail(400, { message: 'Choose an event type.' });
        try {
            await calendarEventsRequest(`/types/${id}`, admin.id, 'DELETE');
        } catch (cause) {
            return calendarEventFailure(cause, 'This type is used by an event. Reassign or delete those events first.');
        }
        return { success: true, message: 'Event type deleted.' };
    },
    order: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const ids = (await request.formData()).getAll('id').map(positiveID);
        if (!ids.length || ids.some((id) => !id) || new Set(ids).size !== ids.length) {
            return fail(400, { message: 'Provide the complete event type order.' });
        }
        try {
            await calendarEventsRequest('/types/order', admin.id, 'PUT', { ids });
        } catch (cause) {
            return calendarEventFailure(cause, 'Event types changed. Refresh and try again.');
        }
        return { success: true, message: 'Priority order saved.' };
    }
};
