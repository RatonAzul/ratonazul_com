<script lang="ts">
    import { CaretDownIcon, GameControllerIcon } from 'phosphor-svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import PlayerResultEditor from '$lib/components/games/PlayerResultEditor.svelte';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import { games } from '$lib/utils/games';
    import { calendarDayColors } from '$lib/utils/shared/calendar';
    import type { ActionData, PageData } from './$types';

    type Today = NonNullable<PageData['today']>;
    type Outcome = Today['matchups'][number]['outcome'];

    let { data, form }: { data: PageData; form: ActionData } = $props();

    function accent(outcome: Outcome, index: number) {
        if (!outcome || outcome === 'draw') return 'gray';
        return outcome === (index === 0 ? 'first' : 'second') ? 'green' : 'red';
    }
</script>

{#snippet scoreboard(players: Today['players'], scores: (string | number | null)[], outcome: Outcome, compact = false)}
    <div class="grid grid-cols-2 gap-2">
        {#each players as player, index (player.id)}
            {@const { color, backgroundColor } = calendarDayColors(accent(outcome, index))}
            <span class="surface-card flex min-w-0 items-stretch gap-1.5
                {index === 1 ? 'flex-row-reverse border-r-4 pr-1' : 'border-l-4 pl-1'}"
                style:border-color={color} style:color style:background-color={backgroundColor}>
                <UserAvatar image={player.image} showImage={player.showImage} color={player.color}
                    class={compact ? 'my-1 size-6' : 'my-1 size-8 sm:size-10'} />
                <span class="min-w-0 flex-1 self-center truncate font-semibold
                    {compact ? 'text-secondary' : 'text-body sm:text-section-title'}" class:text-right={index === 1}>
                    {player.username || player.name}
                </span>
                <span class="flex shrink-0 items-center justify-center font-bold tabular-nums
                    {compact ? 'w-10 text-secondary sm:w-14' : 'w-12 text-body sm:w-20 sm:text-card-title'}"
                    style:background-color={backgroundColor}>{scores[index] ?? '–'}</span>
            </span>
        {/each}
    </div>
{/snippet}

{#snippet gameHeading(game: Today['matchups'][number]['game'])}
    <h3 class="plain-h3 flex items-center gap-2 text-secondary">
        <FilledSectionIcon icon={gameIcons[game]} color="aqua" compact />
        {games[game].name}
    </h3>
{/snippet}

<Body>
    {@const today = data.today}
    {@const query = today ? new URLSearchParams({ date: today.date, first: today.players[0].id, second: today.players[1].id }) : null}
    {@const duelHref = query ? `/games/duel?${query}` : '/games/duel'}
    {@const resultsHref = `/games/results?date=${data.date}`}
    <CustomH1 class="flex items-center gap-2">
        <FilledSectionIcon icon={GameControllerIcon} color="blue" />
        games
    </CustomH1>

    <section class="flex flex-col gap-3" aria-label="Submit today’s game results">
        {#if form?.warning}<p class="form-feedback text-yellow" role="status">{form.warning}</p>{/if}
        {#if data.submissions}
            <div class="grid items-start gap-3 lg:grid-cols-3">
                {#each data.submissions as submission (submission.game)}
                    <div class="flex min-w-0 flex-col gap-1.5">
                        {@render gameHeading(submission.game)}
                        {#if !submission.available}
                            <p class="subtitle" role="status">unable to load your result.</p>
                        {:else if submission.result}
                            <details class="surface-card group border-l-4 border-blue">
                                <summary class="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-secondary text-blue hover:bg-bg2">
                                    <span>result saved</span>
                                    <span class="flex items-center gap-2 font-semibold tabular-nums">
                                        {submission.result.score}
                                        <CaretDownIcon class="size-4 motion-safe:transition-transform group-open:rotate-180" aria-hidden="true" />
                                    </span>
                                </summary>
                                <div class="p-3">
                                    <GameBoard rows={submission.result.rows} words={submission.result.words}
                                        isaac={submission.game === 'isaaconnect'} />
                                </div>
                            </details>
                        {:else}
                            {@const failed = form?.game === submission.game && form.date === data.date ? form.message : undefined}
                            <details class="surface-card group border-l-4 border-green" open={Boolean(failed)}>
                                <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-secondary text-green hover:bg-bg2">
                                    + add result
                                    <CaretDownIcon class="size-3.5 group-open:rotate-180" aria-hidden="true" />
                                </summary>
                                <div class="p-3">
                                    <PlayerResultEditor game={submission.game} date={data.date} action="?/submitResult" message={failed} />
                                </div>
                            </details>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <p class="subtitle">sign in to add your results.</p>
        {/if}
    </section>

    <SectionSeparator />
    <section class="flex flex-col gap-3" aria-labelledby="lobby-duel-title">
        <h2 id="lobby-duel-title"><a href={duelHref} class="hover:text-fg0">today’s duel</a></h2>
        {#if today}
            {@const { players, points, matchups, available } = today}
            {@const winner = !available || points[0] === points[1] ? null : points[0] > points[1] ? 'first' : 'second'}
            {@render scoreboard(players, available ? points : [null, null], winner)}
            <div class="mt-2 grid gap-3 lg:grid-cols-3">
                {#each matchups as matchup (matchup.game)}
                    <div class="flex min-w-0 flex-col gap-1">
                        {@render gameHeading(matchup.game)}
                        {@render scoreboard(players, matchup.scores, matchup.outcome, true)}
                    </div>
                {/each}
            </div>
        {:else}
            <p class="subtitle">A duel needs two registered players.</p>
        {/if}
        <a href={duelHref} class="internal-link self-center text-secondary">[open duel]</a>
    </section>

    <SectionSeparator />
    <section class="flex flex-col gap-3" aria-labelledby="lobby-results-title">
        <h2 id="lobby-results-title"><a href={resultsHref} class="hover:text-fg0">today’s results</a></h2>
        <div class="grid items-start gap-3 lg:grid-cols-3">
            {#each data.results as board (board.game)}
                <div class="flex min-w-0 flex-col gap-1">
                    {@render gameHeading(board.game)}
                    {#if !board.available}
                        <p class="subtitle">unable to load results.</p>
                    {:else if !board.rows.length}
                        <p class="subtitle">no results yet.</p>
                    {:else}
                        <ul class="flex flex-col gap-1" aria-label={`${games[board.game].name} standings preview`}>
                            {#each board.rows as row (row.id)}
                                <li class="grid min-h-9 grid-cols-[2ch_minmax(0,1fr)_auto] items-center gap-2 border-l-4 bg-bg2 px-2 text-secondary tabular-nums"
                                    style:border-left-color={`var(--${row.player.color})`}>
                                    <span><span class="sr-only">position </span>{row.position}</span>
                                    <span class="flex min-w-0 items-center gap-1.5">
                                        <UserAvatar image={row.player.image} showImage={row.player.showImage} color={row.player.color} class="size-6" />
                                        <span class="truncate" style:color={`var(--${row.player.color})`}>{row.player.username || row.player.name}</span>
                                    </span>
                                    <span class="font-semibold">{row.points}<span class="sr-only"> points</span></span>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            {/each}
        </div>
        <a href={resultsHref} class="internal-link self-center text-secondary">[open results]</a>
    </section>
</Body>
