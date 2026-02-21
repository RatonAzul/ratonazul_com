<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h1 class="text-green text-3xl font-semibold mb-4">
    {@render children()}
</h1>