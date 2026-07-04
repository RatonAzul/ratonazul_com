import {motorsportApi} from "$lib/api/base";
import type {PositionBet, PositionBetDraft} from "$lib/types/motorsport";

export const positionBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        motorsportApi.get<PositionBet[]>(`/positionBets/user/${userId}/meeting/${meetingId}`),

    upsert: (bets: PositionBetDraft[], userId: string, meetingId: number) =>
        motorsportApi.post(`/positionBets/upsert/${meetingId}`, bets, userId)
}