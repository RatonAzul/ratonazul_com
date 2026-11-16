<script lang="ts">
    import { enhance } from '$app/forms';
    import { untrack } from 'svelte';
    import { games, puzzleDay, isaacDay, isaacShare, parseIsaac, parseSpanishWordle, spanishWordleShare, wordleResult, type Game, type GameRecord, type Player } from '$lib/utils/games';
    import GameBoard from './GameBoard.svelte';

    type Values = { id: string; userId: string; date: string; answer: string; words: string[]; share: string; mode?: string };
    let { game, date, record, answer, defaultUserId, players, values = null }: { game: Game; date: string; record?: GameRecord; answer: string; defaultUserId: string; players: Player[]; values?: Values | null } = $props();
    let userId = $state(untrack(() => values?.userId ?? record?.user_id ?? defaultUserId));
    let solution = $state('');
    let guesses = $state<string[]>(Array(6).fill(''));
    let share = $state('');
    let mode = $state('words');
    let pending = $state(false);
    $effect(() => {
        userId = values?.userId ?? record?.user_id ?? defaultUserId;
        solution = values?.answer ?? answer;
        guesses = values?.words ?? Array.from({ length: 6 }, (_, i) => record && 'words' in record ? record.words?.[i] ?? '' : '');
        mode = values?.mode ?? (game === 'la-palabra-del-dia' && record && 'is_simple' in record && record.is_simple ? 'share' : 'words');
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
            if (!solution.trim() && guesses.every(word => !word.trim())) return null;
            const result = wordleResult(guesses, solution);
            return { kind: 'wordle' as const, result, rows: result.board.match(/.{5}/gu) ?? [], words: result.words, error: '' };
        } catch (cause) { return { kind: 'invalid' as const, rows: [], words: [], error: cause instanceof Error ? cause.message : 'Invalid result.' }; }
    });
    let selectedPlayer = $derived(players.find(player => player.id === userId));
    let playerName = $derived(selectedPlayer?.username || selectedPlayer?.name || userId || 'choose a player');
    const inputClass = 'form-field';
</script>

