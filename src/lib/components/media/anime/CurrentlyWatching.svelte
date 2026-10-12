<script lang="ts">

    import CurrentMediaMiniCard from "$lib/components/media/generic/CurrentMediaMiniCard.svelte";
    import {miniCardItemFromBasicAnime} from "$lib/types/mediaTracker/generic.ts";

    let { currentlyWatchingAnime }: {
        currentlyWatchingAnime: BasicAnime[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-yellow text-bg0 ps-2 lg:text-base text-sm">currently watching</div>
    <div class="w-full grid grid-cols-1 gap-2">
        {#each currentlyWatchingAnime as anime}
            <CurrentMediaMiniCard currentItem={miniCardItemFromBasicAnime(anime)} />
        {/each}
    </div>
</div>