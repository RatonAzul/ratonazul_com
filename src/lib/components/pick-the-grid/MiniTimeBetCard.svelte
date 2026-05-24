<script lang="ts">
    import type {TimeBet} from "$lib/types/motorsport.ts";
    import {getF1TimeFromMilliseconds, getTimeBetPointsColor} from "$lib/utils/motorsport/pick-the-grid/bets.ts";

    let { timeBet }: { timeBet: TimeBet } = $props();
</script>
<div class="flex gap-1 text-[0.70rem] h-6 text-bg0">
    <div class="bg-bg1 text-gray flex-1 flex justify-center items-center">{getF1TimeFromMilliseconds(timeBet.guessedTime)}</div>
    <div class="{timeBet.points !== null && timeBet.points !== undefined ? getTimeBetPointsColor(timeBet.points) : 'bg-gray-dark'} w-6 flex justify-center items-center">
        {timeBet.points !== null && timeBet.points !== undefined ? '+' + timeBet.points : '-'}
    </div>
</div>