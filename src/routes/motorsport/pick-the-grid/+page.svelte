<script>
    import MeetingsCarousel from "$lib/components/pick-the-grid/MeetingsCarousel.svelte";
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import StandingsCard from "$lib/components/pick-the-grid/StandingsCard.svelte";
    import {createMeetingsBySeasonQuery} from "$lib/queries/motorsport/meetings";
    import {getCurrentMeetingIndex} from "$lib/utils/motorsport/pick-the-grid/meetings";
    import BetComponent from "$lib/components/pick-the-grid/BetComponent.svelte";
    import {createDriversBySeasonQuery} from "$lib/queries/motorsport/drivers";
    import {CURRENT_YEAR} from "$lib/utils/shared/general";

    const meetings = createMeetingsBySeasonQuery(CURRENT_YEAR);
    const drivers = createDriversBySeasonQuery(CURRENT_YEAR);

    let selectedMeetingIndex = $derived(getCurrentMeetingIndex(meetings.data))
    let selectedMeeting = $derived(meetings.data ? meetings.data[selectedMeetingIndex] : undefined)

</script>

<Body>
    <CustomH1>pick the grid</CustomH1>
    <MeetingsCarousel bind:selectedMeetingIndex={selectedMeetingIndex} {meetings}/>
    <CustomH2>your picks</CustomH2>
    <BetComponent meeting={selectedMeeting}/>
    <div>
        <CustomH2>standings</CustomH2>
        <div class="grid grid-cols-1 gap-2">
            <StandingsCard/>
            <StandingsCard/>
        </div>
    </div>
</Body>