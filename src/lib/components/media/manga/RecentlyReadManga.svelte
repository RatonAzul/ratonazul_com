<script lang="ts">
    import RecentMediaMiniCard from "$lib/components/media/generic/RecentMediaMiniCard.svelte";
    import {miniCardItemFromBasicManga} from "$lib/types/mediaTracker/generic.ts";
    import {getRecentlyWatchedListSize} from "$lib/utils/mediaTracker/utils.ts";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";

    let { recentlyReadManga, currentlyReadingListSize }: {
        recentlyReadManga: BasicManga[],
        currentlyReadingListSize: number
    } = $props()

    let listSize = getRecentlyWatchedListSize(currentlyReadingListSize)

</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="recent reads" bgColor="bg-green" />
    <ul class="card-list" role="list">
        {#each recentlyReadManga.slice(0, listSize) as manga}
            <li><RecentMediaMiniCard recentItem={miniCardItemFromBasicManga(manga)}/></li>
        {/each}
    </ul>
</div>
