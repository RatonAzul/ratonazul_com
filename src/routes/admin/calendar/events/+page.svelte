<script lang="ts">
    import { TrashIcon } from 'phosphor-svelte';
    import CalendarDateField from '$lib/components/shared/CalendarDateField.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar', href: '/admin/calendar' }, { label: 'events' }]}>events</H1WithBreadCrumb>
    <form method="GET" class="mb-6 flex flex-wrap items-end gap-3">
        <CalendarDateField label="date" name="date" value={data.date} min={data.firstCalendarDate} required />
        <button type="submit" class="button button-secondary">show events</button>
    </form>

    {#if data.loadError}
        <p class="form-feedback text-red" role="alert">{data.loadError}</p>
    {:else}
        {#if form?.message}
            <p class="form-feedback mb-4 {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>
        {/if}
        <ul class="card-list" role="list">
            {#each data.events as event (event.id)}
                {@const draft = form && 'id' in form && form.id === event.id ? form.input : undefined}
                <li class="surface-card flex flex-wrap items-end gap-3 border-l-4 p-4" style:border-left-color={`var(--${event.color})`}>
                    {#if event.auto_game}
                        <div class="min-w-0">
                            <p class="subtitle">automatic game result · {event.type_name}</p>
                            <p>{event.content}</p>
                        </div>
                    {:else}
                        <form method="POST" action={`?/save&date=${data.date}`} class="flex min-w-0 flex-1 flex-col gap-3">
                            <input type="hidden" name="id" value={event.id} />
                            <div class="flex flex-wrap gap-3">
                                <CalendarDateField label="start date" name="eventDate" value={draft?.date ?? event.date} min={data.firstCalendarDate} required />
                                <CalendarDateField label="end date (optional)" name="eventEndDate" value={draft?.endDate ?? event.end_date ?? ''}
                                    min={data.firstCalendarDate} />
                                <label class="form-label">
                                    event type
                                    <select class="form-field" name="typeId" value={draft?.typeID ?? event.type_id} required>
                                        {#each data.types as type (type.id)}
                                            <option value={type.id}>{type.name}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                            <label class="form-label">
                                event text
                                <textarea name="eventContent" class="form-field resize-y" rows="2" maxlength={data.maxEventLength}
                                    value={draft?.content ?? event.content} required></textarea>
                            </label>
                            <button type="submit" class="button button-primary self-start">save</button>
                        </form>
                        <form method="POST" action={`?/remove&date=${data.date}`} onsubmit={(submit) => { if (!confirm('Delete this event?')) submit.preventDefault(); }}>
                            <input type="hidden" name="id" value={event.id} />
                            <button type="submit" class="action-icon action-icon-danger" aria-label={`Delete event: ${event.type_name}`}><TrashIcon size={18} /></button>
                        </form>
                    {/if}
                </li>
            {:else}
                <li class="subtitle">No events on this day.</li>
            {/each}
        </ul>
    {/if}
</Body>
