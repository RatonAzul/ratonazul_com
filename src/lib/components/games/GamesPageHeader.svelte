<script lang="ts">
    import { GameControllerIcon } from 'phosphor-svelte';
    import type { Component } from 'svelte';
    import Breadcrumbs, { type BreadcrumbItem } from '$lib/components/shared/Breadcrumbs.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import { gameIcons } from '$lib/components/shared/game-icons';
    import { gameFilterHref, games, type Game } from '$lib/utils/games';

    let { title, items, icon, navigation }: {
        title: string;
        items: BreadcrumbItem[];
        icon?: Component<{ class?: string }>;
        navigation?: { path: '/games/duel' | '/games/results'; game?: Game; query?: string; availableGames?: Game[] };
    } = $props();

    const pages = [
        { game: undefined, name: 'all games', icon: GameControllerIcon },
        ...(Object.keys(games) as Game[]).map(game => ({ game, name: games[game].name, icon: gameIcons[game] }))
    ];
</script>

<CustomH1 class="mb-1! flex items-center gap-2">
    {#if icon}<FilledSectionIcon {icon} color="blue" />{/if}
    {title}
</CustomH1>
<Breadcrumbs {items} label="Games breadcrumb" showSingle class="mb-2" />
<nav class="mb-3 flex flex-wrap gap-2" aria-label={navigation?.path === '/games/results' ? 'Results games' : 'Duel games'}>
    {#each pages.filter(entry => !entry.game || !navigation?.availableGames || navigation.availableGames.includes(entry.game)) as entry (entry.name)}
        {@const selected = navigation !== undefined && navigation.game === entry.game}
        <a href={gameFilterHref(navigation?.path ?? '/games/duel', navigation?.query ?? '', entry.game)}
            class="inline-flex hover:brightness-110" aria-current={selected ? 'page' : undefined}
            aria-label={entry.name} title={entry.name}>
            <FilledSectionIcon icon={entry.icon} color={selected ? 'fg0' : 'aqua'} compact />
        </a>
    {/each}
</nav>
