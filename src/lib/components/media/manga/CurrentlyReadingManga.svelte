<script lang="ts">
    import CurrentMediaMiniCard from "$lib/components/media/generic/CurrentMediaMiniCard.svelte";
    import {miniCardItemFromBasicManga} from "$lib/types/mediaTracker/generic.ts";

    let { currentlyReadingManga }: {
        currentlyReadingManga: BasicManga[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-yellow text-bg0 ps-2 lg:text-base text-sm">currently reading</div>
    <div class="w-full grid grid-cols-1 gap-2">
        {#each currentlyReadingManga as manga}
            <CurrentMediaMiniCard currentItem={miniCardItemFromBasicManga(manga)} />
        {/each}
    </div>
</div>