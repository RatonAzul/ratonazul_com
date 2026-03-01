import {api} from "$lib/api/base";
import type {PositionBet, PositionBetDraft} from "$lib/types/motorsport";

export const positionBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        api.get<PositionBet[]>(`/positionBets/user/${userId}/meeting/${meetingId}`),

    upsert: (bets: PositionBetDraft[], userId: string, meetingId: number) =>
        api.post(`/positionBets/upsert/${meetingId}`, bets, userId)
}