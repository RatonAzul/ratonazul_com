<script lang="ts">
    import EventTypeIcon from './EventTypeIcon.svelte';
    import FormSelect from './FormSelect.svelte';
    import type { CalendarEventType } from '$lib/server/calendar/events';

    let {
        types, value = null, optional = false
    }: { types: CalendarEventType[]; value?: number | null; optional?: boolean } = $props();

    let selected = $derived(value == null ? '' : String(value));
    let typesById = $derived(new Map(types.map((type) => [String(type.id), type])));
    let options = $derived([
        ...(optional ? [{ value: '', label: 'automatic events off' }] : []),
        ...types.map((type) => ({ value: String(type.id), label: type.name }))
    ]);
</script>

<FormSelect label="event type" name="typeId" {options} bind:value={selected} required={!optional} placeholder="choose a type">
    {#snippet optionContent(option)}
        {@const type = typesById.get(option.value)}
        <span class="flex min-w-0 items-center gap-2">
            {#if type?.icon}<EventTypeIcon icon={type.icon} color={type.color} />{/if}
            <span class="truncate">{option.label}</span>
        </span>
    {/snippet}
</FormSelect>
