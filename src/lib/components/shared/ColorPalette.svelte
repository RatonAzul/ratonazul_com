<script lang="ts">
    const colors = [
        "bg-red-dark", "bg-green-dark", "bg-yellow-dark", "bg-blue-dark", "bg-purple-dark", "bg-aqua-dark", "bg-gray-dark",
        "bg-red", "bg-green", "bg-yellow", "bg-blue", "bg-purple", "bg-aqua", "bg-gray",
    ];
    let { size = 'big' }: { size?: 'small' | 'medium' | 'big' } = $props();
    const widths = { small: 'w-28 sm:w-42', medium: 'w-42 sm:w-56', big: 'w-56 lg:w-84' };
    const heights = { small: 'h-2 sm:h-3', medium: 'h-3 sm:h-4', big: 'h-4 lg:h-6' };
</script>

<div class="grid max-w-full grid-cols-7 {widths[size]}">
    {#each colors as color}
        <div class="{color} {heights[size]}"></div>
    {/each}
</div>