<script lang="ts">
    import {formatExactDate, getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import Score from "$lib/components/media/generic/Score.svelte";
    import type {MediaMiniCardItem} from "$lib/types/mediaTracker/generic.ts";

    let { recentItem }: {
        recentItem: MediaMiniCardItem;
    } = $props()
</script>


<div class="surface-card flex min-h-20 w-full">
    <img src="{recentItem.image}" class="h-20 w-14 shrink-0 object-cover" alt="{recentItem.title}">
    <div class="flex min-w-0 flex-1 flex-col px-3 py-2 text-secondary">
        <div>
            <h4 class="compact-media-title" title={recentItem.title}>{recentItem.title}</h4>
            <p class="compact-media-subtitle">{recentItem.subtitle}</p>
        </div>

        <div class="mt-auto flex w-full gap-2">
            <!-- Star rating -->
            <Score score="{recentItem.score}" maxScore={recentItem.maxScore} />
            <p class="text-green text-meta pb-1 flex justify-between w-full">
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

