<script lang="ts">
    import { enhance } from '$app/forms';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { games, type Game } from '$lib/utils/games';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let pending = $state(false);
    let selectedGame = $state<Game>('wordle');
    let selectedType = $derived(data.mappings.find((mapping) => mapping.game === selectedGame)?.type_id ?? '');
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar', href: '/admin/calendar' }, { label: 'game results' }]}>game results</H1WithBreadCrumb>
    {#if data.loadError}
        <p class="form-feedback text-red" role="alert">{data.loadError}</p>
    {:else}
        {#if form?.message}
            <p class="form-feedback mb-4 {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>
        {/if}
        <form method="POST" action="?/save" use:enhance={() => {
            pending = true;
            return async ({ update }) => {
                try {
                    await update({ reset: false });
                } finally {
                    pending = false;
                }
            };
        }}
            class="surface-card flex flex-wrap items-end gap-3 p-4">
            <label class="form-label">
                game
                <select name="game" bind:value={selectedGame} class="form-field">
                    {#each Object.entries(games) as [slug, game] (slug)}
                        <option value={slug}>{game.name}</option>
                    {/each}
                </select>
            </label>
            <label class="form-label">
                event type
                {#key selectedGame}
                    <select name="typeId" value={selectedType} class="form-field">
                        <option value="">automatic events off</option>
                        {#each data.types as type (type.id)}
                            <option value={type.id}>{type.name}</option>
                        {/each}
                    </select>
                {/key}
            </label>
            <button type="submit" class="button button-primary" disabled={pending}>save</button>
            <button type="submit" formaction="?/populate" class="button button-secondary"
                disabled={pending || selectedType === ''}>populate past results</button>
        </form>
    {/if}
</Body>
