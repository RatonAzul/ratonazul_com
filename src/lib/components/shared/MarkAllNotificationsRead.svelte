<script lang="ts">
    import { notificationReadAction } from '$lib/queries/notifications';
    import type { InboxNotification } from '$lib/types/notifications';

    let { userId, items }: { userId: string; items: InboxNotification[] } = $props();
    const markRead = notificationReadAction();
    let busy = $state(false);
    let failed = $state(false);

    async function markAll() {
        const id = items[0]?.id;
        if (!id || busy) return;
        busy = true;
        failed = false;
        try {
            await markRead(userId, id, true);
        } catch {
            failed = true;
        } finally {
            busy = false;
        }
    }
</script>

{#if items.some((item) => !item.read)}
    <div>
        <button type="button" class="button button-quiet min-h-8 px-2 py-1 text-meta"
            disabled={busy} onclick={markAll}>mark all as read</button>
        {#if failed}<p class="form-feedback text-red" role="alert">unable to mark notifications as read.</p>{/if}
    </div>
{/if}
