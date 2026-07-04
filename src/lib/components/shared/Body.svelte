<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<main class="w-full mt-8 px-4">
    {@render children()}
</main>