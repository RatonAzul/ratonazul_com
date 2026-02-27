import {prefetchMeetingsBySeason} from "$lib/queries/motorsport/meetings";

export async function load({ parent }) {
    const { queryClient } = await parent()

    await Promise.all([
        prefetchMeetingsBySeason(queryClient, 2026)
    ])
}