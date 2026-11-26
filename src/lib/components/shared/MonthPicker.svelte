<script lang="ts">
    import type { Snippet } from 'svelte';
    import { onMount, tick } from 'svelte';
    import CustomH2 from '$lib/components/shared/CustomH2.svelte';
    import ColoredSectionTitle from '$lib/components/shared/ColoredSectionTitle.svelte';
    import { calendarMonths, calendarWeekRange, emptyCalendarDayClass, formatCalendarDate } from '$lib/utils/shared/calendar';

    let {
        date, firstDate, lastDate, lastYear = 9999, id = 'calendar-months',
        label = 'Calendar date picker', children, dayHref = (day) => `?date=${day}`,
        yearHref, dayStatus, today, plainRange = false, selection = 'day'
    }: {
        date: string;
        firstDate: string;
        lastDate?: string;
        lastYear?: number;
        id?: string;
        label?: string;
        children?: Snippet;
        dayHref?: (day: string) => string;
        yearHref?: (year: number) => string;
        today: string;
        plainRange?: boolean;
        selection?: 'day' | 'week' | 'month';
        dayStatus?: (day: string) => { className: string; label: string; backgroundColor?: string; color?: string; hasComments?: boolean } | undefined;
    } = $props();
    const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let year = $derived(Number(date.slice(0, 4)));
    let firstYear = $derived(Number(firstDate.slice(0, 4)));
    let firstMonth = $derived(year === firstYear ? Number(firstDate.slice(5, 7)) - 1 : 0);
    let months = $derived(calendarMonths(year).slice(firstMonth));
    let selectedWeek = $derived(selection === 'week' ? calendarWeekRange(date) : null);
    let selectedMonth = $derived(Number(date.slice(5, 7)) - 1 - firstMonth);

    let viewport: HTMLDivElement;
    let visibleMonths = $state(1);
    let start = $state(0);
    let lastStart = $derived(Math.max(0, months.length - visibleMonths));
    let lastVisible = $derived(Math.min(start + visibleMonths - 1, months.length - 1));
    let range = $derived(start === lastVisible ? months[start]?.name : `${months[start]?.name} – ${months[lastVisible]?.name}`);

    function hrefForYear(target: number) {
        return yearHref?.(target) ?? dayHref(target === firstYear ? firstDate : `${target}-01-01`);
    }

    function monthWidth() {
        return (viewport.firstElementChild?.getBoundingClientRect().width ?? 0) +
            parseFloat(getComputedStyle(viewport).columnGap);
    }

    function moveTo(index: number, smooth = true) {
        const target = Math.max(0, Math.min(lastStart, index));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        viewport.scrollTo({ left: target * monthWidth(), behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
        if (!smooth || reduceMotion) start = target;
    }

    function trackScroll() {
        const width = monthWidth();
        if (width) start = Math.max(0, Math.min(lastStart, Math.round(viewport.scrollLeft / width)));
    }

    onMount(() => {
        const observer = new ResizeObserver(() => {
            const size = Number(getComputedStyle(viewport).getPropertyValue('--visible-months'));
            if (size !== visibleMonths) {
                visibleMonths = size;
                moveTo(start, false);
            }
        });
        observer.observe(viewport);
        return () => observer.disconnect();
    });

    $effect(() => {
        const index = selectedMonth;
        const selectedYear = year;
        void tick().then(() => {
            if (year !== selectedYear) return;
            const visibleStart = start;
            if (index < visibleStart || index >= visibleStart + visibleMonths) moveTo(index, false);
        });
    });
</script>

<section class="min-w-0" aria-label={label}>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <CustomH2>{year}</CustomH2>
        <nav class="flex flex-wrap gap-4 text-secondary" aria-label="Calendar years">
            {#if year > firstYear}
                <a class="internal-link" href={hrefForYear(year - 1)}>[← {year - 1}]</a>
            {/if}
            {#if year < lastYear}
                <a class="internal-link" href={hrefForYear(year + 1)}>[{year + 1} →]</a>
            {/if}
        </nav>
    </div>
    {@render children?.()}
    <div class="mb-3 flex gap-2">
        <div class="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
            {#if plainRange}
                <h3 class="plain-h3 flex h-full items-center">{range}</h3>
            {:else}
                <ColoredSectionTitle title={range ?? ''} class="h-full" />
            {/if}
        </div>
        <div class="flex gap-2">
            <button type="button" class="action-icon h-auto min-h-8 w-12" aria-label="Previous months" aria-controls={id}
                disabled={start === 0} onclick={() => moveTo(start - visibleMonths)}><span aria-hidden="true">←</span></button>
            <button type="button" class="action-icon h-auto min-h-8 w-12" aria-label="Next months" aria-controls={id}
                disabled={start >= lastStart} onclick={() => moveTo(start + visibleMonths)}><span aria-hidden="true">→</span></button>
        </div>
    </div>

    <div {id} class="months" bind:this={viewport} onscroll={trackScroll}>
        {#each months as month (month.dates[0])}
            {@const monthStart = month.dates[0]}
            {@const monthTarget = monthStart < firstDate ? firstDate : monthStart}
            {@const monthHref = selection === 'month' && (!lastDate || monthTarget <= lastDate) ? dayHref(monthTarget) : undefined}
            {@const monthSelected = selection === 'month' && monthStart.slice(0, 7) === date.slice(0, 7)}
            {@const weekIndex = selectedWeek
                ? month.dates.findIndex(day => day >= selectedWeek.start && day < selectedWeek.end)
                : -1}
            <svelte:element this={monthHref ? 'a' : 'div'} href={monthHref} data-sveltekit-noscroll
                class="group min-w-0 snap-start {selection === 'month' ? 'self-start' : ''}"
                role={monthHref ? undefined : 'group'}
                aria-current={monthSelected ? 'true' : undefined}
                aria-label={`${monthHref ? 'Select ' : ''}${month.name} ${year}`}>
                {#if selection === 'month'}
                    <p class="section-label mb-2 {monthSelected ? 'bg-fg0 text-bg0'
                        : monthHref ? 'bg-bg1 text-fg0 group-hover:bg-bg2' : 'bg-bg1 text-gray'}">{month.name}</p>
                {:else}
                    <p class="section-label mb-2 max-sm:hidden {monthStart.slice(0, 7) === today.slice(0, 7)
                        ? 'bg-purple text-bg0' : 'bg-bg1 text-fg0'}">{month.name}</p>
                {/if}
                <div class="surface-card relative grid grid-cols-7 gap-1 p-2 {monthSelected ? 'ring-2 ring-inset ring-fg0' : ''}">
                    {#if weekIndex >= 0}
                        <span class="pointer-events-none absolute inset-0 z-10 border-2 border-fg0"
                            style:grid-area={`${Math.floor((month.offset + weekIndex) / 7) + 2} / 1 / span 1 / -1`}
                            aria-hidden="true"></span>
                    {/if}
                    {#each weekdays as weekday}
                        <span class="pb-1 text-center text-meta text-gray" title={weekday} aria-hidden="true">{weekday.slice(0, 1)}</span>
                    {/each}
                    {#each Array(month.offset) as _}<span></span>{/each}
                    {#each month.dates as day}
                        {@const status = dayStatus?.(day)}
                        {@const surface = status?.className ?? 'bg-bg2 hover:bg-bg3'}
                        {@const dayLabel = `${weekdayFormat.format(new Date(day))} ${formatCalendarDate(day)}`}
                        {@const selected = selection === 'day' && day === date}
                        {@const inSelectedWeek = selectedWeek && day >= selectedWeek.start && day < selectedWeek.end}
                        {@const isToday = day === today}
                        {@const details = [isToday ? 'today' : '', inSelectedWeek ? 'selected week' : '', status?.label].filter(Boolean).join(', ')}
                        {@const selectable = !lastDate || day <= lastDate}
                        {@const linkDay = selectable && selection !== 'month'}
                        <svelte:element this={linkDay ? 'a' : 'span'} href={linkDay ? dayHref(day) : undefined} data-sveltekit-noscroll
                            class="relative flex aspect-square min-h-7 items-center justify-center text-meta tabular-nums
                                {selectable ? surface : emptyCalendarDayClass}
                                {selected ? 'ring-2 ring-inset ring-fg0 font-semibold' : isToday ? 'ring-2 ring-inset ring-purple' : ''}"
                            style:background-color={status?.backgroundColor}
                            style:color={status?.color}
                            aria-current={selected ? 'date' : undefined}
                            aria-label={details ? `${dayLabel}: ${details}` : dayLabel}
                            title={details || undefined}
                        >
                            {#if selected && isToday}
                                <span class="pointer-events-none absolute inset-0.5 border border-purple" aria-hidden="true"></span>
                            {/if}
                            <span class="flex flex-col items-center gap-0.5 leading-none">
                                {Number(day.slice(-2))}
                                {#if status?.hasComments}
                                    <span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
                                {/if}
                            </span>
                        </svelte:element>
                    {/each}
                </div>
            </svelte:element>
        {/each}
    </div>
</section>

<style>
    .months {
        --visible-months: 1;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 100%;
        gap: 1rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
    }
    .months::-webkit-scrollbar { display: none; }
    @media (min-width: 640px) {
        .months {
            --visible-months: 2;
            grid-auto-columns: calc((100% - 1rem) / 2);
        }
    }
    @media (min-width: 1024px) {
        .months {
            --visible-months: 4;
            grid-auto-columns: calc((100% - 3rem) / 4);
        }
    }
    @media (min-width: 1920px) {
        .months {
            --visible-months: 6;
            grid-auto-columns: calc((100% - 5rem) / 6);
        }
    }
</style>
