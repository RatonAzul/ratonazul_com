<script lang="ts">
    import { UserIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';

    let { image, showImage = false, color, class: className = 'size-10' }: {
        image?: string | null;
        showImage?: boolean | null;
        color?: string | null;
        class?: string;
    } = $props();
    let failedImage = $state('');
    let accent = $derived(isProfileColor(color) ? color : defaultProfileColor);
</script>

{#if showImage && image && image !== failedImage}
    {@const src = image}
    {#key src}
        <img {src} alt="" class="shrink-0 object-cover {className}" onerror={() => failedImage = src} />
    {/key}
{:else}
    <span class="flex shrink-0 items-center justify-center text-bg0 {className}"
        style:background-color={`var(--${accent})`} aria-hidden="true">
        <UserIcon class="size-1/2" />
    </span>
{/if}
