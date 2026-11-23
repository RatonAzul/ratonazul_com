<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon, MinusIcon } from 'phosphor-svelte';
    import EventTypeIcon from '$lib/components/shared/EventTypeIcon.svelte';
    import { calendarEventIcons, isCalendarEventIcon, type CalendarEventIcon } from '$lib/utils/calendar-event-icons';

    let { icon }: { icon: CalendarEventIcon | '' } = $props();
    let selected = $derived<string>(icon || 'none');
    let selectedIcon = $derived<CalendarEventIcon | ''>(isCalendarEventIcon(selected) ? selected : '');
    const options = { none: 'no icon', ...calendarEventIcons };
</script>

{#snippet preview(value: string)}
    <span class="flex size-5 items-center justify-center" aria-hidden="true">
        {#if isCalendarEventIcon(value)}
            <EventTypeIcon icon={value} />
        {:else}
            <MinusIcon size={16} />
        {/if}
    </span>
{/snippet}

<div class="form-label">
    <span>icon</span>
    <input type="hidden" name="icon" value={selectedIcon} />
    <Select.Root type="single" bind:value={selected}>
        <Select.Trigger class="form-field flex items-center justify-between gap-2"
            aria-label={`icon: ${selectedIcon ? calendarEventIcons[selectedIcon] : options.none}`}>
            {@render preview(selected)}
            <CaretDownIcon size={14} aria-hidden="true" />
        </Select.Trigger>
        <Select.Portal>
            <Select.Content class="menu-panel z-10" sideOffset={4} align="start">
                <Select.Viewport>
                    {#each Object.entries(options) as [value, label] (value)}
                        <Select.Item class="menu-item" {value} {label} aria-label={label} title={label}>
                            {#snippet children({ selected })}
                                {@render preview(value)}
                                <span class="flex size-4 items-center justify-center" aria-hidden="true">
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
