import type { Game, GameRecord, IsaacInput } from './games.ts';

function compareIsaac(a: IsaacInput, b: IsaacInput) {
    return b.points - a.points || b.lifes - a.lifes || a.time - b.time;
}

export function gameResultSummary(game: Game, records: GameRecord[], playerName: (id: string) => string): string {
    // Isaaconnect can store multiple attempts. Use each player's best one.
    const ordered = game === 'isaaconnect'
        ? records.filter((record) => 'points' in record).sort(compareIsaac)
        : records.filter((record) => 'score' in record).sort((a, b) => a.score - b.score);
    const players = [...new Set(ordered.map((record) => record.user_id))];
    if (players.length !== 2) return '';

    const first = ordered.find((record) => record.user_id === players[0])!;
    const second = ordered.find((record) => record.user_id === players[1])!;
    const firstName = playerName(first.user_id);
    const secondName = playerName(second.user_id);
    const pair = [firstName, secondName].sort((a, b) => a.localeCompare(b, 'es')).join(' y ');

    if ('points' in first && 'points' in second) {
        if (first.points < 4 && second.points < 4) return `${pair} perdieron`;
        return compareIsaac(first, second) === 0 ? `${pair} empataron` : `${firstName} ganó en el Isaaconnect`;
    }
    if ('score' in first && 'score' in second) {
        const gameName = game === 'wordle' ? 'el wordle' : 'La Palabra del Día';
        if (first.score === 7 && second.score === 7) return `${pair} fallaron ${gameName} (X/6)`;
        if (first.score === second.score) return `${pair} empataron con ${first.score}/6 en ${gameName}`;
        return `${firstName} ganó ${first.score}/6 vs ${second.score === 7 ? 'X' : second.score}/6 a ${secondName} en ${gameName}`;
    }
    return '';
}
