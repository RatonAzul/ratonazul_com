import {mediaTrackerApi} from "$lib/api/base";

export const animeApi = {
    getCurrentlyWatching: () =>
        mediaTrackerApi.get<BasicAnime>(`/webAnimeInfo/currentlyWatching`),

    getRecentlyWatched: () =>
        mediaTrackerApi.get<BasicAnime>(`/webAnimeInfo/recentlyWatched`),
}