<script lang="ts">
    import { CaretDoubleDownIcon, CaretDownIcon } from 'phosphor-svelte';
    import { slide } from 'svelte/transition';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import RankingBoardCarousel from '$lib/components/games/RankingBoardCarousel.svelte';
    import HiddenGameBoard from '$lib/components/games/HiddenGameBoard.svelte';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import { gameFilterHref, games, type Game } from '$lib/utils/games';
    import type { SelectableUser } from '$lib/components/shared/UserSelectLabel.svelte';
    import type { displayGameResult } from '$lib/utils/game-result-summary';

    let { boards, period, date, query }: {
        boards: {
            game: Game;
            available: boolean;
            rows: {
                id: string;
                player: SelectableUser;
                position: number | null;
                points: number | null;
                attempts: { id: string; date: string; points: number | null; board: ReturnType<typeof displayGameResult> }[];
            }[];
        }[];
        period: 'daily' | 'weekly' | 'monthly' | 'global';
        date: string;
        query: string;
    } = $props();

    let expandedByGame = $state<Partial<Record<Game, Record<string, boolean>>>>({});
    let expandAll = $state<Partial<Record<Game, boolean>>>({});
    let carouselSelection = $state<{ scope: string; date: string }>();
    let carouselScope = $derived(`${period}:${date}`);
    let carouselDates = $derived([...new Set(boards.flatMap(board =>
        board.rows.flatMap(row => row.attempts.map(attempt => attempt.date))
    ))].sort().reverse());
    let carouselDate = $derived(
        carouselSelection?.scope === carouselScope && carouselDates.includes(carouselSelection.date)
            ? carouselSelection.date
            : carouselDates[0]
    );

    function boardId(game: Game, playerId: string) {
        return `ranking-board-${period}-${date}-${game}-${encodeURIComponent(playerId)}`;
    }

    function boardIsOpen(game: Game, id: string) {
        return expandedByGame[game]?.[id] ?? expandAll[game] ?? false;
    }

    function toggleBoard(game: Game, id: string) {
        const open = boardIsOpen(game, id);
        expandedByGame[game] ??= {};
        expandedByGame[game][id] = !open;
    }

    function setBoards(game: Game, open: boolean) {
        expandAll[game] = open;
        delete expandedByGame[game];
    }

</script>

{#if boards.length}
    <div class="grid items-start gap-4 lg:grid-cols-(--game-columns)"
        style:--game-columns={`repeat(${boards.length}, minmax(0, 1fr))`}>
        {#each boards as board, index (board.game)}
            {@const name = games[board.game].name}
            {@const ids = board.rows.filter(row => row.attempts.length > 0).map(row => boardId(board.game, row.id))}
            {@const allOpen = ids.length > 0 && ids.every(id => boardIsOpen(board.game, id))}
            {#if index > 0}<SectionSeparator class="my-0! lg:hidden" />{/if}
            <section class="flex min-w-0 flex-col gap-2" aria-labelledby={'ranking-' + board.game}>
                <div class="flex items-center gap-2">
                    <h3 class="plain-h3" id={'ranking-' + board.game}>
                        <a href={gameFilterHref('/games/results', query, board.game)} aria-label={`${name} rankings`}
                            class="inline-flex items-center gap-2 hover:text-fg0">
                            <FilledSectionIcon icon={gameIcons[board.game]} color="aqua" compact />
                            {name}
                        </a>
                    </h3>
                    {#if ids.length}
                        <button type="button" class="mr-3 ml-auto flex h-7 w-14 shrink-0 cursor-pointer items-center justify-center text-aqua hover:text-fg0"
                            aria-label={`${allOpen ? 'Collapse' : 'Expand'} all ${name} boards`}
                            title={allOpen ? 'collapse all boards' : 'expand all boards'}
                            aria-expanded={allOpen} aria-controls={ids.join(' ')}
                            onclick={() => setBoards(board.game, !allOpen)}>
                            <CaretDoubleDownIcon class="size-4 motion-safe:transition-transform {allOpen ? 'rotate-180' : ''}" aria-hidden="true" />
                        </button>
                    {/if}
                </div>
                {#if !board.available}
                    <p class="subtitle" role="status">unable to load results.</p>
                {:else if board.rows.length === 0}
                    <p class="subtitle">no results in this period.</p>
                {:else}
                    <div class="grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem] gap-2 pr-3 pl-5 text-meta text-gray"
                        aria-hidden="true">
                        <span>#</span><span>player</span><span class="text-center">points</span>
                    </div>
                    <ul class="flex flex-col gap-2" aria-label={`${games[board.game].name} standings`}>
                        {#each board.rows as row (row.id)}
                            {@const id = boardId(board.game, row.id)}
                            {@const open = boardIsOpen(board.game, id)}
                            <li class="surface-card grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem] items-center gap-2 border-l-4
                                py-2 pr-3 pl-4 text-secondary tabular-nums" style:border-left-color={`var(--${row.player.color})`}>
                                <span><span class="sr-only">position </span>{row.position ?? '?'}</span>
                                <div class="flex min-w-0 items-center gap-2">
                                    <UserAvatar image={row.player.image} showImage={row.player.showImage} color={row.player.color} class="size-6" />
                                    <a href={'/games/profile/' + encodeURIComponent(row.id)}
                                        class="min-w-0 truncate hover:brightness-110" style:color={`var(--${row.player.color})`}>
                                        {row.player.username || row.player.name}
                                    </a>
                                </div>
                                {#if row.attempts.length}
                                    <button type="button" class="flex cursor-pointer items-center justify-center gap-2 font-semibold text-fg0 hover:text-aqua"
                                        aria-expanded={open} aria-controls={id}
                                        aria-label={`${open ? 'Hide' : 'Show'} boards for ${row.player.username || row.player.name}${row.points === null ? ', points hidden' : `, ${row.points} points`}`}
                                        onclick={() => toggleBoard(board.game, id)}>
                                        {row.points ?? '?'}
                                        <CaretDownIcon class="size-3.5 shrink-0 motion-safe:transition-transform {open ? 'rotate-180' : ''}" aria-hidden="true" />
                                    </button>
                                    <div {id} class="col-span-3 empty:hidden">
                                        {#if open}
                                            <div class="flex flex-wrap justify-center gap-3 border-t border-bg3 pt-2" transition:slide={{ duration: 160 }}>
                                                {#if period === 'daily'}
                                                    {#each row.attempts as entry (entry.id)}
                                                        <div class="flex flex-col items-center gap-1">
                                                            {#if entry.points !== null && row.attempts.length > 1}<span class="text-meta text-gray">{entry.points} pts</span>{/if}
                                                            {#if entry.board}
                                                                <GameBoard rows={entry.board.rows} words={entry.board.words}
                                                                    isaac={board.game === 'isaaconnect'} compact />
                                                            {:else}
                                                                <HiddenGameBoard isaac={board.game === 'isaaconnect'} />
                                                            {/if}
                                                        </div>
                                                    {/each}
                                                {:else}
                                                    <RankingBoardCarousel attempts={row.attempts} isaac={board.game === 'isaaconnect'}
                                                        dates={carouselDates} date={carouselDate}
                                                        onDateChange={date => carouselSelection = { scope: carouselScope, date }} />
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {:else}
                                    <span class="text-center font-semibold">{row.points ?? '?'}<span class="sr-only"> points</span></span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        {/each}
    </div>
{:else}
    <p class="subtitle">choose your preferred games on the Games page to see their rankings.</p>
{/if}
