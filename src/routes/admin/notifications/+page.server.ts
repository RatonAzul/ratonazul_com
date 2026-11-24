import { error, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { GamesApiError } from '$lib/server/games-api';
import { publishNotification } from '$lib/server/notifications';
import { pageColors } from '$lib/utils/page-colors';
import { isNotificationGroup } from '$lib/utils/notification-groups';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user.role !== 'admin') error(403, 'Forbidden');
        const form = await request.formData();
        const title = String(form.get('title') ?? '').trim();
        const description = String(form.get('description') ?? '').trim();
        const section = String(form.get('section') ?? '').trim().toLowerCase();
        const link = String(form.get('link') ?? '').trim() || null;
        const audience = form.get('audience');
        const values = { title, description, section, link, audience: typeof audience === 'string' ? audience : '' };
        if (audience !== 'global' && !isNotificationGroup(audience)) {
            return fail(400, { message: 'choose a notification audience.', values });
        }
        if (!isNotificationGroup(section)) {
            return fail(400, { message: 'choose a notification section.', values });
        }
        if (!title || !description || title.length > 100 || description.length > 400 ||
            (link && (link.length > 400 || !link.startsWith('/') || link.startsWith('//') ||
                link.includes('\\') || /[\s\u0000-\u001f]/.test(link)))) {
            return fail(400, { message: 'enter a title, description and optional site path.', values });
        }

        try {
            const message = await publishNotification(session.user.id, { title, description, section, link, color: pageColors[section], audience });
            return { success: true, message };
        } catch (cause) {
            if (cause instanceof GamesApiError && cause.status === 400) {
                return fail(400, { message: 'check the notification fields and site path.', values });
            }
            return fail(503, { message: 'the notification API did not confirm publication. check the inbox before retrying.', values });
        }
    }
};
