import {CURRENT_YEAR} from "$lib/utils/shared/general";
import {fetchMeetingsBySeason, meetingKeys} from "$lib/queries/motorsport/meetings";
import {driversKeys, fetchDriversBySeason} from "$lib/queries/motorsport/drivers";

export async function load({ parent }) {
    const { queryClient } = await parent()

    await Promise.all([
        await queryClient.prefetchQuery({
            queryKey: meetingKeys.bySeason(CURRENT_YEAR),
            queryFn: () => fetchMeetingsBySeason(CURRENT_YEAR),
        }),

        await queryClient.prefetchQuery({
            queryKey: driversKeys.bySeason(CURRENT_YEAR),
            queryFn: () => fetchDriversBySeason(CURRENT_YEAR),
        })
    ])
}