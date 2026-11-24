export const notificationGroups = ['games', 'calendar', 'motorsport', 'admin'] as const;

export type NotificationGroup = (typeof notificationGroups)[number];
export type NotificationAudience = 'global' | NotificationGroup;

export function isNotificationGroup(value: unknown): value is NotificationGroup {
    return notificationGroups.some((group) => group === value);
}
