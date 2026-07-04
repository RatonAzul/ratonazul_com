<script lang="ts">
    import {getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";

    let { currentlyReadingBooks}: {
        currentlyReadingBooks: CurrentlyReadingBook[]
    } = $props()

    let mostRecentBook = currentlyReadingBooks.length > 0 ? currentlyReadingBooks[0] : null;
</script>

<div class="flex flex-col gap-2 w-full">
    <div class="bg-yellow text-bg0 ps-2 lg:text-base text-sm">currently reading</div>
    <div class="w-full h-34 bg-bg1 hover:bg-bg2 flex">
        {#if currentlyReadingBooks.length === 1}
            <img src="{mostRecentBook.coverImage}" alt="{mostRecentBook.title}" class="h-full">
            <div class="w-full flex flex-col">
                <div class="flex flex-col lg:text-sm text-xs p-2">
                    <h4 class="font-semibold text-fg0 lg:text-base text-sm">{mostRecentBook.title}</h4>
                    <p class="text-gray">{mostRecentBook.author}</p>
                </div>

                {#if mostRecentBook.series}
                    <p class="lg:text-sm text-xs text-bg0 bg-gray flex-0 mx-2 px-2 self-start">{mostRecentBook.series.name} - Book {mostRecentBook.seriesPosition}/{mostRecentBook.series.booksCount}</p>
                {/if}

                <!-- Page count -->
                <div class="text-yellow lg:text-sm text-xs px-2 mt-auto flex">
                    <span>Page {mostRecentBook.progressPages} of {mostRecentBook.pages} <span class="lg:inline hidden">({mostRecentBook.progress}%)</span></span>
                    <span class="ms-auto text-gray lg:hidden inline">
                        Started {getShortTimeFromNow(mostRecentBook.startedAt)} ago
                    </span>
                    <span class="ms-auto text-gray lg:inline hidden">
                        Started {getTimeFromNow(mostRecentBook.startedAt)}
                    </span>
                </div>

                <!-- Progress bar-->
                <div class="w-full bg-gray lg:h-2 h-1 mt-1">
                    <div class="bg-yellow lg:h-2 h-1" style="width: {mostRecentBook.progress}%"></div>
                </div>
            </div>
        {/if}
    </div>
</div>