<script lang="ts">
    import {
        type Driver,
        type Meeting,
        type PositionBet,
        type PositionBetDraft,
        SessionName,
        type TimeBet, type TimeBetDraft
    } from "$lib/types/motorsport";
    import CustomH3 from "$lib/components/shared/CustomH3.svelte";
    import DriverBetCard from "$lib/components/pick-the-grid/DriverBetCard.svelte";
    import TimeBetCard from "$lib/components/pick-the-grid/TimeBetCard.svelte";
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import {buildPositionBetDrafts, buildTimeBetDraft} from "$lib/utils/motorsport/pick-the-grid/bets";
    import DefaultButton from "$lib/components/shared/DefaultButton.svelte";
    import {ButtonStatus} from "$lib/types/shared";

    let { meeting, drivers, positionBets, timeBets }: {
        meeting?: Meeting,
        drivers: CreateQueryResult<Driver[], Error>,
        positionBets: CreateQueryResult<PositionBet[], Error>,
        timeBets: CreateQueryResult<TimeBet[], Error> } = $props();

    // mutable state for editing
    let sprintQualyBets = $state<PositionBetDraft[]>([]);
    let sprintRaceBets = $state<PositionBetDraft[]>([]);
    let qualyBets = $state<PositionBetDraft[]>([]);
    let raceBets = $state<PositionBetDraft[]>([]);
    let qualyTimeBet = $state<TimeBetDraft | undefined>(undefined);


    let betsToFill = $derived(meeting?.isSprint ? 9 : 7);
    let filledBetsCount = $derived(
        [...sprintQualyBets, ...sprintRaceBets, ...qualyBets, ...raceBets]
            .filter(b => b.guessedDriverId && b.guessedDriverId !== 0).length // count the driver bets filled
        + (qualyTimeBet?.guessedTime ? 1 : 0) // qualy time is filled
    );
    let sendButonIsActive = $derived(betsToFill === filledBetsCount)

    let selectedRaceDriverIds = $derived(
        raceBets.map(b => b.guessedDriverId).filter(id => id !== undefined) as number[]
    );

    $effect(() => {
        const bets = positionBets.data ?? [];
        const time = timeBets.data ?? [];
        sprintQualyBets = buildPositionBetDrafts(bets, SessionName.SprintQualifying, 1);
        sprintRaceBets = buildPositionBetDrafts(bets, SessionName.SprintRace, 1);
        qualyBets = buildPositionBetDrafts(bets, SessionName.Qualifying, 1);
        raceBets = buildPositionBetDrafts(bets, SessionName.Race, 5);
        qualyTimeBet = buildTimeBetDraft(time, SessionName.Qualifying);
    });

    let driverList = $derived(drivers.data ?? [])
</script>

{#if meeting}
    <section class="grid sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
        {#if meeting.isSprint}
            <div>
                <CustomH3>sprint qualy</CustomH3>
                {#each sprintQualyBets as _, i}
                    <div class="flex flex-col gap-2">
                        <DriverBetCard drivers={driverList} bind:bet={sprintRaceBets[i]} />
                    </div>
                {/each}
            </div>
            <div>
                <CustomH3>sprint race</CustomH3>
                <div class="flex flex-col gap-2">
                    {#each sprintRaceBets as _, i}
                        <DriverBetCard drivers={driverList} bind:bet={sprintRaceBets[i]} />
                    {/each}
                </div>
            </div>
        {/if}
        <div>
            <CustomH3>qualy</CustomH3>
            <div class="flex flex-col gap-2">
                {#each qualyBets as _, i}
                    <DriverBetCard drivers={driverList} bind:bet={sprintRaceBets[i]} />
                {/each}

                <TimeBetCard bind:bet={qualyTimeBet} />
            </div>
        </div>
        <div>
            <CustomH3>race</CustomH3>
            <div class="flex flex-col gap-2">
                {#each raceBets as _, i}
                    <DriverBetCard drivers={driverList} bind:bet={raceBets[i]} takenDriverIds={selectedRaceDriverIds} />
                {/each}
            </div>
        </div>
        <div class="sm:col-span-2 col-span-1 w-full flex justify-center">
            {#if sendButonIsActive}
                <DefaultButton>
                    save
                </DefaultButton>
            {:else}
                <DefaultButton status={ButtonStatus.disabled}>
                    {filledBetsCount}/{betsToFill}
                </DefaultButton>
            {/if}
        </div>
    </section>
{:else}
    <div>loading</div>
{/if}
