<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<main class="bg-green w-full">
    {@render children()}
</main>