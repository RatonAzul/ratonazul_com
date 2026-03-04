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
            ? { id: found.id, position, sessionName, guessedDriverId: found.guessedDriverId }
            : { position, sessionName };
    });
}

export function buildTimeBetDraft(existing: TimeBet[], sessionName: SessionName): TimeBetDraft {
    const found = existing.find(b => b.sessionName === sessionName);
    return found
        ? { id: found.id, sessionName, guessedTime: found.guessedTime }
        : { sessionName };
}