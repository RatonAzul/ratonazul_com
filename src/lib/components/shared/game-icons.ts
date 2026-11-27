import { SmileySadIcon, TextAaIcon, TranslateIcon } from 'phosphor-svelte';
import type { Game } from '$lib/utils/games';

export const gameIcons = {
    wordle: TextAaIcon,
    'la-palabra-del-dia': TranslateIcon,
    isaaconnect: SmileySadIcon
} satisfies Record<Game, typeof SmileySadIcon>;
