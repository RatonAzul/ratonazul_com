
import { auth } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type AdminUser = Awaited<ReturnType<typeof auth.api.listUsers>>['users'][number] & {
	username?: string | null;
};

export const load: PageServerLoad = async ({ request }) => {
	const url = new URL(request.url);
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = 20;
	const offset = (page - 1) * limit;

    const result = await auth.api.listUsers({
        query: {
            limit,
            offset,
            sortBy: 'createdAt',
            sortDirection: 'desc'
        },
        headers: request.headers
    });

    return {
		users: result.users as AdminUser[],
        total: result.total,
        page,
        limit,
    };
};

export const actions = {
	toggleAdmin: async ({ request }) => {
		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const role = String(formData.get('role') ?? 'user');

		if (!userId || !['admin', 'user'].includes(role)) {
			return fail(400, { message: 'Invalid user role request' });
		}

		await auth.api.setRole({
			body: { userId, role: role === 'admin' ? 'user' : 'admin' },
			headers: request.headers,
		});

		return { success: true };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');

		if (!userId) return fail(400, { message: 'Missing user id' });

		await auth.api.removeUser({
			body: { userId },
			headers: request.headers,
		});

		return { success: true };
	},
};
