<script lang="ts">
    let { children }: { children?: any } = $props();
</script>
<h3 class="text-gray mb-2 font-semibold">
    {@render children()}
</h3>
