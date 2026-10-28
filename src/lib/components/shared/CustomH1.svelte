<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h1 class="text-blue text-3xl font-semibold mb-4 sm:text-4xl">
    {@render children()}
</h1>
