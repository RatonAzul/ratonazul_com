import {motorsportApi} from "$lib/api/base";
import type {MeetingBetResponse} from "$lib/types/motorsport";

export const meetingBetsApi = {
    getByMeetingId: async (meetingId: number) =>
        motorsportApi.get<MeetingBetResponse>(`/meetingBets/meeting/${meetingId}`),
    getBettors: (meetingId: number, signal?: AbortSignal) =>
        motorsportApi.get<string[]>(`/meetingBets/meeting/${meetingId}/bettors`, undefined, undefined,
            { claims: { checkBetReminders: true }, signal }),
}