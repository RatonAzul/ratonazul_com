import {api} from "$lib/api/base";
import type {PositionBetDraft, TimeBet, TimeBetDraft} from "$lib/types/motorsport";

export const timeBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        api.get<TimeBet[]>(`/timeBets/user/${userId}/meeting/${meetingId}`),

    upsert: (bets: TimeBetDraft[], userId: string, meetingId: number) =>
        api.post<TimeBet[]>(`/timeBets/upsert/${meetingId}`, bets, userId)
}