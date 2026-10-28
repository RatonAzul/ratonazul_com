<script lang="ts">
    import {formatExactDate, getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import MediaColoredTitle from "$lib/components/media/generic/MediaColoredTitle.svelte";

    let { currentlyReadingBooks}: {
        currentlyReadingBooks: CurrentlyReadingBook[]
    } = $props()

    let mostRecentBook = $derived(currentlyReadingBooks.length > 0 ? currentlyReadingBooks[0] : null)
</script>

<div class="flex flex-col gap-2 w-full">
    <MediaColoredTitle title="currently reading" bgColor="bg-yellow"/>
    <div class="surface-card-hover flex min-h-40 w-full">
        {#if currentlyReadingBooks.length === 1}
            <img src="{mostRecentBook?.coverImage}" alt="{mostRecentBook?.title}" class="h-40 w-28 object-cover">
            <div class="w-full flex flex-col">
                <div class="flex flex-col p-3 text-xs lg:text-sm">
                    <h4 class="text-fg0 text-base font-semibold lg:text-lg">{mostRecentBook?.title}</h4>
                    <p class="text-gray text-sm lg:text-base">{mostRecentBook?.authors[0]}</p>
                </div>

                {#if mostRecentBook?.series}
                    <p class="mx-3 flex-0 self-start bg-gray px-2 py-1 text-xs text-bg0">{mostRecentBook?.series?.name} - Book {mostRecentBook.seriesPosition}/{mostRecentBook.series?.booksCount}</p>
                {/if}

                <!-- Page count -->
                <div class="mt-auto flex px-3 text-xs text-yellow lg:text-sm">
                    <span>Page {mostRecentBook.progressPages} of {mostRecentBook.pages} <span class="lg:inline hidden">({mostRecentBook.progress}%)</span></span>
                        <span class="ms-auto text-gray lg:hidden inline" title={formatExactDate(mostRecentBook?.startedAt)}>
                        Started {getShortTimeFromNow(mostRecentBook?.startedAt)} ago
                    </span>
                        <span class="ms-auto text-gray lg:inline hidden" title={formatExactDate(mostRecentBook?.startedAt)}>
                        Started {getTimeFromNow(mostRecentBook?.startedAt)}
                    </span>
                </div>

                <!-- Progress bar-->
                <div class="w-full bg-gray lg:h-2 h-1 mt-1">
                    <div class="bg-yellow lg:h-2 h-1" style="width: {mostRecentBook.progress}%"></div>
                </div>
            </div>
        {:else}
            <p class="text-gray m-auto lg:text-base text-sm">no book in progress</p>
        {/if}
    </div>
</div>
