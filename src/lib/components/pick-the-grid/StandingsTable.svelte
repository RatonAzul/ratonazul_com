<script lang="ts">
    import type {Meeting, StandingsTableRow} from "$lib/types/motorsport";
    import type {CreateQueryResult} from "@tanstack/svelte-query";

    const { standings, meetings }: {
        standings: CreateQueryResult<StandingsTableRow[], Error>,
        meetings: CreateQueryResult<Meeting[], Error>,
    } = $props();

    const currentMeeting = $derived(
        meetings.data?.find(m => new Date(m.endDate) > new Date())
    );
</script>

{#if standings.isLoading || standings.isLoadingError || meetings.isLoading || meetings.isLoadingError}
    <p>loading</p>
{:else}
    <div class="overflow-x-auto">
        <table class="border-separate border-spacing-y-2">
            <thead>
            <tr class="h-9">
                <th class="w-8"></th>
                <th class="w-32 text-left text-sm font-normal text-gray-dark px-2">Player</th>
                <th class="w-2 min-w-2"></th>  <!-- gap -->
                {#each meetings.data as meeting, i}
                    <th class="h-9 text-center border-b-2 pb-2 {meeting.id === currentMeeting?.id ? 'border-green' : 'border-transparent'}">
                        <div class="size-5 mx-auto">
                            {@html meeting.country.image}
                        </div>
                    </th>
                {/each}
                <th class="w-2 min-w-2"></th>  <!-- gap -->
                <th class="w-9 text-sm font-normal text-gray-dark flex justify-center items-center h-9">Pts</th>
            </tr>
            </thead>
            <tbody>
            {#each standings.data as standing}
                {@const isFirst = standing.rank === 1}
                <tr class="h-9">
                    <td class="{isFirst ? 'bg-red text-bg0' : 'bg-bg1 text-fg0'} w-8 ps-2 text-center font-bold">
                        {standing.rank}
                    </td>
                    <td class="{isFirst ? 'bg-red text-bg0' : 'bg-bg1 text-fg0'} w-32 text-sm px-2">
                        {standing?.username ?? 'user'}
                    </td>
                    <td class="w-2"></td>  <!-- gap -->
                    {#each meetings.data as meeting}
                        {@const meetingPoints = standing.meetingPoints.find(mp => mp.meetingId === meeting.id)}
                        <td class="h-9 w-9 min-w-9 aspect-square text-center text-sm {meetingPoints ? 'bg-bg1 text-fg0' : 'bg-bg0 text-gray-dark'}">
                            {meetingPoints?.points ?? '-'}
                        </td>
                    {/each}
                    <td class="w-2"></td>  <!-- gap -->
                    <td class="{isFirst ? 'bg-red text-bg0' : 'bg-bg1 text-fg0'} w-9 text-center font-bold">
                        {standing.totalPoints}
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
{/if}