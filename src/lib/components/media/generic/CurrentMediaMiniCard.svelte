<script lang="ts">

    import {formatExactDate, getShortTimeFromNow} from "$lib/utils/shared/dates.ts";
    import {getProgressPercentage} from "$lib/utils/mediaTracker/utils.ts";
    import type {MediaMiniCardItem} from "$lib/types/mediaTracker/generic.ts";

    let { currentItem }: {
        currentItem: MediaMiniCardItem
    } = $props()

</script>

<div class="surface-card flex min-h-20">
    <img src="{currentItem.image}" class="h-20 w-14 shrink-0 object-cover" alt="{currentItem.title}">
    <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex w-full flex-1 flex-col px-3 py-2 text-secondary">
            <h4 class="compact-media-title" title={currentItem.title}>{currentItem.title}</h4>
            <p class="compact-media-subtitle">{currentItem.subtitle}</p>
            <div class="mt-auto flex justify-between gap-2">
                <p class="text-yellow text-meta">Episode {currentItem.progress}{currentItem.maxProgress == 0 ? '' : '/' + currentItem.maxProgress}</p>
                <p class="text-gray text-meta mt-auto" title={formatExactDate(currentItem.lastActivityDate)}>Last {currentItem.dateVerb} {getShortTimeFromNow(currentItem.lastActivityDate)} ago</p>
            </div>
        </div>
        <!-- Progress bar-->
        <div class="w-full bg-gray h-1">
            <div class="bg-yellow h-1" style="width: {getProgressPercentage(currentItem.maxProgress, currentItem.progress)}%"></div>
        </div>
    </div>
</div>
