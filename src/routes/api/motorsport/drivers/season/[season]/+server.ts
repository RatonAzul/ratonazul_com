import {driversApi} from "$lib/api/motorsport/drivers";
import {json} from "@sveltejs/kit";

export async function GET({ params, url }) {
    const season = Number(params.season);
    const active = url.searchParams.get('active') === 'true';
    return json(await driversApi.getBySeason(season, active));
}