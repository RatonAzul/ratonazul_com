<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';
    import { profileColors } from '$lib/utils/profile-colors';

    let { color }: { color: (typeof profileColors)[number] } = $props();
    let selected = $derived<string>(color);
    const eventTypeColors = profileColors.filter((option) => option !== 'purple');
</script>

<div class="form-label">
    <span>color</span>
    <Select.Root type="single" name="color" bind:value={selected}>
        <Select.Trigger class="form-field flex items-center justify-between gap-2" aria-label={`color: ${selected}`}>
            <span class="size-5 border border-bg3" style:background-color={`var(--${selected})`}></span>
            <CaretDownIcon size={14} aria-hidden="true" />
        </Select.Trigger>
        <Select.Portal>
            <Select.Content class="menu-panel z-10" sideOffset={4} align="start">
                <Select.Viewport>
                    {#each eventTypeColors as option (option)}
                        <Select.Item class="menu-item" value={option} label={option} aria-label={option} title={option}>
                            {#snippet children({ selected })}
                                <span class="size-5 border border-bg3" style:background-color={`var(--${option})`}></span>
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