<section class="surface-card p-4 sm:p-6">
    <div class="flex justify-between items-start gap-3 mb-5">
        <div>
            <h3 class="text-xl text-fg0 font-semibold">{games[game].name}</h3>
            <p class="text-sm text-gray mt-1">{record ? `editing result #${record.id}` : 'new result'}</p>
        </div>
        {#if record}<a class="internal-link text-sm" href={`?year=${date.slice(0, 4)}&date=${date}`}>cancel edit</a>{/if}
    </div>
    <form method="POST" action="?/save" class="flex flex-col gap-4" use:enhance={() => {
        pending = true;
        return async ({ update }) => { try { await update({ reset: false }); } finally { pending = false; } };
    }}>
        <input type="hidden" name="id" value={record?.id ?? ''} />
        <input type="hidden" name="date" value={date} />
        <label class="flex flex-col gap-2 text-sm">player
            <select name="userId" bind:value={userId} class={inputClass} required>
                <option value="" disabled>choose a player</option>
                {#if record && !players.some(player => player.id === record.user_id)}<option value={record.user_id} disabled>unknown player ({record.user_id})</option>{/if}
                {#each players as player}<option value={player.id}>{player.username || player.name} · {player.id.slice(0, 8)}</option>{/each}
            </select>
        </label>
        {#if game === 'isaaconnect'}
            <label class="flex flex-col gap-2 text-sm">share text
                <textarea name="share" bind:value={share} rows="11" maxlength="20000" required class={`${inputClass} resize-y text-sm`} placeholder="Isaaconnect #855&#10;✅: 1/4 ❤️: 0/4&#10;🟦🟦🟥🟦&#10;Time: 06:10.549&#10;https://isaaconnect.com/"></textarea>
            </label>
            <p class="text-xs text-gray">Paste the full result. The API stores time in whole seconds; fractional seconds are rounded down.</p>
        {:else}
            {#if game === 'la-palabra-del-dia'}
                <label class="flex flex-col gap-2 text-sm">input method
                    <select name="mode" bind:value={mode} class={inputClass}>
                        <option value="words">enter words</option>
                        <option value="share">paste shared result</option>
                    </select>
                </label>
            {/if}
            {#if game === 'la-palabra-del-dia' && mode === 'share'}
                <label class="flex flex-col gap-2 text-sm">share text
                    <textarea name="share" bind:value={share} rows="10" maxlength="20000" required class={`${inputClass} resize-y text-sm`} placeholder="La palabra del día #1760 4/6"></textarea>
                </label>
                <p class="text-xs text-gray">Paste the complete shared result to save its board and score.</p>
            {:else}
            <label class="flex flex-col gap-2 text-sm">answer
                <input class={`${inputClass} uppercase tracking-widest`} name="answer" bind:value={solution} autocomplete="off" required />
            </label>
            <p class="text-xs text-gray">The answer is shared by all players for this puzzle. Changing it also recalculates other results when their guesses permit it.</p>
            <fieldset class="grid grid-cols-2 gap-3">
                <legend class="text-sm mb-2">guesses · leave unused attempts empty</legend>
                {#each guesses as _, index}
                    <label class="flex flex-col gap-1 text-xs text-gray">guess {index + 1}
                        <input class={`${inputClass} uppercase tracking-widest`} name={`guess${index}`} bind:value={guesses[index]} autocomplete="off" aria-label={`Guess ${index + 1}`} />
                    </label>
                {/each}
            </fieldset>
            {#if record && 'is_simple' in record && record.is_simple}<p class="text-xs text-yellow">This is a board-only result. Enter its guesses and answer to edit it.</p>{/if}
            {/if}
        {/if}
        {#if preview}
            <div class="border-t border-bg3 pt-4 flex flex-col gap-3" aria-live="polite">
                {#if preview.error}<p class="text-sm text-yellow">{preview.error}</p>{:else}
                    <div>
                        <h3 class="font-semibold text-fg0">{playerName}</h3>
                        <p class="text-xs text-gray mt-1">puzzle #{preview.kind === 'isaac' ? preview.result.day : puzzleDay(game, date)} · {record ? `result #${record.id}` : 'new result'}</p>
                    </div>
                    {#if preview.kind === 'isaac'}
                        <div class="flex flex-wrap gap-5 items-start">
                            <GameBoard rows={preview.rows} isaac />
                            <dl class="text-sm text-fg0 grid grid-cols-2 gap-x-4 gap-y-2">
                                <dt class="text-gray">date</dt><dd><time datetime={date}>{date}</time></dd>
                                <dt class="text-gray">points</dt><dd>{preview.result.points}/4</dd>
                                <dt class="text-gray">lives</dt><dd>{preview.result.lifes}/4</dd>
                                <dt class="text-gray">time</dt><dd>{Math.floor(preview.result.time / 60)}:{String(preview.result.time % 60).padStart(2, '0')}</dd>
                            </dl>
                        </div>
                    {:else if preview.kind === 'wordle'}
                        <div class="flex flex-col gap-3">
                            <div class="flex flex-wrap gap-5 items-start">
                                <GameBoard rows={preview.rows} words={preview.words} />
                                <dl class="text-sm text-fg0 grid grid-cols-2 gap-x-4 gap-y-2">
                                    <dt class="text-gray">date</dt><dd><time datetime={date}>{date}</time></dd>
                                </dl>
                            </div>
                            <p class="text-sm text-fg0"><span class={preview.result.score === 7 ? 'text-red' : 'text-green'}>{preview.result.score === 7 ? 'X' : preview.result.score}/6</span> - {solution.trim().toLowerCase() || 'not recorded'}</p>
                        </div>
                    {/if}
                {/if}
            </div>
        {/if}
        <button type="submit" disabled={pending || !players.length || !preview || !!preview.error} class="bg-purple text-bg0 hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 cursor-pointer font-semibold">{pending ? 'saving…' : record ? 'save changes' : 'create result'}</button>
        {#if !players.length}<p class="text-sm text-yellow">Create a website user before entering results.</p>{/if}
    </form>
</section>
