<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import type { wordleStatistics } from '$lib/utils/game-result-summary';

    let { name, color, distribution, summary, chart, right = false }: {
        name: string;
        color: string | null;
        distribution: ReturnType<typeof wordleStatistics>['distribution'];
        summary: { label: string; value: string | number }[];
        chart?: { label: string; cycle: (direction: number) => void };
        right?: boolean;
    } = $props();

    let accent = $derived(isProfileColor(color) ? color : defaultProfileColor);
    const percentage = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 });
</script>

<article class="surface-card flex min-w-0 flex-col gap-1.5 px-1.5 py-1.5 sm:px-3 lg:gap-2 lg:px-4 lg:py-3 {right ? 'border-r-4' : 'border-l-4'}"
    style:--stats-color={`var(--${accent})`} style:border-color="var(--stats-color)">
    <div class="flex items-center gap-1 sm:gap-2 {right ? 'flex-row-reverse' : ''}">
        <h4 class="min-w-0 flex-1 truncate text-meta font-semibold sm:text-secondary lg:text-card-title" class:text-right={right} title={name} style:color="var(--stats-color)">{name}</h4>
        {#if chart}
            <div class="flex shrink-0 items-center text-[0.625rem] sm:text-meta" role="group" aria-label="Isaaconnect chart">
                <button type="button" class="action-icon h-6 w-5 bg-transparent text-gray hover:bg-transparent hover:text-fg0 sm:size-7" aria-label="Previous chart" onclick={() => chart.cycle(-1)}>
                    <CaretLeftIcon class="size-3" aria-hidden="true" />
                </button>
                <span class="w-9 text-center text-fg0 sm:w-11" aria-live="polite">{chart.label}</span>
                <button type="button" class="action-icon h-6 w-5 bg-transparent text-gray hover:bg-transparent hover:text-fg0 sm:size-7" aria-label="Next chart" onclick={() => chart.cycle(1)}>
                    <CaretRightIcon class="size-3" aria-hidden="true" />
                </button>
            </div>
        {/if}
    </div>
    <ul dir={right ? 'rtl' : 'ltr'} class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-1 gap-y-0.5 text-[0.625rem] leading-tight tabular-nums sm:gap-x-1.5 sm:text-meta lg:gap-x-2 lg:gap-y-1 lg:text-secondary">
        {#each distribution as { result, count, share } (result)}
            <li class="col-span-4 grid grid-cols-subgrid items-center">
                <span dir="ltr" class={right ? 'text-right' : 'text-left'}>{result}</span>
                <span class="flex h-2 bg-bg3 lg:h-3" aria-hidden="true">
                    <span class="block h-full" style:width={`${share * 100}%`} style:background-color="var(--stats-color)"></span>
                </span>
                <span dir="ltr" class={right ? 'text-left' : 'text-right'}>{count}</span>
                <span dir="ltr" class="text-gray {right ? 'text-left' : 'text-right'}">{percentage.format(share)}</span>
            </li>
        {/each}
    </ul>
    <dl class="grid grid-cols-3 gap-1 border-t border-bg3 pt-1.5 text-center tabular-nums lg:gap-2 lg:pt-2">
        {#each summary as { label, value } (label)}
            <div>
                <dt class="text-[0.625rem] leading-tight text-gray lg:text-meta">{label}</dt>
                <dd class="text-meta font-semibold lg:text-body">{value}</dd>
            </div>
        {/each}
    </dl>
</article>
