<script lang="ts">
    import { GameControllerIcon, ListNumbersIcon } from 'phosphor-svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import CustomH2 from '$lib/components/shared/CustomH2.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import { gameFilterHref, games } from '$lib/utils/games';
    import { calendarDayColors } from '$lib/utils/shared/calendar';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function accent(outcome: 'first' | 'second' | 'draw' | 'bothLost' | null, index: number) {
        if (!outcome || outcome === 'draw') return 'gray';
        return outcome === (index === 0 ? 'first' : 'second') ? 'green' : 'red';
    }
</script>

<Body>
    <CustomH1 class="flex items-center gap-2">
        <FilledSectionIcon icon={GameControllerIcon} color="blue" />
        games
    </CustomH1>

    <section class="flex flex-col gap-3" aria-labelledby="today-duel">
        <CustomH2 headingClass="mb-0"><span id="today-duel">today’s duel</span></CustomH2>
        {#if data.today}
            {@const { date, players, points, matchups, available } = data.today}
            {@const query = new URLSearchParams({ date, first: players[0].id, second: players[1].id })}
            {@const winner = !available || points[0] === points[1] ? null : points[0] > points[1] ? 'first' : 'second'}
            <a href={`/games/duel?${query}`} class="grid grid-cols-2 gap-2 hover:brightness-110"
                aria-label="Open today’s duel">
                {#each players as player, index (player.id)}
                    {@const { color, backgroundColor } = calendarDayColors(accent(winner, index))}
                    <span class="surface-card flex min-w-0 items-stretch gap-2
                        {index === 1 ? 'flex-row-reverse border-r-4 pr-1 sm:pr-2' : 'border-l-4 pl-1 sm:pl-2'}"
                        style:border-color={color} style:color style:background-color={backgroundColor}>
                        <UserAvatar image={player.image} showImage={player.showImage} color={player.color} class="my-1 size-8 sm:size-12" />
                        <span class="min-w-0 flex-1 self-center truncate text-body font-semibold sm:text-section-title"
                            class:text-right={index === 1}>{player.username || player.name}</span>
                        <span class="flex w-10 shrink-0 items-center justify-center font-bold tabular-nums sm:w-24 sm:text-card-title lg:w-32"
                            style:background-color={backgroundColor}>{available ? points[index] : '–'}</span>
                    </span>
                {/each}
            </a>
            {#each matchups as matchup (matchup.game)}
                <a href={gameFilterHref('/games/duel', query, matchup.game)} class="group flex flex-col gap-1.5"
                    aria-label={`Open today’s ${games[matchup.game].name} duel`}>
                    <h3 class="plain-h3 group-hover:text-fg0">
                        {games[matchup.game].name}
                    </h3>
                    <span class="grid grid-cols-2 gap-2 group-hover:brightness-110">
                        {#each players as player, index (player.id)}
                            {@const { color, backgroundColor } = calendarDayColors(accent(matchup.outcome, index))}
                            <span class="surface-card flex min-h-7 min-w-0 items-stretch
                                {index === 1 ? 'flex-row-reverse border-r-4' : 'border-l-4'}"
                                style:border-color={color} style:color style:background-color={backgroundColor}>
                                <span class="min-w-0 flex-1 self-center truncate px-2 text-meta" class:text-right={index === 0}>
                                    {player.username || player.name}
                                </span>
                                <span class="flex w-12 shrink-0 items-center justify-center text-meta font-bold tabular-nums sm:w-20"
                                    style:background-color={backgroundColor}>{matchup.scores[index] ?? '–'}</span>
                            </span>
                        {/each}
                    </span>
                </a>
            {/each}
        {:else}
            <p class="subtitle">A duel needs two registered players.</p>
            <a class="internal-link self-start" href="/games/duel">[duel]</a>
        {/if}
    </section>

    <SectionSeparator />
    <a href="/games/results" class="card-link border-green">
        <h2 class="flex items-center gap-2 text-card-title">
            <FilledSectionIcon icon={ListNumbersIcon} color="green" />
            results
        </h2>
        <p class="subtitle">daily results</p>
    </a>
</Body>
