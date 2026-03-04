import type {Meeting} from "$lib/types/motorsport";

export function getCurrentMeetingIndex(meetings?: Meeting[]): number {
    if (!meetings) return 0;

    const now = new Date();
    const index = meetings.findIndex(m => new Date(m.endDate) > now);
    return index === -1 ? meetings.length - 1 : index;
}

export type MeetingStatus =
    | { type: 'closed' }
    | { type: 'open' }
    | { type: 'opens_in'; label: string }
    | { type: 'ended'; label: string };

// Get selected meeting status (can be open or closed if its race week, opens_in if its yet to come and ended if it already ended
export function getMeetingStatus(meeting?: Meeting): MeetingStatus {
    if (!meeting) return { type: 'opens_in', label: '' };

    const now = new Date();
    const start = new Date(meeting.startDate);
    const end = new Date(meeting.endDate);

    // meeting in progress
    if (now >= start && now <= end) {
        return { type: 'closed' };
    }

    // meeting already ended
    if (now > end) {
        return { type: 'ended', label: formatTimeAgo(now, end) };
    }

    // RAWE CEEK
    const raceWeekStart = getMondayOf(start);
    if (now >= raceWeekStart) {
        return { type: 'open' };
    }

    // meeting is yet to come
    return { type: 'opens_in', label: formatTimeUntil(now, raceWeekStart) };
}

function getMondayOf(date: Date): Date {
    const monday = new Date(date);
    const day = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatTimeUntil(now: Date, target: Date): string {
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
}

function formatTimeAgo(now: Date, past: Date): string {
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export function formatMeetingDate(startDate?: string): string {
    if (!startDate) return '';

    return new Date(startDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    });
}

export function formatShortMeetingName(name: string) {
    return name.replaceAll("Grand Prix", "GP")
}