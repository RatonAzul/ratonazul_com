<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';
    import EventTypeIcon from '$lib/components/shared/EventTypeIcon.svelte';
    import type { CalendarEventType } from '$lib/server/calendar/events';

    let { types, value = null }: { types: CalendarEventType[]; value?: number | null } = $props();
    let selected = $derived(value == null ? '' : String(value));
    let selectedType = $derived(types.find((type) => String(type.id) === selected));
</script>

{#snippet typeLabel(type: CalendarEventType)}
    <span class="flex min-w-0 items-center gap-2" style:color={`var(--${type.color})`}>
        <EventTypeIcon icon={type.icon} />
        <span class="truncate">{type.name}</span>
    </span>
{/snippet}

<div class="form-label">
    <span id="calendar-event-type-label">event type</span>
    <Select.Root type="single" name="typeId" bind:value={selected} required>
        <Select.Trigger class="form-field flex items-center justify-between gap-2" aria-labelledby="calendar-event-type-label">
            {#if selectedType}
                {@render typeLabel(selectedType)}
            {:else}
                <span>choose a type</span>
            {/if}
            <CaretDownIcon size={14} class="shrink-0" aria-hidden="true" />
        </Select.Trigger>
        <Select.Portal>
            <Select.Content class="menu-panel z-10" sideOffset={4} align="start">
                <Select.Viewport class="max-h-60 overflow-y-auto">
                    {#each types as type (type.id)}
                        <Select.Item class="menu-item" value={String(type.id)} label={type.name}>
                            {#snippet children({ selected })}
                                {@render typeLabel(type)}
                                <span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                                    {#if selected}<CheckIcon size={14} />{/if}
                                </span>
                            {/snippet}
                        </Select.Item>
                    {/each}
                </Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </Select.Root>
</div>
