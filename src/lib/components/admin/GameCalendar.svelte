<script lang="ts">
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';

    let { year, currentYear, counts, date, today }: {
        year: number;
        currentYear: number;
        counts: Record<string, number>;
        date: string;
        today: string;
    } = $props();

    function getDayStatus(day: string) {
        const count = counts[day] ?? 0;
        const future = day > today;
        const className = future ? 'bg-bg2 text-gray' :
            count >= 2 ? 'bg-green/25 text-green hover:bg-green/40' :
            count === 1 ? 'bg-blue/25 text-blue hover:bg-blue/40' : 'bg-red/15 text-red hover:bg-red/30';
        return { className, label: `${count} ${count === 1 ? 'player' : 'players'}${future ? ', future date' : ''}` };
    }
</script>

<MonthPicker
    {date}
    firstDate="2026-01-01"
    lastYear={currentYear}
    id="game-calendar-months"
    label="Daily results calendar"
    dayHref={(day) => `?year=${year}&date=${day}`}
    yearHref={(target) => `?year=${target}`}
    dayStatus={getDayStatus}
>
    <div class="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-meta text-gray">
        <span class="flex items-center gap-2"><span class="size-3 bg-red" aria-hidden="true"></span>0 players</span>
        <span class="flex items-center gap-2"><span class="size-3 bg-blue" aria-hidden="true"></span>1 player</span>
        <span class="flex items-center gap-2"><span class="size-3 bg-green" aria-hidden="true"></span>2+ players</span>
        <span>distinct players · select a day to manage results</span>
    </div>
</MonthPicker>
