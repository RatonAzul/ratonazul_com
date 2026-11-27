<script module lang="ts">
    export type SelectOption = { value: string; label: string; disabled?: boolean; accent?: string };
</script>

<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';
    import type { Snippet } from 'svelte';

    let {
        label, name, options, value = $bindable(''), required = false, placeholder = 'choose an option', optionContent, compact = false
    }: {
        label: string;
        name: string;
        options: SelectOption[];
        value?: string;
        required?: boolean;
        placeholder?: string;
        optionContent?: Snippet<[SelectOption]>;
        compact?: boolean;
    } = $props();

    let selected = $derived(options.find((option) => option.value === value));
</script>

{#snippet optionLabel(option: SelectOption)}
    {#if optionContent}
        {@render optionContent(option)}
    {:else}
        <span class="min-w-0 truncate">{option.label}</span>
    {/if}
{/snippet}

<div class="form-label min-w-0 {compact ? 'text-meta' : ''}">
    <span>{label}</span>
    <Select.Root type="single" {name} items={options} {required} bind:value>
        <Select.Trigger class="form-field flex w-full cursor-pointer items-center justify-between gap-2 text-left {compact ? 'min-h-0 text-meta' : ''} {selected?.accent ? 'border-r-4' : ''}"
            style={selected?.accent ? `border-right-color: var(--${selected.accent})` : undefined}
            aria-label={selected ? label + ': ' + selected.label : label}>
            {#if selected}
                {@render optionLabel(selected)}
            {:else}
                <span class="text-gray">{placeholder}</span>
            {/if}
            <CaretDownIcon size={14} class="shrink-0" aria-hidden="true" />
        </Select.Trigger>
        <Select.Portal>
            <Select.Content class="menu-panel z-30 min-w-(--bits-select-anchor-width)" sideOffset={4} align="start">
                <Select.Viewport class="max-h-60 overflow-y-auto">
                    {#each options as option (option.value)}
                        <Select.Item class="menu-item justify-between data-disabled:cursor-not-allowed data-disabled:opacity-50 {compact ? 'text-meta' : ''} {option.accent ? 'border-r-4' : ''}"
                            style={option.accent ? `border-right-color: var(--${option.accent})` : undefined}
                            value={option.value} label={option.label} aria-label={option.label} disabled={option.disabled}>
                            {#snippet children({ selected })}
                                {@render optionLabel(option)}
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
