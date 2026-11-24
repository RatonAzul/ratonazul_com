import { CalendarIcon, JoystickIcon, ShieldIcon, TireIcon } from 'phosphor-svelte';
import type { NotificationGroup } from './notification-groups';

export const notificationSectionIcons = {
    motorsport: TireIcon,
    admin: ShieldIcon,
    calendar: CalendarIcon,
    games: JoystickIcon
} satisfies Record<NotificationGroup, typeof CalendarIcon>;
