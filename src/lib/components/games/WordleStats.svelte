<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import type { wordleStatistics } from '$lib/utils/game-result-summary';

    let { name, color, stats, right = false, switchPlayer }: {
        name: string;
        color: string | null;
        stats: ReturnType<typeof wordleStatistics>;
        right?: boolean;
        switchPlayer: () => void;
    } = $props();

    let accent = $derived(isProfileColor(color) ? color : defaultProfileColor);
    const percentage = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 1 });
    const average = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
</script>

<article class="surface-card flex min-w-0 flex-col gap-3 p-3 sm:p-4 {right ? 'border-r-4' : 'border-l-4'}"
    style:--stats-color={`var(--${accent})`} style:border-color="var(--stats-color)">
    <div class="flex items-center gap-2 {right ? 'flex-row-reverse' : ''}">
        <h4 class="min-w-0 flex-1 truncate" class:text-right={right} title={name} style:color="var(--stats-color)">{name}</h4>
        <button type="button" class="action-icon size-10 sm:hidden" aria-label={right ? 'Previous player stats' : 'Next player stats'}
            onclick={switchPlayer}>
            {#if right}
                <CaretLeftIcon class="size-4" aria-hidden="true" />
            {:else}
                <CaretRightIcon class="size-4" aria-hidden="true" />
            {/if}
        </button>
    </div>
    <ul dir={right ? 'rtl' : 'ltr'} class="grid grid-cols-[1ch_minmax(0,1fr)_auto_auto] gap-x-2 gap-y-1.5 text-secondary tabular-nums">
        {#each stats.distribution as { result, count, share } (result)}
            <li class="col-span-4 grid grid-cols-subgrid items-center">
                <span>{result}</span>
                <span class="flex h-2.5 bg-bg3" aria-hidden="true">
                    <span class="block h-full" style:width={`${share * 100}%`} style:background-color="var(--stats-color)"></span>
                </span>
                <span dir="ltr" class={right ? 'text-left' : 'text-right'}>{count}</span>
                <span dir="ltr" class="text-gray {right ? 'text-left' : 'text-right'}">{percentage.format(share)}</span>
            </li>
        {/each}
    </ul>
    <dl class="grid grid-cols-3 gap-2 border-t border-bg3 pt-3 text-center tabular-nums">
        <div>
            <dt class="text-meta text-gray">games played</dt>
            <dd class="text-body font-semibold">{stats.games}</dd>
        </div>
        <div>
            <dt class="text-meta text-gray">average result</dt>
            <dd class="text-body font-semibold">{stats.average === null ? '–' : average.format(stats.average)}</dd>
        </div>
        <div>
            <dt class="text-meta text-gray">failures (X)</dt>
            <dd class="text-body font-semibold">{stats.failures}</dd>
        </div>
    </dl>
</article>
