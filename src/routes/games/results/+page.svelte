<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import GamesPageHeader from '$lib/components/games/GamesPageHeader.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import { gameFilterHref, games } from '$lib/utils/games';
    import { calendarDayColors, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import RankingProgression from '$lib/components/games/RankingProgression.svelte';
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

        <section class="flex flex-col gap-3" aria-labelledby="results-rankings">
            <h2 id="results-rankings">rankings</h2>
            <GameRankings boards={data.boards} period={data.period} date={data.date} {query} />
        </section>

        {#if data.period !== 'daily' && data.boards.length}
            <SectionSeparator class="my-0!" />
            <section class="flex flex-col gap-3" aria-labelledby="results-progression">
                <h2 id="results-progression">points progression</h2>
                <div class="grid items-start gap-4 lg:grid-cols-(--game-columns)"
                    style:--game-columns={`repeat(${data.boards.length}, minmax(0, 1fr))`}>
                    {#each data.boards as board, index (board.game)}
                        {@const name = games[board.game].name}
                        {#if index > 0}<SectionSeparator class="my-0! lg:hidden" />{/if}
                        <section class="flex min-w-0 flex-col gap-2" aria-labelledby={'progression-' + board.game}>
                            <h3 class="plain-h3 flex items-center gap-2" id={'progression-' + board.game}>
                                <FilledSectionIcon icon={gameIcons[board.game]} color="aqua" compact />
                                {name}
                            </h3>
                            {#if !board.available}
                                <p class="subtitle">unable to load results.</p>
                            {:else if !board.rows.length}
                                <p class="subtitle">no results in this period.</p>
                            {:else if board.rows.some(row => row.attempts.some(attempt => attempt.board === null))}
                                <p class="subtitle">submit your results to reveal points progression.</p>
                            {:else}
                                <RankingProgression rows={board.rows} start={data.rangeStart} end={data.rangeEnd}
                                    label={`${name} cumulative points`} />
                            {/if}
                        </section>
                    {/each}
                </div>
            </section>
        {/if}
    </div>
</Body>
