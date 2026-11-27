import { recordDate, type GameRecord } from './games.ts';

export function leaderboard(gameResults: GameRecord[]) {
    const bestByPlayer = new Map<string, Map<string, { points: number; submitted: number }>>();
    for (const record of gameResults) {
        const day = recordDate(record);
        const points = 'points' in record ? record.points : 7 - record.score;
        const timestamp = Date.parse(record.created_at ?? day);
        const submitted = Number.isFinite(timestamp) ? timestamp : Date.parse(day);

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
