<script lang="ts">
    const colors = [
        "bg-red-dark", "bg-green-dark", "bg-yellow-dark", "bg-blue-dark", "bg-purple-dark", "bg-aqua-dark", "bg-gray-dark",
        "bg-red", "bg-green", "bg-yellow", "bg-blue", "bg-purple", "bg-aqua", "bg-gray",
    ];
</script>

<div class="grid grid-cols-7 w-fit">
    {#each colors as color}
        <div class="{color} w-12 h-6"></div>
    {/each}
</div>