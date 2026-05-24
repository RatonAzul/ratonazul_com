<script lang="ts">
    import MeetingsCarousel from "$lib/components/pick-the-grid/MeetingsCarousel.svelte";
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH1 from "$lib/components/shared/CustomH1.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import {createMeetingsBySeasonQuery} from "$lib/queries/motorsport/meetings";
    import {getCurrentMeetingIndex} from "$lib/utils/motorsport/pick-the-grid/meetings";
    import BetComponent from "$lib/components/pick-the-grid/BetComponent.svelte";
    import {createDriversBySeasonQuery} from "$lib/queries/motorsport/drivers";
    import {CURRENT_YEAR} from "$lib/utils/shared/general";
    import {createPositionBetsByUserAndMeeting} from "$lib/queries/motorsport/positionBets";
    import {authClient} from "$lib/auth-client";
    import {createTimeBetsByUserAndMeeting} from "$lib/queries/motorsport/timeBets";
    import PointInfo from "$lib/components/pick-the-grid/PointInfo.svelte";
    import {createStandingsBySeasonQuery} from "$lib/queries/motorsport/standings";
    import StandingsTable from "$lib/components/pick-the-grid/StandingsTable.svelte";
    import {createMeetingBetsByMeetingId} from "$lib/queries/motorsport/meetingBets.ts";
    import MeetingBetsComponent from "$lib/components/pick-the-grid/MeetingBetsComponent.svelte";

    const session = authClient.useSession();

    const meetings = createMeetingsBySeasonQuery(CURRENT_YEAR);
    const drivers = createDriversBySeasonQuery(CURRENT_YEAR);
    const standings = createStandingsBySeasonQuery(CURRENT_YEAR);

    let selectedMeetingIndex = $derived(getCurrentMeetingIndex(meetings.data))
    let selectedMeeting = $derived(meetings.data ? meetings.data[selectedMeetingIndex] : undefined)

    let userId = $derived($session.data?.user.id ?? '');
    let meetingId = $derived(selectedMeeting?.id ?? 0);

    let positionBets = $derived(createPositionBetsByUserAndMeeting(userId, meetingId));
    let timeBets = $derived(createTimeBetsByUserAndMeeting(userId, meetingId));
    let meetingBets = $derived(createMeetingBetsByMeetingId(meetingId));

</script>

<Body>
    <CustomH1>pick the grid</CustomH1>
    <MeetingsCarousel bind:selectedMeetingIndex={selectedMeetingIndex} {meetings}/>
    <CustomH2>your picks</CustomH2>
    <BetComponent meeting={selectedMeeting} {drivers} {positionBets} {timeBets}/>
    <MeetingBetsComponent {meetingBets} {drivers} />
    <div>
        <CustomH2>standings</CustomH2>
        <div class="grid grid-cols-1 gap-2">
            <StandingsTable {standings} {meetings} />
            <PointInfo/>
        </div>
    </div>
</Body>