<script lang="ts">
    let { children, subtitle = "", class: className = "" }: { children?: any, subtitle?: string, class?: string } = $props();
</script>
<h2 class="text-green text-xl font-semibold sm:text-2xl {className}">
    {@render children()}
    {#if subtitle}
        <span class="block text-sm text-gray sm:text-base">{subtitle}</span>
    {/if}
</h2>
