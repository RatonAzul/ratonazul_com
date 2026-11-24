import { error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { getNotificationGroups, setNotificationGroups } from '$lib/server/notifications';
import { isNotificationGroup } from '$lib/utils/notification-groups';
import type { Actions, PageServerLoad } from './$types';

type AdminUser = Awaited<ReturnType<typeof auth.api.getUser>> & {
	username?: string | null;
};

export const load: PageServerLoad = async ({ params, request }) => {
	const user = await auth.api.getUser({
		query: { id: params.id },
		headers: request.headers,
	});

	return { user: user as AdminUser, groups: await getNotificationGroups(params.id) };
};

export const actions: Actions = {
    saveNotificationGroups: async ({ params, request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user.role !== 'admin') error(403, 'Forbidden');
        const values = [...new Set((await request.formData()).getAll('groups'))];
        if (!values.every(isNotificationGroup)) return fail(400, { message: 'Invalid notification group.' });

        await auth.api.getUser({ query: { id: params.id }, headers: request.headers });
        await setNotificationGroups(params.id, values);
        redirect(303, `/admin/users/${params.id}`);
    },
	save: async ({ params, request }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const username = String(formData.get('username') ?? '').trim();
		const image = String(formData.get('image') ?? '').trim();
		const role = String(formData.get('role') ?? 'user');

		if (!['admin', 'user'].includes(role)) {
			return fail(400, { message: 'Invalid role' });
		}
		if (!name || name.length > 100 || name.includes('\0')) {
			return fail(400, { message: 'Enter a display name of up to 100 characters.' });
		}

		await auth.api.adminUpdateUser({
			body: {
				userId: params.id,
				data: {
					name,
					username: username || null,
					image: image || null,
				},
			},
			headers: request.headers,
		});

		await auth.api.setRole({
			body: { userId: params.id, role: role as 'admin' | 'user' },
			headers: request.headers,
		});

		throw redirect(303, `/admin/users/${params.id}`);
	},
	delete: async ({ params, request }) => {
		await auth.api.removeUser({
			body: { userId: params.id },
			headers: request.headers,
		});

		throw redirect(303, '/admin/users');
	},
};
