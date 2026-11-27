<script lang="ts">
    import { CalendarDotsIcon, GameControllerIcon, TagIcon, UsersIcon } from 'phosphor-svelte';
    import AdminSectionCard from '$lib/components/admin/AdminSectionCard.svelte';
    import { pageColors } from '$lib/utils/page-colors';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar' }]}>calendar</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminSectionCard href="/admin/calendar/access" title="calendar access" icon={UsersIcon}
            color={pageColors.calendar} description="grant or remove access for users" />
        <AdminSectionCard href="/admin/calendar/types" title="event types" icon={TagIcon}
            color={pageColors.calendar} description="edit event categories and set their priority" />
        <AdminSectionCard href="/admin/calendar/events" title="manage events" icon={CalendarDotsIcon}
            color={pageColors.calendar} description="add, edit or delete calendar events" />
        <AdminSectionCard href="/admin/calendar/game-results" title="game results" icon={GameControllerIcon}
            color={pageColors.calendar} description="choose event types for automatic game results" />
    </div>
</Body>
