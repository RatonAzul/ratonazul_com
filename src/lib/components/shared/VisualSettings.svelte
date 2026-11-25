<script lang="ts">
    import { CheckIcon } from 'phosphor-svelte';
    import { showCrt, theme } from '$lib/stores/globalSettings';
    import SettingsSwitch from './SettingsSwitch.svelte';
    import ColorPalette from './ColorPalette.svelte';

    let { compact = true }: { compact?: boolean } = $props();
    const themes = ['ratonazul', 'gruvbox'];
</script>

<div class="flex min-w-0 flex-col items-start {compact ? 'gap-2' : 'gap-5'}">
    <div class="flex min-w-0 max-w-full flex-col items-start gap-2">
        {#if !compact}<h3 class="plain-h3">color palette</h3>{/if}
        <div class="flex w-fit max-w-full flex-col items-stretch gap-1 text-secondary" role="group" aria-label="color palette">
            {#each themes as option (option)}
                <button type="button" class="theme-{option} grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_9ch_1rem] items-center gap-2 bg-bg2 px-2 py-1 text-left text-fg0 hover:bg-bg3
                    {compact ? 'min-h-7' : 'min-h-10'}"
                    aria-pressed={theme.current === option} onclick={() => theme.current = option}>
                    <span class="min-w-0" aria-hidden="true">
                        <ColorPalette size={compact ? 'small' : 'medium'} />
                    </span>
                    <span class="shrink-0">{option}</span>
                    <span class="flex size-4 items-center justify-center" aria-hidden="true">
                        {#if theme.current === option}<CheckIcon class="size-4" />{/if}
                    </span>
                </button>
            {/each}
        </div>
    </div>
    <SettingsSwitch checked={showCrt.current} onChange={(checked) => showCrt.current = checked}
        label={showCrt.current ? 'hide crt effect' : 'show crt effect'} accessibleLabel="crt effect" />
</div>
