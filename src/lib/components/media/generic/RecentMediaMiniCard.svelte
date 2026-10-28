<script lang="ts">
    import {formatExactDate, getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import Score from "$lib/components/media/generic/Score.svelte";
    import type {MediaMiniCardItem} from "$lib/types/mediaTracker/generic.ts";

    let { recentItem }: {
        recentItem: MediaMiniCardItem;
    } = $props()
</script>


<div class="surface-card-hover flex min-h-20 w-full">
    <img src="{recentItem.image}" class="h-20 w-14 object-cover" alt="{recentItem.title}">
    <div class="flex w-full flex-col px-3 py-2 text-xs lg:text-sm">
        <div>
            <h5 class="text-fg0 text-xs font-semibold lg:text-sm">{recentItem.title}</h5>
            <p class="text-gray text-xs">{recentItem.subtitle}</p>
        </div>

        <div class="mt-auto flex w-full gap-2">
            <!-- Star rating -->
            <Score score="{recentItem.score}" maxScore={recentItem.maxScore} />
            <p class="text-green lg:text-xs text-xxs pb-1 flex justify-between w-full">
                {recentItem.score}
                <span class="text-gray lg:hidden inline">
                    <span title={formatExactDate(recentItem.finishDate)}>{recentItem.dateVerb} {getShortTimeFromNow(recentItem.finishDate)} ago</span>
                </span>
                <span class="text-gray lg:inline hidden">
                    <span title={formatExactDate(recentItem.finishDate)}>{recentItem.dateVerb} {getTimeFromNow(recentItem.finishDate)}</span>
                </span>
            </p>
        </div>
    </div>
</div>

