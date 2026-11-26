<script lang="ts">
    let { rows, words = [], isaac = false, compact = false }: { rows: string[]; words?: string[]; isaac?: boolean; compact?: boolean } = $props();
    function color(cell: string) {
        if (isaac) return ({ B: 'bg-blue text-bg0', R: 'bg-red text-bg0', Y: 'bg-yellow text-bg0', G: 'bg-green text-bg0' } as Record<string, string>)[cell] ?? 'bg-bg3 text-fg0';
        return ({ o: 'bg-green text-bg0', i: 'bg-yellow text-bg0', x: 'bg-bg3 text-gray' } as Record<string, string>)[cell] ?? 'bg-bg3';
    }
    function label(cell: string) {
        return isaac ? ({ B: 'blue', R: 'red', Y: 'yellow', G: 'green' } as Record<string, string>)[cell] ?? cell : ({ o: 'correct', i: 'wrong position', x: 'absent' } as Record<string, string>)[cell];
    }
</script>

<div class="flex flex-col {compact ? 'gap-0.5' : 'gap-1'}" role="img" aria-label={rows.map((row, i) => `row ${i + 1}${words[i] ? ` ${words[i]}` : ''}: ${[...row].map(label).join(', ')}`).join('; ')}>
    {#each rows as row, index}
        <div class="flex {compact ? 'gap-0.5' : 'gap-1'}" aria-hidden="true">
            {#each [...row] as cell, col}
                <span class="flex items-center justify-center uppercase font-semibold {compact ? 'size-4 text-meta' : 'size-7 text-secondary sm:size-8'} {color(cell)}">{words[index] ? [...words[index]][col] : ''}</span>
            {/each}
        </div>
    {/each}
</div>
