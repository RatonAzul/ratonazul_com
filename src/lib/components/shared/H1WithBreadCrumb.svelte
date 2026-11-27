<script lang="ts">
    import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs.svelte';

    let { children, items }: { children?: any; items: BreadcrumbItem[] } = $props();
</script>

<h1 class="{items.length > 1 ? 'mb-1' : 'mb-6'}">
    {@render children()}
</h1>
<Breadcrumbs {items} label="Admin breadcrumb" />
