import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { env } from '$env/dynamic/private';
import { startPickTheGridReminders } from '$lib/server/motorsport/reminders';

export function init() {
	if (!building && env.PICK_THE_GRID_REMINDERS !== 'false') startPickTheGridReminders();
}

export async function handle({ event, resolve }) {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
}