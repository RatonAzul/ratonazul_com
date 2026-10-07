import {json} from "@sveltejs/kit";
import {animeApi} from "$lib/api/mediaTracker/anime";

export async function GET({}) {
    return json(await animeApi.getCurrentlyWatching())
}