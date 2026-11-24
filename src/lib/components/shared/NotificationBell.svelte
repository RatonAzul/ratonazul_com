<script lang="ts">
    import { untrack, onMount } from 'svelte';
    import { Popover } from 'bits-ui';
    import { BellIcon } from 'phosphor-svelte';
    import { useSession } from '$lib/auth-client';
    import { showOpenPageAlerts } from '$lib/utils/browser-notifications';
    import { notificationInbox } from '$lib/queries/notifications';
    import MarkAllNotificationsRead from './MarkAllNotificationsRead.svelte';
    import NotificationList from './NotificationList.svelte';

    const session = useSession();
    let userId = $derived($session.data?.user.id);
    const inbox = notificationInbox(() => userId);
    let open = $state(false);
    let readTab = $state(false);
    let unread = $derived(inbox.data?.items.some((item) => !item.read) ?? false);
    let observedUser: string | undefined;
    let highestId: number | undefined;

    $effect(() => {
        const items = inbox.data?.items;
        const enabled = inbox.data?.enabled;
        const available = inbox.data?.available;
        const viewer = userId;
        untrack(() => {
            if (observedUser !== viewer || !enabled) {
                observedUser = viewer;
                highestId = undefined;
            }
            if (!viewer || !enabled || !available || !items) return;
            const previous = highestId;
            highestId = Math.max(previous ?? 0, items[0]?.id ?? 0);
            if (previous === undefined) return;
            void showOpenPageAlerts(viewer, items.filter(item => !item.read && item.id > previous))
                .catch(() => { /* alerts remain in the inbox if the browser cannot show them */ });
        });
    });

    onMount(() => {
        if (!('serviceWorker' in navigator)) return;
        const refresh = (event: MessageEvent) => {
            if (userId && event.data === 'site-notification') void inbox.refetch();
        };
        navigator.serviceWorker.addEventListener('message', refresh);
        return () => navigator.serviceWorker.removeEventListener('message', refresh);
    });

</script>

{#if userId}
    <Popover.Root bind:open onOpenChange={(value) => {
        if (value) {
            readTab = false;
            void inbox.refetch();
        }
    }}>
        <Popover.Trigger class="button button-quiet relative px-2" aria-label={unread ? 'notifications, unread alerts' : 'notifications'}>
            <BellIcon class="size-5" />
            {#if unread}<span class="absolute top-2 right-2 size-2 rounded-full bg-red" aria-hidden="true"></span>{/if}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content align="end" sideOffset={8} class="menu-panel w-80 max-w-[calc(100vw-2rem)] p-3">
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 class="text-card-title">notifications</h2>
                    {#if inbox.data?.available}
                        <MarkAllNotificationsRead {userId} items={inbox.data.items} />
                    {/if}
                </div>
                {#if inbox.isError}
                    <p role="status" class="subtitle">notifications are temporarily unavailable.</p>
                {:else if !inbox.data}
                    <p role="status" class="subtitle">loading notifications…</p>
                {:else if !inbox.data.enabled}
                    <p class="subtitle mb-2">enable notifications in your profile.</p>
                    <a class="internal-link" href={'/profile/' + encodeURIComponent(userId) + '?tab=settings#notifications'}
                        onclick={() => open = false}>[notification settings]</a>
                {:else if !inbox.data.available}
                    <p role="status" class="subtitle">notifications are temporarily unavailable.</p>
                {:else}
                    <div class="tab-nav mb-2" role="group" aria-label="notification status">
                        <button type="button" class="tab-link cursor-pointer" aria-pressed={!readTab} onclick={() => readTab = false}>unread</button>
                        <button type="button" class="tab-link cursor-pointer" aria-pressed={readTab} onclick={() => readTab = true}>read</button>
                    </div>
                    <div class="max-h-[min(24rem,60vh)] overflow-y-auto lg:max-h-[min(36rem,70vh)]">
                        <NotificationList items={inbox.data.items.filter((item) => item.read === readTab)} {userId}
                            emptyMessage={readTab ? 'no read notifications yet.' : 'no unread notifications.'}
                            onNavigate={() => open = false} />
                    </div>
                {/if}
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
{/if}
