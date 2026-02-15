<script lang="ts">
    const colors = [
        "bg-red-dark", "bg-green-dark", "bg-yellow-dark", "bg-blue-dark", "bg-purple-dark", "bg-aqua-dark", "bg-gray-dark",
        "bg-red", "bg-green", "bg-yellow", "bg-blue", "bg-purple", "bg-aqua", "bg-gray",
    ];
    let { size = "big" }: { size?: string } = $props();
</script>

<div class="grid grid-cols-7 w-fit">
    {#each colors as color}
        <div class="{color} {size === 'small' ? 'sm:w-6 sm:h-3 w-4 h-2' : 'lg:w-12 lg:h-6 w-8 h-4'}"></div>
    {/each}
</div>