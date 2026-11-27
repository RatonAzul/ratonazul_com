<script lang="ts">
    import { formatCalendarDate } from '$lib/utils/shared/calendar';
    import { enhance } from '$app/forms';
    import { tick, untrack } from 'svelte';
    import { games, puzzleDay, isaacDay, isaacShare, parseIsaac, parseSpanishWordle, spanishWordleShare, wordleResult, wordleBoardResult, normalizeWord, type Game, type GameRecord, type Player } from '$lib/utils/games';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import UserSelect from '$lib/components/shared/UserSelect.svelte';
    import GameBoard from '$lib/components/shared/GameBoard.svelte';

    type Values = { id: string; userId: string; date: string; answer: string; words: string[]; share: string; mode?: string; board?: string };
    let { game, date, record, answer, defaultUserId, players, values = null }: { game: Game; date: string; record?: GameRecord; answer: string; defaultUserId: string; players: Player[]; values?: Values | null } = $props();
    let userId = $state(untrack(() => values?.userId ?? record?.user_id ?? defaultUserId));
    let solution = $state('');
    let guesses = $state<string[]>(Array(6).fill(''));
    let share = $state('');
    let mode = $state('words');
    let board = $state('x'.repeat(30));
    let pending = $state(false);
    $effect(() => {
        userId = values?.userId ?? record?.user_id ?? defaultUserId;
        solution = values?.answer ?? answer;
        guesses = values?.words ?? Array.from({ length: 6 }, (_, i) => record && 'words' in record ? record.words?.[i] ?? '' : '');
        mode = values?.mode ?? (record && 'is_simple' in record && record.is_simple ? 'board' : 'words');
        board = values?.board && /^[xio]{30}$/.test(values.board) ? values.board : record && 'is_simple' in record && record.is_simple ? record.board.padEnd(30, 'x') : 'x'.repeat(30);
        share = values?.share ?? (record && 'points' in record ? isaacShare(record) : game === 'la-palabra-del-dia' && record && 'score' in record ? spanishWordleShare(record) : '');
    });
    let preview = $derived.by(() => {
        try {
            if (game === 'isaaconnect') {
                if (!share.trim()) return null;
                const result = parseIsaac(share);
                return { kind: 'isaac' as const, result, rows: result.board, words: [], error: result.day !== isaacDay(date) ? `This date expects puzzle #${isaacDay(date)}.` : '' };
            }
            if (game === 'la-palabra-del-dia' && mode === 'share') {
                if (!share.trim()) return null;
                const result = parseSpanishWordle(share);
                return { kind: 'wordle' as const, result, rows: result.board.match(/.{5}/gu) ?? [], words: result.words, error: result.day !== puzzleDay(game, date) ? `This date expects puzzle #${puzzleDay(game, date)}.` : '' };
            }
            if (mode === 'board') {
                if (solution.trim()) normalizeWord(solution);
                const result = wordleBoardResult(board);
                return { kind: 'wordle' as const, result, rows: result.board.match(/.{5}/gu) ?? [], words: result.words, error: '' };
            }
            if (!solution.trim() && guesses.every(word => !word.trim())) return null;
            const result = wordleResult(guesses, solution);
            return { kind: 'wordle' as const, result, rows: result.board.match(/.{5}/gu) ?? [], words: result.words, error: '' };
        } catch (cause) { return { kind: 'invalid' as const, rows: [], words: [], error: cause instanceof Error ? cause.message : 'Invalid result.' }; }
    });
    let selectedPlayer = $derived(players.find(player => player.id === userId));
    let playerName = $derived(selectedPlayer?.username || selectedPlayer?.name || userId || 'choose a player');
    let extraPlayers = $derived([
        ...(record && !players.some(player => player.id === record.user_id)
            ? [{ value: record.user_id, label: 'unknown player (' + record.user_id.slice(0, 8) + ')', disabled: true }] : [])
    ]);
    let modeOptions = $derived([
        { value: 'words', label: 'enter words' },
        { value: 'board', label: 'enter board' },
        ...(game === 'la-palabra-del-dia' ? [{ value: 'share', label: 'paste shared result' }] : [])
    ]);
    const inputClass = 'form-field';
</script>

