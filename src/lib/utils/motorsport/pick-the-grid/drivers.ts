import type {Driver} from "$lib/types/motorsport";

export function searchDriverById(drivers: Driver[], driverId?: number): Driver | undefined {
    if (!driverId) return undefined;
    return drivers.find(d => d.id === driverId)
}