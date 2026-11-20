<script lang="ts">

    import CurrentMediaMiniCard from "$lib/components/media/generic/CurrentMediaMiniCard.svelte";
    import ColoredSectionTitle from "$lib/components/shared/ColoredSectionTitle.svelte";
    import {miniCardItemFromBasicAnime} from "$lib/types/mediaTracker/generic.ts";

    let { currentlyWatchingAnime }: {
        currentlyWatchingAnime: BasicAnime[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <ColoredSectionTitle title="currently watching" bgColor="bg-yellow" />
    <ul class="card-list" role="list">
        {#each currentlyWatchingAnime as anime}
            <li><CurrentMediaMiniCard currentItem={miniCardItemFromBasicAnime(anime)} /></li>
        {/each}
    </ul>
</div>
