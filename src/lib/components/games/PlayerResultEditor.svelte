<script lang="ts">
    import { enhance } from '$app/forms';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import { puzzleDay, type Game } from '$lib/utils/games';

    let { game, date, action, message }: { game: Game; date: string; action: string; message?: string } = $props();
    let mode = $state('words');
    let board = $state('x'.repeat(30));
    let pending = $state(false);
    let options = $derived([
        { value: 'words', label: 'enter words' },
        { value: 'board', label: 'enter board' },
        ...(game === 'la-palabra-del-dia' ? [{ value: 'share', label: 'paste shared result' }] : [])
    ]);
    let solvedRow = $derived(board.match(/.{5}/g)?.indexOf('ooooo') ?? -1);
    const colors = { x: { name: 'gray', className: 'bg-bg3' }, i: { name: 'yellow', className: 'bg-yellow' }, o: { name: 'green', className: 'bg-green' } };
    const next = { x: 'i', i: 'o', o: 'x' };
</script>

<form method="POST" {action} class="flex w-full min-w-0 flex-col gap-2" use:enhance={() => {
    pending = true;
    return async ({ update }) => {
        try {
            await update({ reset: false });
        } finally {
            pending = false;
        }
    };
}}>
    <input type="hidden" name="game" value={game} />
    <input type="hidden" name="date" value={date} />
    <p class="mb-1 text-meta text-gray">puzzle #{puzzleDay(game, date)}</p>
    {#if game !== 'isaaconnect'}
        <FormSelect label="input method" name="mode" {options} bind:value={mode} compact />
    {/if}
    {#if game === 'isaaconnect' || mode === 'share'}
        <label class="form-label text-meta">share text
            <textarea class="form-field min-h-0 resize-y text-meta" name="share" rows="4" maxlength="20000" required
                placeholder="paste the full shared result"></textarea>
        </label>
    {:else if mode === 'board'}
        <input type="hidden" name="board" value={board} />
        <fieldset class="flex flex-col gap-1">
            <legend class="mb-1 text-meta text-gray">tap squares to change colors</legend>
            {#each Array(6) as _, row}
                <div class="flex gap-1">
                    {#each Array(5) as _, column}
                        {@const index = row * 5 + column}
                        {@const cell = board[index] as keyof typeof colors}
                        <button type="button" class="size-5 shrink-0 cursor-pointer border border-fg0/25 disabled:opacity-30 sm:size-6 {colors[cell].className}"
                            aria-label={`Row ${row + 1}, column ${column + 1}: ${colors[cell].name}. Change color`}
                            disabled={solvedRow !== -1 && row > solvedRow}
                            onclick={() => board = board.slice(0, index) + next[cell] + board.slice(index + 1)}></button>
                    {/each}
                </div>
            {/each}
        </fieldset>
        <button type="button" class="internal-link self-start text-meta" onclick={() => board = 'x'.repeat(30)}>reset board</button>
    {:else}
        <label class="form-label text-meta">answer
            <input class="form-field min-h-0 uppercase text-meta" name="answer" autocomplete="off" maxlength="5" required />
        </label>
        <fieldset class="grid grid-cols-2 gap-1">
            <legend class="mb-1 text-meta text-gray">guesses</legend>
            {#each Array(6) as _, index}
                <input class="form-field min-h-0 min-w-0 uppercase text-meta" name={`guess${index}`} autocomplete="off" maxlength="5"
                    aria-label={`Guess ${index + 1}`} placeholder={String(index + 1)} />
            {/each}
        </fieldset>
    {/if}
    {#if message}<p class="text-meta text-red" role="alert">{message}</p>{/if}
    <button type="submit" class="button button-primary min-h-8 self-start px-2 py-1 text-meta" disabled={pending}>
        {pending ? 'saving…' : 'save result'}
    </button>
</form>
