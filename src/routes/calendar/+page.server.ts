import { fail, redirect } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { requireCalendarMember } from '$lib/server/calendar/access';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { GamesApiError, gamesRequest } from '$lib/server/games-api';
import { calendarEventFailure, calendarEventsRequest, firstCalendarDate, maxEventLength, readEvent, requestedCalendarDate, type CalendarEvent, type CalendarEventType } from '$lib/server/calendar/events';
import { defaultProfileColor, profileColors } from '$lib/utils/profile-colors';
import type { Actions, PageServerLoad } from './$types';

const firstDate = firstCalendarDate;
const maxCommentLength = 2000;
const madridDate = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: 'Europe/Madrid' });
type CalendarComment = {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
};

function requestedMemberDate(url: URL, today = madridDate.format(new Date())) {
    return requestedCalendarDate(url, today < firstDate ? firstDate : today);
}

export const load: PageServerLoad = async ({ request, url }) => {
    const viewer = await requireCalendarMember(request);
    const today = madridDate.format(new Date());
    const date = requestedMemberDate(url, today);
    const [daily, yearly, eventTypes, events, eventColors] = await Promise.allSettled([
        gamesRequest<CalendarComment[]>(`calendar-comments/date/${date}`, viewer.id),
        gamesRequest<string[]>(`calendar-comments/dates/${date.slice(0, 4)}`, viewer.id),
        calendarEventsRequest<CalendarEventType[]>('/types', viewer.id),
        calendarEventsRequest<CalendarEvent[]>(`/date/${date}`, viewer.id),
        calendarEventsRequest<Record<string, (typeof profileColors)[number] | null>>(`/colors/${date.slice(0, 4)}?include_unhighlighted=true`, viewer.id)
    ]);
    const commentDates = yearly.status === 'fulfilled' ? yearly.value : [];
    const eventData = {
        eventTypes: eventTypes.status === 'fulfilled' ? eventTypes.value : [],
        events: events.status === 'fulfilled' ? events.value : [],
        eventColors: eventColors.status === 'fulfilled' ? eventColors.value : {},
        eventsError: events.status === 'rejected' ? 'Unable to load events for this day.' : '',
        eventTypesError: eventTypes.status === 'rejected' ? 'Unable to load event types.' : '',
        maxEventLength,
        isAdmin: viewer.role === 'admin'
    };
    if (daily.status === 'rejected') {
        return { ...eventData, date, firstDate, today, commentDates, maxCommentLength, comments: [], viewer: null, ownComment: false, loadError: 'Unable to load comments for this day.' };
    }
    const comments = daily.value;
    if (comments.length && !commentDates.includes(date)) commentDates.push(date);

    const ids = [...new Set([viewer.id, ...comments.map((comment) => comment.user_id)])];
    const authors = await db.select({ id: user.id, name: user.name, image: user.image, color: user.color })
        .from(user).where(inArray(user.id, ids));
    const profiles = new Map(authors.map((author) => [author.id, {
        name: author.name,
        image: author.image,
        color: author.color
    }]));

    return {
        ...eventData,
        date,
        firstDate,
        today,
        commentDates,
        maxCommentLength,
        comments: comments.map((comment) => ({
            ...comment,
            author: profiles.get(comment.user_id) ?? { name: 'unknown user', image: null, color: defaultProfileColor }
        })),
        viewer: profiles.get(viewer.id) ?? { name: viewer.name, image: viewer.image, color: defaultProfileColor },
        ownComment: comments.some((comment) => comment.user_id === viewer.id),
        loadError: ''
    };
};

export const actions: Actions = {
    event: async ({ request, url }) => {
        const viewer = await requireCalendarMember(request);
        const date = requestedMemberDate(url);
        const form = await request.formData();
        const input = readEvent(form, String(form.get('eventDate') ?? date));
        const details = { kind: 'event' as const, date, startDate: input.date, endDate: input.endDate, eventContent: input.content, typeId: input.typeID };
        if (!input.valid) {
            return fail(400, { ...details, message: input.validRange
                ? `Choose a start date and type, and enter up to ${maxEventLength} characters.`
                : 'Choose an end date on or after the start date.' });
        }
        try {
            await calendarEventsRequest('', viewer.id, 'POST', { type_id: input.typeID, date: input.date, end_date: input.endDate || null, content: input.content });
        } catch (cause) {
            const failure = calendarEventFailure(cause, 'This event type no longer exists.');
            return fail(failure.status, { ...details, message: failure.data.message });
        }
        redirect(303, `/calendar?date=${input.date}`);
    },
    comment: async ({ request, url }) => {
        const viewer = await requireCalendarMember(request);
        const date = requestedMemberDate(url);
        const value = (await request.formData()).get('content');
        const content = typeof value === 'string' ? value.trim() : '';
        if (!content || content.length > maxCommentLength || content.includes('\0')) {
            return fail(400, { kind: 'comment' as const, date, content, message: `Enter a comment of up to ${maxCommentLength} characters.` });
        }

        try {
            await gamesRequest(`calendar-comments/date/${date}`, viewer.id, 'POST', { content });
        } catch (cause) {
            if (cause instanceof GamesApiError && cause.status === 409) {
                return fail(409, { kind: 'comment' as const, date, content, message: 'You’ve already commented on this day.' });
            }
            return fail(503, { kind: 'comment' as const, date, content, message: 'Unable to post your comment. Try again.' });
        }
        redirect(303, `/calendar?date=${date}`);
    }
};
