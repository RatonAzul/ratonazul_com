import type {TimeBet} from "$lib/types/motorsport";
import {ONE_HOUR} from "$lib/queries/base";
import {createQuery} from "@tanstack/svelte-query";

export const timeBetsKeys = {
    byUserAndMeeting: (userId: string, meetingId: number) => ['timeBets', userId, meetingId],
}

export async function fetchTimeBetsByUserAndMeeting(userId: string, meetingId: number) {
    const res = await fetch(`/api/motorsport/timeBets/getByUserAndMeeting?userId=${userId}&meetingId=${meetingId}`);
    if (!res.ok) throw new Error('Failed to fetch time bets');
    return res.json();
}

export function createTimeBetsByUserAndMeeting(userId: string, meetingId: number) {
    return createQuery<TimeBet[]>(() => ({
        queryKey: timeBetsKeys.byUserAndMeeting(userId, meetingId),
        queryFn: () => fetchTimeBetsByUserAndMeeting(userId, meetingId),
        staleTime: ONE_HOUR,
    }))
}