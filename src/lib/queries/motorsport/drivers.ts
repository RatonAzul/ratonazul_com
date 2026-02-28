import type {Driver} from "$lib/types/motorsport";
import {createQuery} from "@tanstack/svelte-query";
import {ONE_DAY} from "$lib/queries/base";

export const driversKeys = {
    bySeason: (season: number) => ['drivers', season] as const,
}

export async function fetchDriversBySeason(season: number): Promise<Driver[]> {
    const res = await fetch(`/api/motorsport/drivers/season/${season}`);
    if (!res.ok) throw new Error("Failed to fetch drivers");
    return res.json();
}

export function createDriversBySeasonQuery(season: number) {
    return createQuery<Driver[]>(() => ({
        queryKey: driversKeys.bySeason(season),
        queryFn: () => fetchDriversBySeason(season),
        staleTime: ONE_DAY,
    }))
}