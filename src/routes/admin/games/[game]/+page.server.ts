import { error, fail } from '@sveltejs/kit';
import { requireGamesAdmin } from '$lib/server/games/access';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';
import { syncCalendarGameResults } from '$lib/server/calendar/game-results';
import { createGameResult } from '$lib/server/games/results';
import { gamesRequest, listGames, GamesApiError } from '$lib/server/games-api';
import { games, isGame, validDate, recordDate, puzzleDay, isaacDay, parseIsaac, parseSpanishWordle, wordleResult, wordleBoardResult, normalizeWord, type GameRecord, type IsaacInput, type WordleInput, type Solution } from '$lib/utils/games';
import type { Actions, PageServerLoad } from './$types';

function gameConfig(slug: string) {
    if (!isGame(slug)) error(404, 'Unknown game');
    return { ...games[slug], game: slug };
}
function positiveInt(value: string, label: string) {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2_147_483_647) throw new Error(`Enter a valid ${label}.`);
    return Number(value);
}
function report(cause: unknown) {
    if (cause instanceof GamesApiError) return { status: [400, 404, 409].includes(cause.status) ? cause.status : 503, message: cause.message };
    return { status: 400, message: cause instanceof Error ? cause.message : 'Unable to save this result.' };
}

async function saveGameResult(
    endpoint: string, actor: string, id: number | null, input: WordleInput | IsaacInput, playerName: string
) {
    if (id !== null) {
        await gamesRequest(`${endpoint}/${id}`, actor, 'PUT', input);
        return;
    }

    await createGameResult(endpoint, actor, input, playerName);
}

export const load: PageServerLoad = async ({ request, params, url }) => {
    const actor = await requireGamesAdmin(request);
    const config = gameConfig(params.game);
    const today = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date());
    const currentYear = Number(today.slice(0, 4));
    const rawYear = url.searchParams.get('year') ?? String(currentYear);
    const year = Number(rawYear);
    if (!/^\d{4}$/.test(rawYear) || year < 2026 || year > currentYear) error(400, 'Choose a year from 2026 to the current year.');
    const date = url.searchParams.get('date') ?? (year === currentYear ? today : `${year}-01-01`);
    if (!validDate(date) || Number(date.slice(0, 4)) !== year) error(400, 'Choose a valid date within the selected year.');
    const players = await db.select({ id: user.id, name: user.name, username: user.username, image: user.image, showImage: user.showImage, color: user.color }).from(user).orderBy(user.name);
    try {
        const records = await listGames<GameRecord>(config.endpoint, actor);
        const daily = records.filter(record => 'date' in record ? record.date === date : record.day === isaacDay(date));
        const days = [...new Set([puzzleDay(params.game as keyof typeof games, date), ...daily.map(record => record.day)])];
        const solutions = config.solutions ? (await Promise.all(days.map(day => listGames<Solution>(config.solutions!, actor, { day: String(day) })))).flat() : [];
        return { game: params.game as keyof typeof games, year, currentYear, today, date, defaultUserId: actor, players, records, daily, solutions, loadError: '' };
    } catch (cause) {
        return { game: params.game as keyof typeof games, year, currentYear, today, date, defaultUserId: actor, players, records: [] as GameRecord[], daily: [] as GameRecord[], solutions: [] as Solution[], loadError: report(cause).message };
    }
};

