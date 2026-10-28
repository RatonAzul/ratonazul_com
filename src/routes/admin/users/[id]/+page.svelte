<script lang="ts">
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
    <CustomH2>{data.user.username || data.user.name || data.user.email}</CustomH2>

    {#if form?.message}
        <p class="text-red text-sm mb-4">{form.message}</p>
    {/if}

    <form method="POST" action="?/save" class="bg-bg1 p-4 flex flex-col gap-4 max-w-xl">
        <label class="flex flex-col gap-1 text-sm text-gray">
            email
            <input class="bg-bg2 text-fg0 p-2 outline-none" value={data.user.email} disabled />
        </label>
        <label class="flex flex-col gap-1 text-sm text-gray">
            username
            <input class="bg-bg2 text-fg0 p-2 outline-none" name="username" bind:value={username} maxlength="30" />
        </label>
        <label class="flex flex-col gap-1 text-sm text-gray">
            image URL
            <input class="bg-bg2 text-fg0 p-2 outline-none" name="image" bind:value={image} type="url" />
        </label>
        <label class="flex flex-col gap-1 text-sm text-gray">
            role
            <select class="bg-bg2 text-fg0 p-2 outline-none" name="role" bind:value={role}>
                <option value="user">user</option>
                <option value="admin">admin</option>
            </select>
        </label>
        <div class="flex gap-4 items-center">
            <button class="cursor-pointer bg-green text-bg0 px-4 h-10 hover:bg-green-dark" type="submit">save</button>
            <a class="cursor-pointer text-gray hover:text-gray-dark text-sm" href="/admin/users">cancel</a>
        </div>
    </form>

    <form method="POST" action="?/delete" class="mt-6" onsubmit={(event) => {
        if (!confirm('Delete this account permanently?')) event.preventDefault();
    }}>
        <button class="cursor-pointer text-red hover:text-red-dark text-sm" type="submit">delete account</button>
    </form>
</Body>
