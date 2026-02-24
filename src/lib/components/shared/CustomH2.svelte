<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h1 class="text-red text-2xl font-semibold mb-2">
    {@render children()}
</h1>