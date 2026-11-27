import { error, redirect } from '@sveltejs/kit';
import { gameFilterHref, isGame } from '$lib/utils/games';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
    if (!isGame(params.game)) error(404, 'Game not found.');
    redirect(308, gameFilterHref('/games/duel', url.searchParams, params.game));
};
