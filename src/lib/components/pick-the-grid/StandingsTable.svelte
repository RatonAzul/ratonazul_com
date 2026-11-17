<script lang="ts">
    import type {Meeting, StandingsTableRow} from "$lib/types/motorsport";
    import type {CreateQueryResult} from "@tanstack/svelte-query";
    import {authClient} from "$lib/auth-client";
    import {PUBLIC_ENVIRONMENT} from "$env/static/public";
    import {PersistedState} from "runed";

    let { standings, meetings, comparisonInfo = $bindable() }: {
        standings: CreateQueryResult<StandingsTableRow[], Error>,
        meetings: CreateQueryResult<Meeting[], Error>,
        comparisonInfo?: { selectedUsers: number; sharedRounds: number },
    } = $props();

    const currentMeeting = $derived(
        meetings.data?.find(m => new Date(m.endDate) > new Date())
    );

    const showDevelopmentFixture = $derived(
        PUBLIC_ENVIRONMENT !== 'prod' && standings.data?.length === 0 && !!meetings.data?.length
    );

    // Let real API standings take precedence over the development fallback.
    const displayStandings = $derived.by(() => {
        if (!showDevelopmentFixture || !meetings.data) {
            return standings.data;
        }

        const rounds = meetings.data;

        function missingRoundIndexes(playerIndex: number) {
            const roundCount = rounds.length;
            const missingCount = Math.min(5 + (playerIndex % 3), Math.max(0, roundCount - 1));
            const start = (playerIndex * 3) % roundCount;
            return new Set(Array.from({ length: missingCount }, (_, index) => (start + index) % roundCount));
        }

        const demoNames = ['paddock fox', 'late braker', 'apex ghost', 'pit wall'];
        const demoRows: StandingsTableRow[] = demoNames.map((username, rowIndex) => {
            const missingRounds = missingRoundIndexes(rowIndex);
            const meetingPoints = rounds.flatMap((meeting, meetingIndex) => {
                if (missingRounds.has(meetingIndex)) return [];
                return [{
                    meetingId: meeting.id,
                    points: ((meetingIndex + 1) * (rowIndex + 2) * 3) % 21,
                }];
            });

            return {
                userId: `demo-user-${rowIndex + 1}`,
                username,
                meetingPoints,
                totalPoints: meetingPoints.reduce((total, point) => total + point.points, 0),
                rank: 0,
            };
        });

        return demoRows
            .sort((left, right) => right.totalPoints - left.totalPoints)
            .map((standing, index) => ({ ...standing, rank: index + 1 }));
    });

    const session = authClient.useSession();
    const selectedUserIds = new PersistedState<string[]>("pick-the-grid-selected-users", []);
    let loggedUserId = $derived($session.data?.user.id);
    let selectionInitialized = $state(false);

    $effect(() => {
        if (selectionInitialized || !displayStandings) return;

        const currentId = loggedUserId;
        const hasStanding = currentId && displayStandings.some(standing => standing.userId === currentId);

        if (hasStanding && !selectedUserIds.current.includes(currentId)) {
            selectedUserIds.current = [currentId, ...selectedUserIds.current];
        }

        selectionInitialized = true;
    });

    // Saved selections can reference players from a previous season or dataset.
    const selectedStandings = $derived(
        displayStandings?.filter(standing => selectedUserIds.current.includes(standing.userId)) ?? []
    );
    const comparisonUserIds = $derived(selectedStandings.map(standing => standing.userId));

    const commonMeetingIds = $derived.by(() => {
        if (selectedStandings.length === 0) return undefined;

        return selectedStandings[0].meetingPoints
            .map(meetingPoint => meetingPoint.meetingId)
            .filter(meetingId => selectedStandings.every(standing =>
                standing.meetingPoints.some(meetingPoint => meetingPoint.meetingId === meetingId)
            ));
    });

    $effect(() => {
        comparisonInfo = {
            selectedUsers: comparisonUserIds.length,
            sharedRounds: commonMeetingIds?.length ?? 0,
        };
    });

    function toggleUser(userId: string) {
        selectedUserIds.current = selectedUserIds.current.includes(userId)
            ? selectedUserIds.current.filter(selectedId => selectedId !== userId)
            : [...selectedUserIds.current, userId];
    }

    function getDisplayedPoints(standing: StandingsTableRow) {
        if (commonMeetingIds === undefined) return standing.totalPoints;

        return standing.meetingPoints
            .filter(meetingPoint => commonMeetingIds.includes(meetingPoint.meetingId))
            .reduce((total, meetingPoint) => total + meetingPoint.points, 0);
    }

    const rankedStandings = $derived.by(() => {
        if (!displayStandings) return [];

        return [...displayStandings]
            .sort((left, right) => {
                const pointsDifference = getDisplayedPoints(right) - getDisplayedPoints(left);
                return pointsDifference || left.rank - right.rank;
            })
            .map((standing, index) => ({ ...standing, rank: index + 1 }));
    });
