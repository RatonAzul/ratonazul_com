<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import type { wordleStatistics } from '$lib/utils/game-result-summary';

    let { name, color, distribution, summary, chart, right = false, switchPlayer }: {
        name: string;
        color: string | null;
        distribution: ReturnType<typeof wordleStatistics>['distribution'];
        summary: { label: string; value: string | number }[];
        chart?: { label: string; cycle: (direction: number) => void };
        right?: boolean;
        switchPlayer: () => void;
    } = $props();

    let accent = $derived(isProfileColor(color) ? color : defaultProfileColor);
    const percentage = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 1 });
</script>

<article class="surface-card flex min-w-0 flex-col gap-1.5 px-2 py-1.5 sm:px-3 {right ? 'border-r-4' : 'border-l-4'}"
    style:--stats-color={`var(--${accent})`} style:border-color="var(--stats-color)">
    <div class="flex items-center gap-1.5 {right ? 'flex-row-reverse' : ''}">
        <h4 class="min-w-0 flex-1 truncate text-secondary font-semibold" class:text-right={right} title={name} style:color="var(--stats-color)">{name}</h4>
        {#if chart}
            <div class="flex shrink-0 items-center text-meta" role="group" aria-label="Isaaconnect chart">
                <button type="button" class="action-icon size-7 bg-transparent text-gray hover:bg-transparent hover:text-fg0" aria-label="Previous chart" onclick={() => chart.cycle(-1)}>
                    <CaretLeftIcon class="size-3" aria-hidden="true" />
                </button>
                <span class="w-11 text-center text-fg0" aria-live="polite">{chart.label}</span>
                <button type="button" class="action-icon size-7 bg-transparent text-gray hover:bg-transparent hover:text-fg0" aria-label="Next chart" onclick={() => chart.cycle(1)}>
                    <CaretRightIcon class="size-3" aria-hidden="true" />
                </button>
            </div>
        {/if}
        <button type="button" class="action-icon size-7 bg-transparent text-gray hover:bg-transparent hover:text-fg0 sm:hidden" data-switch-player aria-label={right ? 'Previous player stats' : 'Next player stats'}
            onclick={switchPlayer}>
            {#if right}
                <CaretLeftIcon class="size-3" aria-hidden="true" />
            {:else}
                <CaretRightIcon class="size-3" aria-hidden="true" />
            {/if}
        </button>
    </div>
    <ul dir={right ? 'rtl' : 'ltr'} class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-1.5 gap-y-0.5 text-meta tabular-nums">
        {#each distribution as { result, count, share } (result)}
            <li class="col-span-4 grid grid-cols-subgrid items-center">
                <span dir="ltr" class={right ? 'text-right' : 'text-left'}>{result}</span>
                <span class="flex h-2 bg-bg3" aria-hidden="true">
                    <span class="block h-full" style:width={`${share * 100}%`} style:background-color="var(--stats-color)"></span>
                </span>
                <span dir="ltr" class={right ? 'text-left' : 'text-right'}>{count}</span>
                <span dir="ltr" class="text-gray {right ? 'text-left' : 'text-right'}">{percentage.format(share)}</span>
            </li>
        {/each}
    </ul>
    <dl class="grid grid-cols-3 gap-1 border-t border-bg3 pt-1.5 text-center tabular-nums {summary.length > 3 ? 'xl:grid-cols-5' : ''}">
        {#each summary as { label, value } (label)}
            <div>
                <dt class="text-[0.625rem] leading-tight text-gray">{label}</dt>
                <dd class="text-meta font-semibold">{value}</dd>
            </div>
        {/each}
    </dl>
</article>
