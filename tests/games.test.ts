import test from 'node:test';
import assert from 'node:assert/strict';
import { gameNotificationPuzzle } from '../src/lib/utils/game-notification.ts';
import { gameResultSummary, isaacStatistics, pointProgression, wordleStatistics } from '../src/lib/utils/game-result-summary.ts';
import { boardsByPoints, leaderboard } from '../src/lib/utils/game-leaderboard.ts';
import { calendarMonths, puzzleDay, isaacDay, isaacShare, parseIsaac, parseSpanishWordle, spanishWordleShare, playerCounts, recordDate, scoreGuess, validDate, wordleResult, wordleBoardResult, type GameRecord } from '../src/lib/utils/games.ts';

test('board-only Wordle stops at the first green row or scores X/6', () => {
    assert.deepEqual(wordleBoardResult('xixxx' + 'ooooo' + 'i'.repeat(20)), { board: 'xixxxooooo', score: 2, is_simple: true, words: [] });
    assert.equal(wordleBoardResult('x'.repeat(30)).score, 7);
    assert.equal(wordleBoardResult('x'.repeat(25) + 'ooooo').score, 6);
    assert.throws(() => wordleBoardResult('x'.repeat(29) + 'z'), /board/);
});

test('Wordle and La Palabra puzzle numbers follow the November 14 2026 anchors across years', () => {
    for (const [game, anchor] of [['wordle', 1974], ['la-palabra-del-dia', 1773]] as const) {
        assert.equal(puzzleDay(game, '2026-11-14'), anchor);
        assert.equal(puzzleDay(game, '2026-11-13'), anchor - 1);
        assert.equal(puzzleDay(game, '2026-11-15'), anchor + 1);
        assert.equal(puzzleDay(game, '2026-01-01'), anchor - 317);
        assert.equal(puzzleDay(game, '2027-01-01'), anchor + 48);
        assert.equal(puzzleDay(game, '2028-03-01') - puzzleDay(game, '2028-02-28'), 2);
        assert.throws(() => puzzleDay(game, '2026-02-29'), /valid date/);
    }
});

test('Wordle allocates duplicate letters only after reserving green matches', () => {
    assert.equal(scoreGuess('allee', 'apple'), 'oixxo');
    assert.equal(scoreGuess('eerie', 'serve'), 'xooxo');
    assert.equal(scoreGuess('niños', 'niños'), 'ooooo');
    assert.equal(scoreGuess('avión', 'avión'), 'ooooo');
});

test('Wordle derives score, compact API board and words', () => {
    assert.deepEqual(wordleResult(['allee', 'apple', '', '', '', ''], 'APPLE'), {
        words: ['allee', 'apple'], board: 'oixxoooooo', score: 2, is_simple: false
    });
    const failed = wordleResult(Array(6).fill('crane'), 'apple');
    assert.equal(failed.score, 7);
    assert.equal(failed.board.length, 30);
});

test('Wordle rejects gaps, partial failed games, nonletters and guesses after solving', () => {
    assert.throws(() => wordleResult(['crane', '', 'apple'], 'apple'), /empty fields/);
    assert.throws(() => wordleResult(['crane'], 'apple'), /six guesses/);
    assert.throws(() => wordleResult(['apple', 'crane'], 'apple'), /after the correct/);
    assert.throws(() => wordleResult([], 'apple'), /at least one/);
    assert.throws(() => wordleResult(['12345'], 'apple'), /five letters/);
    assert.throws(() => wordleResult(Array(7).fill('crane'), 'apple'), /at most six/);
});

const share = `Isaaconnect #855
✅: 1/4 ❤️: 0/4
🟦🟦🟥🟦
🟦🟦🟦🟦
🟨🟩🟨🟥
🟩🟩🟨🟩
🟩🟨🟨🟩
Time: 06:10.549
https://isaaconnect.com/`;

