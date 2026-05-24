<script lang="ts">
    import type {TimeBet} from "$lib/types/motorsport.ts";
    import {getF1TimeFromMilliseconds, getPositionBetPointColors} from "$lib/utils/motorsport/pick-the-grid/bets.ts";

    let { timeBet }: { timeBet: TimeBet } = $props();
</script>
<div class="flex gap-1 text-xs h-6 text-bg0">
    <div class="bg-bg1 text-gray text-xs flex-1 flex justify-center items-center">{getF1TimeFromMilliseconds(timeBet.guessedTime)}</div>
    <div class="{timeBet.points !== null && timeBet.points !== undefined ? getPositionBetPointColors(timeBet.points) : 'bg-gray-dark'} w-6 flex justify-center items-center">
        {timeBet.points !== null && timeBet.points !== undefined ? '+' + timeBet.points : '-'}
    </div>
</div>