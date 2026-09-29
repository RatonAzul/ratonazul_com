<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import CurrentlyWatchingAnime from "$lib/components/media/anime/CurrentlyWatching.svelte";
    import RecentlyWatchedAnime from "$lib/components/media/anime/RecentlyWatchedAnime.svelte";
    import SectionSkeleton from "$lib/components/media/generic/SectionSkeleton.svelte";

    let { currentlyWatchingAnime, recentlyWatchedAnime }: {
        currentlyWatchingAnime: CreateQueryResult<BasicAnime[], Error>,
        recentlyWatchedAnime: CreateQueryResult<BasicAnime[], Error>,
    } = $props()
</script>

<div class="flex flex-col gap-4 w-full">
    {#if currentlyWatchingAnime.data && recentlyWatchedAnime.data}
        <CurrentlyWatchingAnime currentlyWatchingAnime={currentlyWatchingAnime.data}/>
        <RecentlyWatchedAnime recentlyWatchedAnime={recentlyWatchedAnime.data} currentlyWatchingSize={currentlyWatchingAnime.data?.length} />
    {:else}
        <SectionSkeleton titleInProgress="currently watching" titleCompleted="recently watched"/>
    {/if}
</div>

