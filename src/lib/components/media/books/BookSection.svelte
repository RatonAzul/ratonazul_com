<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import CurrentlyReading from "$lib/components/media/books/CurrentlyReading.svelte";
    import RecentReads from "$lib/components/media/books/RecentReads.svelte";
    import SectionSkeleton from "$lib/components/media/generic/SectionSkeleton.svelte";

    let { currentlyReadingBooks, recentlyReadBooks}: {
        currentlyReadingBooks: CreateQueryResult<CurrentlyReadingBook[], Error>,
        recentlyReadBooks: CreateQueryResult<RecentlyReadBook[], Error>,
    } = $props()
</script>

<div class="flex flex-col gap-4 w-full">

    {#if currentlyReadingBooks.data && recentlyReadBooks.data}
        <CurrentlyReading currentlyReadingBooks={currentlyReadingBooks.data}/>
        <RecentReads recentlyReadBooks={recentlyReadBooks.data}/>
    {:else}
        <SectionSkeleton titleInProgress="currently reading" titleCompleted="recent reads"/>
    {/if}
</div>