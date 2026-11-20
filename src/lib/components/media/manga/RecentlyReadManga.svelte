<script lang="ts">
    import RecentMediaMiniCard from "$lib/components/media/generic/RecentMediaMiniCard.svelte";
    import {miniCardItemFromBasicManga} from "$lib/types/mediaTracker/generic.ts";
    import {getRecentlyWatchedListSize} from "$lib/utils/mediaTracker/utils.ts";
    import ColoredSectionTitle from "$lib/components/shared/ColoredSectionTitle.svelte";

    let { recentlyReadManga, currentlyReadingListSize }: {
        recentlyReadManga: BasicManga[],
        currentlyReadingListSize: number
    } = $props()

    let listSize = getRecentlyWatchedListSize(currentlyReadingListSize)

</script>

<div class="flex flex-col gap-2 w-full">
    <ColoredSectionTitle title="recent reads" bgColor="bg-green" />
    <ul class="card-list" role="list">
        {#each recentlyReadManga.slice(0, listSize) as manga}
            <li><RecentMediaMiniCard recentItem={miniCardItemFromBasicManga(manga)}/></li>
        {/each}
    </ul>
</div>
