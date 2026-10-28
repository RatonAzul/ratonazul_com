<script lang="ts">
    let { children, subtitle = null }: { children?: any, subtitle?: string } = $props();
</script>
<h2 class="text-green text-xl font-semibold mb-3 sm:text-2xl">
    {@render children()}
    {#if subtitle}
        <span class="block text-sm text-gray sm:text-base">{subtitle}</span>
    {/if}
</h2>
