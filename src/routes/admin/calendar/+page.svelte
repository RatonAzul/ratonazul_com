<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'calendar' }]}>calendar</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a href="/admin/calendar/access" class="card-link border-blue">
            <span class="text-blue text-card-title">calendar access</span>
            <span class="subtitle">grant or remove access for users</span>
        </a>
        <a href="/admin/calendar/types" class="card-link border-purple">
            <span class="text-purple text-card-title">event types</span>
            <span class="subtitle">edit event categories and set their priority</span>
        </a>
        <a href="/admin/calendar/events" class="card-link border-yellow">
            <span class="text-yellow text-card-title">manage events</span>
            <span class="subtitle">add, edit or delete calendar events</span>
        </a>
        <a href="/admin/calendar/game-results" class="card-link border-green">
            <span class="text-green text-card-title">game results</span>
            <span class="subtitle">choose event types for automatic game results</span>
        </a>
    </div>
</Body>
