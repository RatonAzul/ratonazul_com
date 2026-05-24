import {meetingBetsApi} from "$lib/api/motorsport/meetingBets";
import {json} from "@sveltejs/kit"

export async function GET({ params }) {
    const meetingId = Number(params.meetingId);
    return json(await meetingBetsApi.getByMeetingId(meetingId));
}