import { JoystickIcon, TextAaIcon, TranslateIcon } from 'phosphor-svelte';
import type { Game } from '$lib/utils/games';

export const gameIcons = {
    wordle: TextAaIcon,
    'la-palabra-del-dia': TranslateIcon,
    isaaconnect: JoystickIcon
} satisfies Record<Game, typeof JoystickIcon>;
