<script>
    import MeetingsCarousel from "$lib/components/pick-the-grid/MeetingsCarousel.svelte";
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import DriverBetCard from "$lib/components/pick-the-grid/DriverBetCard.svelte";
    import TimeBetCard from "$lib/components/pick-the-grid/TimeBetCard.svelte";
    import StandingsCard from "$lib/components/pick-the-grid/StandingsCard.svelte";
    import CustomH3 from "$lib/components/shared/CustomH3.svelte";
</script>

<Body>
    <CustomH1>pick the grid</CustomH1>
    <MeetingsCarousel/>
    <CustomH2>your picks</CustomH2>
    <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
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
    </div>

    <div>
        <CustomH2>standings</CustomH2>
        <div class="grid grid-cols-1 gap-2">
            <StandingsCard/>
            <StandingsCard/>
        </div>
    </div>
</Body>