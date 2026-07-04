<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import BookSection from "$lib/components/media/books/BookSection.svelte";
    import {createCurrentlyReadingBooksQuery, createRecentlyReadBooksQuery} from "$lib/queries/mediaTracker/books.ts";

    const currentlyReadingBooks = createCurrentlyReadingBooksQuery();
    const recentlyReadBooks = createRecentlyReadBooksQuery();
</script>

<Body>
    <CustomH1>media</CustomH1>
    <div class="grid lg:grid-cols-2 grid-cols-1 lg:gap-8 gap-y-8 w-full">
        <div class="flex flex-col col-span-1">
            <CustomH2>books</CustomH2>
            <BookSection {currentlyReadingBooks} {recentlyReadBooks}/>
        </div>
        <div class="bg-bg2 w-full h-0.5 col-span-2"></div>
    </div>
</Body>