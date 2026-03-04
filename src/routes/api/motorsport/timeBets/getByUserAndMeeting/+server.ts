import {timeBetsApi} from "$lib/api/motorsport/timeBets";
import {json} from "@sveltejs/kit";

export async function GET({ url }) {
    const userId = String(url.searchParams.get("userId"));
    const meetingId = Number(url.searchParams.get("meetingId"));
    return json(await timeBetsApi.getByUserAndMeeting(userId, meetingId));
}
