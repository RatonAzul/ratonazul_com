<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import BookSection from "$lib/components/media/books/BookSection.svelte";
    import {createCurrentlyReadingBooksQuery, createRecentlyReadBooksQuery} from "$lib/queries/mediaTracker/books.ts";
    import {createCurrentlyWatchingAnimeQuery, createRecentlyWatchedAnimeQuery} from "$lib/queries/mediaTracker/anime.ts";
    import AnimeSection from "$lib/components/media/anime/AnimeSection.svelte";

    const currentlyReadingBooks = createCurrentlyReadingBooksQuery();
    const recentlyReadBooks = createRecentlyReadBooksQuery();

    const currentlyWatchingAnime = createCurrentlyWatchingAnimeQuery();
    const recentlyWatchedAnime = createRecentlyWatchedAnimeQuery();
</script>

<Body>
    <CustomH1>media</CustomH1>
    <div class="grid lg:grid-cols-2 grid-cols-1 lg:gap-8 gap-y-8 w-full">

        <!-- BOOKS -->
        <div class="flex flex-col col-span-1">
            <CustomH2>books</CustomH2>
            <BookSection {currentlyReadingBooks} {recentlyReadBooks}/>
        </div>

        <!-- ANIME -->
        <div class="flex flex-col col-span-1">
            <CustomH2>anime</CustomH2>
            <AnimeSection {currentlyWatchingAnime} {recentlyWatchedAnime}/>
        </div>

        <div class="bg-bg2 w-full h-0.5 lg:col-span-2 col-span-1"></div>

    </div>
</Body>