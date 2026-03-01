import {positionBetsApi} from "$lib/api/motorsport/positionBets";
import {json} from "@sveltejs/kit";

export async function GET({ url }) {
    const userId = String(url.searchParams.get("userId"));
    const meetingId = Number(url.searchParams.get("sessionId"));
    return json(await positionBetsApi.getByUserAndMeeting(userId, meetingId));
}
