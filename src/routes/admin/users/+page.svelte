<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import UserAvatar from "$lib/components/shared/UserAvatar.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import { PencilIcon, StarIcon, TrashIcon } from "phosphor-svelte";
    import { authClient } from "$lib/auth-client";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let totalPages = $derived(Math.max(1, Math.ceil(data.total / data.limit)));
    const session = authClient.useSession();
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'users' }]}>users</H1WithBreadCrumb>
    <CustomH2 class="mb-3" subtitle="{data.total} registered users">users</CustomH2>

    <ul class="surface-list" role="list">
        {#each data.users as user (user.id)}
            <li class="list-row flex-wrap border-l-4 {user.role === 'admin' ? 'border-blue' : 'border-gray'}">
                <a href={`/admin/users/${user.id}`} class="flex min-w-32 flex-1 items-center gap-3 hover:text-blue">
                    <UserAvatar image={user.image} name={user.username || user.name} />
                    <div class="min-w-0">
                        <p class="text-card-title truncate flex items-center gap-1">
                            {user.username || user.name || 'unnamed user'}
                            {#if $session.data?.user.id === user.id}
                                <StarIcon class="text-yellow shrink-0" size={14} aria-label="current user" />
                            {/if}
                        </p>
                        <p class="subtitle truncate">{user.email}</p>
                    </div>
                </a>
                <div class="flex items-center gap-2">
                    <form method="POST" action="?/toggleAdmin">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="role" value={user.role || 'user'} />
                        <button
                            class="button {user.role === 'admin' ? 'button-accent' : 'button-secondary'}"
                            type="submit"
                        >
                            {user.role === 'admin' ? 'admin' : 'user'}
                        </button>
                    </form>
                    <a class="action-icon" href={`/admin/users/${user.id}`} aria-label={`Edit ${user.username || user.name || user.email}`} title="Edit account"><PencilIcon size={18} aria-hidden="true" /></a>
                    <form method="POST" action="?/delete" onsubmit={(event) => {
                        if (!confirm('Delete this account permanently?')) event.preventDefault();
                    }}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                            class="action-icon action-icon-danger"
                            type="submit"
                            aria-label="Delete {user.username || user.name || user.email}"
                            title="Delete account"
                        >
                            <TrashIcon size={18} aria-hidden="true" />
                        </button>
                    </form>
                </div>
            </li>
        {:else}
            <li class="list-row text-gray">No users found.</li>
        {/each}
    </ul>

    {#if totalPages > 1}
        <nav class="flex justify-center gap-4 mt-6 text-secondary" aria-label="Users pagination">
            {#if data.page > 1}
                <a class="internal-link" href={`/admin/users?page=${data.page - 1}`}>[previous]</a>
            {/if}
            <span class="text-gray">page {data.page} / {totalPages}</span>
            {#if data.page < totalPages}
                <a class="internal-link" href={`/admin/users?page=${data.page + 1}`}>[next]</a>
            {/if}
        </nav>
    {/if}
</Body>
