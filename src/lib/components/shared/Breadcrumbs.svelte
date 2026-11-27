<script module lang="ts">
    export type BreadcrumbItem = {
        label: string;
        href?: string;
    };

</script>

<script lang="ts">
    let { items, label = 'Breadcrumb', showSingle = false, class: className = 'mb-6' }: {
        items: BreadcrumbItem[];
        label?: string;
        showSingle?: boolean;
        class?: string;
    } = $props();
</script>

{#if showSingle || items.length > 1}
    <nav class="flex flex-wrap items-center gap-2 text-secondary text-gray {className}" aria-label={label}>
        {#each items as item, index}
            {#if index > 0}
                <span aria-hidden="true">/</span>
            {/if}
            {#if item.href}
                <a class="internal-link" href={item.href}>[{item.label}]</a>
            {:else}
                <span>{item.label}</span>
            {/if}
        {/each}
    </nav>
{/if}
