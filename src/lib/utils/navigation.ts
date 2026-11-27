import { CalendarIcon, CameraIcon, GameControllerIcon, ShieldIcon, TelevisionSimpleIcon, TireIcon } from 'phosphor-svelte';
import { pageColors } from './page-colors';

const publicLinks = [
    { href: '/media', label: 'media', icon: TelevisionSimpleIcon, color: pageColors.media },
    { href: '/pics', label: 'pics', icon: CameraIcon, color: pageColors.pics },
    { href: '/games', label: 'games', icon: GameControllerIcon, color: pageColors.games },
    { href: '/motorsport', label: 'motorsport', icon: TireIcon, color: pageColors.motorsport }
];

export function navigationLinks(calendar: boolean, admin: boolean) {
    return [
        ...publicLinks,
        ...(calendar ? [{ href: '/calendar', label: 'calendar', icon: CalendarIcon, color: pageColors.calendar }] : []),
        ...(admin ? [{ href: '/admin', label: 'admin', icon: ShieldIcon, color: pageColors.admin }] : [])
    ];
}

export function isActiveLink(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
}
