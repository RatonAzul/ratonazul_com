<script lang="ts">
    import type { Component } from 'svelte';
    let { icon: Icon, color }: { icon: Component<{ class?: string }>; color: string } = $props();
</script>

<span class="flex size-7 shrink-0 items-center justify-center text-bg0" style:background-color={'var(--' + color + ')'} aria-hidden="true">
    <Icon class="size-4" />
</span>
