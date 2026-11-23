<script lang="ts">
    import { GearIcon, PaperPlaneRightIcon, PlusIcon } from 'phosphor-svelte';
    import EventTypeIcon from '$lib/components/shared/EventTypeIcon.svelte';
    import CalendarDateField from '$lib/components/shared/CalendarDateField.svelte';
    import { formatCalendarDate } from '$lib/utils/shared/calendar';
    import MonthPicker from '$lib/components/shared/MonthPicker.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import ColoredSectionTitle from '$lib/components/shared/ColoredSectionTitle.svelte';
    import CustomH1 from '$lib/components/shared/CustomH1.svelte';
    import SectionSeparator from '$lib/components/shared/SectionSeparator.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    const postedAtFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' });
    let commentForm = $derived(form?.kind === 'comment' && form.date === data.date ? form : null);
    let eventForm = $derived(form?.kind === 'event' && form.date === data.date ? form : null);

    let eventStartDate = $derived(eventForm?.startDate ?? data.date);
    const commentedDates = $derived(new Set(data.commentDates));
    const automatedDates = $derived(new Set(data.automatedDates));
    const regularEvents = $derived(data.events.filter((event) => !event.auto_game));
    const gameEvents = $derived(data.events.filter((event) => event.auto_game));

    function dayStatus(day: string) {
        const hasComments = commentedDates.has(day);
        const eventColor = data.eventColors[day];
        const hasEvents = Object.hasOwn(data.eventColors, day);
        const hasActivity = hasComments || hasEvents;
        const hasAutomatedEvent = automatedDates.has(day);
        const surface = hasAutomatedEvent ? 'bg-bg2 hover:bg-bg3' : 'bg-bg0 hover:bg-bg2 focus-visible:bg-bg2';
        const text = eventColor ? 'font-semibold'
            : hasActivity ? 'text-fg0' : 'text-gray hover:text-fg0 focus-visible:text-fg0';
        const label = [hasComments ? 'has comments' : '', hasEvents ? 'has events' : ''].filter(Boolean).join(', ');
        return {
            className: `${surface} ${text}`,
            label,
            hasComments,
            color: eventColor ? `var(--${eventColor})` : undefined,
            backgroundColor: eventColor
                ? `color-mix(in srgb, var(--${eventColor}) ${eventColor === 'red' ? 15 : 25}%, transparent)`
                : undefined
        };
    }
</script>

