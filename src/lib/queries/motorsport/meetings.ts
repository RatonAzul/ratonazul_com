import { createQuery } from "@tanstack/svelte-query";
import { ONE_DAY } from "$lib/queries/base";
import type {Meeting} from "$lib/types/motorsport";

export const meetingKeys = {
    bySeason: (season: number) => ['meetings', season] as const,
}

export async function fetchMeetingsBySeason(season: number): Promise<Meeting[]> {
    const res = await fetch(`/api/motorsport/meetings/${season}`);
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return res.json();
}

export function createMeetingsBySeasonQuery(season: number) {
    return createQuery<Meeting[]>(() => ({
        queryKey: meetingKeys.bySeason(season),
        queryFn: () => fetchMeetingsBySeason(season),
        staleTime: ONE_DAY,
    }))
}