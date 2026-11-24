<script lang="ts">
    import { Switch } from 'bits-ui';
    import { pageColors } from '$lib/utils/page-colors';
    import type { NotificationGroup } from '$lib/utils/notification-groups';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { notificationInbox, updateNotifications } from '$lib/queries/notifications';

    let { userId, publicKey }: { userId: string; publicKey: string | null } = $props();
    const inbox = notificationInbox(() => userId);
    let registration = $state<ServiceWorkerRegistration>();
    let permission = $state<NotificationPermission>();
    let supported = $state<boolean>();
    let busy = $state(false);
    let feedback = $state('');
    let failed = $state(false);
    let savingGroup = $state<NotificationGroup>();
    const groupLabels: Record<NotificationGroup, string> = {
        motorsport: 'Receive Pick the Grid notifications',
        calendar: 'Receive Calendar notifications',
        games: 'Receive Games notifications',
        admin: 'Receive Admin notifications'
    };

    async function changeGroup(group: NotificationGroup, receive: boolean) {
        if (savingGroup) return;
        savingGroup = group;
        failed = false;
        feedback = '';
        try {
            await updateNotifications({ group, receive });
            await inbox.refetch();
        } catch {
            failed = true;
            feedback = 'unable to save notification settings. please try again.';
        } finally {
            savingGroup = undefined;
        }
    }

    onMount(() => {
        supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        if (!publicKey || !supported) return;
        permission = Notification.permission;
        void navigator.serviceWorker.register('/service-worker.js', { type: dev ? 'module' : 'classic' })
            .then(() => navigator.serviceWorker.ready)
            .then((worker) => registration = worker)
            .catch(() => {
                failed = true;
                feedback = 'browser alerts could not start on this device.';
            });
    });

    async function changePreference(enabled: boolean, browserAlerts = false) {
        if (busy) return;
        busy = true;
        feedback = '';
        failed = false;
        try {
            let subscription: PushSubscription | undefined;
            if (browserAlerts && registration && publicKey) {
                try {
                    permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true, applicationServerKey: publicKey
                        });
                    }
                } catch {
                    // The inbox is available even when the browser cannot subscribe.
                }
            }
            if (subscription) {
                try {
                    await updateNotifications({ enabled, subscription: subscription.toJSON() });
                    feedback = 'browser alerts enabled on this device.';
                } catch {
                    await updateNotifications({ enabled });
                }
            } else {
                await updateNotifications({ enabled });
            }
            feedback ||= browserAlerts
                ? 'notifications enabled in your inbox. browser alerts could not be enabled on this device.'
                : enabled ? 'notifications enabled.' : 'notifications disabled on all devices.';
            await inbox.refetch();
        } catch {
            failed = true;
            feedback = 'unable to save notification settings. please try again.';
        } finally {
            busy = false;
        }
    }
</script>

{#if inbox.isError}
    <p class="subtitle" role="status">notifications are temporarily unavailable.</p>
    <button class="button button-secondary self-start" type="button" onclick={() => inbox.refetch()}>retry</button>
{:else if inbox.data}
    <p class="subtitle">receive site alerts in your inbox and on devices where you allow browser alerts.</p>
    <div class="flex flex-wrap gap-2">
        {#if inbox.data.enabled}
            <button class="button button-secondary" type="button" disabled={busy} onclick={() => changePreference(false)}>disable notifications</button>
        {:else}
            <button class="button button-primary" type="button" disabled={busy} onclick={() => changePreference(true, Boolean(registration) && permission !== 'denied')}>enable notifications</button>
        {/if}
        {#if inbox.data.enabled && registration && permission !== 'denied'}
            <button class="button button-secondary" type="button" disabled={busy} onclick={() => changePreference(true, true)}>enable browser alerts on this device</button>
        {/if}
    </div>
    {#if !publicKey}
        <p class="subtitle">browser alerts are unavailable on this server.</p>
    {:else if permission === 'denied'}
        <p class="subtitle">allow notifications in your browser or device settings to receive browser alerts.</p>
    {:else if supported === false}
        <p class="subtitle">browser alerts are unavailable here. on iphone or ipad, open the site from your home screen.</p>
    {/if}
    <section class="flex flex-col gap-2" aria-labelledby="notification-categories-heading">
        <h3 id="notification-categories-heading" class="plain-h3">notification categories</h3>
        {#each inbox.data.options as option (option.group)}
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Switch.Root bind:checked={() => option.enabled, (receive) => changeGroup(option.group, receive)}
                    disabled={savingGroup !== undefined} aria-labelledby={'notification-option-' + option.group}
                    class="group inline-flex h-6 w-12 shrink-0 cursor-pointer items-center bg-bg3 p-[3px] hover:bg-bg4 disabled:cursor-wait">
                    <Switch.Thumb class="size-[18px] transition-transform group-data-[state=checked]:translate-x-6"
                        style={option.enabled ? 'background-color: var(--' + pageColors[option.group] + ')' : 'background-color: color-mix(in srgb, var(--gray) 70%, var(--fg0))'} />
                </Switch.Root>
                <span id={'notification-option-' + option.group} class="text-secondary">{groupLabels[option.group]}</span>
            </div>
        {/each}
    </section>
    {#if feedback}<p class="form-feedback {failed ? 'text-red' : 'text-fg0'}" role={failed ? 'alert' : 'status'}>{feedback}</p>{/if}
{:else}
    <p class="subtitle" role="status">loading notifications…</p>
{/if}
