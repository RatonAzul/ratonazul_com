<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { signOut } from '$lib/auth-client';
    import Body from '$lib/components/shared/Body.svelte';
    import CustomH2 from '$lib/components/shared/CustomH2.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import MarkAllNotificationsRead from '$lib/components/shared/MarkAllNotificationsRead.svelte';
    import NotificationList from '$lib/components/shared/NotificationList.svelte';
    import { notificationInbox } from '$lib/queries/notifications';
    import NotificationSettings from '$lib/components/shared/NotificationSettings.svelte';
    import SettingsCheckbox from '$lib/components/shared/SettingsCheckbox.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import VisualSettings from '$lib/components/shared/VisualSettings.svelte';
    import UserSelect from '$lib/components/shared/UserSelect.svelte';
    import ProfileColorSwatches from '$lib/components/shared/ProfileColorSwatches.svelte';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let tab = $derived(page.url.searchParams.get('tab') === 'notifications' ? 'notifications' : 'settings');
    let readTab = $derived(page.url.searchParams.get('status') === 'read');
    const inbox = notificationInbox(() => data.userId);
    let name = $derived(form?.values?.name ?? data.profile.name);
    let username = $derived(form?.values?.username ?? data.profile.username ?? '');
    let image = $derived(form?.values?.image ?? data.profile.image ?? '');
    let showImage = $derived(form?.values?.showImage ?? data.profile.showImage);
    let color = $derived(form?.values?.color ?? data.profile.color);
    let logoutFailed = $state(false);

    async function logout() {
        try {
            const result = await signOut();
            if (result.error) throw result.error;
            await goto('/', { invalidateAll: true });
        } catch {
            logoutFailed = true;
        }
    }
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'profile' }]}>profile</H1WithBreadCrumb>
    <div class="flex max-w-2xl flex-col gap-4">
        <div class="surface-card flex items-center gap-4 border-l-4 p-4" style:border-left-color={'var(--' + color + ')'}>
            <UserAvatar image={image.trim()} {showImage} {color} class="size-20 text-section-title" />
            <div class="min-w-0 break-words">
                <p class="text-section-title" style:color={'var(--' + color + ')'}>{username.trim() || 'no username'}</p>
                <p class="text-secondary text-fg0">{name.trim() || 'display name'}</p>
            </div>
        </div>

        <div class="surface-card px-4 py-2">
            <nav class="tab-nav" aria-label="profile tabs">
                <a href="?tab=settings" aria-current={tab === 'settings' ? 'page' : undefined} class="tab-link">settings</a>
                <a href="?tab=notifications" aria-current={tab === 'notifications' ? 'page' : undefined} class="tab-link">notifications</a>
            </nav>
        </div>

        {#if tab === 'settings'}
            <section class="surface-card flex flex-col gap-4 p-4">
                <CustomH2>your details</CustomH2>
                {#if form?.message}<p class="form-feedback {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>{/if}
                <form method="POST" action="?/save" class="flex flex-col gap-4">
                    <label class="form-label">email<input class="form-field" value={data.profile.email} disabled /></label>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-label">display name<input class="form-field" name="name" autocomplete="name" bind:value={name} maxlength="100" required /></label>
                        <label class="form-label">username<input class="form-field" name="username" autocomplete="username" bind:value={username} maxlength="15" required /></label>
                    </div>
                    <label class="form-label">image URL<input class="form-field" name="image" bind:value={image} type="url" /></label>
                    <SettingsCheckbox label="show profile picture" name="showImage"
                        bind:checked={showImage} />
                    <ProfileColorSwatches name="color" bind:color />
                    <button type="submit" class="button button-primary self-start">save</button>
                </form>
            </section>

            <section class="surface-card flex flex-col gap-4 p-4">
                <CustomH2>visuals</CustomH2>
                <VisualSettings compact={false} />
            </section>

            <section class="surface-card flex flex-col gap-4 p-4">
                <CustomH2>games</CustomH2>
                {#if form?.opponentMessage}
                    <p class="form-feedback {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.opponentMessage}</p>
                {/if}
                <form method="POST" action="?/saveOpponent" class="flex flex-col items-start gap-3">
                    <div class="w-full">
                        <UserSelect label="default duel opponent" name="opponent" value={data.opponentId}
                            users={data.opponents} extraOptions={[{ value: 'automatic', label: 'automatic' }]} />
                    </div>
                    <button type="submit" class="button button-primary">save</button>
                </form>
            </section>

            <section id="notifications" class="surface-card flex scroll-mt-20 flex-col gap-4 p-4">
                <CustomH2>notifications</CustomH2>
                <NotificationSettings userId={data.userId} publicKey={data.pushPublicKey} />
            </section>

            <section class="surface-card flex flex-col gap-4 p-4">
                <CustomH2>account</CustomH2>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="button button-secondary" onclick={logout}>log out</button>
                    <form method="POST" action="?/delete" onsubmit={(event) => { if (!confirm('Delete your account permanently?')) event.preventDefault(); }}>
                        <button type="submit" class="button button-danger">delete account</button>
                    </form>
                </div>
                {#if logoutFailed}<p class="form-feedback text-red" role="alert">unable to log out. please try again.</p>{/if}
            </section>
        {:else}
            <section class="surface-card flex flex-col gap-4 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <CustomH2>notifications</CustomH2>
                    {#if inbox.data?.available}
                        <MarkAllNotificationsRead userId={data.userId} items={inbox.data.items} />
                    {/if}
                </div>
                {#if inbox.isError || inbox.data?.available === false}
                    <p class="subtitle" role="status">notifications are temporarily unavailable.</p>
                    <button class="button button-secondary self-start" type="button" onclick={() => inbox.refetch()}>retry</button>
                {:else if !inbox.data}
                    <p class="subtitle" role="status">loading notifications…</p>
                {:else if !inbox.data.enabled}
                    <p class="subtitle">enable notifications to receive site alerts.</p>
                    <a class="internal-link self-start" href="?tab=settings#notifications">[notification settings]</a>
                {:else}
                    <nav class="tab-nav" aria-label="notification status">
                        <a href="?tab=notifications" aria-current={!readTab ? 'page' : undefined}
                            class="tab-link">unread</a>
                        <a href="?tab=notifications&status=read" aria-current={readTab ? 'page' : undefined}
                            class="tab-link">read</a>
                    </nav>
                    <NotificationList items={inbox.data.items.filter((item) => item.read === readTab)} userId={data.userId}
                        emptyMessage={readTab ? 'no read notifications yet.' : 'no unread notifications.'} />
                {/if}
            </section>
        {/if}
    </div>
</Body>
