import { createECDH } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { and, eq, exists, inArray, ne, notExists, or } from 'drizzle-orm';
import { sendNotification } from 'web-push';
import { db } from '$lib/server/db';
import { calendarMember, notificationGroupMember, notificationGroupMute, notificationPreference, notificationRead, pushSubscription, user } from '$lib/server/db/schema';
import { gamesRequest } from '$lib/server/games-api';
import { isNotificationGroup, notificationGroups, type NotificationGroup } from '$lib/utils/notification-groups';
import type { NotificationInbox, SiteNotification } from '$lib/types/notifications';

export function pushConfig() {
    const { VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey, VAPID_SUBJECT: subject } = env;
    return publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null;
}

export function validatePushSubscription(input: unknown) {
    if (!input || typeof input !== 'object' || !('endpoint' in input) || !('keys' in input)) return;
    const { endpoint, keys } = input;
    if (typeof endpoint !== 'string' || endpoint.length > 2048 ||
        !keys || typeof keys !== 'object' || !('p256dh' in keys) || !('auth' in keys)) return;
    const url = URL.parse(endpoint);
    if (!url || url.protocol !== 'https:' || url.port || url.username || url.password || url.hash) return;
    const host = url.hostname;
    if (host !== 'fcm.googleapis.com' && host !== 'updates.push.services.mozilla.com' &&
        !host.endsWith('.push.apple.com') &&
        !host.endsWith('.notify.windows.com')) return;

    const { p256dh, auth } = keys;
    if (typeof p256dh !== 'string' || !/^[\w-]{87}$/.test(p256dh) ||
        typeof auth !== 'string' || !/^[\w-]{22}$/.test(auth)) return;
    try {
        const ecdh = createECDH('prime256v1');
        ecdh.generateKeys();
        ecdh.computeSecret(Buffer.from(p256dh, 'base64url'));
    } catch {
        return;
    }
    return { endpoint: url.href, p256dh, auth };
}

export async function getNotificationGroups(userId: string) {
    const memberships = await db.select({ group: notificationGroupMember.group })
        .from(notificationGroupMember).where(eq(notificationGroupMember.userId, userId));
    return memberships.map(({ group }) => group);
}

export async function setNotificationGroups(userId: string, groups: NotificationGroup[]) {
    return db.transaction(async (tx) => {
        // Serialize replacements and role changes for the same account.
        const [account] = await tx.select({ role: user.role }).from(user).where(eq(user.id, userId)).for('update');
        if (!account || (account.role !== 'admin' && groups.includes('admin'))) return false;
        await tx.delete(notificationGroupMember).where(eq(notificationGroupMember.userId, userId));
        if (groups.length) await tx.insert(notificationGroupMember).values(groups.map((group) => ({ group, userId })));
        return true;
    });
}

function eligibleMembership() {
    return and(
        or(ne(notificationGroupMember.group, 'calendar'), exists(db.select({ id: calendarMember.userId })
            .from(calendarMember).where(eq(calendarMember.userId, notificationGroupMember.userId)))),
        or(ne(notificationGroupMember.group, 'admin'), exists(db.select({ id: user.id }).from(user)
            .where(and(eq(user.id, notificationGroupMember.userId), eq(user.role, 'admin'))))),
        notExists(db.select({ id: notificationGroupMute.userId }).from(notificationGroupMute)
            .where(and(eq(notificationGroupMute.userId, notificationGroupMember.userId),
                eq(notificationGroupMute.group, notificationGroupMember.group))))
    );
}

async function visibleNotifications(userId: string) {
    const [groups, muted] = await Promise.all([
        db.select({ group: notificationGroupMember.group }).from(notificationGroupMember)
            .where(and(eq(notificationGroupMember.userId, userId), eligibleMembership())),
        db.select({ group: notificationGroupMute.group }).from(notificationGroupMute)
            .where(eq(notificationGroupMute.userId, userId))
    ]);
    return gamesRequest<SiteNotification[]>('notifications', userId, 'GET', undefined, {
        notificationGroups: groups.map(({ group }) => group),
        mutedNotificationSections: muted.map(({ group }) => group)
    });
}

export async function getNotificationRecipients(group: NotificationGroup) {
    const recipients = await db.select({ id: notificationGroupMember.userId }).from(notificationGroupMember)
        .innerJoin(notificationPreference, eq(notificationGroupMember.userId, notificationPreference.userId))
        .where(and(eq(notificationGroupMember.group, group), eq(notificationPreference.enabled, true), eligibleMembership()));
    return recipients.map(({ id }) => id);
}

async function notificationOptions(userId: string) {
    const [profile, muted] = await Promise.all([
        db.select({ role: user.role, calendar: calendarMember.userId }).from(user)
            .leftJoin(calendarMember, eq(calendarMember.userId, user.id)).where(eq(user.id, userId)),
        db.select({ group: notificationGroupMute.group }).from(notificationGroupMute)
            .where(eq(notificationGroupMute.userId, userId))
    ]);
    const disabled = new Set(muted.map(({ group }) => group));
    return notificationGroups.filter(group =>
        (group !== 'calendar' || Boolean(profile[0]?.calendar)) && (group !== 'admin' || profile[0]?.role === 'admin')
    ).map(group => ({ group, enabled: !disabled.has(group) }));
}