<section class="surface-card p-4 sm:p-6">
    <div class="flex justify-between items-start gap-3 mb-5">
        <div>
            <h3 class="plain-h3">{games[game].name}</h3>
            <p class="subtitle mt-1">{record ? `editing result #${record.id}` : 'new result'}</p>
        </div>
        {#if record}<a class="button button-danger" href={`?year=${date.slice(0, 4)}&date=${date}`}>cancel edit</a>{/if}
    </div>
    <form method="POST" action="?/save" class="flex flex-col gap-4" use:enhance={() => {
        pending = true;
        return async ({ result, update }) => {
            try {
                await update({ reset: false });
                if (result.type === 'success') {
                    await tick();
                    board = 'x'.repeat(30);
                }
            } finally { pending = false; }
        };
    }}>
        <input type="hidden" name="id" value={record?.id ?? ''} />
        <input type="hidden" name="date" value={date} />
        <UserSelect label="player" name="userId" users={players} extraOptions={extraPlayers} bind:value={userId} placeholder="choose a player" required />
        {#if game === 'isaaconnect'}
            <label class="form-label">share text
                <textarea name="share" bind:value={share} rows="11" maxlength="20000" required class={`${inputClass} resize-y`} placeholder="Isaaconnect #855&#10;✅: 1/4 ❤️: 0/4&#10;🟦🟦🟥🟦&#10;Time: 06:10.549&#10;https://isaaconnect.com/"></textarea>
            </label>
            <p class="text-meta text-gray">Paste the full result. The API stores time in whole seconds; fractional seconds are rounded down.</p>
        {:else}
            <FormSelect label="input method" name="mode" options={modeOptions} bind:value={mode} />
            {#if game === 'la-palabra-del-dia' && mode === 'share'}
                <label class="form-label">share text
                    <textarea name="share" bind:value={share} rows="10" maxlength="20000" required class={`${inputClass} resize-y`} placeholder="La palabra del día #1760 4/6"></textarea>
                </label>
                <p class="text-meta text-gray">Paste the complete shared result to save its board and score.</p>
            {:else if mode === 'board'}
                <label class="form-label">answer
                    <input class={`${inputClass} uppercase tracking-widest`} name="answer" bind:value={solution} autocomplete="off" />
                </label>
                <p class="text-meta text-gray">The answer is shared by all players for this puzzle. Leave it blank if unknown.</p>
                <input type="hidden" name="board" value={board} />
                <fieldset class="flex flex-col gap-1">
                    <legend class="text-secondary mb-2">board</legend>
                    {#each Array(6) as _, row}
                        <div class="flex gap-1">
                            {#each Array(5) as _, col}
                                {@const index = row * 5 + col}
                                {@const cell = board[index]}
                                {@const ignored = board.match(/.{5}/g)?.findIndex(line => line === 'ooooo') ?? -1}
                                <button type="button" disabled={ignored >= 0 && row > ignored} aria-label={`Row ${row + 1}, column ${col + 1}: ${{ x: 'gray', i: 'yellow', o: 'green' }[cell]}. Change color`} class="size-10 border border-fg0/30 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed {cell === 'o' ? 'bg-green' : cell === 'i' ? 'bg-yellow' : 'bg-bg3'}" onclick={() => { board = board.slice(0, index) + ({ x: 'i', i: 'o', o: 'x' }[cell] ?? 'x') + board.slice(index + 1); }}></button>
                            {/each}
                        </div>
                    {/each}
                </fieldset>
                <button type="button" class="button button-secondary self-start" onclick={() => { board = 'x'.repeat(30); }}>reset board</button>
                <p class="text-meta text-gray">Squares start gray. The first all-green row ends the game; otherwise the result is X/6.</p>
            {:else}
            <label class="form-label">answer
                <input class={`${inputClass} uppercase tracking-widest`} name="answer" bind:value={solution} autocomplete="off" required />
            </label>
            <p class="text-meta text-gray">The answer is shared by all players for this puzzle. Changing it also recalculates other results when their guesses permit it.</p>
            <fieldset class="grid grid-cols-2 gap-3">
                <legend class="text-secondary mb-2">guesses · leave unused attempts empty</legend>
                {#each guesses as _, index}
                    <label class="form-label">guess {index + 1}
                        <input class={`${inputClass} uppercase tracking-widest`} name={`guess${index}`} bind:value={guesses[index]} autocomplete="off" aria-label={`Guess ${index + 1}`} />
                    </label>
                {/each}
            </fieldset>
            {/if}
        {/if}
        {#if preview}
            <div class="border-t border-bg3 pt-4 flex flex-col gap-3" aria-live="polite">
                {#if preview.error}<p class="text-secondary text-yellow">{preview.error}</p>{:else}
                    <div>
                        <h3 class="plain-h3">{playerName}</h3>
                        <p class="text-meta text-gray mt-1">puzzle #{preview.kind === 'isaac' ? preview.result.day : puzzleDay(game, date)} · {record ? `result #${record.id}` : 'new result'}</p>
                    </div>
                    {#if preview.kind === 'isaac'}
                        <div class="flex flex-wrap gap-5 items-start">
                            <GameBoard rows={preview.rows} isaac />
                            <dl class="text-secondary text-fg0 grid grid-cols-2 gap-x-4 gap-y-2">
                                <dt class="text-gray">date</dt><dd><time datetime={date}>{formatCalendarDate(date)}</time></dd>
                                <dt class="text-gray">points</dt><dd>{preview.result.points}/4</dd>
                                <dt class="text-gray">lives</dt><dd>{preview.result.lifes}/4</dd>
                                <dt class="text-gray">time</dt><dd>{Math.floor(preview.result.time / 60)}:{String(preview.result.time % 60).padStart(2, '0')}</dd>
                            </dl>
                        </div>
                    {:else if preview.kind === 'wordle'}
                        <div class="flex flex-col gap-3">
                            <div class="flex flex-wrap gap-5 items-start">
                                <GameBoard rows={preview.rows} words={preview.words} />
                                <dl class="text-secondary text-fg0 grid grid-cols-2 gap-x-4 gap-y-2">
                                    <dt class="text-gray">date</dt><dd><time datetime={date}>{formatCalendarDate(date)}</time></dd>
                                </dl>
                            </div>
                            <p class="text-secondary text-fg0"><span class={preview.result.score === 7 ? 'text-red' : 'text-green'}>{preview.result.score === 7 ? 'X' : preview.result.score}/6</span> - {solution.trim().toLowerCase() || 'not recorded'}</p>
                        </div>
                    {/if}
                {/if}
            </div>
        {/if}
        <button type="submit" disabled={pending || !players.length || !preview || !!preview.error} class="button button-primary">{pending ? 'saving…' : record ? 'save changes' : 'create result'}</button>
        {#if !players.length}<p class="text-secondary text-yellow">Create a website user before entering results.</p>{/if}
    </form>
</section>
