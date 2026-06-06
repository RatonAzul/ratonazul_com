<script lang="ts">
    import type {Driver, PositionBetDraft} from "$lib/types/motorsport";
    import {searchDriverById} from "$lib/utils/motorsport/pick-the-grid/drivers";
    import {Select} from "bits-ui";
    import {getPositionBetPointColors} from "$lib/utils/motorsport/pick-the-grid/bets";

    let { drivers, bet = $bindable(), disabled, onDriverSelected }: {
        drivers: Driver[],
        bet: PositionBetDraft,
        disabled: boolean,
        takenDriverIds?: number[],
        onDriverSelected?: (driverId: number) => void
    } = $props();

    let selectedDriver = $derived(searchDriverById(drivers, bet.guessedDriverId));
    let selectedDriverId = $derived(bet?.guessedDriverId?.toString() || undefined);

    function onValueChange(value: string | undefined) {
        const id = Number(value);
        bet.guessedDriverId = id;
        if (id) onDriverSelected?.(id);
    }
</script>

<div class="flex gap-2 h-10">
    <div class="flex justify-center items-center aspect-square {bet.position === 1 ? 'bg-red text-bg0' : 'bg-bg1'}">{bet.position}</div>
    <div class="bg-bg1 flex justify-between flex-1">
        <Select.Root type="single" value={selectedDriverId} onValueChange={onValueChange} {disabled}>
            <Select.Trigger class=" {disabled ? '' : 'hover:cursor-pointer hover:bg-bg2'} w-full {selectedDriver ? 'border-' + selectedDriver.teamColor : 'border-l-transparent'} border-l-8">
                <span class="flex flex-col ps-4 items-start justify-center text-sm">
                    {#if selectedDriver}
                        <span>{selectedDriver.firstName} {selectedDriver.lastName}</span>
                        <span class="text-{selectedDriver.teamColor} text-sm">{selectedDriver.teamName}</span>
                    {:else}
                        <span class="text-gray-dark">{disabled ? 'bet is closed' : 'Select a driver'}</span>
                    {/if}
                </span>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content style="width: var(--bits-select-anchor-width)" sideOffset={8} align="start" class="font-jetbrains max-h-50 overflow-y-auto w-full">
                    <Select.Viewport>
                        {#each drivers as driver}
                            <Select.Item
                                    value={driver.id.toString()}
                                    class="w-full text-sm h-10 ps-4 flex flex-col justify-center hover:cursor-pointer border-l-8 border-{driver.teamColor}
                                       bg-bg2 hover:bg-bg3">
                                <p class="text-fg0">{driver.firstName} {driver.lastName}</p>
                                <p class="text-{driver.teamColor} text-sm">{driver.teamName}</p>
                            </Select.Item>
                        {/each}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
        <span class="text-bg0 {disabled && bet.points === null || bet.points === undefined ? 'bg-gray-dark' : getPositionBetPointColors(bet.points)} text-lg flex justify-center items-center aspect-square">
            {bet.points !== undefined && bet.points !== null ? '+' + bet.points : '-'}
        </span>
    </div>
</div>