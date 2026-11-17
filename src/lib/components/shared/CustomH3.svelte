<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h3 class="mb-2">
    {@render children()}
</h3>
