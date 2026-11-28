<script lang="ts">
    import { CaretDownIcon, GameControllerIcon, HeartIcon, TimerIcon } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import Body from '$lib/components/shared/Body.svelte';
    import GamesPageHeader from '$lib/components/games/GamesPageHeader.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import HiddenGameBoard from '$lib/components/games/HiddenGameBoard.svelte';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import DuelPlayerSelect from '$lib/components/games/DuelPlayerSelect.svelte';
    import PlayerResultEditor from '$lib/components/games/PlayerResultEditor.svelte';
    import PointsProgression from '$lib/components/games/PointsProgression.svelte';
    import GameStatsCard from '$lib/components/games/GameStatsCard.svelte';
    import { gameFilterHref, games, sharedGames } from '$lib/utils/games';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import { calendarDayColors, formatCalendarDate, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { ActionData, PageData } from './$types';

    type Matchup = NonNullable<PageData['matchup']>;
    const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });

    let { data, form }: { data: PageData; form: ActionData } = $props();
    const isaacMetrics = ['points', 'lives', 'time'] as const;
    const winRateFormat = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 });
    const statNumber = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
    let metricIndex = $state(0);
    let isaacMetric = $derived(isaacMetrics[metricIndex]);
    let expandedDays = $state<Record<string, boolean>>({});
    let expandedBoards = $state<Record<string, boolean>>({});
    const periods = ['daily', 'weekly', 'monthly', 'global'] as const;
    let period = $derived(data.period);
    let submitAction = $derived(data.matchup
        ? `?/submitResult&${matchupHref(data.matchup.date, period).slice(1)}&page=${data.matchup.pageNumber}`
        : '?/submitResult');

    function cycleMetric(direction: number) {
        metricIndex = (metricIndex + direction + isaacMetrics.length) % isaacMetrics.length;
    }

    function winRate(games: number, failures: number) {
        return games === 0 ? '–' : winRateFormat.format((games - failures) / games);
    }

    function averageLabel(value: number | null) {
        return value === null ? '–' : statNumber.format(value);
    }

    function averageTimeLabel(value: number | null) {
        if (value === null) return '–';
        const seconds = Math.round(value);
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    }

    function matchupHref(date: string, tab: typeof periods[number]) {
        const query = new URLSearchParams({ date });
        if (tab !== 'daily') query.set('tab', tab);
        if (data.game) query.set('game', data.game);
        if (data.matchup) {
            query.set('first', data.matchup.players[0].id);
            query.set('second', data.matchup.players[1].id);
        }
        return `?${query}`;
    }

    function pickPlayer(index: number, id: string) {
        const matchup = data.matchup;
        if (!matchup || !id || matchup.players[index].id === id) return;
        const query = new URLSearchParams(matchupHref(matchup.date, period).slice(1));
        query.set(index === 0 ? 'first' : 'second', id);
        const candidate = matchup.options.find(option => option.id === id);
        if (data.game && (!candidate || !sharedGames(candidate.preferredGames, matchup.players[1 - index].preferredGames).includes(data.game))) {
            query.delete('game');
        }
        void goto(`?${query}`, { noScroll: true, keepFocus: true });
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

{#snippet gameResults(matchup: Matchup['matchups'][number], players: Matchup['players'], day: string, compact = false)}
    {@const textSize = compact ? 'text-[0.625rem] leading-tight' : 'text-meta sm:text-secondary'}
    {@const id = day + '-' + matchup.game}
    {@const submission = form?.game === matchup.game && form.date === day ? form : null}
    {@const canSubmit = Boolean(data.matchup && day >= data.matchup.firstDate && day <= data.matchup.today)}
    {#if !matchup.available}
        <p role="status" class="subtitle">unable to load results for this game.</p>
    {:else}
        {@const expanded = expandedBoards[id] ?? Boolean(submission?.message)}
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
                {@const ownMissing = canSubmit && index === data.matchup?.submissionSlot && !result}
                <article aria-label={player.username || player.name}
                    class="surface-card flex min-w-0 items-stretch justify-between {compact ? 'min-h-6' : 'min-h-8'} {index === 1 ? 'flex-row-reverse border-r-4' : 'border-l-4'}"
                    style:border-color={color} style:color style:background-color={backgroundColor}>
                    <button type="button" class="flex w-6 shrink-0 cursor-pointer items-center sm:w-8 justify-center hover:bg-bg2/50 focus-visible:bg-bg2/50"
                        aria-label={`${expanded ? 'Hide' : 'Show'} ${games[matchup.game].name} boards`}
                        aria-expanded={expanded} aria-controls={'boards-' + id}
                        onclick={() => expandedBoards[id] = !expanded}>
                        <CaretDownIcon size={compact ? 12 : 16} class="motion-safe:transition-transform {expanded ? 'rotate-180' : ''}" aria-hidden="true" />
                    </button>
                    {#if ownMissing}
                        <button type="button" class="min-w-0 flex-1 cursor-pointer self-stretch px-2 font-semibold text-green hover:text-fg0 {textSize} {index === 1 ? 'text-left' : 'text-right'}"
                            aria-expanded={expanded} aria-controls={'boards-' + id} onclick={() => expandedBoards[id] = !expanded}>
                            + add result
                        </button>
                    {:else}
                        <p class="min-w-0 flex-1 self-center font-semibold {textSize} {index === 1 ? 'pl-2 text-left sm:pl-5' : 'pr-2 text-right sm:pr-5'} {tiedPoints ? 'sr-only sm:not-sr-only' : ''}">
                            {matchup.hidden ? 'hidden' : status ? resultLabels[status] : result ? 'pending' : 'no result yet'}
                        </p>
                    {/if}
                    <div class="flex shrink-0 gap-px font-bold tabular-nums sm:gap-0.5 {textSize} {index === 1 ? 'flex-row-reverse' : ''}">
                        {#if tiedLives}
                            <span class="flex min-w-7 items-center justify-center gap-0.5 px-1 leading-tight min-[360px]:px-2 min-[400px]:min-w-9 sm:min-w-18 sm:gap-1 lg:min-w-20"
                                style:background-color={backgroundColor}>
                                <TimerIcon class="size-3 shrink-0 {compact ? '' : 'sm:size-4'}" aria-hidden="true" />
                                <span><span class="sr-only">Time </span>{result.time}</span>
                            </span>
                        {/if}
                        {#if tiedPoints}
                            <span class="flex min-w-7 items-center justify-center gap-0.5 px-1 leading-tight min-[360px]:px-2 min-[400px]:min-w-9 sm:min-w-18 sm:gap-1 lg:min-w-20"
                                style:color={neutralLives ? 'var(--gray)' : color}
                                style:background-color={neutralLives ? tiedStatBackground : backgroundColor}>
                                <HeartIcon class="size-3 shrink-0 {compact ? '' : 'sm:size-4'}" aria-hidden="true" />
                                <span><span class="sr-only">Lives </span>{result.lives}/4</span>
                            </span>
                        {/if}
                        <span class="flex items-center justify-center px-0.5 {tiedLives ? 'min-w-7 min-[400px]:min-w-9 sm:w-16 md:w-20 lg:w-24' : 'min-w-12 sm:w-24 lg:w-28'}"
                            style:color={neutralPoints ? 'var(--gray)' : color}
                            style:background-color={neutralPoints ? tiedStatBackground : backgroundColor}>
                            {#if result?.points !== undefined}<span class="sr-only">Points </span>{/if}
                            {matchup.hidden ? (matchup.game === 'isaaconnect' ? '?/4' : '?/6') : result?.score ?? '–'}
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
                            {:else if canSubmit && index === data.matchup?.submissionSlot}
                                <PlayerResultEditor game={matchup.game} date={day} action={submitAction} message={submission?.message} />
                            {:else if matchup.hidden}
                                <HiddenGameBoard isaac={matchup.game === 'isaaconnect'} />
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

{#snippet individualGames(day: Matchup['days'][number], players: Matchup['players'], compact = false)}
    {#each day.matchups as matchup (matchup.game)}
        {#if !data.game}<h5 class="mt-2 text-meta text-gray">{games[matchup.game].name}</h5>{/if}
        {@render gameResults(matchup, players, day.date, compact)}
    {/each}
{/snippet}

{#snippet dayScoreboard(day: Matchup['days'][number], players: Matchup['players'])}
    {@const expanded = expandedDays[day.date] ?? Boolean(form?.message && form.date === day.date)}
    {@const score = day.matchups.every(matchup => matchup.available) ? day.score : null}
    {@const dateLabel = formatCalendarDate(day.date)}
    <button type="button" class="grid w-full cursor-pointer grid-cols-2 gap-2 hover:brightness-110"
        aria-label={`${expanded ? 'Hide' : 'Show'} games for ${dateLabel}${score ? `, score ${score.join(' to ')}` : ''}`}
        aria-expanded={expanded} aria-controls={'day-games-' + day.date}
        onclick={() => expandedDays[day.date] = !expanded}>
        {#each players as player, index (player.id)}
            {@const points = score?.[index] ?? 0}
            {@const opponent = score?.[1 - index] ?? 0}
            {@const { color, backgroundColor } = score ? scoreColor(points, opponent) : calendarDayColors('gray')}
            <span class="surface-card flex min-h-8 min-w-0 items-stretch gap-1
                {index === 1 ? 'flex-row-reverse border-r-4' : 'border-l-4'}"
                style:border-color={color} style:color style:background-color={backgroundColor}>
                <span class="flex w-6 shrink-0 items-center justify-center sm:w-8" aria-hidden="true">
                    <CaretDownIcon size={16} class="motion-safe:transition-transform {expanded ? 'rotate-180' : ''}" />
                </span>
                <span class="min-w-0 flex-1 self-center truncate text-meta font-semibold sm:text-secondary
                    {index === 1 ? 'pl-2 text-left sm:pl-5' : 'pr-2 text-right sm:pr-5'}">
                    {player.username || player.name}
                </span>
                <span class="flex min-w-12 items-center justify-center text-secondary font-bold tabular-nums sm:w-24 lg:w-28"
                    style:background-color={backgroundColor}>{score ? points : '–'}</span>
            </span>
        {/each}
    </button>
    <div id={'day-games-' + day.date} class="empty:hidden">
        {#if expanded}
            <div class="mx-2 flex min-w-0 flex-col gap-2 sm:mx-4"
                transition:slide={{ duration: 160 }}>
                {@render individualGames(day, players, true)}
            </div>
        {/if}
    </div>
{/snippet}

<Body>
    {@const gameTitle = data.game ? games[data.game].name : 'all games'}
    {@const duelQuery = data.matchup ? matchupHref(data.matchup.date, period) : ''}
    <GamesPageHeader title={gameTitle} icon={data.game ? gameIcons[data.game] : GameControllerIcon}
        items={[
            { label: 'games', href: '/games' },
            ...(data.game ? [{ label: 'duel', href: gameFilterHref('/games/duel', duelQuery) }, { label: gameTitle }] : [{ label: 'duel' }])
        ]}
        navigation={{ path: '/games/duel', game: data.game, query: duelQuery, availableGames: data.matchup?.commonGames ?? [] }} />
    {#if data.matchup}
        {@const { date, today, firstDate, players, options, matchups, days, pageNumber, pageCount, points: totalPoints, totalsHidden, periodHidden, wordleStats, isaacStats, progression, rangeStart, rangeEnd, calendar } = data.matchup}
        {@const [leftPoints, rightPoints] = totalPoints ?? [0, 0]}
        <section class="flex flex-col gap-4" aria-label="Game matchup">
            <nav class="tab-nav" aria-label="Scoreboard period">
                {#each periods as option (option)}
                    <a href={matchupHref(date, option)} class="tab-link" data-sveltekit-noscroll
                        aria-current={period === option ? 'page' : undefined}>{option}</a>
                {/each}
            </nav>
            {#if form?.warning}<p class="subtitle" role="status">{form.warning}</p>{/if}
            <div class="grid grid-cols-2 items-stretch gap-2">
                {#each players as player, index (player.id)}
                    {@const points = index === 0 ? leftPoints : rightPoints}
                    {@const { color, backgroundColor } = scoreColor(points, index === 0 ? rightPoints : leftPoints)}
                    <DuelPlayerSelect {player} options={options.filter(option => option.id !== players[1 - index].id && sharedGames(option.preferredGames, players[1 - index].preferredGames).length)}
                        points={totalPoints ? points : null} {color} {backgroundColor}
                        right={index === 1} selectPlayer={id => pickPlayer(index, id)} />
                {/each}
            </div>
            {#if totalsHidden}
                <p class="subtitle">submit your results to reveal the scores.</p>
            {:else if period !== 'daily' && !calendar}
                <p class="subtitle" role="status">unable to load days won.</p>
            {/if}
            <SectionSeparator class="my-0!" />
            <MonthPicker {date} {today} {firstDate} plainRange compact yearInRange lastDate={today} lastYear={Number(today.slice(0, 4))}
                id="game-results-months" label="Game results calendar"
                selection={period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'day'} dayHref={(day) => matchupHref(day, period)} {dayStatus}>
                {#if !calendar}
                    <p class="subtitle mb-3" role="status">unable to load daily winners.</p>
                {/if}
            </MonthPicker>
            <SectionSeparator class="my-0!" />
            {#if data.game && period !== 'daily'}
                <section class="flex flex-col gap-2" aria-labelledby="game-statistics">
                    <h3 class="plain-h3" id="game-statistics">stats</h3>
                    {#if wordleStats || isaacStats}
                        <div class="grid grid-cols-2 gap-2">
                            {#each players as player, index (player.id)}
                                {@const wordle = wordleStats?.[index]}
                                {@const isaac = isaacStats?.[index]}
                                {#if isaac}
                                    <GameStatsCard name={player.username || player.name} color={player.color}
                                        distribution={isaac.distribution[isaacMetric]} chart={{ label: isaacMetric, cycle: cycleMetric }}
                                        summary={[
                                            { label: 'games played', value: isaac.games },
                                            {
                                                label: 'average ' + isaacMetric,
                                                value: isaacMetric === 'time' ? averageTimeLabel(isaac.averageTime)
                                                    : averageLabel(isaacMetric === 'points' ? isaac.averagePoints : isaac.averageLives)
                                            },
                                            { label: 'win rate', value: winRate(isaac.games, isaac.failures) }
                                        ]}
                                        right={index === 1} />
                                {:else if wordle}
                                    <GameStatsCard name={player.username || player.name} color={player.color}
                                        distribution={wordle.distribution}
                                        summary={[
                                            { label: 'games played', value: wordle.games },
                                            { label: 'average result', value: averageLabel(wordle.average) },
                                            { label: 'win rate', value: winRate(wordle.games, wordle.failures) }
                                        ]}
                                        right={index === 1} />
                                {/if}
                            {/each}
                        </div>
                    {:else if periodHidden}
                        <p class="subtitle">stats are hidden until you submit your results.</p>
                    {:else}
                        <p class="subtitle" role="status">unable to load stats.</p>
                    {/if}
                </section>
            {/if}
            {#if progression}
                {#if data.game}
                    <SectionSeparator class="my-0!" />
                {/if}
                <PointsProgression points={progression} {players}
                    startLabel={formatCalendarDate(rangeStart)}
                    endLabel={formatCalendarDate(rangeEnd)} />
            {/if}
            {#if period === 'daily'}
                {#each matchups as matchup, index (matchup.game)}
                    <section class="flex flex-col gap-2 {index > 0 ? 'border-t border-bg3 pt-4' : ''}"
                        aria-labelledby={data.game ? undefined : 'matchup-' + matchup.game}
                        aria-label={data.game ? 'Daily game results' : undefined}>
                        {#if !data.game}
                            <h3 class="plain-h3" id={'matchup-' + matchup.game}>
                                <a class="inline-flex items-center gap-2 text-aqua hover:text-fg0" href={gameFilterHref('/games/duel', matchupHref(date, period), matchup.game)}>
                                    <FilledSectionIcon icon={gameIcons[matchup.game]} color="aqua" />
                                    {games[matchup.game].name}
                                </a>
                            </h3>
                        {/if}
                        {@render gameResults(matchup, players, date)}
                    </section>
                {/each}
            {:else}
                {#if data.game || progression}
                    <SectionSeparator class="my-0!" />
                {/if}
                <section id="period-results" class="flex flex-col gap-4" aria-labelledby="period-results-title">
                    <h3 class="plain-h3" id="period-results-title">games</h3>
                    {#each days as day, index (day.date)}
                        {#if index > 0}<SectionSeparator class="my-0!" />{/if}
                        <section class="flex flex-col gap-2" aria-labelledby={'results-' + day.date}>
                            <h4 class="text-secondary text-fg0" id={'results-' + day.date}>
                                <time datetime={day.date}>{weekdayFormat.format(new Date(day.date))} · {formatCalendarDate(day.date)}</time>
                            </h4>
                            {#if day.matchups.length === 0}
                                {#if day.date > today}
                                    <p class="surface-card subtitle border-l-4 border-aqua px-3 py-2">upcoming</p>
                                {:else}
                                    <p class="subtitle">no results</p>
                                {/if}
                            {:else if !data.game && (period === 'weekly' || period === 'monthly')}
                                {@render dayScoreboard(day, players)}
                            {:else}
                                {@render individualGames(day, players)}
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
                </section>
            {/if}
        </section>
    {:else}
        <p class="subtitle">A duel needs two players with a preferred game in common.</p>
    {/if}
</Body>
