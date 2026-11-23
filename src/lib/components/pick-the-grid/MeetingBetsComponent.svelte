<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import type {Driver, MeetingBetResponse} from "$lib/types/motorsport.ts";
    import MiniBetComponent from "$lib/components/pick-the-grid/MiniBetComponent.svelte";
    import SectionSeparator from "$lib/components/shared/SectionSeparator.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";

    let { meetingBets, drivers }: {
        meetingBets: CreateQueryResult<MeetingBetResponse, Error>,
        drivers: CreateQueryResult<Driver[], Error>,
    } = $props();

    const count = $derived(meetingBets.data?.users.length);
    const subtitle = $derived(count === undefined ? undefined : `${count} ${count === 1 ? "user submitted a bet" : "users submitted a bet"}`);
</script>

{#if meetingBets.isLoading || meetingBets.isLoadingError || (meetingBets.isSuccess && !!count)}
    <SectionSeparator />
    <section>
        <CustomH2 class="mb-3" headingClass="text-card-title" {subtitle}>results</CustomH2>
        {#if meetingBets.isSuccess}
            <div class="flex gap-8 overflow-x-scroll">
                {#each meetingBets.data.users as user, i}
                    <MiniBetComponent meetingBets={user} {drivers} position={i + 1} />
                {/each}
            </div>
        {:else}
            <div class="surface-card h-26 w-full animate-pulse sm:h-17"></div>
        {/if}
    </section>
{/if}
