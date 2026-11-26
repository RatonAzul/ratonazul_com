<script lang="ts">
    import { CaretDownIcon, HeartIcon, TimerIcon } from 'phosphor-svelte';
    import { slide } from 'svelte/transition';
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import WordleStats from '$lib/components/games/WordleStats.svelte';
    import { games, type Game } from '$lib/utils/games';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import { calendarDayColors, formatCalendarDate, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

    type Matchup = NonNullable<PageData['matchup']>;
    const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });

    let { data }: { data: PageData } = $props();
    let statsViewport = $state<HTMLDivElement>();
    let expandedBoards = $state<Record<string, boolean>>({});
    const gameIds = Object.keys(games) as Game[];
    const periods = ['daily', 'weekly', 'monthly', 'global'] as const;
    let period = $derived(data.period);

    function showPlayerStats(index: number) {
        if (!statsViewport) return;
        statsViewport.children[index]?.querySelector('button')?.focus({ preventScroll: true });
        statsViewport.scrollTo({ left: index * statsViewport.clientWidth });
    }

    function matchupHref(date: string, tab: typeof periods[number]) {
        return `?date=${date}${tab === 'daily' ? '' : `&tab=${tab}`}`;
    }

    const tiedStatBackground = 'color-mix(in srgb, var(--gray) 25%, var(--bg0))';
    const resultAccents = { winner: 'green', lost: 'red', draw: 'gray' };
    const resultLabels = { winner: 'wins', lost: 'loses', draw: 'draws' };

    function dayStatus(day: string) {
        const matchup = data.matchup;
        const outcome = matchup?.calendar?.[day];
        if (!matchup || !outcome) return { className: interactiveEmptyCalendarDayClass, label: '' };
        const winner = outcome === 'draw' ? null : matchup.players[outcome === 'first' ? 0 : 1];
        const color = isProfileColor(winner?.color) ? winner.color : defaultProfileColor;
        return {
            className: 'font-semibold hover:brightness-110',
            label: winner ? `${winner.username || winner.name} won` : 'draw',
            ...calendarDayColors(color)
        };
    }

    function scoreColor(points: number, opponentPoints: number) {
        return calendarDayColors(points === opponentPoints ? 'gray' : points > opponentPoints ? 'green' : 'red');
    }

    function playerStatus(outcome: 'first' | 'second' | 'draw' | 'bothLost' | null, index: number) {
        if (!outcome) return null;
        if (outcome === 'draw') return 'draw';
        return (outcome === 'first' && index === 0) || (outcome === 'second' && index === 1) ? 'winner' : 'lost';
    }
</script>

