<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<main class="w-full mt-8 lg:px-4 px-0">
    {@render children()}
</main>