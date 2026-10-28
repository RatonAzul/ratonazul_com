<script lang="ts">
    import { useSession } from "$lib/auth-client";

    const session = useSession();
    let isAdmin = $derived((($session.data?.user as { role?: string } | undefined)?.role) === "admin");
</script>

<nav class="text-gray [&_a]:hover:text-gray-dark">
    <a href="/media">[media]</a>
    <a href="/pics">[pics]</a>
    <a href="/motorsport">[motorsport]</a>
    {#if isAdmin}
        <a href="/admin">[admin]</a>
    {/if}
</nav>
