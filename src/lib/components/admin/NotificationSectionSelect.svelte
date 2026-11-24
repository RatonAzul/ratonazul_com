<script lang="ts">
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import { isNotificationGroup, notificationGroups } from '$lib/utils/notification-groups';
    import { notificationSectionIcons } from '$lib/utils/notification-sections';
    import { pageColors } from '$lib/utils/page-colors';

    let { section = '' }: { section?: string } = $props();
    let selected = $derived<string>(isNotificationGroup(section) ? section : '');
    const options = notificationGroups.map((group) => ({ value: group, label: group }));
</script>

<FormSelect label="section" name="section" {options} bind:value={selected} required placeholder="choose a section">
    {#snippet optionContent({ value, label })}
        <span class="flex min-w-0 items-center gap-2">
            {#if isNotificationGroup(value)}
                <FilledSectionIcon icon={notificationSectionIcons[value]} color={pageColors[value]} />
            {/if}
            <span class="truncate">{label}</span>
        </span>
    {/snippet}
</FormSelect>
