import { games, type Game } from './games.ts';
import type { SiteNotification } from '../types/notifications';

const gameIds = Object.keys(games) as Game[];
const puzzleHeadings = {
    wordle: /^Wordle (\d[\d,]*)\s/i,
    'la-palabra-del-dia': /^La palabra del día #(\d+)\s/i,
    isaaconnect: /^Isaaconnect #(\d+)\s/i
};

export const hiddenGameNotificationDescription = 'Submit your result for this puzzle to reveal the score and board.';

export function gameNotificationPuzzle({ section, title, description }: Pick<SiteNotification, 'section' | 'title' | 'description'>) {
    if (section.trim().toLowerCase() !== 'games') return;
    const game = gameIds.find(game => title.trim().toLowerCase().endsWith(' played ' + games[game].name));
    if (!game) return;

    const puzzle = puzzleHeadings[game].exec(description)?.[1];
    const day = puzzle ? Number(puzzle.replaceAll(',', '')) : null;
    return { game, day: day !== null && Number.isSafeInteger(day) && day > 0 ? day : null };
}
