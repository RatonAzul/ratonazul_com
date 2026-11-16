<script lang="ts">
    import { PencilIcon, TrashIcon } from 'phosphor-svelte';
    import { page } from '$app/state';
    import { enhance } from '$app/forms';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import GameCalendar from '$lib/components/admin/GameCalendar.svelte';
    import GameBoard from '$lib/components/admin/GameBoard.svelte';
    import GameResultEditor from '$lib/components/admin/GameResultEditor.svelte';
    import { games, playerCounts, puzzleDay } from '$lib/utils/games';
    import type { PageData, ActionData } from './$types';
    let { data, form }: { data: PageData; form: ActionData } = $props();
    let editing = $derived(data.daily.find(record => String(record.id) === page.url.searchParams.get('edit')));
    let selectedDay = $derived(editing?.day ?? puzzleDay(data.game, data.date));
    let answer = $derived(data.solutions.find(solution => solution.day === selectedDay)?.word ?? '');
    let counts = $derived(playerCounts(data.records));
    let deleting = $state<number | null>(null);
    function playerName(id: string) { const player = data.players.find(player => player.id === id); return player?.username || player?.name || id; }
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'games', href: '/admin/games' }, { label: games[data.game].name }]}>{games[data.game].name}</H1WithBreadCrumb>
    {#if form?.message}<p class="mb-4 border-l-4 p-4 bg-bg1 {form.success ? 'border-green text-green' : 'border-red text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>{/if}
    {#if data.loadError}
        <div class="surface-card p-6 border-l-4 border-red" role="alert"><p class="text-red">{data.loadError}</p><a class="internal-link inline-block mt-3" href={page.url.pathname + page.url.search}>retry loading results</a></div>
    {:else}
        <GameCalendar year={data.year} currentYear={data.currentYear} {counts} date={data.date} today={data.today} />
        <div class="mt-6 mb-4 flex flex-col items-start gap-1" id="daily-results">
            <div><p class="section-label mb-1">selected day</p><h2 class="text-2xl text-green font-semibold">{data.date}</h2></div>
            <span class="text-sm text-gray">{counts[data.date] ?? 0} / 2 players · {data.daily.length} results</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-5 items-start mb-8">
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
                {#each data.daily as record (record.id)}
                    <article class="surface-card min-w-0 p-4 sm:p-5 {record.id === editing?.id ? 'ring-1 ring-purple' : ''}">
                        <div class="flex flex-wrap gap-3 justify-between items-start mb-4">
                            <div><h3 class="font-semibold text-fg0">{playerName(record.user_id)}</h3><p class="text-xs text-gray mt-1">puzzle #{record.day} · result #{record.id}</p></div>
                            <div class="flex gap-2 items-center text-sm">
                                <a class="action-icon text-fg0 hover:bg-bg2" href={`?year=${data.year}&date=${data.date}&edit=${record.id}#daily-results`} aria-label={`Edit ${playerName(record.user_id)}’s result`} title="Edit result"><PencilIcon size={18} aria-hidden="true" /></a>
                                <form method="POST" action="?/delete" use:enhance={({ cancel }) => {
                                    if (!confirm(`Delete ${playerName(record.user_id)}’s result for ${data.date}?`)) { cancel(); return; }
                                    deleting = record.id;
                                    return async ({ update }) => { try { await update(); } finally { deleting = null; } };
                                }}>
                                    <input name="id" type="hidden" value={record.id} />
                                    <button type="submit" disabled={deleting !== null} aria-label={deleting === record.id ? 'Deleting result…' : `Delete ${playerName(record.user_id)}’s result`} aria-busy={deleting === record.id} title="Delete result" class="action-icon text-red hover:bg-red/15"><TrashIcon size={18} aria-hidden="true" /></button>
                                </form>
                            </div>
                        </div>
                        {#if 'score' in record}
                            <div class="flex flex-col gap-3">
                                <GameBoard rows={record.board.match(/.{5}/gu) ?? []} words={record.words ?? []} />
                                <p class="text-sm text-fg0"><span class={record.score === 7 ? 'text-red' : 'text-green'}>{record.score === 7 ? 'X' : record.score}/6</span> - {data.solutions.find(solution => solution.day === record.day)?.word ?? 'not recorded'}{#if record.is_simple}<span class="block text-gray text-xs mt-1">board only</span>{/if}</p>
                            </div>
                        {:else}
                            <div class="flex flex-wrap gap-5 items-start"><GameBoard rows={record.board} isaac /><dl class="text-sm grid grid-cols-2 gap-x-4 gap-y-2"><dt class="text-gray">points</dt><dd>{record.points}/4</dd><dt class="text-gray">lives</dt><dd>{record.lifes}/4</dd><dt class="text-gray">time</dt><dd>{Math.floor(record.time / 60)}:{String(record.time % 60).padStart(2, '0')}</dd></dl></div>
                        {/if}
                    </article>
                {:else}
                    <div class="surface-card p-6 border-l-4 border-bg3 xl:col-span-2"><h3 class="text-fg0 mb-2">no results yet</h3><p class="text-sm text-gray">{data.date > data.today ? 'This day is still ahead. You can enter results once it arrives.' : 'Choose a player and add their daily result.'}</p></div>
                {/each}
            </div>
            {#if data.date <= data.today}
                {#key JSON.stringify([data.game, data.date, editing, form?.values])}
                    <GameResultEditor game={data.game} date={data.date} record={editing} {answer} defaultUserId={data.defaultUserId} players={data.players} values={form?.values ?? null} />
                {/key}
            {/if}
        </div>
    {/if}
</Body>
