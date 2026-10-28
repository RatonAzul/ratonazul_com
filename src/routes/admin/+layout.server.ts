import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	// There is no login route in this application. Send signed-out visitors to
	// the homepage, where the shared header provides the Google sign-in action.
	if (!session) {
		redirect(303, '/');
	}

	if (session.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
};
