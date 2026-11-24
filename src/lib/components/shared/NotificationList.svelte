<script lang="ts">
    import { BellIcon } from 'phosphor-svelte';
    import { isNotificationGroup } from '$lib/utils/notification-groups';
    import { notificationSectionIcons } from '$lib/utils/notification-sections';
    import { pageColors } from '$lib/utils/page-colors';
    import FilledSectionIcon from './FilledSectionIcon.svelte';
    import { format } from 'date-fns';
    import { notificationReadAction } from '$lib/queries/notifications';
    import type { InboxNotification } from '$lib/types/notifications';

    let { items, userId, onNavigate, emptyMessage = 'no notifications yet.' }: {
        items: InboxNotification[];
        userId: string;
        onNavigate?: () => void;
        emptyMessage?: string;
    } = $props();
    const markRead = notificationReadAction();
    let failed = $state(false);

    async function read(item: InboxNotification) {
        if (item.read) return;
        failed = false;
        try {
            await markRead(userId, item.id);
        } catch {
            failed = true;
        }
    }
</script>

{#if failed}<p class="form-feedback text-red" role="alert">unable to mark this notification as read.</p>{/if}

{#if items.length}
    <ul class="card-list">
        {#each items as item (item.id)}
            {@const section = item.section.trim().toLowerCase()}
            {@const color = isNotificationGroup(section) ? pageColors[section] : item.color}
            {@const icon = isNotificationGroup(section) ? notificationSectionIcons[section] : BellIcon}
            <li>
                {#snippet content()}
                    <div class="flex items-center gap-2">
                        <FilledSectionIcon {icon} {color} />
                        <h3 class="plain-h3 min-w-0 text-secondary" style:color={'var(--' + color + ')'}>{item.title}</h3>
                    </div>
                    <p class="text-meta whitespace-pre-wrap text-fg0">{item.description}</p>
                    <p class="text-meta text-gray">
                        {item.section} · <time datetime={item.created_at}>{format(new Date(item.created_at), 'dd/MM/yyyy')}</time>
                        {#if !item.read}<span class="text-green"> · new</span>{/if}
                    </p>
                {/snippet}
                {#if item.link}
                    <a class="surface-card-hover flex flex-col gap-1 break-words border-l-4 p-3"
                        style:border-left-color={'var(--' + color + ')'} href={item.link} onclick={() => { void read(item); onNavigate?.(); }}>
                        {@render content()}
                    </a>
                {:else if !item.read}
                    <div class="surface-card-hover relative flex flex-col gap-1 break-words border-l-4 p-3"
                        style:border-left-color={'var(--' + color + ')'}>
                        {@render content()}
                        <button type="button" class="absolute inset-0 cursor-pointer" aria-label={'mark ' + item.title + ' as read'}
                            onclick={() => read(item)}></button>
                    </div>
                {:else}
                    <div class="surface-card flex flex-col gap-1 break-words border-l-4 p-3"
                        style:border-left-color={'var(--' + color + ')'}>
                        {@render content()}
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{:else}
    <p class="subtitle">{emptyMessage}</p>
{/if}
