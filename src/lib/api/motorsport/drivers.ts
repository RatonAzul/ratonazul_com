import {motorsportApi} from "$lib/api/base";
import type {Driver} from "$lib/types/motorsport";

export const driversApi = {
    getBySeason: (season: number, active: boolean) =>
        motorsportApi.get<Driver[]>(`/drivers/season/${season}?active=${active}`),
}