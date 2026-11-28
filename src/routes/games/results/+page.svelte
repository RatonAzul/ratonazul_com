<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import GamesPageHeader from '$lib/components/games/GamesPageHeader.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import { gameFilterHref, games } from '$lib/utils/games';
    import { calendarDayColors, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

    import GameRankings from '$lib/components/games/GameRankings.svelte';

    let { data }: { data: PageData } = $props();
    const periods = ['daily', 'weekly', 'monthly', 'global'] as const;

    function resultsHref(date: string, period: (typeof periods)[number]) {
        const query = new URLSearchParams({ date });
        if (period !== 'daily') query.set('tab', period);
        if (data.game) query.set('game', data.game);
        return `?${query}`;
    }

    function dayStatus(day: string) {
        const count = data.calendar[day];
        return count
            ? { className: 'font-semibold hover:brightness-110', label: `${count} ${count === 1 ? 'game' : 'games'} recorded`, ...calendarDayColors('aqua') }
            : { className: interactiveEmptyCalendarDayClass, label: '' };
    }
</script>

<Body>
    {@const query = resultsHref(data.date, data.period)}
    <GamesPageHeader title="results"
        items={[
            { label: 'games', href: '/games' },
            ...(data.game ? [{ label: 'results', href: gameFilterHref('/games/results', query) }, { label: games[data.game].name }] : [{ label: 'results' }])
        ]}
        navigation={{ path: '/games/results', game: data.game, query, availableGames: data.availableGames }} />

    <div class="flex flex-col gap-4">
        <nav class="tab-nav" aria-label="Results period">
            {#each periods as option (option)}
                <a class="tab-link" href={resultsHref(data.date, option)} data-sveltekit-noscroll
                    aria-current={data.period === option ? 'page' : undefined}>{option}</a>
            {/each}
        </nav>
        <MonthPicker date={data.date} firstDate={data.firstDate} today={data.today} lastDate={data.today}
            lastYear={Number(data.today.slice(0, 4))} id="standings-calendar" label="Results calendar"
            compact yearInRange plainRange dayHref={day => resultsHref(day, data.period)}
            selection={data.period === 'weekly' ? 'week' : data.period === 'monthly' ? 'month' : 'day'} {dayStatus} />
        <SectionSeparator class="my-0!" />

        <GameRankings boards={data.boards} period={data.period} date={data.date} {query} />
    </div>
</Body>
