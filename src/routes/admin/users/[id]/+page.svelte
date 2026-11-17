<script lang="ts">
    import { TrashIcon } from "phosphor-svelte";
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let username = $state('');
    let image = $state('');
    let role = $state('user');

    $effect(() => {
        username = data.user.username ?? '';
        image = data.user.image ?? '';
        role = data.user.role ?? 'user';
    });
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'users', href: '/admin/users' }, { label: data.user.username || data.user.name || data.user.email }]}>user</H1WithBreadCrumb>
    <CustomH2 class="mb-3">{data.user.username || data.user.name || data.user.email}</CustomH2>

    {#if form?.message}
        <p class="form-feedback text-red mb-4">{form.message}</p>
    {/if}

    <form method="POST" action="?/save" class="surface-card p-4 flex flex-col gap-4 max-w-xl">
        <label class="form-label">
            email
            <input class="form-field" value={data.user.email} disabled />
        </label>
        <label class="form-label">
            username
            <input class="form-field" name="username" bind:value={username} maxlength="30" />
        </label>
        <label class="form-label">
            image URL
            <input class="form-field" name="image" bind:value={image} type="url" />
        </label>
        <label class="form-label">
            role
            <select class="form-field" name="role" bind:value={role}>
                <option value="user">user</option>
                <option value="admin">admin</option>
            </select>
        </label>
        <div class="flex gap-4 items-center">
            <button class="button button-primary" type="submit">save</button>
            <a class="button button-danger" href="/admin/users">cancel</a>
        </div>
    </form>

    <form method="POST" action="?/delete" class="mt-6" onsubmit={(event) => {
        if (!confirm('Delete this account permanently?')) event.preventDefault();
    }}>
        <button class="action-icon action-icon-danger" type="submit" aria-label="Delete account" title="Delete account"><TrashIcon size={18} aria-hidden="true" /></button>
    </form>
</Body>
