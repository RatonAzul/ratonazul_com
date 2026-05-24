import {api} from "$lib/api/base";
import type {MeetingBetResponse} from "$lib/types/motorsport";

export const meetingBetsApi = {
    getByMeetingId: async (meetingId: number) =>
        api.get<MeetingBetResponse>(`/meetingBets/meeting/${meetingId}`),
}