import {positionBetsApi} from "$lib/api/motorsport/positionBets";
import {timeBetsApi} from "$lib/api/motorsport/timeBets";
import {auth} from "$lib/server/auth";

export async function POST({ request, url }) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return new Response('unauthorized', {status: 401});

    const meetingId = Number(url.searchParams.get("meetingId"));

    const { positionBets, timeBet } = await request.json();

    await Promise.all([
        positionBets?.length ? positionBetsApi.upsert(positionBets, session.user.id, meetingId) : Promise.resolve(),
        timeBet ? timeBetsApi.upsert([timeBet], session.user.id, meetingId) : Promise.resolve(),
    ]);

    return new Response(null, { status: 204 });
}