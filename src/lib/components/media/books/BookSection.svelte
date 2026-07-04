<script lang="ts">
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import CurrentlyReading from "$lib/components/media/books/CurrentlyReading.svelte";
    import RecentReads from "$lib/components/media/books/RecentReads.svelte";
    import CurrentlyReadingSkeleton from "$lib/components/media/books/skeletons/CurrentlyReadingSkeleton.svelte";
    import RecentReadsSkeleton from "$lib/components/media/books/skeletons/RecentReadsSkeleton.svelte";

    let { currentlyReadingBooks, recentlyReadBooks}: {
        currentlyReadingBooks: CreateQueryResult<CurrentlyReadingBook[], Error>,
        recentlyReadBooks: CreateQueryResult<RecentlyReadBook[], Error>,
    } = $props()
</script>

<div class="flex flex-col gap-4 w-full">

    {#if currentlyReadingBooks.data}
        <CurrentlyReading currentlyReadingBooks={currentlyReadingBooks.data}/>
    {:else}
        <CurrentlyReadingSkeleton/>
    {/if}

    {#if recentlyReadBooks.data}
        <RecentReads recentlyReadBooks={recentlyReadBooks.data}/>
    {:else}
        <RecentReadsSkeleton/>
    {/if}
</div>