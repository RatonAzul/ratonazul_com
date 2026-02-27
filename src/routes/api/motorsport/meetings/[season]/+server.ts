import {meetingsApi} from "$lib/api/motorsport/meetings";
import {json} from "@sveltejs/kit";

export async function GET({ params }) {
    const season = Number(params.season);
    return json(await meetingsApi.getBySeason(season));
}