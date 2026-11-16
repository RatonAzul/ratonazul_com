export const games = {
    wordle: { name: 'wordle', endpoint: 'wordles', solutions: 'wordle-solutions' },
    'la-palabra-del-dia': { name: 'la palabra del día', endpoint: 'spanish-wordles', solutions: 'spanish-wordle-solutions' },
    isaaconnect: { name: 'isaaconnect', endpoint: 'isaac-tries', solutions: null }
} as const;
export type Game = keyof typeof games;
export function isGame(value: string): value is Game { return Object.hasOwn(games, value); }
export type WordleInput = { day: number; date: string; board: string; score: number; user_id: string; is_simple: boolean; words: string[] };
export type IsaacInput = { day: number; points: number; lifes: number; time: number; board: string[]; user_id: string };
export type GameRecord = (WordleInput | IsaacInput) & { id: number };
export type Solution = { id: number; day: number; word: string };
export type Player = { id: string; name: string; username: string | null };
const DAY = 86_400_000;
const PUZZLE_ANCHOR = Date.UTC(2026, 10, 14);
const PUZZLE_NUMBERS: Record<Game, number> = { wordle: 1974, 'la-palabra-del-dia': 1773, isaaconnect: 856 };

export function validDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function puzzleDay(game: Game, date: string): number {
    if (!validDate(date)) throw new Error('Choose a valid date.');
    return PUZZLE_NUMBERS[game] + Math.round((Date.parse(date) - PUZZLE_ANCHOR) / DAY);
}
export function isaacDay(date: string): number {
    return puzzleDay('isaaconnect', date);
}
export function recordDate(record: GameRecord): string {
    return 'date' in record ? record.date : new Date(PUZZLE_ANCHOR + (record.day - PUZZLE_NUMBERS.isaaconnect) * DAY).toISOString().slice(0, 10);
}
export function calendarMonths(year: number) {
    return Array.from({ length: 12 }, (_, month) => ({
        name: new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1))),
        offset: (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7,
        dates: Array.from({ length: new Date(Date.UTC(year, month + 1, 0)).getUTCDate() }, (_, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`)
    }));
}
export function playerCounts(records: GameRecord[]): Record<string, number> {
    const byDate = new Map<string, Set<string>>();
    for (const record of records) {
        const date = recordDate(record);
        if (!byDate.has(date)) byDate.set(date, new Set());
        byDate.get(date)!.add(record.user_id);
    }
    return Object.fromEntries([...byDate].map(([date, users]) => [date, users.size]));
}
export function normalizeWord(value: string): string {
    const word = value.trim().normalize('NFC').toLowerCase();
    if (!/^\p{L}{5}$/u.test(word)) throw new Error('Answers and guesses must contain exactly five letters.');
    return word;
}
export function scoreGuess(guess: string, answer: string): string {
    const letters = [...normalizeWord(guess)];
    const target = [...normalizeWord(answer)];
    const cells: string[] = letters.map((letter, i) => letter === target[i] ? 'o' : 'x');
    const remaining = new Map<string, number>();
    target.forEach((letter, i) => { if (cells[i] !== 'o') remaining.set(letter, (remaining.get(letter) ?? 0) + 1); });
    letters.forEach((letter, i) => {
        if (cells[i] === 'o' || !remaining.get(letter)) return;
        cells[i] = 'i'; remaining.set(letter, remaining.get(letter)! - 1);
    });
    return cells.join('');
}
export function wordleResult(rawWords: string[], rawAnswer: string) {
    const answer = normalizeWord(rawAnswer);
    const words: string[] = [];
    let blank = false;
    if (rawWords.length > 6) throw new Error('Use at most six guesses.');
    for (const raw of rawWords) {
        if (!raw.trim()) { blank = true; continue; }
        if (blank) throw new Error('Leave empty fields after the last guess, not between guesses.');
        if (words.includes(answer)) throw new Error('Remove guesses after the correct answer.');
        words.push(normalizeWord(raw));
    }
    if (!words.length) throw new Error('Enter at least one guess.');
    const solved = words.at(-1) === answer;
    if (!solved && words.length !== 6) throw new Error('An unsolved game needs all six guesses.');
    return { words, board: words.map(word => scoreGuess(word, answer)).join(''), score: solved ? words.length : 7, is_simple: false as const };
}
export function parseIsaac(text: string): Omit<IsaacInput, 'user_id'> {
    const lines = text.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const header = /^Isaaconnect\s+#(\d+)$/i.exec(lines[0] ?? '');
    const stats = /^✅\uFE0F?\s*:\s*([0-4])\/4\s+❤\uFE0F?\s*:\s*([0-4])\/4$/u.exec(lines[1] ?? '');
    const timeIndex = lines.findIndex(line => /^Time:/i.test(line));
    const time = /^Time:\s*(\d+):([0-5]\d)(?:\.(\d{1,3}))?$/i.exec(lines[timeIndex] ?? '');
    if (!header || !stats || !time || timeIndex < 3) throw new Error('Paste the complete Isaaconnect share text, including puzzle number, points, lives, board and time.');
    const colors: Record<string, string> = { '🟦': 'B', '🟥': 'R', '🟨': 'Y', '🟩': 'G' };
    const board = lines.slice(2, timeIndex).map(row => {
        const cells = [...row.replace(/\s|\uFE0F/gu, '')];
        if (cells.length !== 4 || cells.some(cell => !colors[cell])) throw new Error('Each Isaaconnect board row must contain four blue, red, yellow or green squares.');
        return cells.map(cell => colors[cell]).join('');
    });
    if (board.length > 64 || !Number.isSafeInteger(Number(header[1])) || Number(header[1]) < 1) throw new Error('Invalid Isaaconnect puzzle or board.');
    if (lines.slice(timeIndex + 1).some(line => !/^https:\/\/isaaconnect\.com\/?$/i.test(line))) throw new Error('Unexpected text after the Isaaconnect time.');
    // The API stores whole seconds; retain the share text's precision in the editor only.
    const seconds = Number(time[1]) * 60 + Number(time[2]);
    if (!Number.isSafeInteger(seconds) || seconds > 2_147_483_647) throw new Error('Invalid completion time.');
    return { day: Number(header[1]), points: Number(stats[1]), lifes: Number(stats[2]), time: seconds, board };
}
export function isaacShare(record: IsaacInput): string {
    const colors: Record<string, string> = { B: '🟦', R: '🟥', Y: '🟨', G: '🟩' };
    return `Isaaconnect #${record.day}\n✅: ${record.points}/4 ❤️: ${record.lifes}/4\n${record.board.map(row => [...row].map(cell => colors[cell] ?? cell).join('')).join('\n')}\nTime: ${String(Math.floor(record.time / 60)).padStart(2, '0')}:${String(record.time % 60).padStart(2, '0')}\nhttps://isaaconnect.com/`;
}
