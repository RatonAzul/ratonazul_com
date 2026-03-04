import type {PositionBet} from "$lib/types/motorsport";
import {ONE_HOUR} from "$lib/queries/base";
import {createQuery} from "@tanstack/svelte-query";

export const positionBetsKeys = {
    byUserAndMeeting: (userId: string, meetingId: number) => ['positionBets', userId, meetingId],
}

export async function fetchPositionBetsByUserAndMeeting(userId: string, meetingId: number) {
    const res = await fetch(`/api/motorsport/positionBets/getByUserAndMeeting?userId=${userId}&meetingId=${meetingId}`);
    if (!res.ok) throw new Error('Failed to fetch position bets');
    return res.json();
}

export function createPositionBetsByUserAndMeeting(userId: string, meetingId: number) {
    return createQuery<PositionBet[]>(() => ({
        queryKey: positionBetsKeys.byUserAndMeeting(userId, meetingId),
        queryFn: () => fetchPositionBetsByUserAndMeeting(userId, meetingId),
        staleTime: ONE_HOUR,
    }))
}