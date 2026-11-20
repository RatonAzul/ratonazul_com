<script lang="ts">
    import {formatExactDate, getShortTimeFromNow, getTimeFromNow} from "$lib/utils/shared/dates.ts";
    import Score from "$lib/components/media/generic/Score.svelte";
    import ColoredSectionTitle from "$lib/components/shared/ColoredSectionTitle.svelte";

    let { recentlyReadBooks }: {
        recentlyReadBooks: RecentlyReadBook[];
    } = $props()
</script>

<div class="flex flex-col gap-2 w-full">
    <ColoredSectionTitle title="recent reads" bgColor="bg-green" />
    <ul class="card-list" role="list">
        {#each recentlyReadBooks as book}
            <li class="surface-card flex min-h-20 w-full">
                <img src="{book.coverImage}" class="h-20 w-14 shrink-0 object-cover" alt="{book.title}">
                <div class="flex min-w-0 flex-1 flex-col px-3 py-2 text-secondary">
                    <div>
                        <h4 class="compact-media-title" title={book.title}>{book.title}</h4>
                        <p class="compact-media-subtitle">{book.authors[0]}</p>
                    </div>

                    <div class="flex gap-2 mt-auto w-full">
                        <!-- Star rating -->
                        <Score score="{book.rating}" maxScore={10} />
                        <p class="text-green text-meta pb-1 flex justify-between w-full">
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
            </li>
        {/each}
    </ul>
</div>
