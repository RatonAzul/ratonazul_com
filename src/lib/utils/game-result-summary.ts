import type { Game, GameRecord, IsaacInput } from './games.ts';

function compareIsaac(a: IsaacInput, b: IsaacInput) {
    return b.points - a.points || b.lifes - a.lifes || a.time - b.time;
}

export function rankGameResults(game: Game, records: GameRecord[]) {
    return game === 'isaaconnect'
        ? records.filter((record) => 'points' in record).sort(compareIsaac)
        : records.filter((record) => 'score' in record).sort((a, b) => a.score - b.score);
}

export function gameResultOutcome(first: GameRecord, second: GameRecord): 'first' | 'second' | 'draw' | 'bothLost' {
    let rank = 0;
    if ('points' in first && 'points' in second) {
        if (first.points < 4 && second.points < 4) return 'bothLost';
        rank = compareIsaac(first, second);
    } else if ('score' in first && 'score' in second) {
        if (first.score === 7 && second.score === 7) return 'bothLost';
        rank = first.score - second.score;
    }
    return rank === 0 ? 'draw' : rank < 0 ? 'first' : 'second';
}

export function gameResultSummary(game: Game, records: GameRecord[], playerName: (id: string) => string): string {
    // Isaaconnect can store multiple attempts. Use each player's best one.
    const ordered = rankGameResults(game, records);
    const players = [...new Set(ordered.map((record) => record.user_id))];
    if (players.length !== 2) return '';

    const first = ordered.find((record) => record.user_id === players[0])!;
    const second = ordered.find((record) => record.user_id === players[1])!;
    const firstName = playerName(first.user_id);
    const secondName = playerName(second.user_id);
    const outcome = gameResultOutcome(first, second);
    const pair = [firstName, secondName].sort((a, b) => a.localeCompare(b, 'es')).join(' y ');

    if ('points' in first && 'points' in second) {
        if (outcome === 'bothLost') return `${pair} perdieron en el Isaaconnect`;
        return outcome === 'draw' ? `${pair} empataron en el Isaaconnect` : `${firstName} ganó en el Isaaconnect`;
    }
    if ('score' in first && 'score' in second) {
        const gameName = game === 'wordle' ? 'el wordle' : 'La Palabra del Día';
        if (outcome === 'bothLost') return `${pair} fallaron ${gameName} (X/6)`;
        if (outcome === 'draw') return `${pair} empataron con ${first.score}/6 en ${gameName}`;
        return `${firstName} ganó ${first.score}/6 vs ${second.score === 7 ? 'X' : second.score}/6 a ${secondName} en ${gameName}`;
    }
    return '';
}

function resultDistribution(labels: string[], counts: number[], games: number) {
    return labels.map((result, index) => ({
        result,
        count: counts[index],
        share: games ? counts[index] / games : 0
    }));
}

export function wordleStatistics(scores: number[]) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const score of scores) counts[score - 1]++;

    const games = scores.length;
    const failures = counts[6];
    const solved = games - failures;
    const guesses = counts.slice(0, 6).reduce((total, count, index) => total + count * (index + 1), 0);

    return {
        games,
        failures,
        average: solved ? guesses / solved : null,
        distribution: resultDistribution(['1', '2', '3', '4', '5', '6', 'X'], counts, games)
    };
}

const timeLimits = [60, 120, 180, 300];
const maxStatsTime = 600;

export function isaacStatistics(attempts: { points: number; lifes: number; time: number }[]) {
    const points = [0, 0, 0, 0, 0];
    const lives = [0, 0, 0, 0, 0];
    const time = [0, 0, 0, 0, 0];
    let totalPoints = 0;
    let totalLives = 0;
    let totalTime = 0;
    let timedGames = 0;

    for (const attempt of attempts) {
        points[attempt.points]++;
        lives[attempt.lifes]++;
        totalPoints += attempt.points;
        totalLives += attempt.lifes;
        if (attempt.time <= maxStatsTime) {
            const bucket = timeLimits.findIndex(limit => attempt.time < limit);
            time[bucket === -1 ? timeLimits.length : bucket]++;
            totalTime += attempt.time;
            timedGames++;
        }
    }

    const games = attempts.length;
    const scores = ['4', '3', '2', '1', '0'];
    return {
        games,
        failures: games - points[4],
        averagePoints: games ? totalPoints / games : null,
        averageLives: games ? totalLives / games : null,
        averageTime: timedGames ? totalTime / timedGames : null,
        distribution: {
            points: resultDistribution(scores, points.toReversed(), games),
            lives: resultDistribution(scores, lives.toReversed(), games),
            time: resultDistribution(['<1m', '1–<2m', '2–<3m', '3–<5m', '5–10m'], time, timedGames)
        }
    };
}

export function pointProgression(events: { position: number; winner: 0 | 1 }[], length: number) {
    let left = 0;
    let right = 0;
    const points = [{ position: 0, left, right }];

    for (const { position, winner } of [...events].sort((a, b) => a.position - b.position)) {
        if (winner === 0) left++;
        else right++;
        points.push({ position, left, right });
    }
    if (points.at(-1)?.position !== length) points.push({ position: length, left, right });
    return points;
}

export function compareGamePair(game: Game, records: GameRecord[], ids: readonly [string, string]) {
    const [firstId, secondId] = ids;
    const ranked = rankGameResults(game, records);
    const first = ranked.find(record => record.user_id === firstId);
    const second = ranked.find(record => record.user_id === secondId);
    return {
        outcome: first && second ? gameResultOutcome(first, second) : null,
        results: [first, second]
    } as const;
}

export function gameResultScore(record: GameRecord) {
    return 'points' in record ? record.points + '/4' : (record.score === 7 ? 'X' : record.score) + '/6';
}
