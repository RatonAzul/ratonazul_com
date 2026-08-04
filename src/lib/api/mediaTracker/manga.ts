import {mediaTrackerApi} from "$lib/api/base";

export const mangaApi = {
    getCurrentlyReading: () =>
        mediaTrackerApi.get<BasicManga>(`/webMangaInfo/currentlyReading`),

    getRecentlyRead: () =>
        mediaTrackerApi.get<BasicManga>(`/webMangaInfo/recentlyRead`),
}