test('Isaaconnect parses the supplied example and truncates fractional seconds for the API', () => {
    assert.deepEqual(parseIsaac(share), { day: 855, points: 1, lifes: 0, board: ['BBRB', 'BBBB', 'YGYR', 'GGYG', 'GYYG'], time: 370 });
    const input = { ...parseIsaac(share), user_id: 'alice' };
    assert.deepEqual(parseIsaac(isaacShare(input)), parseIsaac(share));
    assert.deepEqual(parseIsaac(share.replaceAll('\n', '\r\n')), parseIsaac(share));
});

test('Isaaconnect rejects malformed stats, rows, times, missing data and unrelated text', () => {
    for (const invalid of [share.replace('1/4', '5/4'), share.replace('🟦🟦🟥🟦', '🟦🟦'), share.replace('🟥', '⬜'), share.replace('06:10', '06:99'), share.replace('Time: 06:10.549', ''), share + '\nextra', share.replace('#855', '#0')]) {
        assert.throws(() => parseIsaac(invalid));
    }
});

test('Isaaconnect calendar uses November 13 2026 as puzzle 855 across years', () => {
    assert.equal(isaacDay('2026-11-13'), 855);
    assert.equal(isaacDay('2026-11-14'), 856);
    assert.equal(isaacDay('2026-01-01'), 539);
    assert.equal(isaacDay('2027-01-01'), 904);
    const record = { ...parseIsaac(share), id: 1, user_id: 'alice' };
    assert.equal(recordDate(record), '2026-11-13');
});

test('Calendar handles leap years, Monday offsets and distinct players per date', () => {
    assert.equal(validDate('2026-02-29'), false);
    assert.equal(validDate('2028-02-29'), true);
    assert.equal(validDate('2026-02-30'), false);
    assert.equal(calendarMonths(2026)[0].offset, 3);
    assert.equal(calendarMonths(2028)[1].dates.length, 29);
    const record = { ...parseIsaac(share), id: 1, user_id: 'alice' };
    assert.deepEqual(playerCounts([record, { ...record, id: 2 }, { ...record, id: 3, user_id: 'bob' }]), { '2026-11-13': 2 });
});

const spanishShare = `La palabra del día #1760 4/6

🟨🟨⬛🟨⬛
🟨⬛🟨🟨⬛
🟩🟩⬛🟨🟩
🟩🟩🟩🟩🟩

https://lapalabradeldia.com/`;

test('Spanish share parses board-only results without inventing guesses', () => {
    const parsed = parseSpanishWordle(spanishShare);
    assert.deepEqual(parsed, { day: 1760, board: 'iixixixiixooxioooooo', score: 4, is_simple: true, words: [] });
    assert.deepEqual(parseSpanishWordle(spanishShare.replaceAll('⬛', '⬜').replaceAll('\n', '\r\n')), parsed);
    assert.deepEqual(parseSpanishWordle(spanishWordleShare({ ...parsed, date: '2026-11-01', user_id: 'alice' })), parsed);
    assert.equal(puzzleDay('la-palabra-del-dia', '2026-11-01'), parsed.day);
});

test('Spanish share validates score, board rows, completion and puzzle number', () => {
    for (const invalid of [spanishShare.replace('4/6', '3/6'), spanishShare.replace('🟩🟩🟩🟩🟩', '⬛⬛⬛⬛⬛'), spanishShare.replace('#1760', '#0'), spanishShare + '\nextra', spanishShare.replace('🟨🟨⬛🟨⬛', '🟨🟨')]) assert.throws(() => parseSpanishWordle(invalid));
    const failed = `La palabra del día #1760 X/6\n${Array(6).fill('⬛⬛⬛⬛⬛').join('\n')}`;
    assert.equal(parseSpanishWordle(failed).score, 7);
    assert.equal(parseSpanishWordle(failed).board.length, 30);
    assert.throws(() => parseSpanishWordle(failed.replace('X/6', '6/6')));
});

