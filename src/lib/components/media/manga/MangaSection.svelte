<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import RecentlyReadManga from "$lib/components/media/manga/RecentlyReadManga.svelte";
    import SectionSkeleton from "$lib/components/media/generic/SectionSkeleton.svelte";

    let { currentlyReadingManga, recentlyReadManga }: {
        currentlyReadingManga: CreateQueryResult<BasicManga[], Error>,
        recentlyReadManga: CreateQueryResult<BasicManga[], Error>,
    } = $props()
</script>

<div class="flex flex-col gap-4 w-full">
    {#if currentlyReadingManga.data && recentlyReadManga.data}
        <RecentlyReadManga recentlyReadManga={recentlyReadManga.data} currentlyReadingSize={currentlyReadingManga.data?.length} />
    {:else}
        <SectionSkeleton titleInProgress="currently reading" titleCompleted="recent reads"/>
    {/if}
</div>