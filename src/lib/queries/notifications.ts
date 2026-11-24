import { browser } from '$app/environment';
import { createQuery, useQueryClient } from '@tanstack/svelte-query';
import type { NotificationGroup } from '$lib/utils/notification-groups';
import type { NotificationInbox } from '$lib/types/notifications';

export function notificationInbox(userId: () => string | undefined) {
    return createQuery<NotificationInbox>(() => ({
        queryKey: ['notification-inbox', userId()],
        enabled: browser && Boolean(userId()),
        refetchInterval: 30_000,
        staleTime: 15_000,
        queryFn: async ({ signal }) => {
            const response = await fetch('/api/notifications', { signal });
            if (!response.ok) throw new Error('notifications are temporarily unavailable.');
            return response.json();
        }
    }));
}

export async function updateNotifications(input: { enabled: boolean; subscription?: PushSubscriptionJSON } | { group: NotificationGroup; receive: boolean } | { read: number; all?: true }) {
    const response = await fetch('/api/notifications', {
        method: 'POST',
        keepalive: 'read' in input,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('unable to update notifications. please try again.');
}

export function notificationReadAction() {
    const queryClient = useQueryClient();
    return async (userId: string, id: number, all?: true) => {
        await updateNotifications({ read: id, all });
        await queryClient.invalidateQueries({ queryKey: ['notification-inbox', userId] });
    };
}
