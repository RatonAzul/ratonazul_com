import type {StandingsTableRow} from "$lib/types/motorsport";
import {api} from "$lib/api/base";

export const standingsApi = {
    getSeasonStandings: (season: number) =>
        api.get<StandingsTableRow[]>(`/standings/${season}`),
}