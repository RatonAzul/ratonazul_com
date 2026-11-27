import { CalendarIcon, GameControllerIcon, ShieldIcon, TireIcon } from 'phosphor-svelte';
import type { NotificationGroup } from './notification-groups';

export const notificationSectionIcons = {
    motorsport: TireIcon,
    admin: ShieldIcon,
    calendar: CalendarIcon,
    games: GameControllerIcon
} satisfies Record<NotificationGroup, typeof CalendarIcon>;
