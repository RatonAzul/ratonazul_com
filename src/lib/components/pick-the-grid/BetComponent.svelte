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
    import {createMutation, useQueryClient} from "@tanstack/svelte-query";
    import {authClient, useSession} from "$lib/auth-client";
    import {page} from "$app/state";
    import {getMeetingStatus} from "$lib/utils/motorsport/pick-the-grid/meetings";

    const session = useSession();

    let { meeting, drivers, positionBets, timeBets }: {
        meeting?: Meeting,
        drivers: CreateQueryResult<Driver[], Error>,
        positionBets: CreateQueryResult<PositionBet[], Error>,
        timeBets: CreateQueryResult<TimeBet[], Error>
    } = $props();

    // mutable state for editing
    let sprintQualyBets = $state<PositionBetDraft[]>([]);
    let sprintRaceBets = $state<PositionBetDraft[]>([]);
    let qualyBets = $state<PositionBetDraft[]>([]);
    let raceBets = $state<PositionBetDraft[]>([]);
    let qualyTimeBet = $state<TimeBetDraft | undefined>(undefined);
    $inspect("qualytimebet: ", qualyTimeBet)
    let isMeetingOpen = $derived(getMeetingStatus(meeting).type === "open")
    let betsToFill = $derived(meeting?.isSprint ? 9 : 7);
    let filledBetsCount = $derived(
        [...sprintQualyBets, ...sprintRaceBets, ...qualyBets, ...raceBets]
            .filter(b => b.guessedDriverId && b.guessedDriverId !== 0).length
        + (qualyTimeBet?.guessedTime ? 1 : 0)
    );
    let sendButtonIsActive = $derived(betsToFill === filledBetsCount && isMeetingOpen);

    // deselect the selected driver from other positions
    function handleRaceDriverSelected(pickedByIndex: number, driverId: number) {
        raceBets = raceBets.map((b, i) => {
            if (i !== pickedByIndex && b.guessedDriverId === driverId) {
                return { ...b, guessedDriverId: undefined };
            }
            return b;
        });
    }

    $effect(() => {
        const bets = positionBets.data ?? [];
        const time = timeBets.data ?? [];
        sprintQualyBets = buildPositionBetDrafts(bets, SessionName.SprintQualifying, 1);
        sprintRaceBets = buildPositionBetDrafts(bets, SessionName.SprintRace, 1);
        qualyBets = buildPositionBetDrafts(bets, SessionName.Qualifying, 1);
        raceBets = buildPositionBetDrafts(bets, SessionName.Race, 5);
        qualyTimeBet = buildTimeBetDraft(time, SessionName.Qualifying);
    });

    let driverList = $derived(drivers.data ?? []);

    // -- submit bets
    let showSuccessButton = $state(false);

    const queryClient = useQueryClient();
    const submitBets = createMutation(() => ({
        mutationFn: async () => {
            const allPositionBets = [...sprintQualyBets, ...sprintRaceBets, ...qualyBets, ...raceBets]
                .filter(b => b.guessedDriverId);

            const res = await fetch(`/api/motorsport/bets/upsert?meetingId=${meeting?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    positionBets: allPositionBets,
                    timeBet: qualyTimeBet?.guessedTime ? qualyTimeBet : undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit bets');
        },
        onSuccess: () => {
            showSuccessButton = true;
            queryClient.invalidateQueries({ queryKey: ['bets', meeting?.id] });
            setTimeout(() => showSuccessButton = false, 2000)
        },
        onError: (error: Error) => {
            console.error('Failed to submit bets:', error);
        }
    }));
</script>

{#if meeting}
    <section class="grid sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
        {#if meeting.isSprint}
            <div>
                <CustomH3>sprint qualy</CustomH3>
                <div class="flex flex-col gap-2">
                    {#each sprintQualyBets as _, i}
                        <DriverBetCard drivers={driverList} bind:bet={sprintQualyBets[i]} disabled={!isMeetingOpen}/>
                    {/each}
                </div>
            </div>
            <div>
                <CustomH3>sprint race</CustomH3>
                <div class="flex flex-col gap-2">
                    {#each sprintRaceBets as _, i}
                        <DriverBetCard drivers={driverList} bind:bet={sprintRaceBets[i]} disabled={!isMeetingOpen} />
                    {/each}
                </div>
            </div>
        {/if}
        <div>
            <CustomH3>qualy</CustomH3>
            <div class="flex flex-col gap-2">
                {#each qualyBets as _, i}
                    <DriverBetCard drivers={driverList} bind:bet={qualyBets[i]} disabled={!isMeetingOpen} />
                {/each}
                <TimeBetCard bind:bet={qualyTimeBet} disabled={!isMeetingOpen} />
            </div>
        </div>
        <div>
            <CustomH3>race</CustomH3>
            <div class="flex flex-col gap-2">
                {#each raceBets as _, i}
                    <DriverBetCard
                            drivers={driverList}
                            bind:bet={raceBets[i]}
                            onDriverSelected={(driverId) => handleRaceDriverSelected(i, driverId)}
                            disabled={!isMeetingOpen}
                    />
                {/each}
            </div>
        </div>
        <div class="sm:col-span-2 col-span-1 w-full flex justify-center mt-4">
            {#if $session?.data?.user.id}
                {#if showSuccessButton}
                    <DefaultButton status={ButtonStatus.success}>
                        saved!
                    </DefaultButton>
                {:else if submitBets.isPending}
                    <DefaultButton status={ButtonStatus.disabled}>
                        saving...
                    </DefaultButton>
                {:else if sendButtonIsActive}
                    <DefaultButton handleOnClick={() => submitBets.mutate()}>
                        save
                    </DefaultButton>
                {:else}
                    <DefaultButton status={ButtonStatus.disabled}>
                        {filledBetsCount}/{betsToFill}
                    </DefaultButton>
                {/if}
            {:else}
                <DefaultButton status={ButtonStatus.default} handleOnClick={() =>
                        authClient.signIn.social({
                            provider: "google",
                            callbackURL: `${page.url}`,
                        })}>
                    log in
                </DefaultButton>
            {/if}
        </div>
    </section>
{:else}
    <section class="bg-bg1 animate-pulse sm:h-17 h-26 w-full mb-8"></section>
{/if}