<Body>
    <CustomH1>calendar</CustomH1>
    <MonthPicker date={data.date} firstDate={data.firstDate} {dayStatus} today={data.today} />
    <SectionSeparator />
    <section aria-labelledby="calendar-day-title">
        <h2 id="calendar-day-title" class="mb-4" aria-live="polite">
            <time datetime={data.date}>{formatCalendarDate(data.date)}</time>
        </h2>

        <section class="flex flex-col gap-4" aria-labelledby="calendar-events-title">
            <div class="flex gap-2">
                <ColoredSectionTitle id="calendar-events-title" title="events" bgColor="bg-yellow" class="min-w-0 flex-1 text-base" />
                {#if data.isAdmin}
                    <a class="action-icon h-auto min-h-8 w-12"
                        href={`/admin/calendar/events?date=${data.date}`} aria-label="Manage events" title="Manage events">
                        <GearIcon size={18} aria-hidden="true" />
                    </a>
                {/if}
            </div>

            {#if data.eventsError || data.eventTypesError}
                <p class="form-feedback text-red" role="alert">{data.eventsError || data.eventTypesError}</p>
            {/if}
            {#if eventForm?.message}
                <p class="form-feedback text-red" role="alert">{eventForm.message}</p>
            {/if}

            {#each [regularEvents, gameEvents] as events}
                {#if events.length}
                    <ul class="flex min-w-0 flex-col gap-2 text-secondary max-sm:text-xs" role="list">
                        {#each events as event (event.id)}
                            <li class="flex min-w-0 items-start gap-2"
                                title={`${event.type_name} · ${event.content}`}>
                                <span class="flex max-w-[45%] min-w-0 shrink-0 items-center gap-1.5 font-semibold" style:color={`var(--${event.color})`}>
                                    <EventTypeIcon icon={event.icon} />
                                    <span class="truncate">{event.type_name}</span>
                                    <span class="shrink-0" aria-hidden="true">·</span>
                                </span>
                                <span class="min-w-0 {event.auto_game ? 'wrap-anywhere' : 'truncate'}">{event.content}</span>
                            </li>
                        {/each}
                    </ul>
                {/if}
            {/each}

            {#if data.eventTypes.length}
                {#key data.date}
                    <details class="group" open={!!eventForm}>
                        <summary class="internal-link flex w-fit cursor-pointer list-none items-center gap-2 text-secondary max-sm:text-xs [&::-webkit-details-marker]:hidden">
                            <PlusIcon size={16} class="group-open:rotate-45" aria-hidden="true" />
                            add event
                        </summary>
                        <form method="POST" action={`?/event&date=${data.date}`} class="surface-card mt-2 flex flex-col gap-3 p-3">
                            <div class="flex flex-wrap gap-3">
                                <CalendarDateField label="start date" name="eventDate" bind:value={eventStartDate} min={data.firstDate} required />
                                <CalendarDateField label="end date (optional)" name="eventEndDate" value={eventForm?.endDate ?? ''}
                                    min={eventStartDate || data.firstDate} />
                            </div>
                            <label class="form-label">
                                event type
                                <select class="form-field" name="typeId" value={eventForm?.typeId ?? ''} required>
                                    <option value="" disabled>choose a type</option>
                                    {#each data.eventTypes as type (type.id)}
                                        <option value={type.id}>{type.name}</option>
                                    {/each}
                                </select>
                            </label>
                            <label class="form-label">
                                event text
                                <textarea class="form-field resize-y" name="eventContent" rows="2" required
                                    maxlength={data.maxEventLength} value={eventForm?.eventContent ?? ''}></textarea>
                            </label>
                            <button class="button button-primary self-start" type="submit">add event</button>
                        </form>
                    </details>
                {/key}
            {:else if !data.eventTypesError}
                <p class="subtitle">No event types have been added.</p>
            {/if}
        </section>

        <SectionSeparator />

        <section class="flex flex-col gap-4" aria-labelledby="calendar-comments-title">
            <ColoredSectionTitle id="calendar-comments-title" title="comments" bgColor="bg-green" class="text-base" />
            {#if data.loadError}
                <p class="form-feedback text-red max-sm:text-xs" role="alert">{data.loadError}</p>
            {:else}
                {#if commentForm?.message}
                    <p class="form-feedback text-red max-sm:text-xs" role="alert">{commentForm.message}</p>
                {/if}

                {#if data.viewer && !data.ownComment}
                    {#key data.date}
                        <form method="POST" action={`?/comment&date=${data.date}`}
                            class="surface-card flex min-h-14 items-center gap-2 p-3 sm:gap-3">
                            <UserAvatar image={data.viewer.image} name={data.viewer.name} class="size-12 aspect-square max-sm:text-xs" />
                            <label class="sr-only" for="calendar-comment">your comment</label>
                            <textarea id="calendar-comment" class="form-field min-w-0 flex-1 resize-y max-sm:text-xs" name="content" rows="2"
                                placeholder="your comment" maxlength={data.maxCommentLength}
                                value={commentForm?.content ?? ''} required></textarea>
                            <button type="submit" class="button button-primary size-12 p-0" aria-label="Send comment" title="Send comment">
                                <PaperPlaneRightIcon size={20} aria-hidden="true" />
                            </button>
                        </form>
                    {/key}
                {/if}

                {#if data.comments.length}
                    <ul class="card-list" role="list">
                        {#each data.comments as comment (comment.id)}
                            <li class="surface-card flex min-h-14 gap-3 border-r-4 p-3" style:--author-color={`var(--${comment.author.color})`} style:border-right-color="var(--author-color)">
                                <UserAvatar image={comment.author.image} name={comment.author.name} class="size-12 aspect-square self-start max-sm:text-xs" />
                                <div class="min-w-0 flex-1 self-center text-secondary max-sm:text-xs">
                                    <div class="flex flex-wrap items-baseline gap-x-2">
                                        <p class="text-card-title wrap-anywhere max-sm:text-sm" style:color="var(--author-color)">{comment.author.name}</p>
                                        <time class="text-meta text-gray max-sm:text-[11px]" datetime={comment.created_at}>
                                            {postedAtFormat.format(new Date(comment.created_at))}
                                        </time>
                                    </div>
                                    <p class="mt-1 whitespace-pre-wrap wrap-anywhere text-fg0">{comment.content}</p>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            {/if}
        </section>
    </section>
</Body>
