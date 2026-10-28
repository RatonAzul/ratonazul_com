<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h3 class="text-gray mb-2 text-sm font-semibold sm:text-base">
    {@render children()}
</h3>
