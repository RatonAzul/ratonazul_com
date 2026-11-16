<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { games } from '$lib/utils/games';
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'games' }]}>games</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {#each Object.entries(games) as [slug, game]}
            <a href={`/admin/games/${slug}`} class="surface-card surface-card-hover border-l-4 border-green p-4 flex flex-col gap-2">
                <span class="text-green text-xl font-semibold">{game.name}</span>
                <span class="text-gray text-sm">view the calendar and manage daily results</span>
            </a>
        {/each}
    </div>
</Body>
