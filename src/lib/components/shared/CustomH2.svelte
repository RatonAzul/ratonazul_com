<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, subtitle = '', headingClass = '', class: className = '' }: {
        children: Snippet;
        subtitle?: string;
        class?: string;
        headingClass?: string;
    } = $props();
</script>

<div class={className}>
    <h2 class={headingClass}>{@render children()}</h2>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
</div>
