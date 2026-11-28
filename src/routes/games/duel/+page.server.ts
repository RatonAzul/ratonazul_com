import { error, redirect } from '@sveltejs/kit';
import { listGames } from '$lib/server/games-api';
import { currentGameDate, firstGameDate as firstDate } from '$lib/server/games/results';
import { submittedGameDates } from '$lib/server/games/result-visibility';
import { submitResult } from '$lib/server/games/submit-result';
import { byResultCount, playerResultCounts } from '$lib/server/games/player-activity';
import { duelSetup } from '$lib/server/games/access';
import { compareGamePair, displayGameResult, isaacStatistics, pointProgression, wordleStatistics } from '$lib/utils/game-result-summary';
import { gameFilterHref, games, isGame, recordDate, validDate, type Game, type GameRecord } from '$lib/utils/games';
import { calendarMonths, calendarWeekRange } from '$lib/utils/shared/calendar';
import type { Actions, PageServerLoad } from './$types';

const millisecondsPerDay = 86_400_000;
const gameIds = Object.keys(games) as Game[];

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
    const game = url.searchParams.get('game') ?? undefined;
    if (game !== undefined && !isGame(game)) error(404, 'Game not found.');
    const tab = url.searchParams.get('tab');
    const period = tab === 'weekly' || tab === 'monthly' || tab === 'global' ? tab : 'daily';
    const scope = { game, period } as const;
    setHeaders({ 'Cache-Control': 'private, no-store' });
    const viewerId = locals.user?.id;
    const pairing = await duelSetup(viewerId, url.searchParams.get('first'), url.searchParams.get('second'));
    const { roster, players, commonGames } = pairing;
    if (!players) return { ...scope, matchup: null };
    if (game && !commonGames.includes(game)) redirect(303, gameFilterHref('/games/duel', url.searchParams));
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
    const selectedGames = selectedGame ? [selectedGame] : gameIds.filter(game => commonGames.includes(game));
    const activity = playerResultCounts(reader);
    const results = await Promise.allSettled(selectedGames.map(async game => {
        const histories = await Promise.all(players.map(player =>
            listGames<GameRecord>(games[game].endpoint, reader, { user_id: player.id })
        ));
        const viewerRecords = viewerId
            ? histories[submissionSlot] ?? await listGames<GameRecord>(games[game].endpoint, reader, { user_id: viewerId }).catch(() => [])
            : [];
        const visibleDates = submittedGameDates(viewerRecords, viewerId);
        const byDate = new Map<string, GameRecord[]>();
        for (const record of histories.flat()) {
            const day = recordDate(record);
            if (day < firstDate || day > today) continue;
            const records = byDate.get(day);
            if (records) records.push(record);
            else byDate.set(day, [record]);
        }

        const matchups = new Map([...byDate].filter(([day]) => visibleDates.has(day)).map(([day, records]) => [
            day, compareGamePair(game, records, [players[0].id, players[1].id])
        ] as const));
        const periodHidden = !viewerId || [...byDate.keys()].some(day => inSelectedPeriod(day) && !visibleDates.has(day));
        const wordleStats = !periodHidden && period !== 'daily' && selectedGame && game !== 'isaaconnect' ? players.map((_, index) => {
            const scores: number[] = [];
            for (const [day, matchup] of matchups) {
                const record = matchup.results[index];
                if (inSelectedPeriod(day) && record && 'score' in record) scores.push(record.score);
            }
            return wordleStatistics(scores);
        }) : null;
        const isaacStats = !periodHidden && period !== 'daily' && selectedGame === 'isaaconnect' ? histories.map(records => isaacStatistics(
            records.filter(record => {
                const day = recordDate(record);
                return day >= firstDate && day <= today && inSelectedPeriod(day);
            }).filter(record => 'points' in record)
        )) : null;
        return { matchups, visibleDates, recordedDates: [...byDate.keys()], periodHidden, wordleStats, isaacStats };
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

    function dayHidden(day: string) {
        return results.some(result => result.status === 'fulfilled' && !result.value.visibleDates.has(day));
    }

    function matchupsForDay(day: string) {
        return results.map((result, index) => {
            const game = selectedGames[index];
            const matchup = result.status === 'fulfilled' ? result.value.matchups.get(day) : undefined;
            return {
                game,
                available: result.status === 'fulfilled',
                hidden: result.status === 'fulfilled' && !result.value.visibleDates.has(day),
                outcome: matchup?.outcome ?? null,
                results: matchup?.results.map(displayGameResult) ?? [null, null]
            };
        });
    }

    const matchups = matchupsForDay(date);
    const history = results[0];
    const wordleStats = history?.status === 'fulfilled' ? history.value.wordleStats : null;
    const isaacStats = history?.status === 'fulfilled' ? history.value.isaacStats : null;
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
                for (const day of result.value.recordedDates) recordedDates.add(day);
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
        score: dayHidden(date) ? null : scores.get(date) ?? [0, 0],
        matchups: date >= firstDate && date <= today ? matchupsForDay(date) : []
    }));
    const complete = matchups.every(matchup => matchup.available);
    const periodHidden = results.some(result => result.status === 'fulfilled' && result.value.periodHidden);
    const totalsHidden = period === 'daily' ? dayHidden(date) : periodHidden;
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
            if (dayHidden(day)) continue;
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

    const progression = period !== 'daily' && complete && !periodHidden
        ? pointProgression(events, positionForDate(rangeEnd))
        : null;
    return { ...scope, matchup: {
        date, today, firstDate, submissionSlot, players, commonGames, options: roster.toSorted(byResultCount(await activity)), matchups, days, pageNumber, pageCount,
        points: complete && !totalsHidden ? totals[period] : null, totalsHidden, periodHidden,
        wordleStats, isaacStats, progression, rangeStart, rangeEnd, calendar: complete ? calendar : null
    } };
};

export const actions = {
    submitResult: event => submitResult(event, true)
} satisfies Actions;
