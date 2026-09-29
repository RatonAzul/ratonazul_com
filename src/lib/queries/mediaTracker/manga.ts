import {createQuery} from "@tanstack/svelte-query";
import {ONE_HOUR} from "$lib/queries/base";

export const mangaKeys = {
    currentlyReading: ["currentlyReadingManga"] as const,
    recentlyRead: ["recentlyReadManga"] as const,
}

export async function fetchCurrentlyReadingManga(): Promise<BasicManga[]> {
    const res = await fetch(`/api/mediaTracker/manga/currentlyReading`);
    if (!res.ok) throw new Error(`Failed to fetch currentlyReading manga`);
    return res.json();
}

export function createCurrentlyReadingMangaQuery() {
    return createQuery<BasicManga[]>(() => ({
        queryKey: mangaKeys.currentlyReading,
        queryFn: () => fetchCurrentlyReadingManga(),
        staleTime: ONE_HOUR,
    }))
}

export async function fetchRecentlyReadManga(): Promise<BasicManga[]> {
    const res = await fetch(`/api/mediaTracker/manga/recentlyRead`);
    if (!res.ok) throw new Error(`Failed to fetch recentlyRead manga`);
    return res.json();
}

export function createRecentlyReadMangaQuery() {
    return createQuery<BasicManga[]>(() => ({
        queryKey: mangaKeys.recentlyRead,
        queryFn: () => fetchRecentlyReadManga(),
        staleTime: ONE_HOUR,
    }))
}