import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarMonths, puzzleDay, isaacDay, isaacShare, parseIsaac, parseSpanishWordle, spanishWordleShare, playerCounts, recordDate, scoreGuess, validDate, wordleResult } from '../src/lib/utils/games.ts';

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
