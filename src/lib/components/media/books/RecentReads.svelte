<script lang="ts">
    import {getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import Score from "$lib/components/media/generic/Score.svelte";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";

    let { recentlyReadBooks }: {
        recentlyReadBooks: RecentlyReadBook[];
    } = $props()
</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="recent reads" bgColor="bg-green"/>
    <div class="flex flex-col gap-2 w-full">
        {#each recentlyReadBooks as book}
            <div class="w-full h-18 bg-bg1 hover:bg-bg2 flex">
                <img src="{book.coverImage}" class="h-full" alt="{book.title}">
                <div class="lg:text-sm text-xs flex flex-col px-2 w-full">
                    <div class="py-1">
                        <h5 class="text-fg0 font-semibold">{book.title}</h5>
                        <p class="text-gray">{book.authors[0]}</p>
                    </div>

                    <div class="flex gap-2 mt-auto w-full">
                        <!-- Star rating -->
                        <Score score="{book.rating}" maxScore={10} />
                        <p class="text-green lg:text-xs text-xxs pb-1 flex justify-between w-full">
                            {book.rating}
                            <span class="text-gray lg:hidden inline">
                                Read {getShortTimeFromNow(book.finishedAt)} ago
                            </span>
                            <span class="text-gray lg:inline hidden">
                                Read {getTimeFromNow(book.finishedAt)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>