test('calendar summarizes Wordle wins, ties, and shared failures in Spanish', () => {
    const play = (user_id: string, score: number): GameRecord => ({
        id: score, day: 1974, date: '2026-11-14', user_id, score, board: '', is_simple: true, words: []
    });
    const name = (id: string) => id === 'c' ? 'Celia' : 'Diego';
    assert.equal(gameResultSummary('wordle', [play('c', 3)], name), '');
    assert.equal(gameResultSummary('wordle', [play('d', 5), play('c', 3)], name), 'Celia ganó 3/6 vs 5/6 a Diego en el wordle');
    assert.equal(gameResultSummary('wordle', [play('d', 7), play('c', 3)], name), 'Celia ganó 3/6 vs X/6 a Diego en el wordle');
    assert.equal(gameResultSummary('wordle', [play('d', 5), play('c', 5)], name), 'Celia y Diego empataron con 5/6 en el wordle');
    assert.equal(gameResultSummary('wordle', [play('d', 7), play('c', 7)], name), 'Celia y Diego fallaron el wordle (X/6)');
    assert.equal(gameResultSummary('la-palabra-del-dia', [play('d', 5), play('c', 5)], name), 'Celia y Diego empataron con 5/6 en La Palabra del Día');
});

test('calendar ranks Isaaconnect by points, lives and time using each player’s best attempt', () => {
    const play = (user_id: string, points: number, lifes: number, time: number): GameRecord => ({
        id: time, day: 856, user_id, points, lifes, time, board: []
    });
    const name = (id: string) => id === 'c' ? 'Celia' : 'Diego';
    const celia = play('c', 4, 3, 60);
    assert.equal(gameResultSummary('isaaconnect', [celia, play('c', 3, 4, 30)], name), '');
    assert.equal(gameResultSummary('isaaconnect', [celia, play('d', 3, 4, 30)], name), 'Celia ganó en el Isaaconnect');
    assert.equal(gameResultSummary('isaaconnect', [celia, play('d', 4, 2, 30)], name), 'Celia ganó en el Isaaconnect');
    assert.equal(gameResultSummary('isaaconnect', [celia, play('d', 4, 3, 30)], name), 'Diego ganó en el Isaaconnect');
    assert.equal(gameResultSummary('isaaconnect', [celia, play('d', 4, 3, 60), play('c', 3, 3, 30)], name), 'Celia y Diego empataron en el Isaaconnect');
    assert.equal(gameResultSummary('isaaconnect', [play('c', 3, 3, 30), play('d', 2, 1, 60)], name), 'Celia y Diego perdieron en el Isaaconnect');
});


test('Wordle statistics include failures in the distribution and exclude them from the average', () => {
    const stats = wordleStatistics([1, 3, 3, 7]);
    assert.equal(stats.games, 4);
    assert.equal(stats.failures, 1);
    assert.equal(stats.average, 7 / 3);
    assert.deepEqual(stats.distribution.map(({ result, count, share }) => [result, count, share]), [
        ['1', 1, 0.25], ['2', 0, 0], ['3', 2, 0.5], ['4', 0, 0],
        ['5', 0, 0], ['6', 0, 0], ['X', 1, 0.25]
    ]);
    assert.equal(wordleStatistics([7]).average, null);
    assert.ok(wordleStatistics([]).distribution.every(entry => entry.count === 0 && entry.share === 0));
});

test('Isaaconnect statistics rank high scores first and exclude times over ten minutes', () => {
    const stats = isaacStatistics([
        { points: 0, lifes: 0, time: 59 },
        { points: 4, lifes: 2, time: 60 },
        { points: 1, lifes: 1, time: 120 },
        { points: 4, lifes: 4, time: 180 },
        { points: 2, lifes: 0, time: 300 },
        { points: 4, lifes: 2, time: 600 },
        { points: 3, lifes: 1, time: 601 }
    ]);
    assert.equal(stats.games, 7);
    assert.equal(stats.failures, 4);
    assert.equal(stats.averagePoints, 18 / 7);
    assert.equal(stats.averageLives, 10 / 7);
    assert.equal(stats.averageTime, 1319 / 6);
    assert.deepEqual(stats.distribution.points.map(row => [row.result, row.count]), [
        ['4', 3], ['3', 1], ['2', 1], ['1', 1], ['0', 1]
    ]);
    assert.deepEqual(stats.distribution.lives.map(row => row.count), [1, 0, 2, 2, 2]);
    assert.deepEqual(stats.distribution.time.map(row => row.count), [1, 1, 1, 1, 2]);
    assert.equal(stats.distribution.time.at(-1)?.share, 2 / 6);
    assert.equal(isaacStatistics([{ points: 4, lifes: 2, time: 601 }]).averageTime, null);
    assert.equal(isaacStatistics([]).averageTime, null);
});

