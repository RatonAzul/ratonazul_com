import { boardsByPoints, gamePoints, leaderboard } from '$lib/utils/game-leaderboard';
import { displayGameResult } from '$lib/utils/game-result-summary';
import { recordDate, type GameRecord } from '$lib/utils/games';

export function submittedGameDates(records: GameRecord[], viewerId: string | undefined) {
    return new Set(records.filter(record => record.user_id === viewerId).map(recordDate));
}

export function rankingRows<Player extends { id: string }>(
    records: GameRecord[],
    profiles: Map<string, Player>,
    visibleDates: Set<string>,
    showPeriodTotals = false
) {
    const attemptsByPlayer = new Map<string, Map<string, {
        id: string; date: string; points: number | null; board: ReturnType<typeof displayGameResult>
    }>>();
    const visibleRecords = records.filter(record => visibleDates.has(recordDate(record)));
    for (const record of boardsByPoints(visibleRecords)) {
        const entries = attemptsByPlayer.get(record.user_id) ?? new Map();
        const id = String(record.id);
        entries.set(id, { id, date: recordDate(record), points: gamePoints(record), board: displayGameResult(record) });
        attemptsByPlayer.set(record.user_id, entries);
    }
    for (const record of records) {
        const date = recordDate(record);
        if (visibleDates.has(date)) continue;
        const entries = attemptsByPlayer.get(record.user_id) ?? new Map();
        entries.set(date, { id: date, date, points: null, board: null });
        attemptsByPlayer.set(record.user_id, entries);
    }
    const rankings = showPeriodTotals || visibleRecords.length === records.length
        ? leaderboard(records)
        : [...attemptsByPlayer.keys()].sort().map(id => ({ id, points: null, position: null }));
    return rankings.map(row => ({
        ...row,
        player: profiles.get(row.id)!,
        attempts: [...(attemptsByPlayer.get(row.id)?.values() ?? [])].sort((left, right) => right.date.localeCompare(left.date))
    }));
}
