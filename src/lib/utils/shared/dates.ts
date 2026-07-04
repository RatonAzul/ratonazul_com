import {formatDistance} from 'date-fns';
import {enUS} from "date-fns/locale";

export function getTimeFromNow(date: string) {
    if (!date) return "A long time ago"
    return formatDistance(date, Date.now(), {addSuffix: true, locale: enUS})
}

export function getShortTimeFromNow(date: string): string {
    if (!date) return '?';

    const diffMs = Date.now() - new Date(date).getTime();
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