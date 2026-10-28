<script lang="ts">
    import AdminBreadcrumbs from "$lib/components/admin/AdminBreadcrumbs.svelte";

    type BreadcrumbItem = {
        label: string;
        href?: string;
    };

    let { children, items }: { children?: any; items: BreadcrumbItem[] } = $props();
</script>

<h1 class="text-blue text-4xl font-semibold {items.length > 1 ? 'mb-1' : 'mb-6'}">
    {@render children()}
</h1>
<AdminBreadcrumbs {items} />
