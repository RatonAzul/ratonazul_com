<script lang="ts">
    import {getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import Score from "$lib/components/media/generic/Score.svelte";

    let { recentItem }: {
        recentItem: RecentMiniCardItem;
    } = $props()
</script>


<div class="w-full h-18 bg-bg1 hover:bg-bg2 flex">
    <img src="{recentItem.image}" class="h-full" alt="{recentItem.title}">
    <div class="lg:text-sm text-xs flex flex-col px-2 w-full">
        <div class="py-1">
            <h5 class="text-fg0 font-semibold">{recentItem.title}</h5>
            <p class="text-gray">{recentItem.subtitle}</p>
        </div>

        <div class="flex gap-2 mt-auto w-full">
            <!-- Star rating -->
            <Score score="{recentItem.score}" maxScore={recentItem.maxScore} />
            <p class="text-green lg:text-xs text-xxs pb-1 flex justify-between w-full">
                {recentItem.score}
                <span class="text-gray lg:hidden inline">
                    {recentItem.dateVerb} {getShortTimeFromNow(recentItem.date)} ago
                </span>
                <span class="text-gray lg:inline hidden">
                    {recentItem.dateVerb} {getTimeFromNow(recentItem.date)}
                </span>
            </p>
        </div>
    </div>
</div>

