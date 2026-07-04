import type {StandingsTableRow} from "$lib/types/motorsport";
import {motorsportApi} from "$lib/api/base";

export const standingsApi = {
    getSeasonStandings: (season: number) =>
        motorsportApi.get<StandingsTableRow[]>(`/standings/${season}`),
}