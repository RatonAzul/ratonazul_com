<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { calendarMonths } from '$lib/utils/games';
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    let { year, currentYear, counts, date, today }: { year: number; currentYear: number; counts: Record<string, number>; date: string; today: string } = $props();
    let viewport = $state<HTMLDivElement>();
    let visibleMonths = $state(1);
    let start = $state(0);
    let months = $derived(calendarMonths(year));
    let range = $derived(visibleMonths === 1 ? months[start].name : `${months[start].name} – ${months[Math.min(start + visibleMonths - 1, 11)].name}`);

    function monthWidth() {
        if (!viewport?.firstElementChild) return 0;
        return viewport.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).columnGap);
    }
    function moveTo(index: number, smooth = true) {
        if (!viewport) return;
        const target = Math.max(0, Math.min(12 - visibleMonths, index));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        viewport.scrollTo({ left: target * monthWidth(), behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
        start = target;
    }
    function trackScroll() {
        const width = monthWidth();
        if (viewport && width) start = Math.max(0, Math.min(12 - visibleMonths, Math.round(viewport.scrollLeft / width)));
    }
    onMount(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const tablet = window.matchMedia('(min-width: 640px)');
        const resize = () => { visibleMonths = desktop.matches ? 6 : tablet.matches ? 3 : 1; };
        resize();
        desktop.addEventListener('change', resize);
        tablet.addEventListener('change', resize);
        return () => {
            desktop.removeEventListener('change', resize);
            tablet.removeEventListener('change', resize);
        };
    });
    $effect(() => {
        const selectedMonth = Number(date.slice(5, 7)) - 1;
        const size = visibleMonths;
        const node = viewport;
        year;
        if (node) void tick().then(() => moveTo(Math.floor(selectedMonth / size) * size, false));
    });
</script>

<section class="min-w-0" aria-label="Daily results calendar">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-1">
        <div>
            <CustomH2>{year}</CustomH2>
        </div>
        <nav class="flex items-center gap-4 text-secondary" aria-label="Calendar years">
            {#if year > 2026}<a class="internal-link" href={`?year=${year - 1}`}>[← {year - 1}]</a>{/if}
            {#if year < currentYear}<a class="internal-link" href={`?year=${year + 1}`}>[{year + 1} →]</a>{/if}
        </nav>
    </div>
    <div class="flex flex-wrap gap-x-5 gap-y-2 text-meta text-gray mb-6">
        <span class="flex items-center gap-2"><span class="size-3 bg-red" aria-hidden="true"></span>0 players</span>
        <span class="flex items-center gap-2"><span class="size-3 bg-blue" aria-hidden="true"></span>1 player</span>
        <span class="flex items-center gap-2"><span class="size-3 bg-green" aria-hidden="true"></span>2+ players</span>
        <span>distinct players · select a day to manage results</span>
    </div>
    <div class="flex items-center justify-between gap-4 mb-3">
        <p class="text-secondary text-fg0" aria-live="polite" aria-atomic="true">{range}</p>
        <div class="flex gap-2">
            <button type="button" onclick={() => moveTo(start - visibleMonths)} disabled={start === 0} aria-label={visibleMonths === 1 ? 'Previous month' : `Previous ${visibleMonths} months`} aria-controls="game-calendar-months" class="action-icon"><span aria-hidden="true">←</span></button>
            <button type="button" onclick={() => moveTo(start + visibleMonths)} disabled={start >= 12 - visibleMonths} aria-label={visibleMonths === 1 ? 'Next month' : `Next ${visibleMonths} months`} aria-controls="game-calendar-months" class="action-icon"><span aria-hidden="true">→</span></button>
        </div>
    </div>
    <div id="game-calendar-months" class="months" bind:this={viewport} onscroll={trackScroll}>
        {#each months as month, index}
            {@const isCurrentMonth = year === Number(today.slice(0, 4)) && index === Number(today.slice(5, 7)) - 1}
            <div class="min-w-0 flex flex-col gap-2 snap-start" role="group" aria-label={`${month.name} ${year}`}>
                <h3 class="section-label {isCurrentMonth ? 'bg-green text-bg0' : 'bg-bg1 text-fg1'}">{month.name}</h3>
                <div class="surface-card p-2 grid grid-cols-7 gap-1">
                    {#each ['m', 't', 'w', 't', 'f', 's', 's'] as weekday}<span class="text-center text-meta text-gray pb-1" aria-hidden="true">{weekday}</span>{/each}
                    {#each Array(month.offset) as _}<span></span>{/each}
                    {#each month.dates as day}
                        {@const count = counts[day] ?? 0}
                        <a
                            href={`?year=${year}&date=${day}`}
                            class="aspect-square min-h-6 flex items-center justify-center text-meta tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg0 {day === date ? 'ring-2 ring-purple ring-offset-2 ring-offset-bg1' : ''} {day > today ? 'bg-bg2 text-gray' : count >= 2 ? 'bg-green/25 text-green hover:bg-green/40' : count === 1 ? 'bg-blue/25 text-blue hover:bg-blue/40' : 'bg-red/15 text-red hover:bg-red/30'}"
                            aria-label={`${day}: ${count} ${count === 1 ? 'player' : 'players'}${day > today ? ', future date' : ''}`}
                            aria-current={day === date ? 'date' : undefined}
                            title={`${day}: ${count} players`}
                        >{Number(day.slice(-2))}</a>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</section>

<style>
    .months {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 100%;
        gap: 1rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-padding: 0;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
    }
    .months::-webkit-scrollbar { display: none; }
    @media (min-width: 640px) {
        .months { grid-auto-columns: calc((100% - 2rem) / 3); }
    }
    @media (min-width: 1024px) {
        .months { grid-auto-columns: calc((100% - 5rem) / 6); }
    }
</style>
