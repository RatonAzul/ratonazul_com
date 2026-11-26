<script lang="ts">
    import { CaretDownIcon, HeartIcon, TimerIcon } from 'phosphor-svelte';
    import { slide } from 'svelte/transition';
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import { page } from '$app/state';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import { games } from '$lib/utils/games';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import { calendarDayColors, interactiveEmptyCalendarDayClass } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let expandedBoards = $state<Record<string, boolean>>({});
    const periods = ['daily', 'weekly', 'monthly', 'global'] as const;
    let period = $derived(periods.find(option => option === page.url.searchParams.get('tab')) ?? 'daily');

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

<Body>
    <CustomH1>games</CustomH1>
    {#if data.matchup}
        {@const { date, today, firstDate, players, matchups, totals, calendar } = data.matchup}
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
            {#if period === 'daily'}
                {#each matchups as matchup (matchup.game)}
                    <section class="flex flex-col gap-2 border-t border-bg3 pt-4" aria-labelledby={'matchup-' + matchup.game}>
                        <h3 class="plain-h3 flex items-center gap-2" id={'matchup-' + matchup.game}>
                            <FilledSectionIcon icon={gameIcons[matchup.game]} color="aqua" />
                            {games[matchup.game].name}
                        </h3>
                        {#if !matchup.available}
                            <p role="status" class="subtitle">unable to load results for this game.</p>
                        {:else}
                            {@const expanded = expandedBoards[matchup.game] ?? false}
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
                                            aria-expanded={expanded} aria-controls={'boards-' + matchup.game}
                                            onclick={() => expandedBoards[matchup.game] = !expanded}>
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
                            <div id={'boards-' + matchup.game} class="empty:hidden">
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
                    </section>
                {/each}
            {/if}
        </section>
        <div class="mt-4">
            <MonthPicker {date} {today} {firstDate} plainRange lastDate={today} lastYear={Number(today.slice(0, 4))}
                id="game-results-months" label="Game results calendar"
                selection={period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'day'} dayHref={(day) => matchupHref(day, period)} {dayStatus}>
                {#if !calendar}
                    <p class="subtitle mb-3" role="status">unable to load daily winners.</p>
                {/if}
            </MonthPicker>
        </div>
    {/if}
</Body>
