<script lang="ts">
    import type { SelectableUser } from '$lib/components/shared/UserSelectLabel.svelte';
    import { rankingPointProgression } from '$lib/utils/game-leaderboard';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import { formatCalendarDate } from '$lib/utils/shared/calendar';

    let { rows, start, end, label }: {
        rows: { player: SelectableUser; attempts: { date: string; points: number | null }[] }[];
        start: string;
        end: string;
        label: string;
    } = $props();

    const dayLength = 86_400_000;
    const daySteps = [1, 2, 5, 10, 15, 30];
    let chartWidth = $state(0);
    let dayCount = $derived((Date.parse(end) - Date.parse(start)) / dayLength + 1);
    const x = (day: number) => day / dayCount * 100;

    let dateTicks = $derived.by(() => {
        const spansMonths = start.slice(0, 7) !== end.slice(0, 7);
        const spacing = spansMonths ? 40 : 24;
        const minStep = Math.max(1, Math.ceil(dayCount * spacing / (chartWidth || 280)));
        const interval = daySteps.find(step => step >= minStep) ?? Math.ceil(minStep / 30) * 30;
        const days = [1];
        for (let day = 1 + interval; dayCount - day >= minStep; day += interval) days.push(day);
        if (dayCount - 1 >= minStep) days.push(dayCount);

        return days.map(day => {
            const date = new Date(Date.parse(start) + (day - 1) * dayLength).toISOString().slice(0, 10);
            const month = Number(date.slice(5, 7));
            const number = Number(date.slice(8, 10));
            return { day, date, text: spansMonths ? `${number}/${month}` : String(number) };
        });
    });

    let hidden = $state<Record<string, boolean>>({});
    let series = $derived.by(() => {
        const colorCounts = new Map<string, number>();
        return rows.map(({ player, attempts }) => {
            const color = isProfileColor(player.color) ? player.color : defaultProfileColor;
            const index = colorCounts.get(color) ?? 0;
            colorCounts.set(color, index + 1);
            return {
                id: player.id,
                name: player.username || player.name,
                color: `var(--${color})`,
                dash: index === 0 ? undefined : index === 1 ? '0.5 5' : `${index * 3} 4`,
                totals: rankingPointProgression(attempts, start, end)
            };
        });
    });
    let visible = $derived(series.filter(player => !hidden[player.id]));
    let peak = $derived(series.reduce((max, player) => Math.max(max, player.totals.at(-1) ?? 0), 0));
    let step = $derived(Math.max(1, Math.ceil(peak / 4)));
    let upper = $derived(Math.max(step, Math.ceil(peak / step) * step));
    let ticks = $derived(Array.from({ length: upper / step + 1 }, (_, index) => upper - step * index));
    const y = (value: number) => (1 - value / upper) * 100;

    let lines = $derived(visible.map(player => {
        const stroke = player.totals.map((total, index) => index === 0
            ? `M 0 ${y(total)}`
            : `H ${x(index)} V ${y(total)}`).join(' ');
        const markers = player.totals.slice(1).map((total, index) => `M ${x(index + 1)} ${y(total)} h0.0001`).join(' ');
        return { ...player, stroke, markers };
    }));
</script>

<div class="surface-card flex min-w-0 flex-col gap-3 border-l-4 border-bg2 p-3 sm:p-4">
    <div class="flex flex-wrap gap-x-3 gap-y-1 text-meta" role="group" aria-label={label + ' players'}>
        {#each series as player (player.id)}
            <button type="button" class="inline-flex cursor-pointer items-center gap-1.5 py-1 hover:brightness-125"
                class:opacity-50={hidden[player.id]} aria-pressed={!hidden[player.id]}
                style:color={player.color} onclick={() => hidden[player.id] = !hidden[player.id]}>
                <svg class="h-2 w-5 shrink-0" viewBox="0 0 20 8" aria-hidden="true">
                    <path d="M 0 4 H 20" stroke="currentColor" stroke-width="2" stroke-dasharray={player.dash} stroke-linecap="round" />
                </svg>
                {player.name}
            </button>
        {/each}
    </div>
    {#if visible.length}
        <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2">
            <div class="-my-2 flex flex-col justify-between text-right text-meta tabular-nums text-gray" aria-hidden="true">
                {#each ticks as tick (tick)}<span>{tick}</span>{/each}
            </div>
            <svg class="block h-24 w-full overflow-visible sm:h-32 lg:h-40"
                viewBox="0 0 100 100" preserveAspectRatio="none" role="img"
                aria-label={label + '. ' + visible.map(player => `${player.name}: ${player.totals.at(-1)} points`).join('. ')}>
                {#each ticks as tick (tick)}
                    <line x1="0" x2="100" y1={y(tick)} y2={y(tick)} stroke="var(--bg3)" vector-effect="non-scaling-stroke" />
                {/each}
                {#each dateTicks as tick (tick.day)}
                    <line x1={x(tick.day)} x2={x(tick.day)} y1="100" y2="103" stroke="var(--gray)" vector-effect="non-scaling-stroke" />
                {/each}
                {#each lines as line (line.id)}
                    {#if line.dash}
                        <path d={line.stroke} fill="none" stroke="var(--bg1)" stroke-width="2" vector-effect="non-scaling-stroke" />
                    {/if}
                    <path d={line.stroke} fill="none" stroke={line.color} stroke-width={line.dash ? 1.5 : 3} stroke-linecap="round"
                        stroke-dasharray={line.dash} vector-effect="non-scaling-stroke" />
                    <path d={line.markers} fill="none" stroke={line.color} stroke-width="4" stroke-linecap="round"
                        vector-effect="non-scaling-stroke" />
                {/each}
            </svg>
            <div class="relative col-start-2 h-4 text-meta text-gray" bind:clientWidth={chartWidth}>
                {#each dateTicks as tick (tick.day)}
                    <time datetime={tick.date} title={formatCalendarDate(tick.date)}
                        class="absolute whitespace-nowrap tabular-nums {tick.day === dayCount ? '-translate-x-full' : '-translate-x-1/2'}"
                        style:left={`${x(tick.day)}%`}>{tick.text}</time>
                {/each}
            </div>
        </div>
    {:else}
        <p class="subtitle">select a player to show their points.</p>
    {/if}
</div>
