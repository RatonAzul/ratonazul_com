<script lang="ts">
    import { ListIcon, PaletteIcon, EyeIcon, EyeSlashIcon, CheckIcon } from "phosphor-svelte";
    import {
        expandedHomeMenu,
        expandedMenu,
        showCrt, theme,
        toggleExpandedMenu,
        toggleMenu,
        toggleShowCrt
    } from "$lib/stores/globalSettings";
    import Navbar from "$lib/components/shared/Navbar.svelte";
    import { Select } from "bits-ui";
    import ColorPalette from "$lib/components/shared/ColorPalette.svelte";
    import {browser} from "$app/environment";
    import LogInUser from "$lib/components/shared/LogInUser.svelte";

    // -- toggle theme and header bar
    const themes = ["ratonazul", "gruvbox"];

    // -- align theme dropdown with header end
    let alignOffset = $state(-83);
    if (browser) {
        const mq = window.matchMedia("(min-width: 640px)");

        const set = () =>
            alignOffset = mq.matches ? -103 : -83;

        set();
        mq.addEventListener("change", set);
    }

</script>
<div class="bg-bg1 h-10 mx-auto me-0 w-full flex items-center sticky top-4 ps-2">
    <div class="flex items-center flex-1 sm:text-base text-sm relative">
        <div class="flex items-center gap-2 px-2 sm:text-base">
            <a href="/" class="text-blue hover:text-blue-dark font-bold text-xl sm:block hidden">ratonazul</a>
            <a href="/" class="text-blue hover:text-blue-dark font-bold text-xl sm:hidden block">rt</a>
            <div class="pt-px ms-2">
                <Navbar/>
            </div>
        </div>
        <div class="flex items-center gap-4 ms-auto h-10">
            <!-- Theme selector -->
            <Select.Root type="single" bind:value={theme.current}>
                <Select.Trigger class="hover:cursor-pointer text-gray hover:text-gray-dark">
                    <PaletteIcon class="sm:size-6 size-5" weight="regular" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content sideOffset={30} align="end" alignOffset={alignOffset}>
                        <Select.Viewport>
                            {#each themes as themeOption, i}
                                <Select.Item class="theme-{themeOption} hover:cursor-pointer hover:bg-bg2 sm:text-base text-sm font-jetbrains text-gray bg-bg1 flex items-center gap-4 p-2"
                                             value={themeOption} label={themeOption}>
                                    <p class="me-auto">{themeOption}</p>
                                    <ColorPalette size="small" />
                                    <div class="sm:size-6 size-4">
                                        {#if themeOption === theme.current}
                                            <CheckIcon class="sm:size-6 size-4"></CheckIcon>
                                        {/if}
                                    </div>
                                </Select.Item>
                            {/each}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>

            <!-- Crt effect toggle button -->
            <button class="hover:cursor-pointer flex gap-2 text-gray hover:text-gray-dark sm:me-4 me-2" onclick={toggleShowCrt}>
                {#if showCrt.current}
                    <EyeIcon class="sm:size-6 size-5" weight="regular" />
                {:else}
                    <EyeSlashIcon class="sm:size-6 size-5" weight="regular" />
                {/if}
            </button>

            <!-- Login/out widget -->
            <LogInUser/>
        </div>
    </div>
</div>