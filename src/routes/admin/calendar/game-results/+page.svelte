<script lang="ts">
    import { enhance } from '$app/forms';
    import CalendarEventTypeSelect from '$lib/components/shared/CalendarEventTypeSelect.svelte';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { games } from '$lib/utils/games';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let pending = $state(false);
    let selectedGame = $state('wordle');
    const gameOptions = Object.entries(games).map(([value, game]) => ({ value, label: game.name }));
    let selectedType = $derived(data.mappings.find((mapping) => mapping.game === selectedGame)?.type_id ?? null);
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
            <FormSelect label="game" name="game" options={gameOptions} bind:value={selectedGame} />
            {#key selectedGame}
                <CalendarEventTypeSelect types={data.types} value={selectedType} optional />
            {/key}
            <button type="submit" class="button button-primary" disabled={pending}>save</button>
            <button type="submit" formaction="?/populate" class="button button-secondary"
                disabled={pending || selectedType === null}>populate past results</button>
        </form>
    {/if}
</Body>