</script>

{#if standings.isLoading || standings.isLoadingError || meetings.isLoading || meetings.isLoadingError}
    <p>loading</p>
{:else}
    {#if showDevelopmentFixture}
        <p class="mb-2 text-meta text-yellow">development standings fixture enabled</p>
    {/if}
    <div class="overflow-x-auto">
        <table class="data-table matrix-table">
            <thead>
            <tr class="h-9">
                <th class="w-8"></th>
                <th class="w-32 px-2"></th>
                <th class="w-2 min-w-2"></th>  <!-- gap -->
                {#each meetings.data as meeting, i}
                    <th class="h-9 text-center border-b-2 pb-2 {meeting.id === currentMeeting?.id ? 'border-green' : 'border-transparent'}">
                        <div class="size-5 mx-auto">
                            {@html meeting.country.image}
                        </div>
                    </th>
                {/each}
                <th class="w-2 min-w-2"></th>  <!-- gap -->
                <th class="w-9 h-9 text-center">Pts</th>
            </tr>
            </thead>
            <tbody>
            {#each rankedStandings as standing}
                {@const isFirst = standing.rank === 1}
                {@const isSelected = comparisonUserIds.includes(standing.userId)}
                {@const rowColors = isFirst ? 'bg-red text-bg0' : isSelected ? 'bg-blue text-bg0' : 'bg-bg1 text-fg0'}
                {@const displayedPoints = getDisplayedPoints(standing)}
                <tr class="h-9">
                    <td class="{rowColors} w-8 ps-2 text-center font-bold">
                        {standing.rank}
                    </td>
                    <td class="{rowColors} w-32 px-2">
                        <button
                            class="w-full cursor-pointer text-left hover:underline"
                            aria-pressed={isSelected}
                            onclick={() => toggleUser(standing.userId)}
                        >
                            {standing?.username ?? 'user'}
                        </button>
                    </td>
                    <td class="w-2"></td>  <!-- gap -->
                    {#each meetings.data as meeting}
                        {@const meetingPoints = standing.meetingPoints.find(mp => mp.meetingId === meeting.id)}
                        {@const isSharedRound = commonMeetingIds?.includes(meeting.id) ?? true}
                        {@const comparedPoints = !!meetingPoints && isSelected && isSharedRound}
                        {@const normalPoints = !!meetingPoints && comparisonUserIds.length === 0}
                        <td class="h-9 w-9 min-w-9 aspect-square text-center {comparedPoints ? 'bg-bg1 text-fg0 font-semibold' : normalPoints ? 'bg-bg1 text-fg0' : 'bg-bg0 text-gray-dark'}">
                            {meetingPoints?.points ?? '-'}
                        </td>
                    {/each}
                    <td class="w-2"></td>  <!-- gap -->
                    <td class="{rowColors} w-9 text-center font-bold">
                        {displayedPoints}
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
{/if}
