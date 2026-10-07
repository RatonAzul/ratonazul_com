import {json} from "@sveltejs/kit"
import {mangaApi} from "$lib/api/mediaTracker/manga";

export async function GET({}) {
    return json(await mangaApi.getCurrentlyReading());
}