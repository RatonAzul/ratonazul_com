<script lang="ts">
    import {CaretLeftIcon, CaretRightIcon} from "phosphor-svelte";
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import type {Meeting} from "$lib/types/motorsport";
    import {
        formatMeetingDate, formatShortMeetingName,
        getMeetingStatus,
    } from "$lib/utils/motorsport/pick-the-grid/meetings";

    let { selectedMeetingIndex = $bindable(), meetings }: { selectedMeetingIndex: number, meetings:  CreateQueryResult<Meeting[], Error> } = $props();

    let selectedMeeting = $derived(meetings?.data ? meetings.data[selectedMeetingIndex] : undefined)
    let previousMeeting = $derived(meetings?.data && selectedMeetingIndex > 0 ? meetings.data[selectedMeetingIndex - 1] : undefined)
    let nextMeeting = $derived(meetings?.data && selectedMeetingIndex < meetings.data.length ? meetings.data[selectedMeetingIndex + 1] : undefined)

    let selectedMeetingStatus = $derived(getMeetingStatus(selectedMeeting))

    function increaseSelectedMeeting() {
        if (meetings?.data?.length && selectedMeetingIndex !== meetings.data.length - 1) selectedMeetingIndex++;
    }

    function decreaseSelectedMeeting() {
        if (selectedMeetingIndex > 0) selectedMeetingIndex -= 1;
    }
</script>

{#if meetings.isLoading || meetings.isLoadingError}
    <section class="surface-card animate-pulse sm:h-17 h-26 w-full mb-8"></section>
{:else if meetings.data}
    <section class="surface-card mb-8 grid sm:grid-cols-3 grid-cols-4">
        {#if !previousMeeting}
            <div></div>
        {:else}
            <button type="button" aria-label="Previous meeting" class="button button-quiet p-2 sm:flex-row flex-col-reverse sm:items-center items-start sm:justify-start justify-end" onclick={decreaseSelectedMeeting}>
                <span class="flex justify-center items-center sm:me-0 me-auto h-full">
                    <CaretLeftIcon class="sm:size-6 size-6" weight="bold" />
                    {#if previousMeeting.country.image && previousMeeting.country.image.length !== 0}
                        <div class="inline-block sm:size-8 size-6 mx-1">
                            {@html previousMeeting.country.image}
                        </div>
                    {/if}
                </span>
                <span class="hidden sm:flex flex-col items-start justify-center">
                    <span class="text-secondary font-semibold text-fg0 text-start">{formatShortMeetingName(previousMeeting.name)}</span>
                    <span class="subtitle">R{selectedMeetingIndex} - {formatMeetingDate(previousMeeting.startDate)}</span>
                </span>
            </button>
        {/if}

        {#if !selectedMeeting}
            <div></div>
        {:else}
            <div class="p-2 sm:col-span-1 col-span-2 flex sm:flex-row flex-col items-center justify-center gap-2">
                <span class="flex flex-col justify-start gap-1">
                    <span class="text-secondary font-semibold text-fg0">{formatShortMeetingName(selectedMeeting.name)}</span>
                    {#if selectedMeetingStatus.type === "open"}
                        <span class="tag text-secondary bg-green text-bg0">closes in {selectedMeetingStatus.label}</span>
                    {:else if selectedMeetingStatus.type === "closed"}
                        <span class="tag text-secondary bg-red text-bg0">bet is closed</span>
                    {:else if selectedMeetingStatus.type === "opens_in"}
                        <span class="tag text-secondary">opens in {selectedMeetingStatus.label}</span>
                    {:else if selectedMeetingStatus.type === "ended"}
                        <span class="tag text-secondary bg-red text-bg0">ended {selectedMeetingStatus.label}</span>
                    {/if}
                </span>
                {#if selectedMeeting.country.image && selectedMeeting.country.image.length !== 0}
                    <div class="inline-block sm:size-8 size-6 sm:mx-1 mt-1">
                        {@html selectedMeeting.country.image}
                    </div>
                {/if}
            </div>
        {/if}

        {#if !nextMeeting}
            <div></div>
        {:else}
            <button type="button" aria-label="Next meeting" class="button button-quiet p-2 sm:flex-row flex-col w-full" onclick={increaseSelectedMeeting}>
                <span class="sm:ms-auto h-full hidden sm:flex flex-col items-end justify-center">
                    <span class="text-secondary font-semibold text-fg0 ">{formatShortMeetingName(nextMeeting.name)}</span>
                    <span class="subtitle" >R{selectedMeetingIndex + 2} - {formatMeetingDate(nextMeeting.startDate)}</span>
                </span>
            <span class="flex items-center justify-center sm:ms-0 ms-auto h-full">
                {#if nextMeeting.country.image && nextMeeting.country.image.length !== 0}
                    <div class="inline-block sm:size-8 size-6 mx-1">
                        {@html nextMeeting.country.image}
                    </div>
                {/if}
                <CaretRightIcon class="size-6" weight="bold" />
            </span>
            </button>
        {/if}
    </section>
{/if}
