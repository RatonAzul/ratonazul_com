import type { NotificationAudience, NotificationGroup } from '$lib/utils/notification-groups';
import type { profileColors } from '$lib/utils/profile-colors';

export interface SiteNotification {
    id: number;
    title: string;
    description: string;
    color: (typeof profileColors)[number];
    section: string;
    audience: NotificationAudience;
    link: string | null;
    created_at: string;
}

export type InboxNotification = SiteNotification & { read: boolean };

export type NotificationOption = { group: NotificationGroup; enabled: boolean };

export interface NotificationInbox {
    enabled: boolean;
    available: boolean;
    options: NotificationOption[];
    items: InboxNotification[];
}
