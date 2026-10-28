<script lang="ts">

    import {formatExactDate, getShortTimeFromNow} from "$lib/utils/shared/dates.ts";
    import {getProgressPercentage} from "$lib/utils/mediaTracker/utils.ts";
    import type {MediaMiniCardItem} from "$lib/types/mediaTracker/generic.ts";

    let { currentItem }: {
        currentItem: MediaMiniCardItem
    } = $props()

</script>

<div class="surface-card-hover flex min-h-20">
    <img src="{currentItem.image}" class="h-20 w-14 object-cover" alt="{currentItem.title}">
    <div class="flex flex-col w-full">
        <div class="flex w-full flex-1 flex-col px-3 py-2 text-xs lg:text-sm">
            <p class="text-fg0 lg:text-sm text-xs font-semibold">{currentItem.title}</p>
            <p class="text-gray text-xs">{currentItem.subtitle}</p>
            <div class="mt-auto flex justify-between gap-2">
                <p class="text-yellow lg:text-xs text-xxs">Episode {currentItem.progress}{currentItem.maxProgress == 0 ? '' : '/' + currentItem.maxProgress}</p>
                <p class="text-gray lg:text-xs text-xxs mt-auto" title={formatExactDate(currentItem.lastActivityDate)}>Last {currentItem.dateVerb} {getShortTimeFromNow(currentItem.lastActivityDate)} ago</p>
            </div>
        </div>
        <!-- Progress bar-->
        <div class="w-full bg-gray h-1">
            <div class="bg-yellow h-1" style="width: {getProgressPercentage(currentItem.maxProgress, currentItem.progress)}%"></div>
        </div>
    </div>
</div>
