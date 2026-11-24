<script lang="ts">
    import { JoystickIcon, TextAaIcon, TranslateIcon } from 'phosphor-svelte';
    import AdminSectionCard from '$lib/components/admin/AdminSectionCard.svelte';
    import { pageColors } from '$lib/utils/page-colors';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { games, type Game } from '$lib/utils/games';

    const icons = { wordle: TextAaIcon, 'la-palabra-del-dia': TranslateIcon, isaaconnect: JoystickIcon };
    const slugs = Object.keys(games) as Game[];
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'games' }]}>games</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {#each slugs as slug (slug)}
            <AdminSectionCard href={`/admin/games/${slug}`} title={games[slug].name} icon={icons[slug]}
                color={pageColors.games} description="view the calendar and manage daily results" />
        {/each}
    </div>
</Body>
