<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { games } from '$lib/utils/games';
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'games' }]}>games</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {#each Object.entries(games) as [slug, game]}
            <a href={`/admin/games/${slug}`} class="card-link border-green">
                <span class="text-green text-card-title">{game.name}</span>
                <span class="subtitle">view the calendar and manage daily results</span>
            </a>
        {/each}
    </div>
</Body>
