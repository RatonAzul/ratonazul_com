import { error } from '@sveltejs/kit';
import { listGames } from '$lib/server/games-api';
import { registeredGamePlayers } from '$lib/server/games/access';
import { currentGameDate } from '$lib/server/games/results';
import { leaderboard } from '$lib/utils/game-leaderboard';
import { games, isGame, recordDate, validDate, type Game, type GameRecord } from '$lib/utils/games';
import { calendarWeekRange } from '$lib/utils/shared/calendar';
import type { PageServerLoad } from './$types';

const firstDate = '2026-08-01';
const gameIds = Object.keys(games) as Game[];

export const load: PageServerLoad = async ({ locals, url }) => {
    const today = currentGameDate();
    const date = url.searchParams.get('date') ?? today;
    if (!validDate(date) || date < firstDate || date > today) error(400, 'Choose a past or current game date.');

    const game = url.searchParams.get('game') ?? undefined;
    if (game !== undefined && !isGame(game)) error(404, 'Game not found.');
    const selectedGames = game ? [game] : gameIds;

    const tab = url.searchParams.get('tab');
    const period = tab === 'weekly' || tab === 'monthly' || tab === 'global' ? tab : 'daily';
    const { start, end } = calendarWeekRange(date);
    const month = date.slice(0, 7);
    const year = date.slice(0, 4);
    const reader = locals.user?.id ?? 'public-games';

    const [players, histories] = await Promise.all([
        registeredGamePlayers(),
        Promise.allSettled(selectedGames.map(game => listGames<GameRecord>(games[game].endpoint, reader)))
    ]);
    const profiles = new Map(players.map(player => [player.id, player]));
    const calendar: Record<string, number> = {};

    function inPeriod(day: string) {
        if (period === 'daily') return day === date;
        if (period === 'weekly') return day >= start && day < end;
        if (period === 'monthly') return day.startsWith(month + '-');
        return true;
    }

    const boards = histories.map((history, index) => {
        const game = selectedGames[index];
        if (history.status === 'rejected') return { game, available: false, rows: [] };

        const dayRecords = new Set<string>();
        const scoped = history.value.filter(record => {
            if (!profiles.has(record.user_id)) return false;
            const day = recordDate(record);
            if (day < firstDate || day > today) return false;
            if (day.startsWith(year + '-')) dayRecords.add(day);
            return inPeriod(day);
        });
        for (const day of dayRecords) calendar[day] = (calendar[day] ?? 0) + 1;
        const rows = leaderboard(scoped).map(row => ({ ...row, player: profiles.get(row.id)! }));
        return { game, available: true, rows };
    });

    return { firstDate, today, date, period, game, calendar, boards } as const;
};
