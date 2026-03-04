import {driversApi} from "$lib/api/motorsport/drivers";
import {json} from "@sveltejs/kit";

export async function GET({ params }) {
    const season = Number(params.season);
    return json(await driversApi.getBySeason(season));
}