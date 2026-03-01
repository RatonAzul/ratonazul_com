import {api} from "$lib/api/base";
import type {TimeBet} from "$lib/types/motorsport";

export const timeBetsApi = {
    getByUserAndMeeting: (userId: string, meetingId: number) =>
        api.get<TimeBet[]>(`/timeBets/user/${userId}/meeting/${meetingId}`),
}