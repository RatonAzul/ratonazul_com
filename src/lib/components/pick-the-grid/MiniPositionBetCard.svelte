<script lang="ts">
    import type {Driver, PositionBet} from "$lib/types/motorsport.ts";
    import {getPositionBetPointColors} from "$lib/utils/motorsport/pick-the-grid/bets.ts";
    import {searchDriverById} from "$lib/utils/motorsport/pick-the-grid/drivers.ts";

    let { positionBet, driverList }: { positionBet: PositionBet, driverList: Driver[]} = $props();
    let driver = $derived(searchDriverById(driverList, positionBet.guessedDriverId))
</script>

<div class="flex gap-1 text-xs h-6">
    <div class="{positionBet.position === 1 ? 'bg-red text-bg0' : 'bg-bg1 text-gray'} aspect-square flex justify-center items-center">{positionBet.position}</div>
    <div class="text-bg0 flex justify-center items-center w-12 bg-{driver.teamColor}">{driver.acronym}</div>
    <div class="{positionBet.points !== null && positionBet.points !== undefined  ? getPositionBetPointColors(positionBet.points) : 'bg-gray-dark'} text-bg0 aspect-square flex justify-center items-center">
        {positionBet.points !== null && positionBet !== undefined ? '+' + positionBet.points : '-'}
    </div>
</div>