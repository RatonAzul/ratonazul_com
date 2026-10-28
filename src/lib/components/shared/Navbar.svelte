<script>
    import { ListIcon, CameraIcon, TelevisionSimpleIcon, TireIcon, ShieldIcon } from "phosphor-svelte";
    import {DropdownMenu} from "bits-ui";
    import {page} from "$app/state";
    import {useSession} from "$lib/auth-client.ts";
    let currentPath = $derived(page.url.pathname)

    const session = useSession()
    let isAdmin = $derived($session.data?.user.role === "admin")
</script>

<nav class=" text-gray [&_a]:hover:text-gray-dark md:block hidden">
    {@render link("/media", "media")}
    {@render link("/pics", "pics")}
    {@render link("/motorsport", "motorsport")}
    {#if isAdmin}{@render link("/admin", "admin")}{/if}
</nav>

<DropdownMenu.Root>
    <DropdownMenu.Trigger class="justify-center items-center md:hidden flex h-10 hover:cursor-pointer hover:text-gray-dark">
        <ListIcon class="sm:size-6 size-5"/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} alignOffset={-56} align="start" class="md:hidden bg-bg2 text-gray text-sm font-jetbrains">
            <DropdownMenu.Item class="hover:bg-bg3 hover:cursor-pointer p-2 flex gap-2">
                <TelevisionSimpleIcon class="sm:size-6 size-5"/>
                <a href="/media">media</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="hover:bg-bg1 hover:cursor-pointer p-2 flex gap-2">
                <CameraIcon class="sm:size-6 size-5"/>
                <a href="/pics">pics</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="hover:bg-bg1 hover:cursor-pointer p-2 flex gap-2">
                <TireIcon class="sm:size-6 size-5"/>
                <a href="/motorsport">motorsport</a>
            </DropdownMenu.Item>
            {#if isAdmin}
                <DropdownMenu.Item class="hover:bg-bg1 hover:cursor-pointer p-2 flex gap-2">
                    <ShieldIcon class="sm:size-6 size-5"/>
                    <a class={currentPath === '/admin' || currentPath.startsWith('/admin/') ? 'text-fg0' : ''} href="/admin">admin</a>
                </DropdownMenu.Item>
            {/if}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>

{#snippet link(endpoint, text)}
    <a href={endpoint} class="{currentPath === endpoint || currentPath.startsWith(`${endpoint}/`) ? 'text-fg0' : ''}">[{text}]</a>
{/snippet}
