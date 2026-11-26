<script lang="ts">
    import { parseDate } from '@internationalized/date';
    import { DatePicker } from 'bits-ui';
    import { CalendarIcon, CaretLeftIcon, CaretRightIcon, XIcon } from 'phosphor-svelte';
    import { validDate } from '$lib/utils/shared/calendar';

    let { label, name, value = $bindable(''), min, max, required = false }: {
        label: string;
        name: string;
        value?: string;
        min: string;
        max?: string;
        required?: boolean;
    } = $props();

    const selected = $derived(validDate(value) ? parseDate(value) : undefined);
    const minimum = $derived(parseDate(min));
    const maximum = $derived(max ? parseDate(max) : undefined);
</script>

<div class="form-label">
    <input type="hidden" {name} value={selected?.toString() ?? ''} />
    <DatePicker.Root locale="en-GB" weekStartsOn={1} weekdayFormat="short" calendarLabel={label}
        value={selected} onValueChange={(date) => value = date?.toString() ?? ''}
        minValue={minimum} maxValue={maximum} placeholder={selected ?? minimum} {required} preventDeselect disableDaysOutsideMonth>
        <DatePicker.Label>{label}</DatePicker.Label>
        <div class="form-field flex items-center gap-2 py-0 focus-within:border-purple">
            <DatePicker.Input class="flex flex-1 tabular-nums">
                {#snippet children({ segments })}
                    {#each segments as { part, value: text }}
                        <DatePicker.Segment {part} class="focus-visible:bg-purple focus-visible:text-bg0 data-placeholder:text-gray">
                            {text}
                        </DatePicker.Segment>
                    {/each}
                {/snippet}
            </DatePicker.Input>
            {#if !required && selected}
                <button type="button" class="button button-quiet min-h-0 p-1" aria-label={`Clear ${label}`} onclick={() => value = ''}>
                    <XIcon size={14} aria-hidden="true" />
                </button>
            {/if}
            <DatePicker.Trigger class="button button-quiet min-h-0 p-1" aria-label={`Choose ${label}`}>
                <CalendarIcon size={18} aria-hidden="true" />
            </DatePicker.Trigger>
        </div>
        <DatePicker.Portal>
            <DatePicker.Content class="menu-panel z-20 p-2" sideOffset={4} align="start">
                <DatePicker.Calendar>
                    {#snippet children({ months, weekdays })}
                        <DatePicker.Header class="mb-2 flex items-center justify-between gap-2">
                            <DatePicker.PrevButton class="action-icon size-8" aria-label="Previous month">
                                <CaretLeftIcon size={16} aria-hidden="true" />
                            </DatePicker.PrevButton>
                            <DatePicker.Heading />
                            <DatePicker.NextButton class="action-icon size-8" aria-label="Next month">
                                <CaretRightIcon size={16} aria-hidden="true" />
                            </DatePicker.NextButton>
                        </DatePicker.Header>
                        {#each months as month (month.value.toString())}
                            <DatePicker.Grid class="border-separate border-spacing-1 text-center">
                                <DatePicker.GridHead>
                                    <DatePicker.GridRow>
                                        {#each weekdays as weekday (weekday)}
                                            <DatePicker.HeadCell class="text-meta font-normal text-gray">{weekday}</DatePicker.HeadCell>
                                        {/each}
                                    </DatePicker.GridRow>
                                </DatePicker.GridHead>
                                <DatePicker.GridBody>
                                    {#each month.weeks as week (week[0].toString())}
                                        <DatePicker.GridRow>
                                            {#each week as date (date.toString())}
                                                <DatePicker.Cell {date} month={month.value}>
                                                    <DatePicker.Day class="flex size-8 cursor-pointer items-center justify-center bg-bg2 hover:bg-bg3 data-disabled:cursor-default data-disabled:bg-bg0 data-disabled:text-gray-dark data-selected:bg-purple data-selected:text-bg0" />
                                                </DatePicker.Cell>
                                            {/each}
                                        </DatePicker.GridRow>
                                    {/each}
                                </DatePicker.GridBody>
                            </DatePicker.Grid>
                        {/each}
                    {/snippet}
                </DatePicker.Calendar>
            </DatePicker.Content>
        </DatePicker.Portal>
    </DatePicker.Root>
</div>
