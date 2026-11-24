<script lang="ts">
    import { TrashIcon } from "phosphor-svelte";
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";
    import { notificationGroups } from '$lib/utils/notification-groups';
    import { pageColors } from '$lib/utils/page-colors';
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
            display name
            <input class="form-field" name="name" value={data.user.name} maxlength="100" required />
        </label>
        <label class="form-label">
            username
            <input class="form-field" name="username" bind:value={username} maxlength="30" />
        </label>
        <label class="form-label">
            image URL
            <input class="form-field" name="image" bind:value={image} type="url" />
        </label>
        <FormSelect label="role" name="role" bind:value={role}
            options={[{ value: 'user', label: 'user' }, { value: 'admin', label: 'admin' }]} />
        <div class="flex gap-4 items-center">
            <button class="button button-primary" type="submit">save</button>
            <a class="button button-danger" href="/admin/users">cancel</a>
        </div>
    </form>

    <form method="POST" action="?/saveNotificationGroups" class="surface-card mt-4 flex max-w-xl flex-col gap-4 p-4">
        <fieldset>
            <legend class="mb-2 text-section-title text-green">notification groups</legend>
            <div class="flex flex-wrap gap-2">
                {#each notificationGroups as group (group)}
                    <label class="group-toggle inline-flex cursor-pointer" style:--group-color={'var(--' + pageColors[group] + ')'}>
                        <input type="checkbox" name="groups" value={group} checked={data.groups.includes(group)} class="sr-only" />
                        <span class="button min-h-8 border px-3 py-1">{group}</span>
                    </label>
                {/each}
            </div>
        </fieldset>
        <button class="button button-primary self-start" type="submit">save groups</button>
    </form>

    <form method="POST" action="?/delete" class="mt-6" onsubmit={(event) => {
        if (!confirm('Delete this account permanently?')) event.preventDefault();
    }}>
        <button class="action-icon action-icon-danger" type="submit" aria-label="Delete account" title="Delete account"><TrashIcon size={18} aria-hidden="true" /></button>
    </form>
</Body>

<style>
    .group-toggle span {
        border-color: color-mix(in srgb, var(--group-color) 45%, var(--bg3));
        color: color-mix(in srgb, var(--group-color) 55%, var(--gray));
    }

    .group-toggle:hover span {
        background-color: var(--bg2);
    }

    .group-toggle input:checked + span {
        background-color: var(--group-color);
        border-color: var(--group-color);
        color: var(--bg0);
    }

    .group-toggle input:focus-visible + span {
        outline: 2px solid var(--purple);
        outline-offset: 2px;
    }
</style>
