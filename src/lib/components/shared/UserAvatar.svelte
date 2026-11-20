<script lang="ts">
    let { image, name, class: className = 'size-10' }: { image?: string | null; name: string; class?: string } = $props();
    let failedImage = $state('');
</script>

{#if image && image !== failedImage}
    {@const src = image}
    {#key src}
        <img {src} alt="" class="shrink-0 object-cover {className}" onerror={() => failedImage = src} />
    {/key}
{:else}
    <span class="flex shrink-0 items-center justify-center bg-bg3 font-semibold text-blue {className}" aria-hidden="true">
        {(name || '?').slice(0, 1).toUpperCase()}
    </span>
{/if}
