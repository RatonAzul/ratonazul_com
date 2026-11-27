<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import GamesPageHeader from '$lib/components/games/GamesPageHeader.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import { gameFilterHref, games } from '$lib/utils/games';
    import { calendarDayColors, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

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
        navigation={{ path: '/games/results', game: data.game, query }} />

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

        <div class="grid items-start gap-4 {data.game ? '' : 'lg:grid-cols-3'}">
            {#each data.boards as board, index (board.game)}
                {#if index > 0}<SectionSeparator class="my-0! lg:hidden" />{/if}
                <section class="flex min-w-0 flex-col gap-2" aria-labelledby={'ranking-' + board.game}>
                    <h3 class="plain-h3 flex items-center gap-2" id={'ranking-' + board.game}>
                        <FilledSectionIcon icon={gameIcons[board.game]} color="aqua" compact />
                        {games[board.game].name}
                    </h3>
                    {#if !board.available}
                        <p class="subtitle" role="status">unable to load results.</p>
                    {:else if board.rows.length === 0}
                        <p class="subtitle">no results in this period.</p>
                    {:else}
                        <div class="grid grid-cols-[2.5rem_minmax(0,1fr)_3.5rem] gap-2 px-3 text-meta text-gray"
                            aria-hidden="true">
                            <span>#</span><span>player</span><span class="text-right">points</span>
                        </div>
                        <ul class="flex flex-col gap-2" aria-label={`${games[board.game].name} standings`}>
                            {#each board.rows as row (row.id)}
                                <li class="surface-card grid grid-cols-[2.5rem_minmax(0,1fr)_3.5rem] items-center gap-2 border-l-4
                                    py-2 pr-3 pl-2 text-secondary tabular-nums" style:border-left-color={`var(--${row.player.color})`}>
                                    <span><span class="sr-only">position </span>{row.position}</span>
                                    <a href={'/games/profile/' + encodeURIComponent(row.id)}
                                        class="flex min-w-0 items-center gap-2 hover:brightness-110">
                                        <UserAvatar image={row.player.image} showImage={row.player.showImage} color={row.player.color} class="size-6" />
                                        <span class="truncate" style:color={`var(--${row.player.color})`}>{row.player.username || row.player.name}</span>
                                    </a>
                                    <span class="text-right font-semibold">{row.points}<span class="sr-only"> points</span></span>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </section>
            {/each}
        </div>
    </div>
</Body>
