<script lang="ts">
    import type { Component } from 'svelte';
    let { icon: Icon, color, compact = false }: { icon: Component<{ class?: string }>; color: string; compact?: boolean } = $props();
</script>

<span class="flex shrink-0 items-center justify-center text-bg0 {compact ? 'size-6' : 'size-7'}" style:background-color={'var(--' + color + ')'} aria-hidden="true">
    <Icon class={compact ? 'size-3.5' : 'size-4'} />
</span>
