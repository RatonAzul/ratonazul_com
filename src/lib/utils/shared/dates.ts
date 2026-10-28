import {format, formatDistanceStrict} from 'date-fns';
import {enUS} from "date-fns/locale";

function parseDate(date: string | undefined) {
    if (!date) return undefined;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function getTimeFromNow(date: string | undefined) {
    const parsed = parseDate(date);
    if (!parsed) return "A long time ago";
    return formatDistanceStrict(parsed, new Date(), {
        addSuffix: true,
        locale: enUS,
        roundingMethod: 'floor',
    });
}

export function getShortTimeFromNow(date: string | undefined): string {
    const parsed = parseDate(date);
    if (!parsed) return '?';

    const diffMs = Math.max(0, Date.now() - parsed.getTime());
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    if (diffMonths < 12) return `${diffMonths}mo`;
    return `${diffYears}y`;
}

export function formatExactDate(date: string | undefined): string {
    const parsed = parseDate(date);
    return parsed ? format(parsed, 'PPpp', {locale: enUS}) : 'Unknown date';
}
