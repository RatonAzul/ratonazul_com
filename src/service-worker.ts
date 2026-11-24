/// <reference lib="webworker" />

const worker = self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener('push', (event) => {
    if (!event.data) return;
    const alert = event.data.json();
    event.waitUntil((async () => {
        await worker.registration.showNotification(alert.title, {
            body: alert.description,
            icon: '/images/app-icon.png',
            tag: 'site-notification-' + alert.id,
            data: { path: alert.link || '/' }
        });
        const windows = await worker.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) client.postMessage('site-notification');
    })());
});

worker.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const target = new URL(event.notification.data?.path || '/', worker.location.origin);
    if (target.origin !== worker.location.origin) return;
    event.waitUntil((async () => {
        const windows = await worker.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windows.find((client) => client.url === target.href);
        if (existing) await existing.focus();
        else await worker.clients.openWindow(target.href);
    })());
});
