<script lang="ts">

    import {getProgressPercentage} from "$lib/utils/mediaTracker/utils.ts";
    import {getShortTimeFromNow} from "$lib/utils/shared/dates.ts";

    let { currentlyWatchingAnime }: {
        currentlyWatchingAnime: BasicAnime[]
    } = $props()

</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-yellow text-bg0 ps-2 lg:text-base text-sm">currently watching</div>
    <div class="w-full grid grid-cols-1 gap-2">
        {#each currentlyWatchingAnime as anime}
            <div class="bg-bg1 hover:bg-bg2 flex h-18">
                <img src="{anime.image}" class="h-full" alt="{anime.title}">
                <div class="flex flex-col w-full">
                    <div class="lg:text-sm text-xs flex flex-col flex-1 px-2 pt-1 w-full">
                        <p class="text-fg0 lg:text-sm text-xs font-semibold">{anime.title}</p>
                        <p class="text-gray text-xs">{anime.studio}</p>
                        <div class="flex justify-between mt-auto">
                            <p class="text-yellow lg:text-xs text-xxs">Episode {anime.progress}{anime.episodes == 0 ? '' : '/' + anime.episodes}</p>
                            <p class="text-gray lg:text-xs text-xxs mt-auto">Last seen {getShortTimeFromNow(anime.lastActivityAt)} ago</p>
                        </div>
                    </div>
                    <!-- Progress bar-->
                    <div class="w-full bg-gray h-1 mt-1">
                        <div class="bg-yellow h-1" style="width: {getProgressPercentage(anime.episodes, anime.progress)}%"></div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>