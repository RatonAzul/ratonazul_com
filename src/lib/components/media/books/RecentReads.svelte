<script lang="ts">
    import {formatExactDate, getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
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
            <div class="surface-card-hover flex min-h-20 w-full">
                <img src="{book.coverImage}" class="h-20 w-14 object-cover" alt="{book.title}">
                <div class="flex w-full flex-col px-3 py-2 text-xs lg:text-sm">
                    <div>
                        <h5 class="text-fg0 text-xs font-semibold lg:text-sm">{book.title}</h5>
                        <p class="text-gray text-xs">{book.authors[0]}</p>
                    </div>

                    <div class="flex gap-2 mt-auto w-full">
                        <!-- Star rating -->
                        <Score score="{book.rating}" maxScore={10} />
                        <p class="text-green lg:text-xs text-xxs pb-1 flex justify-between w-full">
                            {book.rating}
                                <span class="text-gray lg:hidden inline" title={formatExactDate(book.finishedAt)}>
                                Read {getShortTimeFromNow(book.finishedAt)} ago
                            </span>
                                <span class="text-gray lg:inline hidden" title={formatExactDate(book.finishedAt)}>
                                Read {getTimeFromNow(book.finishedAt)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
