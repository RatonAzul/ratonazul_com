<script>
    import { ListIcon, CameraIcon, TelevisionSimpleIcon, TireIcon } from "phosphor-svelte";
    import {DropdownMenu} from "bits-ui";
    import {page} from "$app/state";
    let currentPage = $derived(page.route.id)
</script>

<nav class=" text-gray [&_a]:hover:text-gray-dark md:block hidden">
    <a href="/media" class="{currentPage === '/media' ? 'text-fg0' : ''}">[media]</a>
    <a href="/pics" class="{currentPage === '/pics' ? 'text-fg0' : ''}">[pics]</a>
    <a href="/motorsport" class="{currentPage === '/motorsport' ? 'text-fg0' : ''}">[motorsport]</a>
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
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>