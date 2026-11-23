<script lang="ts">
    import { enhance } from '$app/forms';
    import { flip } from 'svelte/animate';
    import { MediaQuery } from 'svelte/reactivity';
    import EventTypeHighlightToggle from '$lib/components/admin/EventTypeHighlightToggle.svelte';
    import EventTypeColorSelect from '$lib/components/admin/EventTypeColorSelect.svelte';
    import { ArrowDownIcon, ArrowUpIcon, DotsSixVerticalIcon, TrashIcon } from 'phosphor-svelte';
    import type { CalendarEventIcon } from '$lib/utils/calendar-event-icons';
    import EventTypeIconSelect from '$lib/components/admin/EventTypeIconSelect.svelte';
    import EventTypeIcon from '$lib/components/shared/EventTypeIcon.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import { defaultProfileColor, type profileColors } from '$lib/utils/profile-colors';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let draftOrder = $state<number[] | null>(null);
    let order = $derived.by(() => {
        if (!draftOrder) return data.types;
        const typesById = new Map(data.types.map((type) => [type.id, type]));
        const ordered = draftOrder.flatMap((id) => {
            const type = typesById.get(id);
            typesById.delete(id);
            return type ? [type] : [];
        });
        return [...ordered, ...typesById.values()];
    });
    const changed = $derived(order.some((type, index) => type.id !== data.types[index]?.id));
    const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
    let list = $state<HTMLOListElement>();
    let createFormVersion = $state(0);
    let drag = $state<{ id: number; pointerId: number; previousOrder: number[] | null } | null>(null);

    function move(from: number, to: number) {
        if (from === to || from < 0 || to < 0 || to >= order.length) return;
        const next = order.map((type) => type.id);
        const [id] = next.splice(from, 1);
        next.splice(to, 0, id);
        draftOrder = next;
    }

    function startDrag(event: PointerEvent, id: number) {
        if (event.button !== 0 || drag || !list) return;
        event.preventDefault();
        list.setPointerCapture(event.pointerId);
        drag = { id, pointerId: event.pointerId, previousOrder: draftOrder };
    }

    function previewDrag(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.pointerId || !list) return;
        const draggedId = drag.id;
        const from = order.findIndex((type) => type.id === draggedId);
        if (from < 0) return;
        // Use layout positions so the animated transforms don't affect the drop thresholds.
        const y = event.clientY - list.getBoundingClientRect().top;
        let to = from;
        for (const [index, row] of Array.from(list.children).entries()) {
            if (!(row instanceof HTMLElement)) continue;
            const midpoint = row.offsetTop + row.offsetHeight / 2;
            if (index < from && y < midpoint) {
                to = index;
                break;
            }
            if (index > from && y > midpoint) to = index;
        }
        move(from, to);
    }

    function endDrag(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (event.type !== 'pointerup') draftOrder = drag.previousOrder;
        drag = null;
    }
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar', href: '/admin/calendar' }, { label: 'event types' }]}>event types</H1WithBreadCrumb>

    {#if data.loadError}
        <p class="form-feedback text-red" role="alert">{data.loadError}</p>
    {:else}
        {#if form?.message}
            <p class="form-feedback mb-4 {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>
        {/if}

        <form method="POST" action="?/save" class="surface-card flex flex-wrap items-end gap-3 p-4"
            use:enhance={() => async ({ result, update }) => {
                await update();
                if (result.type === 'success') createFormVersion++;
            }}>
            {#key createFormVersion}
                {@render typeFields('new')}
            {/key}
            <button type="submit" class="button button-primary">add type</button>
        </form>

        {#if order.length}
            <SectionSeparator />
            <h2>priority order</h2>
            <p class="subtitle mb-3">Drag to reorder, then save. The first type has the highest priority.</p>

            <ol class="surface-list relative" class:cursor-grabbing={drag !== null} role="list" bind:this={list}
                onpointermove={previewDrag} onpointerup={endDrag}
                onpointercancel={endDrag} onlostpointercapture={endDrag}>
                {#each order as type, index (type.id)}
                    <li animate:flip={{ duration: reducedMotion.current ? 0 : 160 }}
                        class="list-row flex-wrap border-l-4" class:opacity-60={drag?.id === type.id}
                        style:border-left-color={`var(--${type.color})`}>
                        <div class="flex items-center gap-2 md:mb-0.5 md:self-end">
                            <span class="touch-none select-none p-2 text-gray {drag ? 'cursor-grabbing' : 'cursor-grab'}"
                                onpointerdown={(event) => startDrag(event, type.id)}
                                title="Drag to reorder" aria-hidden="true"><DotsSixVerticalIcon size={20} /></span>
                            <span class="text-meta text-gray">{index + 1}</span>
                            <span style:color={`var(--${type.color})`}><EventTypeIcon icon={type.icon} /></span>
                            <button type="button" class="action-icon" aria-label={`Move ${type.name} up`} disabled={index === 0}
                                onclick={() => move(index, index - 1)}><ArrowUpIcon size={18} /></button>
                            <button type="button" class="action-icon" aria-label={`Move ${type.name} down`} disabled={index === order.length - 1}
                                onclick={() => move(index, index + 1)}><ArrowDownIcon size={18} /></button>
                        </div>
                        <form method="POST" action="?/save" use:enhance={() => ({ update }) => update({ reset: false })}
                            class="flex w-full min-w-0 flex-wrap items-end gap-3 md:w-auto md:flex-1">
                            <input type="hidden" name="id" value={type.id} />
                            {@render typeFields(String(type.id), type.name, type.color, type.icon, type.is_highlighted)}
                            <div class="flex shrink-0 items-end gap-2">
                                <button type="submit" class="button button-primary">save</button>
                                <button type="submit" formaction="?/remove" formnovalidate class="action-icon action-icon-danger"
                                    onclick={(event) => { if (!confirm('Delete this event type?')) event.preventDefault(); }}
                                    aria-label={`Delete ${type.name}`}><TrashIcon size={18} /></button>
                            </div>
                        </form>
                    </li>
                {/each}
            </ol>
            <form method="POST" action="?/order" class="mt-4"
                use:enhance={() => {
                    const submittedOrder = draftOrder;
                    return async ({ result, update }) => {
                        await update();
                        if (result.type === 'success' && draftOrder === submittedOrder) draftOrder = null;
                    };
                }}>
                {#each order as type (type.id)}
                    <input type="hidden" name="id" value={type.id} />
                {/each}
                <button class="button button-primary" type="submit" disabled={!changed}>save order</button>
            </form>
        {/if}
    {/if}
</Body>

{#snippet typeFields(key: string, name = '', color: (typeof profileColors)[number] = defaultProfileColor, icon: CalendarEventIcon | '' = '', highlighted = true)}
    <label class="form-label min-w-32 flex-1" for={`type-name-${key}`}>
        name
        <input id={`type-name-${key}`} class="form-field" name="name" value={name} maxlength={data.maxEventTypeName} required />
    </label>
    <EventTypeColorSelect {color} />
    <EventTypeIconSelect {icon} />
    <EventTypeHighlightToggle {highlighted} />
{/snippet}
