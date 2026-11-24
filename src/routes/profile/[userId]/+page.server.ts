import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { isProfileColor } from '$lib/utils/profile-colors';
import { pushConfig } from '$lib/server/notifications';
import type { Actions, PageServerLoad } from './$types';

async function requireOwner(request: Request, userId: string) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.id !== userId) error(403, 'Forbidden');
    return session.user;
}

export const load: PageServerLoad = async ({ request, params }) => {
    await requireOwner(request, params.userId);
    const [profile] = await db.select({ name: user.name, username: user.username, image: user.image, email: user.email, color: user.color }).from(user).where(eq(user.id, params.userId)).limit(1);
    if (!profile) error(404, 'User not found');
    return { profile, userId: params.userId, pushPublicKey: pushConfig()?.publicKey ?? null };
};

export const actions: Actions = {
    save: async ({ request, params }) => {
        await requireOwner(request, params.userId);
        const form = await request.formData();
        const color = form.get('color');
        const values = {
            name: String(form.get('name') ?? '').trim(),
            username: String(form.get('username') ?? '').trim(),
            image: String(form.get('image') ?? '').trim(),
            color: isProfileColor(color) ? color : undefined
        };
        if (color !== null && !values.color) return fail(400, { message: 'Choose a profile color from the palette.', values });
        if (!values.name || values.name.length > 100 || !values.username || values.username.length > 15) return fail(400, { message: 'Enter a name (up to 100 characters) and username (up to 15 characters).', values });
        if (values.image) {
            try {
                const url = new URL(values.image);
                if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
            } catch { return fail(400, { message: 'Enter a valid HTTP or HTTPS image URL.', values }); }
        }
        try {
            await auth.api.updateUser({
                headers: request.headers,
                body: {
                    name: values.name,
                    username: values.username,
                    image: values.image || null,
                    ...(values.color && { color: values.color })
                }
            });
        } catch {
            return fail(400, { message: 'Unable to update your profile. Please try again.', values });
        }
        return { success: true, message: 'Profile saved.' };
    },
    delete: async ({ request, params }) => {
        await requireOwner(request, params.userId);
        try {
            await auth.api.deleteUser({ headers: request.headers, body: {} });
        } catch {
            return fail(400, { message: 'Unable to delete your account. Sign in again and retry.' });
        }
        redirect(303, '/');
    }
};
