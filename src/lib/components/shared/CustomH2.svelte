<script lang="ts">
    let { children, subtitle = null }: { children?: any, subtitle?: string } = $props();
</script>
<h2 class="text-green text-2xl font-semibold mb-3">
    {@render children()}
    {#if subtitle}
        <span class="text-base block text-gray">{subtitle}</span>
    {/if}
</h2>
