import {createQuery} from "@tanstack/svelte-query";
import type {StandingsTableRow} from "$lib/types/motorsport";
import {ONE_DAY} from "$lib/queries/base";

export const standingsKeys = {
    bySeason: (season: number) => ['standings', season],
}

export async function fetchStandingsBySeason(season: number): Promise<StandingsTableRow[]> {
    const standings: StandingsTableRow[] = await fetch(`/api/motorsport/standings/${season}`)
        .then(r => r.json());

    // fetch usernames
    const userIds = standings.map(s => s.userId);
    const usernameMap: Record<string, string> = await fetch('/api/users/usernames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
    }).then(r => r.json());

    return standings.map(s => ({
        ...s,
        username: usernameMap[s.userId] ?? 'user',
    }));
}

export function createStandingsBySeasonQuery(season: number) {
    return createQuery<StandingsTableRow[]>(() => ({
        queryKey: standingsKeys.bySeason(season),
        queryFn: () => fetchStandingsBySeason(season),
        staleTime: ONE_DAY,
    }))
}