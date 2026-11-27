import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { GamesApiError, listGames } from '$lib/server/games-api';
import { syncCalendarGameResults, withCalendarGameLock } from '$lib/server/calendar/game-results';
import { createGameResult, currentGameDate } from './results';
import { games, isGame, normalizeWord, parseIsaac, parseSpanishWordle, puzzleDay, wordleBoardResult, wordleResult, type GameRecord, type Solution } from '$lib/utils/games';

export async function submitResult({ locals, url, request }: RequestEvent) {
    const player = locals.user;
    if (!player) error(403, 'Sign in to submit your result.');
    const form = await request.formData();
    const field = (name: string) => String(form.get(name) ?? '');
    const game = field('game');
    const date = field('date');
    const selectedGame = url.searchParams.get('game');
    if (!isGame(game) || (selectedGame !== null && selectedGame !== game)) error(400, 'Choose a valid game.');
    if (date !== currentGameDate()) {
        return fail(400, { game, date, message: 'You can only submit today’s result.' });
    }

    const config = games[game];
    const day = puzzleDay(game, date);
    const mode = field('mode');
    const share = field('share');
    let saved = false;
    try {
        if (share.length > 20_000) throw new Error('The shared result is too long.');
        await withCalendarGameLock(game, async () => {
            if (date !== currentGameDate()) throw new Error('You can only submit today’s result.');
            const existing = await listGames<GameRecord>(config.endpoint, player.id, {
                user_id: player.id,
                ...(game === 'isaaconnect' ? { day: String(day) } : { date })
            });
            if (existing.length) throw new GamesApiError(409, 'You already submitted this result.');

            if (game === 'isaaconnect') {
                const result = parseIsaac(share);
                if (result.day !== day) throw new Error(`Today’s puzzle is #${day}.`);
                await createGameResult(config.endpoint, player.id, { ...result, user_id: player.id }, player.name);
            } else {
                let result;
                if (mode === 'board') {
                    result = wordleBoardResult(field('board'));
                } else if (mode === 'share' && game === 'la-palabra-del-dia') {
                    result = parseSpanishWordle(share);
                    if (result.day !== day) throw new Error(`Today’s puzzle is #${day}.`);
                } else if (mode === 'words') {
                    const answer = normalizeWord(field('answer'));
                    result = wordleResult(Array.from({ length: 6 }, (_, index) => field(`guess${index}`)), answer);
                    const [solution] = await listGames<Solution>(games[game].solutions, player.id, { day: String(day) });
                    if (solution && solution.word !== answer) throw new Error('The answer does not match today’s puzzle.');
                } else {
                    throw new Error('Choose a valid input method.');
                }
                await createGameResult(config.endpoint, player.id, { ...result, day, date, user_id: player.id }, player.name);
            }
            saved = true;
        });
        await syncCalendarGameResults(game, [date], player.id);
        return { game, date };
    } catch (cause) {
        if (saved) {
            return { game, date, warning: 'Result saved. The calendar summary could not be updated.' };
        }
        const status = cause instanceof GamesApiError ? ([400, 409].includes(cause.status) ? cause.status : 503) : 400;
        return fail(status, { game, date, message: cause instanceof Error ? cause.message : 'Unable to save this result.' });
    }
}
