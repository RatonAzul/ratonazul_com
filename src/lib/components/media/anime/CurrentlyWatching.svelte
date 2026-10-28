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
    <div class="w-full grid grid-cols-1 gap-2">
        {#each currentlyWatchingAnime as anime}
            <CurrentMediaMiniCard currentItem={miniCardItemFromBasicAnime(anime)} />
        {/each}
    </div>
</div>