{#snippet gameResults(matchup: Matchup['matchups'][number], players: Matchup['players'], id: string)}
    {#if !matchup.available}
        <p role="status" class="subtitle">unable to load results for this game.</p>
    {:else}
        {@const expanded = expandedBoards[id] ?? false}
        <div class="grid grid-cols-2 gap-2">
            {#each players as player, index (player.id)}
                {@const result = matchup.results[index]}
                {@const status = playerStatus(matchup.outcome, index)}
                {@const opponent = matchup.results[1 - index]}
                {@const tiedPoints = result?.points !== undefined && result.points === opponent?.points}
                {@const tiedLives = tiedPoints && result.lives === opponent?.lives}
                {@const neutralPoints = tiedPoints && matchup.outcome !== 'bothLost'}
                {@const neutralLives = tiedLives && matchup.outcome !== 'bothLost'}
                {@const { color, backgroundColor } = calendarDayColors(status ? resultAccents[status] : 'gray')}
                <article aria-label={player.username || player.name}
                    class="surface-card flex min-h-8 min-w-0 items-stretch justify-between {index === 1 ? 'flex-row-reverse border-r-4' : 'border-l-4'}"
                    style:border-color={color} style:color style:background-color={backgroundColor}>
                    <button type="button" class="flex w-6 shrink-0 cursor-pointer items-center sm:w-8 justify-center hover:bg-bg2/50 focus-visible:bg-bg2/50"
                        aria-label={`${expanded ? 'Hide' : 'Show'} ${games[matchup.game].name} boards`}
                        aria-expanded={expanded} aria-controls={'boards-' + id}
                        onclick={() => expandedBoards[id] = !expanded}>
                        <CaretDownIcon size={16} class="motion-safe:transition-transform {expanded ? 'rotate-180' : ''}" aria-hidden="true" />
                    </button>
                    <p class="min-w-0 flex-1 self-center text-meta font-semibold sm:text-secondary {index === 1 ? 'pl-2 text-left sm:pl-5' : 'pr-2 text-right sm:pr-5'} {tiedPoints ? 'sr-only sm:not-sr-only' : ''}">
                        {status ? resultLabels[status] : result ? 'pending' : 'no result yet'}
                    </p>
                    <div class="flex shrink-0 gap-px text-meta font-bold tabular-nums sm:gap-0.5 sm:text-secondary {index === 1 ? 'flex-row-reverse' : ''}">
                        {#if tiedLives}
                            <span class="flex min-w-7 items-center justify-center gap-0.5 px-1 leading-tight min-[360px]:px-2 min-[400px]:min-w-9 sm:min-w-18 sm:gap-1 lg:min-w-20"
                                style:background-color={backgroundColor}>
                                <TimerIcon class="size-3 shrink-0 sm:size-4" aria-hidden="true" />
                                <span><span class="sr-only">Time </span>{result.time}</span>
                            </span>
                        {/if}
                        {#if tiedPoints}
                            <span class="flex min-w-7 items-center justify-center gap-0.5 px-1 leading-tight min-[360px]:px-2 min-[400px]:min-w-9 sm:min-w-18 sm:gap-1 lg:min-w-20"
                                style:color={neutralLives ? 'var(--gray)' : color}
                                style:background-color={neutralLives ? tiedStatBackground : backgroundColor}>
                                <HeartIcon class="size-3 shrink-0 sm:size-4" aria-hidden="true" />
                                <span><span class="sr-only">Lives </span>{result.lives}/4</span>
                            </span>
                        {/if}
                        <span class="flex items-center justify-center px-0.5 {tiedLives ? 'min-w-7 min-[400px]:min-w-9 sm:w-16 md:w-20 lg:w-24' : 'min-w-12 sm:w-24 lg:w-28'}"
                            style:color={neutralPoints ? 'var(--gray)' : color}
                            style:background-color={neutralPoints ? tiedStatBackground : backgroundColor}>
                            {#if result?.points !== undefined}<span class="sr-only">Points </span>{/if}
                            {result?.score ?? '–'}
                        </span>
                    </div>
                </article>
            {/each}
        </div>
        <div id={'boards-' + id} class="empty:hidden">
            {#if expanded}
                <div class="grid grid-cols-2 gap-2" transition:slide={{ duration: 160 }}>
                    {#each players as player, index (player.id)}
                        {@const result = matchup.results[index]}
                        <div role="group" aria-label={player.username || player.name}
                            class="surface-card flex min-w-0 flex-col items-center p-3 {index === 1 ? 'border-r-4 sm:items-start' : 'border-l-4 sm:items-end'}"
                            style:border-color={'var(--' + player.color + ')'}>
                            {#if result?.rows}
                                <GameBoard rows={result.rows} words={result.words} isaac={matchup.game === 'isaaconnect'} compact />
                            {:else}
                                <p class="subtitle">no result yet.</p>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
{/snippet}

<Body>
    <CustomH1 class="mb-1!">{data.game ? games[data.game].name : 'games'}</CustomH1>
    <nav class="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-secondary" aria-label="Game pages">
        {#if data.game}
            <a class="internal-link" href={data.matchup ? '/games' + matchupHref(data.matchup.date, period) : '/games'}>[all]</a>
        {/if}
        {#each gameIds as game (game)}
            <a href={`/games/${game}${data.matchup ? matchupHref(data.matchup.date, period) : ''}`}
                class={data.game === game ? 'font-semibold text-fg0' : 'internal-link'}
                aria-current={data.game === game ? 'page' : undefined}>[{games[game].name}]</a>
        {/each}
    </nav>
    {#if data.matchup}
        {@const { date, today, firstDate, players, matchups, days, pageNumber, pageCount, totals, stats, calendar } = data.matchup}
        {@const [leftPoints, rightPoints] = totals[period]}
        <section class="flex flex-col gap-4" aria-label="Game matchup">
            <nav class="tab-nav" aria-label="Scoreboard period">
                {#each periods as option (option)}
                    <a href={matchupHref(date, option)} class="tab-link" data-sveltekit-noscroll
                        aria-current={period === option ? 'page' : undefined}>{option}</a>
                {/each}
            </nav>
            {#if period === 'daily' || calendar}
                <div class="grid grid-cols-2 items-stretch gap-2">
                    {#each players as player, index (player.id)}
                        {@const points = index === 0 ? leftPoints : rightPoints}
                        {@const { color, backgroundColor } = scoreColor(points, index === 0 ? rightPoints : leftPoints)}
                        <button type="button"
                            class="surface-card flex min-w-0 cursor-pointer items-center gap-3 hover:brightness-110 focus-visible:brightness-110 {index === 1 ? 'flex-row-reverse border-r-4 pr-1 sm:pr-2' : 'border-l-4 pl-1 sm:pl-2'}"
                            style:border-color={color} style:background-color={backgroundColor}>
                            <UserAvatar image={player.image} name={player.name} class="my-1 size-9 sm:size-12" />
                            <span class="min-w-0 flex-1 truncate text-body font-semibold sm:text-section-title {index === 1 ? 'text-right' : 'text-left'}"
                                style:color title={player.username || player.name}>
                                {player.username || player.name}
                            </span>
                            <span class="flex w-12 shrink-0 items-center justify-center self-stretch text-body font-bold tabular-nums sm:w-28 sm:text-card-title lg:w-36"
                                style:color style:background-color={backgroundColor}>{points}</span>
                        </button>
                    {/each}
                </div>
            {:else}
                <p class="subtitle" role="status">unable to load days won.</p>
            {/if}
            {#if data.game && data.game !== 'isaaconnect'}
                <SectionSeparator class="my-0!" />
                <section class="flex flex-col gap-2" aria-labelledby="wordle-statistics">
                    <h3 class="plain-h3" id="wordle-statistics">stats</h3>
                    {#if stats}
                        <div class="flex min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]
                            motion-safe:scroll-smooth sm:grid sm:grid-cols-2 sm:gap-2 sm:overflow-visible" bind:this={statsViewport}>
                            {#each players as player, index (player.id)}
                                <div class="grid w-full min-w-0 shrink-0 snap-start">
                                    <WordleStats name={player.username || player.name} color={player.color} stats={stats[index]}
                                        right={index === 1} switchPlayer={() => showPlayerStats(1 - index)} />
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="subtitle" role="status">unable to load stats.</p>
                    {/if}
                </section>
            {/if}
            {#if period === 'daily'}
                {#each matchups as matchup (matchup.game)}
                    <section class="flex flex-col gap-2 border-t border-bg3 pt-4"
                        aria-labelledby={data.game ? undefined : 'matchup-' + matchup.game}
                        aria-label={data.game ? 'Daily game results' : undefined}>
                        {#if !data.game}
                            <h3 class="plain-h3" id={'matchup-' + matchup.game}>
                                <a class="inline-flex items-center gap-2 text-aqua hover:text-fg0" href={`/games/${matchup.game}${matchupHref(date, period)}`}>
                                    <FilledSectionIcon icon={gameIcons[matchup.game]} color="aqua" />
                                    {games[matchup.game].name}
                                </a>
                            </h3>
                        {/if}
                        {@render gameResults(matchup, players, date + '-' + matchup.game)}
                    </section>
                {/each}
            {:else}
                <div id="period-results" class="flex flex-col gap-4">
                    {#each days as day (day.date)}
                        <section class="flex flex-col gap-2 border-t border-bg3 pt-4" aria-labelledby={'results-' + day.date}>
                            <h3 class="plain-h3" id={'results-' + day.date}>
                                <time datetime={day.date}>{weekdayFormat.format(new Date(day.date))} · {formatCalendarDate(day.date)}</time>
                            </h3>
                            {#if day.matchups.length === 0}
                                {#if day.date > today}
                                    <p class="surface-card subtitle border-l-4 border-aqua px-3 py-2">upcoming</p>
                                {:else}
                                    <p class="subtitle">no results</p>
                                {/if}
                            {:else}
                                {#each day.matchups as matchup (matchup.game)}
                                    {#if !data.game}<h4 class="mt-2 text-secondary text-gray">{games[matchup.game].name}</h4>{/if}
                                    {@render gameResults(matchup, players, day.date + '-' + matchup.game)}
                                {/each}
                            {/if}
                        </section>
                    {:else}
                        {#if period === 'global'}
                            <p class="subtitle">{calendar ? 'no recorded results' : 'unable to load results'}</p>
                        {/if}
                    {/each}
                    {#if pageCount > 1}
                        <nav class="flex flex-wrap items-center gap-4 text-secondary" aria-label="Result pages">
                            {#if pageNumber > 1}
                                <a class="internal-link" href={`${matchupHref(date, period)}&page=${pageNumber - 1}#period-results`}>[← previous]</a>
                            {/if}
                            <span class="text-gray">page {pageNumber} of {pageCount}</span>
                            {#if pageNumber < pageCount}
                                <a class="internal-link" href={`${matchupHref(date, period)}&page=${pageNumber + 1}#period-results`}>[next →]</a>
                            {/if}
                        </nav>
                    {/if}
                </div>
            {/if}
        </section>
        <SectionSeparator />
        <MonthPicker {date} {today} {firstDate} plainRange lastDate={today} lastYear={Number(today.slice(0, 4))}
            id="game-results-months" label="Game results calendar"
            selection={period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'day'} dayHref={(day) => matchupHref(day, period)} {dayStatus}>
            {#if !calendar}
                <p class="subtitle mb-3" role="status">unable to load daily winners.</p>
            {/if}
        </MonthPicker>
    {/if}
</Body>
