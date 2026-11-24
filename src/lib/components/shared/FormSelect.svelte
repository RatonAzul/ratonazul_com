<script module lang="ts">
    export type SelectOption = { value: string; label: string; disabled?: boolean };
</script>

<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';
    import type { Snippet } from 'svelte';

    let {
        label, name, options, value = $bindable(''), required = false, placeholder = 'choose an option', optionContent
    }: {
        label: string;
        name: string;
        options: SelectOption[];
        value?: string;
        required?: boolean;
        placeholder?: string;
        optionContent?: Snippet<[SelectOption]>;
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

<div class="form-label min-w-0">
    <span>{label}</span>
    <Select.Root type="single" {name} items={options} {required} bind:value>
        <Select.Trigger class="form-field flex w-full cursor-pointer items-center justify-between gap-2 text-left"
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
                        <Select.Item class="menu-item justify-between data-disabled:cursor-not-allowed data-disabled:opacity-50"
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
