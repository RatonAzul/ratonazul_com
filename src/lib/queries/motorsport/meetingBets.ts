import {createQuery} from "@tanstack/svelte-query";
import type {MeetingBetResponse} from "$lib/types/motorsport";
import {ONE_HOUR} from "$lib/queries/base";

export const meetingBetsKeys = {
    byMeetingId: (meetingId: number) => ['meetingBets', meetingId],
}

export async function fetchMeetingBetsByMeetingId(meetingId: number): Promise<MeetingBetResponse> {
    const res = await fetch(`/api/motorsport/meetingBets/${meetingId}`);
    if (!res.ok) throw new Error(`Failed to fetch meeting bets for meeting ${meetingId}`);

    const data: MeetingBetResponse = await res.json();

    const userIds = data.users.map(u => u.userId.toString());
    const usernameMap: Record<string, string> = await fetch('/api/users/usernames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
    }).then(r => r.json());

    return {
        ...data,
        users: data.users.map(u => ({
            ...u,
            username: usernameMap[u.userId.toString()] ?? 'user',
        })),
    };
}

export function createMeetingBetsByMeetingId(meetingId: number) {
    return createQuery<MeetingBetResponse>(() => ({
        queryKey: meetingBetsKeys.byMeetingId(meetingId),
        queryFn: () => fetchMeetingBetsByMeetingId(meetingId),
        staleTime: ONE_HOUR
    }))
}