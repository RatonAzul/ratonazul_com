const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;
const catchUpWindow = 10 * minute;

const madridDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', dateStyle: 'short' });
const madridOffset = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', timeZoneName: 'longOffset' });

export type ReminderKind = 'open' | 'day' | 'hour';

export function reminderSeason(now: Date) {
    return Number(madridDate.format(now).slice(0, 4));
}

export function raceWeekStart(deadline: Date) {
    const date = new Date(madridDate.format(deadline) + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    const offset = madridOffset.formatToParts(date).find(part => part.type === 'timeZoneName')!.value.slice(3);
    return new Date(date.toISOString().slice(0, 10) + 'T00:00:00' + (offset || 'Z'));
}

export function dueReminder(startDate: string, now: Date): ReminderKind | undefined {
    const deadline = Date.parse(startDate);
    const current = now.getTime();
    if (!Number.isFinite(deadline) || current >= deadline) return;
    const monday = raceWeekStart(new Date(deadline)).getTime();
    const slots: [ReminderKind, number][] = [['hour', deadline - hour], ['day', deadline - day], ['open', monday]];
    return slots.find(([, scheduled]) => scheduled >= monday && current >= scheduled && current - scheduled < catchUpWindow)?.[0];
}

export function timeUntilBetCloses(deadline: string, now: Date) {
    const minutes = Math.max(1, Math.ceil((Date.parse(deadline) - now.getTime()) / minute));
    const parts = [[Math.floor(minutes / 1440), 'day'], [Math.floor(minutes / 60) % 24, 'hour'], [minutes % 60, 'minute']] as const;
    return parts.filter(([value]) => value > 0).map(([value, unit]) => value + ' ' + unit + (value === 1 ? '' : 's')).join(', ');
}
