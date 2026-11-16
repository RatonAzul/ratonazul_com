import { error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';
import { gamesRequest, listGames, GamesApiError } from '$lib/server/games-api';
import { games, isGame, validDate, puzzleDay, isaacDay, parseIsaac, wordleResult, type GameRecord, type WordleInput, type Solution } from '$lib/utils/games';
import type { Actions, PageServerLoad } from './$types';

async function requireAdmin(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) redirect(303, '/');
    if (session.user.role !== 'admin') error(403, 'Forbidden');
    return session.user.id;
}
function gameConfig(slug: string) {
    if (!isGame(slug)) error(404, 'Unknown game');
    return games[slug];
}
function positiveInt(value: string, label: string) {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2_147_483_647) throw new Error(`Enter a valid ${label}.`);
    return Number(value);
}
function report(cause: unknown) {
    if (cause instanceof GamesApiError) return { status: [400, 404, 409].includes(cause.status) ? cause.status : 503, message: cause.message };
    return { status: 400, message: cause instanceof Error ? cause.message : 'Unable to save this result.' };
}

export const load: PageServerLoad = async ({ request, params, url }) => {
    const actor = await requireAdmin(request);
    const config = gameConfig(params.game);
    const currentYear = new Date().getFullYear();
    const rawYear = url.searchParams.get('year') ?? String(currentYear);
    const year = Number(rawYear);
    if (!/^\d{4}$/.test(rawYear) || year < 2026 || year > currentYear) error(400, 'Choose a year from 2026 to the current year.');
    const today = new Date().toISOString().slice(0, 10);
    const date = url.searchParams.get('date') ?? (year === currentYear ? today : `${year}-01-01`);
    if (!validDate(date) || Number(date.slice(0, 4)) !== year) error(400, 'Choose a valid date within the selected year.');
    const players = await db.select({ id: user.id, name: user.name, username: user.username }).from(user).orderBy(user.name);
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
        const actor = await requireAdmin(request);
        const config = gameConfig(params.game);
        const form = await request.formData();
        const value = (key: string) => String(form.get(key) ?? '');
        const values = { id: value('id'), userId: value('userId'), date: value('date'), answer: value('answer'), words: Array.from({ length: 6 }, (_, i) => value(`guess${i}`)), share: value('share') };
        let wrote = false;
        try {
            const id = values.id ? positiveInt(values.id, 'record id') : null;
            if (!validDate(values.date) || Number(values.date.slice(0, 4)) < 2026 || Number(values.date.slice(0, 4)) > new Date().getFullYear()) throw new Error('Choose a date from 2026 to the current year.');
            if (values.date > new Date().toISOString().slice(0, 10)) throw new Error('Results cannot be entered for future dates.');
            const [player] = await db.select({ id: user.id }).from(user).where(eq(user.id, values.userId)).limit(1);
            if (!player) throw new Error('Choose a registered player.');
            if (id) await gamesRequest<GameRecord>(`${config.endpoint}/${id}`, actor);
            if (!config.solutions) {
                const parsed = parseIsaac(values.share);
                if (parsed.day !== isaacDay(values.date)) throw new Error(`This date is Isaaconnect #${isaacDay(values.date)}. The pasted puzzle is #${parsed.day}.`);
                await gamesRequest(`${config.endpoint}${id ? `/${id}` : ''}`, actor, id ? 'PUT' : 'POST', { ...parsed, user_id: player.id });
            } else {
                const day = puzzleDay(params.game as keyof typeof games, values.date);
                const result = wordleResult(values.words, values.answer);
                const answer = values.answer.trim().normalize('NFC').toLowerCase();
                const [solutions, sameDay, sameDate] = await Promise.all([
                    listGames<Solution>(config.solutions, actor, { day: String(day) }),
                    listGames<GameRecord>(config.endpoint, actor, { day: String(day) }),
                    listGames<GameRecord>(config.endpoint, actor, { date: values.date })
                ]);
                if (sameDay.some(record => record.id !== id && 'date' in record && record.date !== values.date) || sameDate.some(record => record.id !== id && record.day !== day)) throw new Error('The puzzle number and date conflict with an existing result.');
                const solution = solutions[0];
                const corrections: { id: number; input: WordleInput }[] = [];
                if (solution && solution.word !== answer) {
                    for (const other of sameDay.filter(record => record.id !== id)) {
                        if (!('words' in other) || other.is_simple) throw new Error('The answer is shared by this puzzle. A board-only result cannot be recalculated; correct that result with its guesses first.');
                        try {
                            corrections.push({ id: other.id, input: { day: other.day, date: other.date, user_id: other.user_id, ...wordleResult(other.words, answer) } });
                        } catch { throw new Error('Changing this shared answer would invalidate another player’s guesses. Correct or remove that result first.'); }
                    }
                }
                await gamesRequest(`${config.endpoint}${id ? `/${id}` : ''}`, actor, id ? 'PUT' : 'POST', { day, date: values.date, user_id: player.id, ...result });
                wrote = true;
                if (!solution || solution.word !== answer) {
                    await gamesRequest(`${config.solutions}${solution ? `/${solution.id}` : ''}`, actor, solution ? 'PUT' : 'POST', { day, word: answer });
                    for (const correction of corrections) await gamesRequest(`${config.endpoint}/${correction.id}`, actor, 'PUT', correction.input);
                }
            }
            return { success: true, message: 'Result saved.', values: null };
        } catch (cause) {
            const failure = report(cause);
            return fail(failure.status, { success: false, message: `${failure.message}${wrote ? ' The result was saved, but synchronizing the shared answer failed. Reload and review this puzzle before retrying.' : ''}`, values });
        }
    },
    delete: async ({ request, params }) => {
        const actor = await requireAdmin(request);
        const config = gameConfig(params.game);
        const form = await request.formData();
        try {
            const id = positiveInt(String(form.get('id') ?? ''), 'record id');
            await gamesRequest(`${config.endpoint}/${id}`, actor, 'DELETE');
            return { success: true, message: config.solutions ? 'Result deleted. The shared daily answer is retained.' : 'Result deleted.', values: null };
        } catch (cause) {
            const failure = report(cause);
            return fail(failure.status, { success: false, message: failure.message, values: null });
        }
    }
};
