import {CURRENT_YEAR} from "$lib/utils/shared/general";
import {fetchMeetingsBySeason, meetingKeys} from "$lib/queries/motorsport/meetings";
import {driversKeys, fetchDriversBySeason} from "$lib/queries/motorsport/drivers";
import {fetchStandingsBySeason, standingsKeys} from "$lib/queries/motorsport/standings";

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
        }),

        await queryClient.prefetchQuery({
            queryKey: standingsKeys.bySeason(CURRENT_YEAR),
            queryFn: () => fetchStandingsBySeason(CURRENT_YEAR),
        })
    ])
}