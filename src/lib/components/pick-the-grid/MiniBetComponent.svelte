<script lang="ts">
    import MiniPositionBetCard from "$lib/components/pick-the-grid/MiniPositionBetCard.svelte";
    import type {Driver, UserMeetingBet} from "$lib/types/motorsport.ts";
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import MiniTimeBetCard from "$lib/components/pick-the-grid/MiniTimeBetCard.svelte";

    let { meetingBets, drivers, position }: {
        meetingBets: UserMeetingBet,
        drivers: CreateQueryResult<Driver[], Error>,
        position: number
    } = $props();

    let driverList = $derived(drivers.data ?? []);
</script>

<div class="w-49 min-w-49">
    <div class="col-span-2 flex justify-around text-sm h-9 mb-4 gap-x-1">
        <div class="h-full w-9 flex justify-center items-center text-center {position === 1 ? 'bg-red text-bg0' : 'bg-bg1'}">{position}</div>
        <div class="h-full flex-1 flex justify-start ps-4 items-center bg-bg1">{meetingBets.username}</div>
        <div class="h-full w-12 flex justify-center items-center bg-bg1 text-center">{meetingBets.points}</div>
    </div>
    <div class="grid grid-cols-2 gap-x-4">
        {#if meetingBets.positionBets.filter(p => p.sessionName === "Sprint").length !== 0 }
            <div class="mb-4">
                {#each meetingBets.positionBets.filter(p => p.sessionName === "Sprint Qualifying") as positionBet}
                    <MiniPositionBetCard {positionBet} {driverList} />
                {/each}
            </div>
            <div class="mb-4">
                {#each meetingBets.positionBets.filter(p => p.sessionName === "Sprint") as positionBet}
                    <MiniPositionBetCard {positionBet} {driverList}/>
                {/each}
            </div>
        {/if}
        <div class="flex flex-col gap-1">
            {#each meetingBets.positionBets.filter(p => p.sessionName === "Qualifying" ) as positionBet}
                <MiniPositionBetCard {positionBet} {driverList} />
            {/each}
            <MiniTimeBetCard timeBet={meetingBets.timeBet}/>
        </div>
        <div class="flex flex-col gap-1">
            {#each meetingBets.positionBets.filter(p => p.sessionName === "Race" ) as positionBet}
                <MiniPositionBetCard {positionBet} {driverList} />
            {/each}
        </div>
    </div>
</div>