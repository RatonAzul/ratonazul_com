<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import HiddenGameBoard from '$lib/components/games/HiddenGameBoard.svelte';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import type { displayGameResult } from '$lib/utils/game-result-summary';
    import { formatCalendarDate } from '$lib/utils/shared/calendar';

    let { attempts, isaac, dates, date, onDateChange }: {
        attempts: { id: string; date: string; board: ReturnType<typeof displayGameResult> }[];
        isaac: boolean;
        dates: string[];
        date: string;
        onDateChange: (date: string) => void;
    } = $props();

    let index = $derived(dates.indexOf(date));
    let dayAttempts = $derived(attempts.filter(attempt => attempt.date === date));

    const arrowClass = 'flex min-h-11 w-11 cursor-pointer items-center justify-center text-fg0 hover:brightness-125 disabled:cursor-default disabled:text-gray';
</script>

<div class="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-stretch">
    {#if dates.length > 1}
        <button type="button" class="col-start-1 row-start-1 {arrowClass}" aria-label="Previous board" disabled={index === 0}
            onclick={() => onDateChange(dates[index - 1])}>
            <CaretLeftIcon class="size-4" aria-hidden="true" />
        </button>
    {/if}
    <div class="col-start-2 row-start-1 flex min-w-0 flex-col items-center justify-center gap-1" aria-live="polite">
        <div class="flex flex-wrap items-center justify-center gap-2 {isaac ? 'min-h-[4.375rem]' : 'min-h-[6.625rem]'}">
            {#each dayAttempts as attempt (attempt.id)}
                {#if attempt.board}
                    <GameBoard rows={attempt.board.rows} words={attempt.board.words} {isaac} compact />
                {:else}
                    <HiddenGameBoard {isaac} />
                {/if}
            {:else}
                <p class="text-center text-meta text-gray">didn’t play that day</p>
            {/each}
        </div>
        <time datetime={date} class="text-meta text-gray">{formatCalendarDate(date)}</time>
        {#if isaac && dates.length > 1}
            <span class="text-meta text-gray">{index + 1} / {dates.length}</span>
        {/if}
    </div>
    {#if dates.length > 1}
        <button type="button" class="col-start-3 row-start-1 {arrowClass}" aria-label="Next board" disabled={index === dates.length - 1}
            onclick={() => onDateChange(dates[index + 1])}>
            <CaretRightIcon class="size-4" aria-hidden="true" />
        </button>
    {/if}
</div>
