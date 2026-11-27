<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import GamesPageHeader from '$lib/components/games/GamesPageHeader.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<Body>
    <GamesPageHeader title={data.title} items={[{ label: 'games', href: '/games' }, { label: 'profile' }, { label: data.title }]} />
</Body>
