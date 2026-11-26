<script lang="ts">
    import GamePlayerSelect from '$lib/components/admin/GamePlayerSelect.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let first = $derived((form?.values ? form.values.firstUserId : data.pair?.firstUserId) ?? '');
    let second = $derived((form?.values ? form.values.secondUserId : data.pair?.secondUserId) ?? '');
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'games', href: '/admin/games' }, { label: 'access' }]}>games access</H1WithBreadCrumb>
    <form method="POST" action="?/save" class="surface-card flex max-w-2xl flex-col gap-4 p-4">
        <p class="subtitle">choose the two players who can see the results on the games page.</p>
        <div class="grid gap-4 sm:grid-cols-2">
            <GamePlayerSelect users={data.users} name="firstUserId" label="player one" bind:value={first} />
            <GamePlayerSelect users={data.users} name="secondUserId" label="player two" bind:value={second} />
        </div>
        <button type="submit" class="button button-primary self-start">save</button>
        {#if form?.message}
            <p class="form-feedback {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>
        {/if}
    </form>
</Body>
