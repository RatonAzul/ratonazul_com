import {
    type PositionBet,
    type PositionBetDraft,
    SessionName,
    type TimeBet,
    type TimeBetDraft
} from "$lib/types/motorsport";

export function buildPositionBetDrafts(
    existing: PositionBet[],
    sessionName: SessionName,
    count: number
): PositionBetDraft[] {
    return Array.from({ length: count }, (_, i) => {
        const position = i + 1;
        const found = existing.find(b => b.sessionName === sessionName && b.position === position);
        return found
            ? { id: found.id, position, sessionName, guessedDriverId: found.guessedDriverId, points: found.points }
            : { position, sessionName };
    });
}

export function buildTimeBetDraft(existing: TimeBet[], sessionName: SessionName): TimeBetDraft {
    const found = existing.find(b => b.sessionName === sessionName);
    return found
        ? { id: found.id, sessionName, guessedTime: found.guessedTime, points: found.points }
        : { sessionName };
}

export function getPositionBetPointColors(points: number | undefined) {
    if (points === undefined || points === null) return "bg-gray"
    switch (points) {
        case 5: return "bg-purple"
        case 3: return "bg-green"
        case 1: return "bg-yellow"
        default: return "bg-red"
    }
}

export function getTimeBetPointsColor(points: number | undefined) {
    if (points === undefined || points === null ) return "bg-gray"
    switch (points) {
        case 20: return "bg-purple"
        case 5: return "bg-green"
        case 2: return "bg-yellow"
        default: return "bg-red"
    }
}

export function getF1TimeFromMilliseconds(timeInMs: number): string {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const ms = timeInMs % 1000;

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}