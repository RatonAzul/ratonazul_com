<script lang="ts">
    import { CheckIcon } from 'phosphor-svelte';
    import { defaultProfileColor, profileColors } from '$lib/utils/profile-colors';

    let { color = $bindable(defaultProfileColor), name }: {
        color?: (typeof profileColors)[number];
        name?: string;
    } = $props();
</script>

<fieldset>
    <legend class="mb-1 text-secondary text-gray">profile color</legend>
    {#if name}<input type="hidden" {name} value={color} />{/if}
    <div class="flex flex-wrap gap-1">
        {#each profileColors as option (option)}
            <button type="button" class="flex size-8 shrink-0 cursor-pointer items-center justify-center text-bg0 hover:brightness-110"
                style:background-color={`var(--${option})`} aria-label={option} aria-pressed={color === option}
                onclick={() => color = option}>
                {#if color === option}<CheckIcon class="size-4" aria-hidden="true" />{/if}
            </button>
        {/each}
    </div>
</fieldset>
