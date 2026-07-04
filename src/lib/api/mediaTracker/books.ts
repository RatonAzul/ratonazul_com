import {mediaTrackerApi} from "$lib/api/base";

export const booksApi = {
    getCurrentlyReading: () =>
        mediaTrackerApi.get<CurrentlyReadingBook>(`/webBookInfo/currentlyReading`),

    getRecentlyRead: () =>
        mediaTrackerApi.get<RecentlyReadBook[]>(`/webBookInfo/recentlyRead`)
}