<script lang="ts">

    import CurrentMediaMiniCard from "$lib/components/media/generic/CurrentMediaMiniCard.svelte";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";
    import {miniCardItemFromBasicAnime} from "$lib/types/mediaTracker/generic.ts";

    let { currentlyWatchingAnime }: {
        currentlyWatchingAnime: BasicAnime[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="currently watching" bgColor="bg-yellow" />
    <ul class="card-list" role="list">
        {#each currentlyWatchingAnime as anime}
            <li><CurrentMediaMiniCard currentItem={miniCardItemFromBasicAnime(anime)} /></li>
        {/each}
    </ul>
</div>
