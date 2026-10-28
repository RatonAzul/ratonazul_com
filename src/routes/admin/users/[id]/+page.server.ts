import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

type AdminUser = Awaited<ReturnType<typeof auth.api.getUser>> & {
	username?: string | null;
};

export const load: PageServerLoad = async ({ params, request }) => {
	const user = await auth.api.getUser({
		query: { id: params.id },
		headers: request.headers,
	});

	return { user: user as AdminUser };
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const image = String(formData.get('image') ?? '').trim();
		const role = String(formData.get('role') ?? 'user');

		if (!['admin', 'user'].includes(role)) {
			return fail(400, { message: 'Invalid role' });
		}

		await auth.api.adminUpdateUser({
			body: {
				userId: params.id,
				data: {
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
