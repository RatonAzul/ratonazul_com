import {motorsportApi} from "$lib/api/base";
import type {TimeBet, TimeBetDraft} from "$lib/types/motorsport";

export const timeBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        motorsportApi.get<TimeBet[]>(`/timeBets/user/${userId}/meeting/${meetingId}`),

    upsert: (bets: TimeBetDraft[], userId: string, meetingId: number) =>
        motorsportApi.post<TimeBet[]>(`/timeBets/upsert/${meetingId}`, bets, userId)
}