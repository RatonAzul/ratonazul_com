<script lang="ts">
    import RecentMediaMiniCard from "$lib/components/media/generic/RecentMediaMiniCard.svelte";
    import {miniCardItemFromBasicAnime} from "$lib/types/mediaTracker/generic.ts";
    import {getRecentlyWatchedListSize} from "$lib/utils/mediaTracker/utils.ts";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";

    let { recentlyWatchedAnime, currentlyWatchingSize }: {
        recentlyWatchedAnime: BasicAnime[],
        currentlyWatchingSize: number,
    } = $props()

    let listSize = $derived(getRecentlyWatchedListSize(currentlyWatchingSize))
</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="recently watched" bgColor="bg-green" />
    <div class="flex flex-col gap-2 w-full">
        {#each recentlyWatchedAnime.slice(0, listSize) as anime}
           <RecentMediaMiniCard recentItem={miniCardItemFromBasicAnime(anime)} />
        {/each}
    </div>
</div>
