import type {Meeting} from "$lib/types/motorsport";
import {api} from "$lib/api/base";

export const meetingsApi = {
    getBySeason: (season: number) =>
        api.get<Meeting[]>(`/meetings/season/${season}`),
}