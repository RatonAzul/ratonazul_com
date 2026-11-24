<script lang="ts">
    import { MinusIcon } from 'phosphor-svelte';
    import EventTypeIcon from '$lib/components/shared/EventTypeIcon.svelte';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import { calendarEventIcons, isCalendarEventIcon, type CalendarEventIcon } from '$lib/utils/calendar-event-icons';

    let { icon }: { icon: CalendarEventIcon | '' } = $props();
    let selected = $derived<string>(icon);
    const options = [
        { value: '', label: 'no icon' },
        ...Object.entries(calendarEventIcons).map(([value, label]) => ({ value, label }))
    ];
</script>

<FormSelect label="icon" name="icon" {options} bind:value={selected}>
    {#snippet optionContent({ value })}
        <span class="flex size-5 items-center justify-center" aria-hidden="true">
            {#if isCalendarEventIcon(value)}
                <EventTypeIcon icon={value} />
            {:else}
                <MinusIcon size={16} />
            {/if}
        </span>
    {/snippet}
</FormSelect>