export async function setNotificationGroupPreference(userId: string, group: NotificationGroup, receive: boolean) {
    if (!(await notificationOptions(userId)).some(option => option.group === group)) return false;
    if (receive) {
        await db.delete(notificationGroupMute).where(and(eq(notificationGroupMute.userId, userId), eq(notificationGroupMute.group, group)));
    } else {
        await db.insert(notificationGroupMute).values({ userId, group }).onConflictDoNothing();
    }
    return true;
}

export async function getInbox(userId: string): Promise<NotificationInbox> {
    const [[pref], options] = await Promise.all([
        db.select().from(notificationPreference).where(eq(notificationPreference.userId, userId)),
        notificationOptions(userId)
    ]);
    const enabled = pref?.enabled ?? false;
    const inbox: NotificationInbox = { enabled, options, items: [], available: true };
    if (pref?.enabled) {
        try {
            const items = await visibleNotifications(userId);
            const read = items.length ? await db.select({ id: notificationRead.notificationId }).from(notificationRead)
                .where(and(eq(notificationRead.userId, userId), inArray(notificationRead.notificationId, items.map((item) => item.id)))) : [];
            const readIds = new Set(read.map((item) => item.id));
            inbox.items = items.map((item) => ({ ...item, read: item.id <= pref.lastSeenId || readIds.has(item.id) }));
        } catch {
            inbox.available = false;
        }
    }
    return inbox;
}

export async function setNotificationPreference(
    userId: string, enabled: boolean, subscription?: NonNullable<ReturnType<typeof validatePushSubscription>>
) {
    await db.transaction(async (tx) => {
        await tx.insert(notificationPreference).values({ userId, enabled })
            .onConflictDoUpdate({ target: notificationPreference.userId, set: { enabled } });
        if (!enabled) {
            await tx.delete(pushSubscription).where(eq(pushSubscription.userId, userId));
        } else if (subscription) {
            const values = { ...subscription, userId };
            await tx.insert(pushSubscription).values(values)
                .onConflictDoUpdate({ target: pushSubscription.endpoint, set: values });
        }
    });
}

export async function removePushSubscription(userId: string, endpoint: string) {
    await db.delete(pushSubscription).where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.endpoint, endpoint)));
}

export async function markNotificationsRead(userId: string, id: number, all: boolean) {
    const visible = await visibleNotifications(userId);
    const ids = visible.filter((item) => all ? item.id <= id : item.id === id).map((item) => item.id);
    if (!ids.length) return;

    await db.transaction(async (tx) => {
        const [pref] = await tx.select().from(notificationPreference)
            .where(eq(notificationPreference.userId, userId)).for('update');
        if (!pref?.enabled) return;
        const unread = ids.filter((notificationId) => notificationId > pref.lastSeenId);
        if (unread.length) {
            await tx.insert(notificationRead).values(unread.map((notificationId) => ({ userId, notificationId })))
                .onConflictDoNothing();
        }
    });
}

export async function publishNotification(actor: string, input: Omit<SiteNotification, 'id' | 'created_at'>) {
    const item = await gamesRequest<SiteNotification>('notifications', actor, 'POST', input, { publishNotifications: true });
    return deliverNotification(item);
}

export async function deliverNotification(item: SiteNotification, excludedUserId?: string, recipientIds?: string[]) {
    const vapidDetails = pushConfig();
    if (!vapidDetails) return 'published to the inbox. browser push is not configured.';

    const description = Array.from(item.description);
    const title = Array.from(item.title);
    const payload = JSON.stringify({
        id: item.id,
        title: title.length > 128 ? title.slice(0, 127).join('') + '…' : item.title,
        description: description.length > 400 ? description.slice(0, 399).join('') + '…' : item.description,
        link: item.link
    });

    let failed = 0;
    try {
        const members = item.audience === 'global' ? undefined : db.select({ id: notificationGroupMember.userId })
            .from(notificationGroupMember).where(and(eq(notificationGroupMember.group, item.audience), eligibleMembership()));
        const section = item.section.trim().toLowerCase();
        const sectionEnabled = isNotificationGroup(section)
            ? notExists(db.select({ id: notificationGroupMute.userId }).from(notificationGroupMute)
                .where(and(eq(notificationGroupMute.userId, pushSubscription.userId), eq(notificationGroupMute.group, section))))
            : undefined;
        const subscriptions = await db.select().from(pushSubscription)
            .innerJoin(notificationPreference, eq(pushSubscription.userId, notificationPreference.userId))
            .where(and(eq(notificationPreference.enabled, true), members && inArray(pushSubscription.userId, members),
                excludedUserId ? ne(pushSubscription.userId, excludedUserId) : undefined,
                recipientIds ? inArray(pushSubscription.userId, recipientIds) : undefined, sectionEnabled));
        for (let start = 0; start < subscriptions.length; start += 20) {
            await Promise.all(subscriptions.slice(start, start + 20).map(async ({ push_subscription: sub }) => {
                try {
                    await sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                        payload, { vapidDetails, TTL: 86_400, timeout: 2500 });
                } catch (cause) {
                    const code = (cause as { statusCode?: number })?.statusCode;
                    if (code === 404 || code === 410) {
                        await db.delete(pushSubscription).where(and(eq(pushSubscription.endpoint, sub.endpoint),
                            eq(pushSubscription.userId, sub.userId), eq(pushSubscription.p256dh, sub.p256dh)))
                            .catch(() => { failed++; });
                    } else {
                        failed++;
                    }
                }
            }));
        }
    } catch {
        return 'published to the inbox. browser delivery could not be completed.';
    }
    return failed ? `published to the inbox. browser delivery failed for ${failed} device(s).` : 'notification published.';
}
