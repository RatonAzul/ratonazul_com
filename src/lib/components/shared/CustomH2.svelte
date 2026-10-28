<script lang="ts">
    let { children, subtitle = null }: { children?: any, subtitle?: string } = $props();
</script>
<h1 class="text-green text-2xl font-semibold mb-2">
    {@render children()}
    {#if subtitle}
        <span class="text-base block text-gray">2 registered users</span>
    {/if}
</h1>