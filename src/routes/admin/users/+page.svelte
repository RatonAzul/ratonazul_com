<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import { StarIcon, TrashIcon } from "phosphor-svelte";
    import { authClient } from "$lib/auth-client";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let totalPages = $derived(Math.max(1, Math.ceil(data.total / data.limit)));
    const session = authClient.useSession();
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'users' }]}>users</H1WithBreadCrumb>
    <CustomH2 subtitle="{data.total} registered users">users</CustomH2>

    <div class="flex flex-col gap-2">
        {#each data.users as user (user.id)}
            <div class="bg-bg1 pe-3 flex items-center border-l-4 {user.role === 'admin' ? 'border-purple' : 'border-gray'}">
                <a href={`/admin/users/${user.id}`} class="cursor-pointer p-3 flex items-center gap-3 flex-1 min-w-0 hover:text-gray-dark">
                    {#if user.image}
                        <img src={user.image} alt="" class="size-10 object-cover" />
                    {:else}
                        <div class="size-10 bg-bg3 flex items-center justify-center text-blue font-semibold">
                            {(user.username || user.name || '?').slice(0, 1).toUpperCase()}
                        </div>
                    {/if}
                    <div class="min-w-0">
                        <p class="text-fg0 truncate flex items-center gap-1">
                            {user.username || user.name || 'unnamed user'}
                            {#if $session.data?.user.id === user.id}
                                <StarIcon class="text-yellow shrink-0" size={14} weight="fill" aria-label="current user" />
                            {/if}
                        </p>
                        <p class="text-gray text-sm truncate">{user.email}</p>
                    </div>
                </a>
                <form method="POST" action="?/toggleAdmin" class="me-3">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={user.role || 'user'} />
                    <button
                        class="cursor-pointer text-bg0 text-xs w-15 h-10 {user.role === 'admin' ? 'bg-purple hover:bg-purple-dark' : 'bg-gray hover:bg-gray-dark'}"
                        type="submit"
                    >
                        {user.role === 'admin' ? 'admin' : 'user'}
                    </button>
                </form>
                <form method="POST" action="?/delete" onsubmit={(event) => {
                    if (!confirm('Delete this account permanently?')) event.preventDefault();
                }}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                        class="cursor-pointer w-10 h-10 bg-red hover:bg-red-dark text-bg0 flex items-center justify-center"
                        type="submit"
                        aria-label="Delete {user.username || user.name || user.email}"
                        title="Delete account"
                    >
                        <TrashIcon size={22} weight="bold" />
                    </button>
                </form>
            </div>
        {:else}
            <p class="text-gray text-sm">No users found.</p>
        {/each}
    </div>

    {#if totalPages > 1}
        <nav class="flex justify-center gap-4 mt-6 text-sm" aria-label="Users pagination">
            {#if data.page > 1}
                <a class="cursor-pointer text-blue hover:text-blue-dark" href={`/admin/users?page=${data.page - 1}`}>previous</a>
            {/if}
            <span class="text-gray">page {data.page} / {totalPages}</span>
            {#if data.page < totalPages}
                <a class="cursor-pointer text-blue hover:text-blue-dark" href={`/admin/users?page=${data.page + 1}`}>next</a>
            {/if}
        </nav>
    {/if}
</Body>
