import { error, json } from '@sveltejs/kit';
import { getInbox, markNotificationsRead, pushConfig, setNotificationGroupPreference, setNotificationPreference, validatePushSubscription } from '$lib/server/notifications';
import { isNotificationGroup } from '$lib/utils/notification-groups';
import type { RequestHandler } from './$types';

const noStore = { 'Cache-Control': 'private, no-store' };

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) error(401, 'Sign in to see notifications.');
    try {
        return json(await getInbox(locals.user.id), { headers: noStore });
    } catch {
        error(503, 'Notifications are temporarily unavailable.');
    }
};

export const POST: RequestHandler = async ({ locals, request, url }) => {
    if (!locals.user) error(401, 'Sign in to change notifications.');
    if (request.headers.get('origin') !== url.origin) error(403, 'Invalid request origin.');
    if (request.headers.get('content-type') !== 'application/json') error(415, 'Expected JSON.');
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== 'object') error(400, 'Invalid notification request.');
    if (typeof input.enabled === 'boolean') {
        const subscription = validatePushSubscription(input.subscription);
        if (input.subscription != null && (!input.enabled || !subscription || !pushConfig())) {
            error(400, 'This browser subscription could not be registered.');
        }
        await setNotificationPreference(locals.user.id, input.enabled, subscription);
    } else if (isNotificationGroup(input.group) && typeof input.receive === 'boolean') {
        if (!await setNotificationGroupPreference(locals.user.id, input.group, input.receive)) {
            error(403, 'This notification category is unavailable.');
        }
    } else if (Number.isSafeInteger(input.read) && input.read > 0 &&
        (input.all === undefined || input.all === true)) {
        try {
            await markNotificationsRead(locals.user.id, input.read, input.all === true);
        } catch {
            error(503, 'Unable to mark notifications as read.');
        }
    } else {
        error(400, 'Invalid notification request.');
    }
    return new Response(null, { status: 204, headers: noStore });
};
