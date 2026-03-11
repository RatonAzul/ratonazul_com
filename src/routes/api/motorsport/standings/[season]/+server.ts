import {standingsApi} from "$lib/api/motorsport/standings";
import {json} from "@sveltejs/kit";

export async function GET({ params }) {
    const season = Number(params.season);
    return json(await standingsApi.getSeasonStandings(season));
}