<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h1 class="text-aqua mb-2 font-semibold">
    {@render children()}
</h1>