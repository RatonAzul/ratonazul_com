<script lang="ts">
    import type { PageData } from './$types';
    import Body from "$lib/components/shared/Body.svelte";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";

    let { data }: { data: PageData } = $props();
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin' }]}>admin</H1WithBreadCrumb>
    <div class="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <a
            href="/admin/users"
            class="cursor-pointer bg-bg1 hover:bg-bg2 border-l-4 border-blue p-4 flex flex-col gap-2"
        >
            <span class="text-blue text-xl font-semibold">users</span>
            <span class="text-gray text-sm">view users and manage their roles</span>
        </a>
        <a
            href="/admin/motorsport"
            class="cursor-pointer bg-bg1 hover:bg-bg2 border-l-4 border-purple p-4 flex flex-col gap-2"
        >
            <span class="text-purple text-xl font-semibold">motorsport</span>
            <span class="text-gray text-sm">manage drivers, meetings and race data</span>
        </a>
    </div>
</Body>
