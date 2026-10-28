<script lang="ts">
    type BreadcrumbItem = {
        label: string;
        href?: string;
    };

    let { items }: { items: BreadcrumbItem[] } = $props();
</script>

{#if items.length > 1}
    <nav class="text-gray text-sm flex items-center gap-2 mb-6" aria-label="Admin breadcrumb">
        {#each items as item, index}
            {#if index > 0}
                <span aria-hidden="true">/</span>
            {/if}
            {#if item.href}
                <a class="cursor-pointer hover:text-gray-dark" href={item.href}>{item.label}</a>
            {:else}
                <span>{item.label}</span>
            {/if}
        {/each}
    </nav>
{/if}
