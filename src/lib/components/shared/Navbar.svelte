<script>
    import { ListIcon, CameraIcon, TelevisionSimpleIcon, TireIcon, ShieldIcon } from "phosphor-svelte";
    import {DropdownMenu} from "bits-ui";
    import {page} from "$app/state";
    import {useSession} from "$lib/auth-client.ts";
    let currentPath = $derived(page.url.pathname)

    const session = useSession()
    let isAdmin = $derived($session.data?.user.role === "admin")
</script>

<nav class="hidden text-gray [&_a]:hover:text-gray-dark md:block">
    {@render link("/media", "media")}
    {@render link("/pics", "pics")}
    {@render link("/motorsport", "motorsport")}
    {#if isAdmin}{@render link("/admin", "admin")}{/if}
</nav>

<DropdownMenu.Root>
    <DropdownMenu.Trigger class="button button-quiet px-2 md:hidden" aria-label="Main menu">
        <ListIcon class="sm:size-6 size-5"/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} alignOffset={-56} align="start" class="menu-panel md:hidden">
            <DropdownMenu.Item class="menu-item">
                <TelevisionSimpleIcon class="sm:size-6 size-5"/>
                {@render link("/media", "media", "text-gray")}
            </DropdownMenu.Item>
            <DropdownMenu.Item class="menu-item">
                <CameraIcon class="sm:size-6 size-5"/>
                {@render link("/pics", "pics", "text-gray")}
            </DropdownMenu.Item>
            <DropdownMenu.Item class="menu-item">
                <TireIcon class="sm:size-6 size-5"/>
                {@render link("/motorsport", "motorsport", "text-gray")}
            </DropdownMenu.Item>
            {#if isAdmin}
                <DropdownMenu.Item class="menu-item">
                    <ShieldIcon class="sm:size-6 size-5"/>
                    {@render link("/admin", "admin", "text-gray")}
                </DropdownMenu.Item>
            {/if}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>

{#snippet link(endpoint, text, inactiveColor = "")}
    <a href={endpoint} class="{currentPath === endpoint || currentPath.startsWith(`${endpoint}/`) ? 'text-fg0' : inactiveColor}">[{text}]</a>
{/snippet}