export const actions: Actions = {
    save: async ({ request, params }) => {
        const actor = await requireGamesAdmin(request);
        const config = gameConfig(params.game);
        const form = await request.formData();
        const value = (key: string) => String(form.get(key) ?? '');
        const values = { id: value('id'), userId: value('userId'), date: value('date'), answer: value('answer'), words: Array.from({ length: 6 }, (_, i) => value(`guess${i}`)), share: value('share'), mode: value('mode'), board: value('board') };
        let wrote = false;
        let syncingCalendar = false;
        try {
            const id = values.id ? positiveInt(values.id, 'record id') : null;
            if (!validDate(values.date) || Number(values.date.slice(0, 4)) < 2026 || Number(values.date.slice(0, 4)) > new Date().getFullYear()) throw new Error('Choose a date from 2026 to the current year.');
            if (values.date > new Date().toISOString().slice(0, 10)) throw new Error('Results cannot be entered for future dates.');
            const [player] = await db.select({ id: user.id, name: user.name }).from(user).where(eq(user.id, values.userId)).limit(1);
            if (!player) throw new Error('Choose a registered player.');
            const previous = id ? await gamesRequest<GameRecord>(`${config.endpoint}/${id}`, actor) : null;
            if (!config.solutions) {
                const parsed = parseIsaac(values.share);
                if (parsed.day !== isaacDay(values.date)) throw new Error(`This date is Isaaconnect #${isaacDay(values.date)}. The pasted puzzle is #${parsed.day}.`);
                await saveGameResult(config.endpoint, actor, id, { ...parsed, user_id: player.id }, player.name);
            } else {
                const day = puzzleDay(params.game as keyof typeof games, values.date);
                if (values.mode && !['words', 'share', 'board'].includes(values.mode)) throw new Error('Choose a valid input method.');
                const boardOnly = values.mode === 'share' || values.mode === 'board';
                if (values.mode === 'share' && params.game !== 'la-palabra-del-dia') throw new Error('Share input is only supported for La Palabra del Día.');
                const result = values.mode === 'board' ? wordleBoardResult(values.board) : values.mode === 'share' ? parseSpanishWordle(values.share) : wordleResult(values.words, values.answer);
                if ('day' in result && result.day !== day) throw new Error(`This date expects puzzle #${day}. The pasted puzzle is #${result.day}.`);
                const saveAnswer = !boardOnly || (values.mode === 'board' && !!values.answer.trim());
                const answer = saveAnswer ? normalizeWord(values.answer) : '';
                const [solutions, sameDay, sameDate] = await Promise.all([
                    listGames<Solution>(config.solutions, actor, { day: String(day) }),
                    listGames<GameRecord>(config.endpoint, actor, { day: String(day) }),
                    listGames<GameRecord>(config.endpoint, actor, { date: values.date })
                ]);
                if (sameDay.some(record => record.id !== id && 'date' in record && record.date !== values.date) || sameDate.some(record => record.id !== id && record.day !== day)) throw new Error('The puzzle number and date conflict with an existing result.');
                const solution = solutions[0];
                const corrections: { id: number; input: WordleInput }[] = [];
                if (saveAnswer && solution && solution.word !== answer) {
                    for (const other of sameDay.filter(record => record.id !== id)) {
                        if (!('words' in other) || other.is_simple) throw new Error('The answer is shared by this puzzle. A board-only result cannot be recalculated; correct that result with its guesses first.');
                        try {
                            corrections.push({ id: other.id, input: { day: other.day, date: other.date, user_id: other.user_id, ...wordleResult(other.words, answer) } });
                        } catch { throw new Error('Changing this shared answer would invalidate another player’s guesses. Correct or remove that result first.'); }
                    }
                }
                await saveGameResult(config.endpoint, actor, id, { day, date: values.date, user_id: player.id, ...result }, player.name);
                wrote = true;
                if (saveAnswer && (!solution || solution.word !== answer)) {
                    await gamesRequest(`${config.solutions}${solution ? `/${solution.id}` : ''}`, actor, solution ? 'PUT' : 'POST', { day, word: answer });
                    for (const correction of corrections) await gamesRequest(`${config.endpoint}/${correction.id}`, actor, 'PUT', correction.input);
                }
            }
            syncingCalendar = true;
            await syncCalendarGameResults(config.game, previous ? [recordDate(previous), values.date] : [values.date], actor);
            return { success: true, message: 'Result saved.', values: null };
        } catch (cause) {
            const failure = report(cause);
            const partial = syncingCalendar
                ? ' The result was saved, but updating the calendar event failed. Reload and save the result again to retry.'
                : wrote ? ' The result was saved, but synchronizing the shared answer failed. Reload and review this puzzle before retrying.' : '';
            return fail(failure.status, { success: false, message: `${failure.message}${partial}`, values: syncingCalendar ? null : values });
        }
    },
    delete: async ({ request, params }) => {
        const actor = await requireGamesAdmin(request);
        const config = gameConfig(params.game);
        const form = await request.formData();
        let deleted = false;
        try {
            const id = positiveInt(String(form.get('id') ?? ''), 'record id');
            const previous = await gamesRequest<GameRecord>(`${config.endpoint}/${id}`, actor);
            await gamesRequest(`${config.endpoint}/${id}`, actor, 'DELETE');
            deleted = true;
            await syncCalendarGameResults(config.game, [recordDate(previous)], actor);
            return { success: true, message: config.solutions ? 'Result deleted. The shared daily answer is retained.' : 'Result deleted.', values: null };
        } catch (cause) {
            const failure = report(cause);
            return fail(failure.status, { success: false, message: deleted ? 'Result deleted, but updating the calendar event failed.' : failure.message, values: null });
        }
    }
};
