<script lang="ts">
    import CurrentMediaMiniCard from "$lib/components/media/generic/CurrentMediaMiniCard.svelte";
    import {miniCardItemFromBasicManga} from "$lib/types/mediaTracker/generic.ts";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";

    let { currentlyReadingManga }: {
        currentlyReadingManga: BasicManga[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="currently reading" bgColor="bg-yellow" />
    <ul class="card-list" role="list">
        {#each currentlyReadingManga as manga}
            <li><CurrentMediaMiniCard currentItem={miniCardItemFromBasicManga(manga)} /></li>
        {/each}
    </ul>
</div>
