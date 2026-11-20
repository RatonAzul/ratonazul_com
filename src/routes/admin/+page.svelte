<script lang="ts">
    import type { PageData } from './$types';
    import Body from "$lib/components/shared/Body.svelte";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";

    let { data }: { data: PageData } = $props();
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin' }]}>admin</H1WithBreadCrumb>
    <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <a href="/admin/calendar" class="card-link border-yellow">
            <span class="text-yellow text-card-title">calendar</span>
            <span class="subtitle">manage calendar access, event types and events</span>
        </a>
        <a href="/admin/games" class="card-link border-green">
            <span class="text-green text-card-title">games</span>
            <span class="subtitle">manage wordle, la palabra del día and isaaconnect results</span>
        </a>
        <a
            href="/admin/users"
            class="card-link border-blue"
        >
            <span class="text-blue text-card-title">users</span>
            <span class="subtitle">view users and manage their roles</span>
        </a>
        <a
            href="/admin/motorsport"
            class="card-link border-purple"
        >
            <span class="text-purple text-card-title">motorsport</span>
            <span class="subtitle">manage drivers, meetings and race data</span>
        </a>
    </div>
</Body>
