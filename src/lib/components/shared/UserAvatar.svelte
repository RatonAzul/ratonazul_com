<script lang="ts">
    let { image, name }: { image?: string | null; name: string } = $props();
    let failedImage = $state('');
</script>

{#if image && image !== failedImage}
    {@const src = image}
    {#key src}
        <img {src} alt="" class="size-10 shrink-0 object-cover" onerror={() => failedImage = src} />
    {/key}
{:else}
    <span class="flex size-10 shrink-0 items-center justify-center bg-bg3 font-semibold text-blue" aria-hidden="true">
        {(name || '?').slice(0, 1).toUpperCase()}
    </span>
{/if}
