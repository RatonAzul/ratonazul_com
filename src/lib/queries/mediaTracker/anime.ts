import {createQuery} from "@tanstack/svelte-query"
import {ONE_HOUR} from "$lib/queries/base";

export const animeKeys = {
    currentlyWatching: ["currentlyWatching"] as const,
    recentlyWatched: ["recentlyWatched"] as const,
}

export async function fetchCurrentlyWatchingAnime(): Promise<BasicAnime[]> {
    const res = await fetch(`/api/mediaTracker/anime/currentlyWatching`);
    if (!res.ok) throw new Error(`Failed to fetch currentlyWatching anime`);
    return res.json();
}

export function createCurrentlyWatchingAnimeQuery() {
    return createQuery<BasicAnime[]>(() => ({
        queryKey: animeKeys.currentlyWatching,
        queryFn: () => fetchCurrentlyWatchingAnime(),
        staleTime: ONE_HOUR,
    }))
}

export async function fetchRecentlyWatchedAnime() {
    const res = await fetch(`/api/mediaTracker/anime/recentlyWatched`);
    if (!res.ok) throw new Error(`Failed to fetch recentlyWatched anime`);
    return res.json();
}

export function createRecentlyWatchedAnimeQuery() {
    return createQuery<BasicAnime[]>(() => ({
        queryKey: animeKeys.recentlyWatched,
        queryFn: () => fetchRecentlyWatchedAnime(),
        staleTime: ONE_HOUR,
    }))
}