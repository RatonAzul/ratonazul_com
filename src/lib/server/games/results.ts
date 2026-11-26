import { gamesRequest } from '$lib/server/games-api';
import { deliverNotification } from '$lib/server/notifications';
import type { SiteNotification } from '$lib/types/notifications';
import type { GameRecord, IsaacInput, WordleInput } from '$lib/utils/games';

export async function createGameResult(endpoint: string, actor: string, input: WordleInput | IsaacInput, playerName: string) {
    const result = await gamesRequest<GameRecord & { notification?: SiteNotification }>(endpoint, actor, 'POST', {
        ...input,
        notification: { display_name: playerName.trim() || 'unknown player' }
    });
    if (result.notification) await deliverNotification(result.notification, input.user_id);
}
