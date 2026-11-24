<script lang="ts">
    import { BellIcon, CalendarIcon, JoystickIcon, TireIcon, UsersIcon } from 'phosphor-svelte';
    import AdminSectionCard from '$lib/components/admin/AdminSectionCard.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { pageColors } from '$lib/utils/page-colors';

    const sections = [
        { name: 'notifications', icon: BellIcon, description: 'publish site-wide or group alerts' },
        { name: 'calendar', icon: CalendarIcon, description: 'manage calendar access, event types and events' },
        { name: 'games', icon: JoystickIcon, description: 'manage wordle, la palabra del día and isaaconnect results' },
        { name: 'users', icon: UsersIcon, description: 'view users and manage their roles' },
        { name: 'motorsport', icon: TireIcon, description: 'manage drivers, meetings and race data' }
    ] as const;
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin' }]}>admin</H1WithBreadCrumb>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {#each sections as section (section.name)}
            <AdminSectionCard href={'/admin/' + section.name} title={section.name} description={section.description}
                icon={section.icon} color={pageColors[section.name]} />
        {/each}
    </div>
</Body>
