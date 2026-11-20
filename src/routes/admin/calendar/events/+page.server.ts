import { fail, redirect } from '@sveltejs/kit';
import { requireCalendarAdmin } from '$lib/server/calendar/access';
import { calendarEventFailure, calendarEventsRequest, firstCalendarDate, maxEventLength, positiveID, readEvent, requestedCalendarDate, type CalendarEvent, type CalendarEventType } from '$lib/server/calendar/events';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
    const admin = await requireCalendarAdmin(request);
    const today = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date());
    const date = requestedCalendarDate(url, today >= firstCalendarDate ? today : firstCalendarDate);
    try {
        const [events, types] = await Promise.all([
            calendarEventsRequest<CalendarEvent[]>(`/date/${date}`, admin.id),
            calendarEventsRequest<CalendarEventType[]>('/types', admin.id)
        ]);
        return { date, firstCalendarDate, maxEventLength, events, types, loadError: '' };
    } catch {
        return { date, firstCalendarDate, maxEventLength, events: [], types: [], loadError: 'Unable to load events.' };
    }
};

export const actions: Actions = {
    save: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const form = await request.formData();
        const id = positiveID(form.get('id'));
        const input = readEvent(form, String(form.get('eventDate') ?? ''));
        const details = { id, input };
        if (!id || !input.valid) return fail(400, { ...details, message: input.validRange
            ? 'Choose a start date and type, and enter event text.'
            : 'Choose an end date on or after the start date.' });
        try {
            await calendarEventsRequest(`/${id}`, admin.id, 'PUT', { type_id: input.typeID, date: input.date, end_date: input.endDate || null, content: input.content });
        } catch (cause) {
            const failure = calendarEventFailure(cause, 'This event type no longer exists.');
            return fail(failure.status, { ...details, message: failure.data.message });
        }
        redirect(303, `/admin/calendar/events?date=${input.date}`);
    },
    remove: async ({ request }) => {
        const admin = await requireCalendarAdmin(request);
        const id = positiveID((await request.formData()).get('id'));
        if (!id) return fail(400, { message: 'Choose an event.' });
        try {
            await calendarEventsRequest(`/${id}`, admin.id, 'DELETE');
        } catch (cause) {
            return calendarEventFailure(cause, 'Unable to delete this event.');
        }
        return { success: true, message: 'Event deleted.' };
    }
};
