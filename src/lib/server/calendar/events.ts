import { error, fail } from '@sveltejs/kit';
import { GamesApiError, gamesRequest } from '$lib/server/games-api';
import { isProfileColor, profileColors } from '$lib/utils/profile-colors';
import { isCalendarEventIcon, type CalendarEventIcon } from '$lib/utils/calendar-event-icons';
import type { Game } from '$lib/utils/games';
import { validDate } from '$lib/utils/shared/calendar';

export const firstCalendarDate = '2026-08-01';
export const maxEventLength = 2000;
export const maxEventTypeName = 100;
type CalendarColor = (typeof profileColors)[number];
export type CalendarEventType = { id: number; name: string; color: CalendarColor; icon: CalendarEventIcon | ''; is_highlighted: boolean; priority: number };
export type CalendarEvent = {
    id: number;
    type_id: number;
    date: string;
    end_date: string | null;
    auto_game: Game | null;
    content: string;
    type_name: string;
    color: CalendarColor;
    icon: CalendarEventIcon | '';
};

export function calendarDate(value: string) {
    return validDate(value) && value >= firstCalendarDate;
}

export function requestedCalendarDate(url: URL, fallback: string) {
    const date = url.searchParams.get('date') ?? fallback;
    if (!calendarDate(date)) error(400, 'Choose a valid date from August 2026 onward.');
    return date;
}

export function positiveID(value: FormDataEntryValue | null) {
    const id = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN;
    return Number.isSafeInteger(id) && id <= 2_147_483_647 ? id : null;
}

export function readEvent(form: FormData, date: string) {
    const value = form.get('eventContent');
    const content = typeof value === 'string' ? value.trim() : '';
    const typeID = positiveID(form.get('typeId'));
    const endDate = String(form.get('eventEndDate') ?? '');
    const validRange = !endDate || (calendarDate(endDate) && endDate >= date);
    return {
        typeID, date, endDate, content, validRange,
        valid: !!typeID && calendarDate(date) && validRange && !!content && content.length <= maxEventLength && !content.includes('\0')
    };
}

export function calendarEventsRequest<T>(path: string, actor: string, method = 'GET', body?: unknown) {
    return gamesRequest<T>(`calendar-events${path}`, actor, method, body);
}

export function calendarEventFailure(cause: unknown, conflict: string) {
    if (cause instanceof GamesApiError) {
        if (cause.status === 409) return fail(409, { message: conflict });
        if (cause.status === 404) return fail(404, { message: 'This item no longer exists.' });
        if (cause.status === 400) return fail(400, { message: 'Check the event details and try again.' });
    }
    return fail(503, { message: 'The calendar API is unavailable. Try again.' });
}

export function readEventType(form: FormData) {
    const name = String(form.get('name') ?? '').trim();
    const color = form.get('color');
    const icon = String(form.get('icon') ?? '');
    if (!name || name.length > maxEventTypeName || name.includes('\0') || !isProfileColor(color) || (icon !== '' && !isCalendarEventIcon(icon))) return null;
    return { name, color, icon, is_highlighted: form.get('isHighlighted') === 'on' };
}
