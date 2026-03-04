import {api} from "$lib/api/base";
import type {Driver} from "$lib/types/motorsport";

export const driversApi = {
    getBySeason: (season: number) =>
        api.get<Driver[]>(`/drivers/season/${season}`),
}