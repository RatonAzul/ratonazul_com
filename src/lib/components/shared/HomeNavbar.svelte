<script lang="ts">
    import { useSession } from "$lib/auth-client";
    import { page } from "$app/state";

    const session = useSession();
    let isAdmin = $derived((($session.data?.user as { role?: string } | undefined)?.role) === "admin");
    let currentPath = $derived(page.url.pathname);
</script>

<nav class="flex flex-wrap justify-center gap-x-2 text-gray [&_a]:hover:text-gray-dark">
    <a class={currentPath === '/media' || currentPath.startsWith('/media/') ? 'text-fg0' : ''} href="/media">[media]</a>
    <a class={currentPath === '/pics' || currentPath.startsWith('/pics/') ? 'text-fg0' : ''} href="/pics">[pics]</a>
    <a class={currentPath === '/motorsport' || currentPath.startsWith('/motorsport/') ? 'text-fg0' : ''} href="/motorsport">[motorsport]</a>
    {#if isAdmin}
        <a class={currentPath === '/admin' || currentPath.startsWith('/admin/') ? 'text-fg0' : ''} href="/admin">[admin]</a>
    {/if}
</nav>