test('points progression accumulates chronologically and holds the final score to the period end', () => {
    const points = pointProgression([
        { position: 5, winner: 0 },
        { position: 3, winner: 1 },
        { position: 1, winner: 0 }
    ], 7);
    assert.deepEqual(points, [
        { position: 0, left: 0, right: 0 },
        { position: 1, left: 1, right: 0 },
        { position: 3, left: 1, right: 1 },
        { position: 5, left: 2, right: 1 },
        { position: 7, left: 2, right: 1 }
    ]);
    assert.deepEqual(pointProgression([], 3).at(-1), { position: 3, left: 0, right: 0 });
});

test('Wordle leaderboard converts guesses to points and shares ranks in date order', () => {
    const record = (id: number, user_id: string, date: string, score: number, created_at?: string): GameRecord =>
        ({ id, user_id, date, day: id, score, created_at, board: '', words: [], is_simple: true });
    assert.deepEqual(leaderboard([
        record(1, 'late', '2026-11-15', 2),
        record(2, 'early', '2026-11-14', 2, '2026-11-14T08:00:00Z'),
        record(3, 'late-same-day', '2026-11-14', 2, '2026-11-14T09:00:00Z'),
        record(4, 'winner', '2026-11-14', 1),
        record(5, 'winner', '2026-11-15', 6),
        record(6, 'unsolved', '2026-11-14', 7)
    ]), [
        { id: 'winner', points: 7, position: 1 },
        { id: 'early', points: 5, position: 2 },
        { id: 'late-same-day', points: 5, position: 2 },
        { id: 'late', points: 5, position: 2 },
        { id: 'unsolved', points: 0, position: 5 }
    ]);
});

test('Isaaconnect leaderboard uses the highest points per player per puzzle', () => {
    const attempt = (id: number, date: string, points: number, lifes: number): GameRecord =>
        ({ id, user_id: 'player', day: isaacDay(date), points, lifes, time: 60, board: [] });
    assert.deepEqual(leaderboard([
        attempt(1, '2026-11-14', 1, 4),
        attempt(2, '2026-11-14', 4, 0),
        attempt(3, '2026-11-15', 2, 3)
    ]), [{ id: 'player', points: 6, position: 1 }]);
});

test('daily boards keep every attempt and order equal scores by submission time', () => {
    const attempt = (id: number, points: number, created_at: string): GameRecord =>
        ({ id, user_id: 'player', day: isaacDay('2026-11-14'), points, created_at, lifes: 2, time: 60, board: [] });
    assert.deepEqual(boardsByPoints([
        attempt(1, 2, '2026-11-14T06:00:00Z'),
        attempt(2, 4, '2026-11-14T09:00:00Z'),
        attempt(3, 4, '2026-11-14T08:00:00Z')
    ]).map(row => row.id), [3, 2, 1]);
});

test('game notifications identify the original puzzle without reading the score or board', () => {
    for (const [name, description, game, day] of [
        ['Wordle', 'Wordle 1,974 X/6\n\n⬛⬛⬛⬛⬛', 'wordle', 1974],
        ['La palabra del día', 'La palabra del día #1773 2/6\n\n🟩🟩🟩🟩🟩', 'la-palabra-del-dia', 1773],
        ['Isaaconnect', 'Isaaconnect #856\n✅: 4/4 ❤️: 3/4', 'isaaconnect', 856]
    ] as const) {
        assert.deepEqual(gameNotificationPuzzle({ section: 'Games', title: 'Ada played ' + name, description }), { game, day });
    }
    assert.deepEqual(gameNotificationPuzzle({ section: 'Games', title: 'Ada played Wordle', description: 'unexpected format' }),
        { game: 'wordle', day: null });
    assert.equal(gameNotificationPuzzle({ section: 'Games', title: 'Games tonight', description: 'See you at eight' }), undefined);
});
