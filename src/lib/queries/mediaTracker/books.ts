import {createQuery} from "@tanstack/svelte-query";
import {ONE_HOUR} from "$lib/queries/base";

export const booksKeys = {
    currentlyReading: ["currentlyReading"] as const,
    recentlyRead: ["recentlyRead"] as const,
}

export async function fetchCurrentlyReadingBooks(): Promise<CurrentlyReadingBook[]> {
    const res = await fetch(`/api/mediaTracker/books/currentlyReading`);
    if (!res.ok) throw new Error("Failed to fetch currentlyReading");
    return res.json();
}

export function createCurrentlyReadingBooksQuery() {
    return createQuery<CurrentlyReadingBook[]>(() => ({
        queryKey: booksKeys.currentlyReading,
        queryFn: () => fetchCurrentlyReadingBooks(),
        staleTime: ONE_HOUR,
    }))
}


export async function fetchRecentlyReadBooks(): Promise<RecentlyReadBook[]> {
    const res = await fetch(`/api/mediaTracker/books/recentlyRead`);
    if (!res.ok) throw new Error("Failed to fetch recentlyReadBooks");
    return res.json();
}

export function createRecentlyReadBooksQuery() {
    return createQuery<RecentlyReadBook[]>(() => ({
        queryKey: booksKeys.recentlyRead,
        queryFn: () => fetchRecentlyReadBooks(),
        staleTime: ONE_HOUR,
    }))
}