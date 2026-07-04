import {booksApi} from "$lib/api/mediaTracker/books";
import {json} from "@sveltejs/kit";

export async function GET({}) {
    return json(await booksApi.getCurrentlyReading());
}