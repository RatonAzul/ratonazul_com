<script lang="ts">

    import {getShortTimeFromNow} from "$lib/utils/shared/dates.ts";
    import {getProgressPercentage} from "$lib/utils/mediaTracker/utils.ts";
    import type {MediaMiniCardItem} from "$lib/types/mediaTracker/generic.ts";

    let { currentItem }: {
        currentItem: MediaMiniCardItem
    } = $props()

</script>

<div class="bg-bg1 hover:bg-bg2 flex h-18">
    <img src="{currentItem.image}" class="h-full" alt="{currentItem.title}">
    <div class="flex flex-col w-full">
        <div class="lg:text-sm text-xs flex flex-col flex-1 px-2 pt-1 w-full">
            <p class="text-fg0 lg:text-sm text-xs font-semibold">{currentItem.title}</p>
            <p class="text-gray text-xs">{currentItem.subtitle}</p>
            <div class="flex justify-between mt-auto">
                <p class="text-yellow lg:text-xs text-xxs">Episode {currentItem.progress}{currentItem.maxProgress == 0 ? '' : '/' + currentItem.maxProgress}</p>
                <p class="text-gray lg:text-xs text-xxs mt-auto">Last {currentItem.dateVerb} {getShortTimeFromNow(currentItem.lastActivityDate)} ago</p>
            </div>
        </div>
        <!-- Progress bar-->
        <div class="w-full bg-gray h-1 mt-1">
            <div class="bg-yellow h-1" style="width: {getProgressPercentage(currentItem.maxProgress, currentItem.progress)}%"></div>
        </div>
    </div>
</div>