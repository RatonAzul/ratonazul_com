<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH2 from '$lib/components/shared/CustomH2.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let withAccess = $derived(data.users.filter((user) => user.member !== null));
    let withoutAccess = $derived(data.users.filter((user) => user.member === null));
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar', href: '/admin/calendar' }, { label: 'access' }]}>calendar access</H1WithBreadCrumb>
    {#if form?.message}<p class="form-feedback mb-4" role="status">{form.message}</p>{/if}

    <div class="flex flex-col">
        {@render accessList('with access', withAccess, true)}
        <SectionSeparator />
        {@render accessList('without access', withoutAccess, false)}
    </div>
</Body>

{#snippet accessList(title: string, users: PageData['users'], hasAccess: boolean)}
    <section>
        <CustomH2 class="mb-3" subtitle={`${users.length} ${users.length === 1 ? 'user' : 'users'}`}>{title}</CustomH2>
        <ul class="surface-list" role="list">
            {#each users as user (user.id)}
                <li class="list-row flex-wrap border-l-4 {hasAccess ? 'border-green' : 'border-red'}">
                    <div class="flex min-w-0 items-center gap-3">
                        <UserAvatar image={user.image} showImage={user.showImage} color={user.color} />
                        <div class="min-w-0 wrap-anywhere">
                            <p class="text-card-title">{user.username || user.name}</p>
                            <p class="subtitle">{user.email}</p>
                        </div>
                    </div>
                    <form method="POST" action="?/update">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="access" value={hasAccess ? 'revoke' : 'grant'} />
                        <button type="submit" class="button {hasAccess ? 'button-danger' : 'button-primary'}" aria-label={`${hasAccess ? 'Remove calendar access for' : 'Grant calendar access to'} ${user.username || user.name}`}>
                            {hasAccess ? 'remove access' : 'grant access'}
                        </button>
                    </form>
                </li>
            {:else}
                <li class="list-row text-gray">No users {title}.</li>
            {/each}
        </ul>
    </section>
{/snippet}
