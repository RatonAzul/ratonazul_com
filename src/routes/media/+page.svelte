<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import SectionSeparator from "$lib/components/shared/SectionSeparator.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import BookSection from "$lib/components/media/books/BookSection.svelte";
    import {createCurrentlyReadingBooksQuery, createRecentlyReadBooksQuery} from "$lib/queries/mediaTracker/books.ts";
    import {createCurrentlyWatchingAnimeQuery, createRecentlyWatchedAnimeQuery} from "$lib/queries/mediaTracker/anime.ts";
    import AnimeSection from "$lib/components/media/anime/AnimeSection.svelte";
    import MangaSection from "$lib/components/media/manga/MangaSection.svelte";
    import {createCurrentlyReadingMangaQuery, createRecentlyReadMangaQuery} from "$lib/queries/mediaTracker/manga.ts";

    const currentlyReadingBooks = createCurrentlyReadingBooksQuery();
    const recentlyReadBooks = createRecentlyReadBooksQuery();

    const currentlyWatchingAnime = createCurrentlyWatchingAnimeQuery();
    const recentlyWatchedAnime = createRecentlyWatchedAnimeQuery();

    const currentlyReadingManga = createCurrentlyReadingMangaQuery();
    const recentlyReadManga = createRecentlyReadMangaQuery();
</script>

<Body>
    <CustomH1>media</CustomH1>
    <div class="grid w-full grid-cols-1 lg:grid-cols-2 lg:gap-x-8">

        <div class="grid grid-cols-1 gap-8 lg:col-span-2 lg:grid-cols-2">
            <!-- BOOKS -->
            <div class="flex min-w-0 flex-col col-span-1">
                <CustomH2 class="mb-3">books</CustomH2>
                <BookSection {currentlyReadingBooks} {recentlyReadBooks}/>
            </div>

            <!-- ANIME -->
            <div class="flex min-w-0 flex-col col-span-1">
                <CustomH2 class="mb-3">anime</CustomH2>
                <AnimeSection {currentlyWatchingAnime} {recentlyWatchedAnime}/>
            </div>
        </div>

        <SectionSeparator class="lg:col-span-2" />

        <!-- MANGA -->
        <div class="flex min-w-0 flex-col col-span-1">
            <CustomH2 class="mb-3">manga</CustomH2>
            <MangaSection {currentlyReadingManga} {recentlyReadManga}/>
        </div>
    </div>
</Body>
