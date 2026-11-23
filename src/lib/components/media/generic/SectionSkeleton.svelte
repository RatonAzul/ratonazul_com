<script lang="ts">
    import ColoredSectionTitle from "$lib/components/shared/ColoredSectionTitle.svelte";

    let {titleInProgress, titleCompleted}: {
        titleInProgress: string,
        titleCompleted: string
    } = $props()
</script>

<div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col gap-2 w-full">
        <ColoredSectionTitle title={titleInProgress} bgColor="bg-yellow" />
        <div class="surface-card h-42 w-full animate-pulse"></div>
    </div>
    <div class="flex flex-col gap-2 w-full">
        <ColoredSectionTitle title={titleCompleted} bgColor="bg-green" />
        {#each Array(3) as _, i}
            <div class="surface-card h-20 w-full"></div>
        {/each}
    </div>
</div>
