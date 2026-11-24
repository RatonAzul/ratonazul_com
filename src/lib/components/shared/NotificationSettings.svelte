<script lang="ts">
    import { Switch } from 'bits-ui';
    import { pageColors } from '$lib/utils/page-colors';
    import type { NotificationGroup } from '$lib/utils/notification-groups';
    import { onMount } from 'svelte';
    import { getDeviceAlerts, notificationWorker, setDeviceAlerts, supportsDeviceAlerts } from '$lib/utils/browser-notifications';
    import { notificationInbox, updateNotifications } from '$lib/queries/notifications';

    let { userId, publicKey }: { userId: string; publicKey: string | null } = $props();
    const inbox = notificationInbox(() => userId);
    let permission = $state<NotificationPermission>();
    let supported = $state<boolean>();
    let device = $state<ReturnType<typeof getDeviceAlerts>>(null);
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
        supported = supportsDeviceAlerts();
        if (supported) permission = Notification.permission;
        const refresh = () => {
            device = getDeviceAlerts(userId);
            if (supported) permission = Notification.permission;
        };
        refresh();
        window.addEventListener('focus', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            window.removeEventListener('storage', refresh);
        };
    });

    async function changePreference(action: 'device' | 'inbox' | 'off-device' | 'off-all') {
        if (busy) return;
        busy = true;
        feedback = '';
        failed = false;
        try {
            if (action === 'device') {
                permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    feedback = 'allow notifications in your browser settings to enable alerts on this device.';
                    return;
                }
                const worker = await notificationWorker();
                let subscription: PushSubscription | undefined;
                if (publicKey && 'PushManager' in window) {
                    try {
                        subscription = await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey });
                        await updateNotifications({ enabled: true, subscription: subscription.toJSON() });
                    } catch {
                        subscription = undefined;
                    }
                }
                if (!subscription) await updateNotifications({ enabled: true });
                device = subscription ? { mode: 'push', endpoint: subscription.endpoint } : { mode: 'page' };
                setDeviceAlerts(userId, device);
                feedback = subscription ? 'browser alerts enabled on this device.' : 'browser alerts enabled while the site is open.';
            } else if (action === 'off-device') {
                if (device?.mode === 'push') await updateNotifications({ removeEndpoint: device.endpoint });
                setDeviceAlerts(userId, null);
                device = null;
                feedback = 'browser alerts disabled on this device.';
            } else {
                const enabled = action === 'inbox';
                await updateNotifications({ enabled });
                if (!enabled) {
                    setDeviceAlerts(userId, null);
                    device = null;
                }
                feedback = enabled ? 'inbox enabled.' : 'notifications disabled on all devices.';
            }
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
        {#if inbox.data.enabled && device && permission === 'granted'}
            <button class="button button-secondary" type="button" disabled={busy} onclick={() => changePreference('off-device')}>disable notifications on this device</button>
        {:else if supported && permission !== 'denied'}
            <button class="button button-primary" type="button" disabled={busy} onclick={() => changePreference('device')}>enable notifications on this device</button>
        {/if}
        {#if inbox.data.enabled}
            <button class="button button-secondary" type="button" disabled={busy} onclick={() => changePreference('off-all')}>disable notifications on all devices</button>
        {:else}
            <button class="button button-secondary" type="button" disabled={busy} onclick={() => changePreference('inbox')}>enable inbox only</button>
        {/if}
    </div>
    {#if permission === 'denied'}
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
