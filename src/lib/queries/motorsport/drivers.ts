import type {Driver} from "$lib/types/motorsport";
import {createQuery} from "@tanstack/svelte-query";
import {ONE_DAY} from "$lib/queries/base";

export const driversKeys = {
    bySeason: (season: number, active: boolean) => ['drivers', season, active] as const,
}

export async function fetchDriversBySeason(season: number, active: boolean): Promise<Driver[]> {
    const res = await fetch(`/api/motorsport/drivers/season/${season}?active=${active}`);
    if (!res.ok) throw new Error("Failed to fetch drivers");
    return res.json();
}

export function createDriversBySeasonQuery(season: number, active: boolean) {
    return createQuery<Driver[]>(() => ({
        queryKey: driversKeys.bySeason(season, active),
        queryFn: () => fetchDriversBySeason(season, active),
        staleTime: ONE_DAY,
    }))
}