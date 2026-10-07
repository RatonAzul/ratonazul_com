<script lang="ts">
    let { score, maxScore }: {
        score: number
        maxScore: number
    } = $props()

    const displayMaxScore = maxScore === 100 ? 10 : maxScore
    const displayScore = score * displayMaxScore / maxScore
</script>

<div class="flex gap-1 justify-center items-center pb-1">
    {#each Array(displayMaxScore) as _, i}
        {@const filled = displayScore - i}

        <div class="lg:size-3 size-2 relative overflow-hidden bg-gray">
            {#if filled >= 1}
                <div class="absolute inset-0 bg-green"></div>
            {:else if filled > 0}
                <div
                        class="absolute top-0 bottom-0 left-0 bg-green"
                        style={`width: ${Math.min(filled, 1) * 100}%`}
                ></div>
            {/if}
        </div>
    {/each}
</div>