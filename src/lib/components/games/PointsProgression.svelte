<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import type { pointProgression } from '$lib/utils/game-result-summary';

    let { points, players, startLabel, endLabel }: {
        points: ReturnType<typeof pointProgression>;
        players: readonly { name: string; username: string | null; color: string | null }[];
        startLabel: string;
        endLabel: string;
    } = $props();

    const sides = ['left', 'right'] as const;
    let difference = $state(false);
    let final = $derived(points[points.length - 1]);
    let playerStyles = $derived(players.map(player => {
        const accent = isProfileColor(player.color) ? player.color : defaultProfileColor;
        return { name: player.username || player.name, color: `var(--${accent})` };
    }));
    let sharedColor = $derived(playerStyles[0].color === playerStyles[1].color);
    const lead = ({ left, right }: (typeof points)[number]) => left - right;
    let peak = $derived(difference
        ? points.reduce((max, point) => Math.max(max, Math.abs(lead(point))), 0)
        : Math.max(final.left, final.right));
    let step = $derived(Math.max(1, Math.ceil(peak / (difference ? 2 : 4))));
    let upper = $derived(Math.max(step, Math.ceil(peak / step) * step));
    let lower = $derived(difference ? -upper : 0);
    let ticks = $derived(Array.from({ length: (upper - lower) / step + 1 }, (_, index) => upper - step * index));
    const x = (position: number) => position / final.position * 100;
    const y = (value: number) => (upper - value) / (upper - lower) * 100;

    // Keep one position for each day while storing only score changes on the server.
    let samples = $derived.by(() => {
        let event = 0;
        return Array.from({ length: final.position }, (_, index) => {
            const position = index + 1;
            if (points[event + 1]?.position === position) event++;
            return { ...points[event], position };
        });
    });

    let lines = $derived(difference ? [] : sides.map((side, index) => ({
        color: playerStyles[index].color,
        dashed: index === 1 && sharedColor,
        width: index === 0 ? 3 : 2,
        markerWidth: index === 0 ? 6 : 4,
        stroke: points.map((point, index) => index === 0
            ? `M ${x(point.position)} ${y(point[side])}`
            : `H ${x(point.position)} V ${y(point[side])}`).join(' '),
        markers: samples.map(point => `M ${x(point.position)} ${y(point[side])} h0.0001`).join(' ')
    })));

    let bars = $derived(difference ? [1, -1].map((sign, index) => ({
        color: playerStyles[index].color,
        path: samples.filter(point => Math.sign(lead(point)) === sign).map(point => {
            const left = x(point.position - 0.9);
            const right = x(point.position - 0.1);
            return `M ${left} ${y(0)} H ${right} V ${y(lead(point))} H ${left} Z`;
        }).join(' ')
    })) : []);
</script>

<section class="flex min-w-0 flex-col gap-2" aria-labelledby="points-progression">
    <h3 class="plain-h3" id="points-progression">points progression</h3>
    <div class="surface-card flex min-w-0 flex-col gap-3 border-l-4 border-bg2 p-3 sm:p-4">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-meta">
                {#each playerStyles as player, index}
                    <span class="inline-flex items-center gap-2" style:color={player.color}>
                        <span class="w-5 border-t-2 {index === 1 && sharedColor && !difference ? 'border-dashed' : ''}"
                            aria-hidden="true"></span>
                        {player.name}
                    </span>
                {/each}
            </div>
            <div class="ml-auto flex items-center text-meta" role="group" aria-label="Progression chart view">
                <button type="button" class="action-icon size-7 bg-transparent text-gray hover:bg-transparent hover:text-fg0"
                    aria-label="Previous chart view" onclick={() => difference = !difference}>
                    <CaretLeftIcon class="size-3" aria-hidden="true" />
                </button>
                <span class="w-24 text-center text-fg0" aria-live="polite">{difference ? 'difference' : 'total points'}</span>
                <button type="button" class="action-icon size-7 bg-transparent text-gray hover:bg-transparent hover:text-fg0"
                    aria-label="Next chart view" onclick={() => difference = !difference}>
                    <CaretRightIcon class="size-3" aria-hidden="true" />
                </button>
            </div>
        </div>
        <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2">
            <div class="-my-2 flex flex-col justify-between text-right text-meta tabular-nums text-gray" aria-hidden="true">
                {#each ticks as tick (tick)}<span>{Math.abs(tick)}</span>{/each}
            </div>
            <svg class="block h-24 w-full overflow-visible sm:h-32 lg:h-40"
                viewBox="0 0 100 100" preserveAspectRatio="none" role="img"
                aria-label={`${difference ? `Points difference, from ${playerStyles[0].name}’s perspective` : 'Cumulative points'} from ${startLabel} to ${endLabel}. ${playerStyles[0].name}: ${final.left} points. ${playerStyles[1].name}: ${final.right} points.`}>
                {#each ticks as tick (tick)}
                    <line x1="0" x2="100" y1={y(tick)} y2={y(tick)} stroke={difference && tick === 0 ? 'var(--gray)' : 'var(--bg3)'}
                        vector-effect="non-scaling-stroke" />
                {/each}
                {#each bars as player}
                    <path d={player.path} fill={player.color} />
                {/each}
                {#each lines as line}
                    <path d={line.stroke} fill="none" stroke={line.color} stroke-width={line.width}
                        stroke-dasharray={line.dashed ? '5 4' : undefined} vector-effect="non-scaling-stroke" />
                {/each}
                {#each lines as line}
                    <path d={line.markers} fill="none" stroke={line.color} stroke-width={line.markerWidth}
                        stroke-linecap="round" vector-effect="non-scaling-stroke" />
                {/each}
            </svg>
            <div class="col-start-2 flex justify-between gap-2 text-meta text-gray" aria-hidden="true">
                <span>{startLabel}</span>
                <span class="text-right">{endLabel}</span>
            </div>
        </div>
    </div>
</section>
