<script lang="ts">
    import { EyeIcon, EyeSlashIcon } from 'phosphor-svelte';

    let { highlighted }: { highlighted: boolean } = $props();
    let enabled = $derived(highlighted);
</script>

<input type="hidden" name="isHighlighted" value={enabled ? 'on' : 'off'} />
<button type="button" class="action-icon" class:bg-bg2={!enabled} class:text-gray={!enabled} aria-label="Highlight calendar days"
    title={enabled ? 'Highlighting on' : 'Highlighting off'} aria-pressed={enabled}
    onclick={() => enabled = !enabled}>
    {#if enabled}
        <EyeIcon size={18} aria-hidden="true" />
    {:else}
        <EyeSlashIcon size={18} aria-hidden="true" />
    {/if}
</button>
