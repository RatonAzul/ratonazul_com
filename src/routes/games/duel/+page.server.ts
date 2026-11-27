import { error, fail } from '@sveltejs/kit';
import { GamesApiError, listGames } from '$lib/server/games-api';
import { syncCalendarGameResults, withCalendarGameLock } from '$lib/server/calendar/game-results';
import { createGameResult, currentGameDate } from '$lib/server/games/results';
import { duelSetup } from '$lib/server/games/access';
import { compareGamePair, gameResultScore, isaacStatistics, pointProgression, wordleStatistics } from '$lib/utils/game-result-summary';
import { games, isGame, normalizeWord, parseIsaac, parseSpanishWordle, puzzleDay, recordDate, validDate, wordleBoardResult, wordleResult, type Game, type GameRecord, type Solution } from '$lib/utils/games';
import { calendarMonths, calendarWeekRange } from '$lib/utils/shared/calendar';
import type { Actions, PageServerLoad } from './$types';

const millisecondsPerDay = 86_400_000;
const firstDate = '2026-08-01';
const gameIds = Object.keys(games) as Game[];

function displayResult(record: GameRecord | undefined) {
    if (!record) return null;
    if ('points' in record) {
        const minutes = String(Math.floor(record.time / 60)).padStart(2, '0');
        const seconds = String(record.time % 60).padStart(2, '0');
        return { rows: record.board, score: gameResultScore(record), points: record.points, lives: record.lifes, time: minutes + ':' + seconds };
    }
    return {
        score: gameResultScore(record),
        rows: record.board.match(/.{5}/g) ?? [],
        words: record.words ?? []
    };
}

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
    const game = url.searchParams.get('game') ?? undefined;
    if (game !== undefined && !isGame(game)) error(404, 'Game not found.');
    const tab = url.searchParams.get('tab');
    const period = tab === 'weekly' || tab === 'monthly' || tab === 'global' ? tab : 'daily';
    const scope = { game, period } as const;
    setHeaders({ 'Cache-Control': 'private, no-store' });
    const viewerId = locals.user?.id;
    const pairing = await duelSetup(viewerId, url.searchParams.get('first'), url.searchParams.get('second'));
    if (!pairing) return { ...scope, matchup: null };
    const { roster, players } = pairing;
    const submissionSlot = players.findIndex(player => player.id === viewerId);
    const reader = viewerId ?? 'public-games';

    const today = currentGameDate();
    const date = url.searchParams.get('date') ?? today;
    if (!validDate(date) || date < firstDate || date > today) error(400, 'Choose a past or current game date.');

    const year = date.slice(0, 4);
    const { start, end } = calendarWeekRange(date);
    const month = date.slice(0, 7);

    function inSelectedPeriod(day: string) {
        if (period === 'weekly') return day >= start && day < end;
        if (period === 'monthly') return day.startsWith(month + '-');
        return true;
    }

    const selectedGame = game;
    const selectedGames = selectedGame ? [selectedGame] : gameIds;
    const results = await Promise.allSettled(selectedGames.map(async game => {
        const histories = await Promise.all(players.map(player =>
            listGames<GameRecord>(games[game].endpoint, reader, { user_id: player.id })
        ));
        const byDate = new Map<string, GameRecord[]>();
        for (const record of histories.flat()) {
            const day = recordDate(record);
            if (day < firstDate || day > today) continue;
            const records = byDate.get(day);
            if (records) records.push(record);
            else byDate.set(day, [record]);
        }

        const matchups = new Map([...byDate].map(([day, records]) => [
            day, compareGamePair(game, records, [players[0].id, players[1].id])
        ] as const));
        const wordleStats = period !== 'daily' && selectedGame && game !== 'isaaconnect' ? players.map((_, index) => {
            const scores: number[] = [];
            for (const [day, matchup] of matchups) {
                const record = matchup.results[index];
                if (inSelectedPeriod(day) && record && 'score' in record) scores.push(record.score);
            }
            return wordleStatistics(scores);
        }) : null;
        const isaacStats = period !== 'daily' && selectedGame === 'isaaconnect' ? histories.map(records => isaacStatistics(
            records.filter(record => {
                const day = recordDate(record);
                return day >= firstDate && day <= today && inSelectedPeriod(day);
            }).filter(record => 'points' in record)
        )) : null;
        return { matchups, wordleStats, isaacStats };
    }));

    const scores = new Map<string, [number, number]>();
    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const [day, { outcome }] of result.value.matchups) {
            if (!outcome) continue;
            const score = scores.get(day) ?? [0, 0];
            if (outcome === 'first') score[0]++;
            if (outcome === 'second') score[1]++;
            scores.set(day, score);
        }
    }

    function matchupsForDay(day: string) {
        return results.map((result, index) => {
            const game = selectedGames[index];
            const matchup = result.status === 'fulfilled' ? result.value.matchups.get(day) : undefined;
            return {
                game,
                available: result.status === 'fulfilled',
                outcome: matchup?.outcome ?? null,
                results: matchup?.results.map(displayResult) ?? [null, null]
            };
        });
    }

    const matchups = matchupsForDay(date);
    const history = results[0];
    const wordleStats = history.status === 'fulfilled' ? history.value.wordleStats : null;
    const isaacStats = history.status === 'fulfilled' ? history.value.isaacStats : null;
    let dates: string[] = [];
    if (period === 'weekly') {
        dates = Array.from({ length: 7 }, (_, index) => {
            const day = new Date(start);
            day.setUTCDate(day.getUTCDate() + index);
            return day.toISOString().slice(0, 10);
        });
    } else if (period === 'monthly') {
        dates = calendarMonths(Number(year))[Number(date.slice(5, 7)) - 1].dates;
    } else if (period === 'global') {
        const recordedDates = new Set<string>();
        for (const result of results) {
            if (result.status === 'fulfilled') {
                for (const day of result.value.matchups.keys()) recordedDates.add(day);
            }
        }
        dates = [...recordedDates].sort().reverse();
    }

    const pageSize = 7;
    const pageCount = Math.max(1, Math.ceil(dates.length / pageSize));
    const requestedPage = Number(url.searchParams.get('page'));
    const pageNumber = Number.isSafeInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
    const pageStart = (pageNumber - 1) * pageSize;
    const days = dates.slice(pageStart, pageStart + pageSize).map(date => ({
        date,
        score: scores.get(date) ?? [0, 0],
        matchups: date >= firstDate && date <= today ? matchupsForDay(date) : []
    }));
    const complete = matchups.every(matchup => matchup.available);
    const calendar: Record<string, 'first' | 'second' | 'draw'> = {};
    const totals = {
        daily: scores.get(date) ?? [0, 0],
        weekly: [0, 0],
        monthly: [0, 0],
        global: [0, 0]
    };
    const events: { position: number; winner: 0 | 1 }[] = [];
    const rangeStart = period === 'weekly' ? start : period === 'monthly' ? month + '-01' : firstDate;
    const lastPeriodDay = period === 'weekly' || period === 'monthly' ? dates.at(-1) ?? today : today;
    const rangeEnd = lastPeriodDay < today ? lastPeriodDay : today;

    function positionForDate(day: string) {
        return (Date.parse(day) - Date.parse(rangeStart)) / millisecondsPerDay + 1;
    }

    if (complete) {
        for (const [day, [left, right]] of scores) {
            if (day.startsWith(year + '-')) {
                calendar[day] = left === right ? 'draw' : left > right ? 'first' : 'second';
            }
            if (left === right) continue;

            const winner = left > right ? 0 : 1;
            totals.global[winner]++;
            if (period !== 'daily' && inSelectedPeriod(day)) {
                events.push({ position: positionForDate(day), winner });
            }
            if (day.startsWith(month + '-')) totals.monthly[winner]++;
            if (day >= start && day < end) totals.weekly[winner]++;
        }
    }

    const progression = period !== 'daily' && complete
        ? pointProgression(events, positionForDate(rangeEnd))
        : null;
    return { ...scope, matchup: {
        date, today, firstDate, submissionSlot, players, options: roster, matchups, days, pageNumber, pageCount,
        totals, wordleStats, isaacStats, progression, rangeStart, rangeEnd, calendar: complete ? calendar : null
    } };
};

export const actions: Actions = {
    submitResult: async ({ locals, url, request }) => {
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
};
