<script lang="ts">
    import { EyeIcon, EyeSlashIcon } from 'phosphor-svelte';
    import { showCrt, theme, toggleShowCrt } from '$lib/stores/globalSettings';
    import ColorPalette from './ColorPalette.svelte';
    let { compact = true }: { compact?: boolean } = $props();
    const themes = ['ratonazul', 'gruvbox'];
</script>

<div class="flex flex-col items-start">
    <div class="flex items-center gap-2 {compact ? 'text-secondary' : 'text-body'}" role="group" aria-label="color palette">
        {#each themes as option, index (option)}
            {#if index > 0}<span class="text-gray" aria-hidden="true">·</span>{/if}
            <button type="button" class="{compact ? 'min-h-7' : 'min-h-10'} cursor-pointer hover:underline {theme.current === option ? 'text-purple underline' : 'text-fg0'}"
                aria-pressed={theme.current === option} onclick={() => theme.current = option}>{option}</button>
        {/each}
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-0">
        <ColorPalette size={compact ? 'small' : 'big'} />
        <button type="button" class="inline-flex cursor-pointer items-center gap-1 text-gray hover:text-fg0 {compact ? 'min-h-8 text-meta' : 'min-h-10 text-body'}"
            aria-label="crt effect" aria-pressed={showCrt.current} onclick={toggleShowCrt}>
            {#if showCrt.current}<EyeIcon class={compact ? 'size-4' : 'size-5'} />{:else}<EyeSlashIcon class={compact ? 'size-4' : 'size-5'} />{/if} crt
        </button>
    </div>
</div>
