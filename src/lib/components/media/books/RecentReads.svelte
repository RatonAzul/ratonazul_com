<script lang="ts">
    import {getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";

    let { recentlyReadBooks }: {
        recentlyReadBooks: RecentlyReadBook[];
    } = $props()
</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-green lg:text-base text-sm text-bg0 ps-2">recent reads</div>
    <div class="flex flex-col gap-2 w-full">
        {#each recentlyReadBooks as book}
            <div class="w-full h-16 bg-bg1 hover:bg-bg2 flex">
                <img src="{book.coverImage}" class="h-full" alt="{book.title}">
                <div class="lg:text-sm text-xs flex flex-col px-2 w-full">
                    <div class="py-1">
                        <h5 class="text-fg0 font-semibold">{book.title}</h5>
                        <p class="text-gray">{book.author}</p>
                    </div>

                    <div class="flex gap-2 mt-auto w-full">
                        <!-- Star rating -->
                        <div class="flex gap-1 justify-center items-center pb-1">
                            {#each Array(10) as _, i}
                                {@const filled = book.rating - i}
                                <div class="lg:size-3 size-2 relative overflow-hidden bg-gray">
                                    {#if filled >= 1}
                                        <div class="absolute inset-0 bg-green"></div>
                                    {:else if filled > 0}
                                        <div class="absolute bottom-0 left-0 right-0 bg-green h-full w-1/2" width="height: {filled * 100}%"></div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
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