<script lang="ts">
    import RecentMediaMiniCard from "$lib/components/media/generic/RecentMediaMiniCard.svelte";
    import {miniCardItemFromBasicAnime} from "$lib/types/mediaTracker/generic.ts";
    import {getRecentlyWatchedListSize} from "$lib/utils/mediaTracker/utils.ts";

    let { recentlyWatchedAnime, currentlyWatchingSize }: {
        recentlyWatchedAnime: BasicAnime[],
        currentlyWatchingSize: number,
    } = $props()

    let listSize = $derived(getRecentlyWatchedListSize(currentlyWatchingSize))
</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-green lg:text-base text-sm text-bg0 ps-2">recently watched</div>
    <div class="flex flex-col gap-2 w-full">
        {#each recentlyWatchedAnime.slice(0, listSize) as anime}
           <RecentMediaMiniCard recentItem={miniCardItemFromBasicAnime(anime)} />
        {/each}
    </div>
</div>