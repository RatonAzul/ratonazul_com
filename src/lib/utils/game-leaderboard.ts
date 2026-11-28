import { recordDate, type GameRecord } from './games.ts';

export function gamePoints(record: GameRecord) {
    return 'points' in record ? record.points : 7 - record.score;
}

function submissionTime(record: GameRecord, day = recordDate(record)) {
    const timestamp = Date.parse(record.created_at ?? day);
    return Number.isFinite(timestamp) ? timestamp : Date.parse(day);
}

export function boardsByPoints(records: GameRecord[]) {
    return [...records].sort((a, b) => gamePoints(b) - gamePoints(a) ||
        submissionTime(a) - submissionTime(b) || a.id - b.id);
}

export function leaderboard(gameResults: GameRecord[]) {
    const bestByPlayer = new Map<string, Map<string, { points: number; submitted: number }>>();
    for (const record of gameResults) {
        const day = recordDate(record);
        const points = gamePoints(record);
        const submitted = submissionTime(record, day);

        const puzzles = bestByPlayer.get(record.user_id) ?? new Map();
        bestByPlayer.set(record.user_id, puzzles);
        const previous = puzzles.get(day);
        if (!previous || points > previous.points || (points === previous.points && submitted < previous.submitted)) {
            puzzles.set(day, { points, submitted });
        }
    }

    const ordered = [...bestByPlayer].map(([id, puzzles]) => {
        let points = 0;
        let reachedOn = '';
        let reachedAt = 0;
        for (const [day, attempt] of [...puzzles].sort(([left], [right]) => left.localeCompare(right))) {
            points += attempt.points;
            if (!reachedOn || attempt.points > 0) {
                reachedOn = day;
                reachedAt = attempt.submitted;
            }
        }
        return { id, points, reachedOn, reachedAt };
    }).sort((left, right) =>
        right.points - left.points || left.reachedOn.localeCompare(right.reachedOn) ||
        left.reachedAt - right.reachedAt || left.id.localeCompare(right.id)
    );

    let position = 0;
    return ordered.map(({ id, points }, index) => {
        if (ordered[index - 1]?.points !== points) position = index + 1;
        return { id, points, position };
    });
}

export function rankingPointProgression(
    attempts: { date: string; points: number | null }[], start: string, end: string
) {
    const dayLength = 86_400_000;
    const first = Date.parse(start);
    const length = (Date.parse(end) - first) / dayLength + 1;
    const best = new Map<number, number>();
    for (const { date, points } of attempts) {
        if (points === null) continue;
        const position = (Date.parse(date) - first) / dayLength + 1;
        if (position >= 1 && position <= length) best.set(position, Math.max(best.get(position) ?? 0, points));
    }
    let total = 0;
    return [0, ...Array.from({ length }, (_, index) => {
        total += best.get(index + 1) ?? 0;
        return total;
    })];
}
