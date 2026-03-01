import {api} from "$lib/api/base";
import type {PositionBet} from "$lib/types/motorsport";

export const positionBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        api.get<PositionBet[]>(`/positionBets/user/${userId}/meeting/${meetingId}`),
}