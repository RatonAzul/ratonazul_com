<script lang="ts">
    import type {Meeting} from "$lib/types/motorsport";
    import CustomH3 from "$lib/components/shared/CustomH3.svelte";
    import DriverBetCard from "$lib/components/pick-the-grid/DriverBetCard.svelte";
    import TimeBetCard from "$lib/components/pick-the-grid/TimeBetCard.svelte";

    let { meeting }: { meeting?: Meeting } = $props();
</script>

{#if meeting}
    <section class="grid sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
        {#if meeting.isSprint}
            <div>
                <CustomH3>sprint qualy</CustomH3>
                <div class="flex flex-col gap-2">
                    <DriverBetCard/>
                </div>
            </div>
            <div>
                <CustomH3>sprint race</CustomH3>
                <div class="flex flex-col gap-2">
                    <DriverBetCard/>
                </div>
            </div>
        {/if}
        <div>
            <CustomH3>qualy</CustomH3>
            <div class="flex flex-col gap-2">
                <DriverBetCard/>
                <TimeBetCard/>
            </div>
        </div>
        <div>
            <CustomH3>race</CustomH3>
            <div class="flex flex-col gap-2">
                <DriverBetCard/>
                <DriverBetCard/>
                <DriverBetCard/>
                <DriverBetCard/>
                <DriverBetCard/>
            </div>
        </div>
    </section>
{:else}
    <div>loading</div>
{/if}
