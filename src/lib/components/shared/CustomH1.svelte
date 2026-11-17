<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, class: className = '' }: { children: Snippet; class?: string } = $props();
</script>
<h1 class="mb-6 {className}">
    {@render children()}
</h1>
