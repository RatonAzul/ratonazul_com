import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { gameOpponent, user } from '$lib/server/db/schema';
import { sharedGames } from '$lib/utils/games';
import { isProfileColor } from '$lib/utils/profile-colors';
import { byResultCount, playerResultCounts } from '$lib/server/games/player-activity';
import { gamePreferenceRoster, preferredOpponent } from '$lib/server/games/access';
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
    const [profile] = await db.select({ name: user.name, username: user.username, image: user.image, showImage: user.showImage, email: user.email, color: user.color }).from(user).where(eq(user.id, params.userId)).limit(1);
    if (!profile) error(404, 'User not found');
    const [players, opponentId] = await Promise.all([gamePreferenceRoster(), preferredOpponent(params.userId)]);
    const preferredGames = players.find(player => player.id === params.userId)?.preferredGames ?? [];
    const opponents = players.filter(player => player.id !== params.userId && sharedGames(preferredGames, player.preferredGames).length);
    if (opponents.length > 1) opponents.sort(byResultCount(await playerResultCounts(params.userId)));
    return { profile, userId: params.userId, pushPublicKey: pushConfig()?.publicKey ?? null, opponents, opponentId: opponents.find(player => player.id === opponentId)?.id ?? 'automatic' };
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
            showImage: form.has('showImage'),
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
                    showImage: values.showImage,
                    profileSetupComplete: true,
                    ...(values.color && { color: values.color })
                }
            });
        } catch {
            return fail(400, { message: 'Unable to update your profile. Please try again.', values });
        }
        return { success: true, message: 'Profile saved.' };
    },
    saveOpponent: async ({ request, params }) => {
        await requireOwner(request, params.userId);
        const opponentId = (await request.formData()).get('opponent');
        if (typeof opponentId !== 'string' || opponentId === params.userId) {
            return fail(400, { success: false, opponentMessage: 'Choose another player.' });
        }
        if (opponentId !== 'automatic') {
            const players = await gamePreferenceRoster();
            const owner = players.find(player => player.id === params.userId);
            const opponent = players.find(player => player.id === opponentId);
            if (!owner || !opponent || !sharedGames(owner.preferredGames, opponent.preferredGames).length) {
                return fail(400, { success: false, opponentMessage: 'Choose a player with a preferred game in common.' });
            }
            await db.insert(gameOpponent).values({ userId: params.userId, opponentId })
                .onConflictDoUpdate({ target: gameOpponent.userId, set: { opponentId } });
        } else {
            await db.delete(gameOpponent).where(eq(gameOpponent.userId, params.userId));
        }
        return { success: true, opponentMessage: 'Duel opponent saved.' };
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
