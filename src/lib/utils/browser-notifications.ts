import { dev } from '$app/environment';
import type { InboxNotification } from '$lib/types/notifications';

type DeviceAlerts = { mode: 'page' } | { mode: 'push'; endpoint: string };

const deviceKey = (userId: string) => 'notification-device:' + userId;

export function getDeviceAlerts(userId: string): DeviceAlerts | null {
    try {
        const saved = JSON.parse(localStorage.getItem(deviceKey(userId)) ?? 'null');
        if (saved?.mode === 'page' || (saved?.mode === 'push' && typeof saved.endpoint === 'string')) return saved;
    } catch {
        // Treat unavailable or invalid storage as a device without an opt-in.
    }
    return null;
}

export function setDeviceAlerts(userId: string, alerts: DeviceAlerts | null) {
    if (alerts) localStorage.setItem(deviceKey(userId), JSON.stringify(alerts));
    else localStorage.removeItem(deviceKey(userId));
}

export function supportsDeviceAlerts() {
    return window.isSecureContext && 'Notification' in window && 'serviceWorker' in navigator;
}

export async function notificationWorker() {
    await navigator.serviceWorker.register('/service-worker.js', { type: dev ? 'module' : 'classic' });
    return navigator.serviceWorker.ready;
}

export async function showOpenPageAlerts(userId: string, items: InboxNotification[]) {
    if (!items.length || !supportsDeviceAlerts() || Notification.permission !== 'granted' ||
        getDeviceAlerts(userId)?.mode !== 'page') return;

    const worker = await notificationWorker();
    const displayedKey = 'notification-displayed:' + userId;
    const show = async () => {
        for (const item of items.toReversed()) {
            if (getDeviceAlerts(userId)?.mode !== 'page') return;
            if (item.id <= Number(localStorage.getItem(displayedKey) ?? 0)) continue;

            await worker.showNotification(item.title, {
                body: item.description,
                icon: '/images/app-icon.png',
                tag: 'site-notification-' + item.id,
                data: { path: item.link || '/' }
            });
            localStorage.setItem(displayedKey, String(item.id));
        }
    };
    if (navigator.locks) await navigator.locks.request(displayedKey, show);
    else await show();
}
