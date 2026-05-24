<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import type {Driver, MeetingBetResponse} from "$lib/types/motorsport.ts";
    import MiniBetComponent from "$lib/components/pick-the-grid/MiniBetComponent.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";

    let { meetingBets, drivers }: {
        meetingBets: CreateQueryResult<MeetingBetResponse, Error>,
        drivers: CreateQueryResult<Driver[], Error>,
    } = $props();


</script>

{#if meetingBets.isSuccess && meetingBets.data.users.length !== 0}
    <div class="mb-8">
        <CustomH2>pick results</CustomH2>
        <div class="flex gap-4 overflow-x-scroll">
            {#each meetingBets.data.users as user, i}
                <MiniBetComponent meetingBets={user} {drivers} position={i+1} />
            {/each}
        </div>
    </div>
{/if}