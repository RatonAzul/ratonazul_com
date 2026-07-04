import type {Meeting} from "$lib/types/motorsport";
import {motorsportApi} from "$lib/api/base";

export const meetingsApi = {
    getBySeason: (season: number) =>
        motorsportApi.get<Meeting[]>(`/meetings/season/${season}`),
}