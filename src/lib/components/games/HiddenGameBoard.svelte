<script lang="ts">
    import GameBoard from '$lib/components/shared/GameBoard.svelte';
    let { isaac = false }: { isaac?: boolean } = $props();
    const wordleRows = Array<string>(4).fill('xxxxx');
    const isaacRows = Array<string>(4).fill('xxxx');
</script>

<div role="img" aria-label="Result hidden">
    <div aria-hidden="true">
        <GameBoard rows={isaac ? isaacRows : wordleRows} {isaac} compact />
    </div>
</div>
