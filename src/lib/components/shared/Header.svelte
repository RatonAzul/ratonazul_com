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
<div class="surface-card sticky top-4 z-20 mx-auto me-0 flex h-10 w-full items-center ps-2">
    <div class="flex items-center flex-1 text-body relative">
        <div class="flex items-center gap-2 px-2">
            <a href="/" class="text-blue hover:text-blue-dark text-card-title sm:block hidden">ratonazul</a>
            <a href="/" class="text-blue hover:text-blue-dark text-card-title sm:hidden block">rt</a>
            <div class="pt-px ms-2">
                <Navbar/>
            </div>
        </div>
        <div class="ms-auto flex h-10 items-center gap-1 sm:gap-2">
            <!-- Theme selector -->
            <Select.Root type="single" bind:value={theme.current}>
                <Select.Trigger class="button button-quiet px-2" aria-label="Color theme">
                    <PaletteIcon class="sm:size-6 size-5" weight="regular" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content class="menu-panel" sideOffset={30} align="end" alignOffset={alignOffset}>
                        <Select.Viewport>
                            {#each themes as themeOption (themeOption)}
                                <Select.Item class="theme-{themeOption} surface-card menu-item gap-4 text-fg0" value={themeOption} label={themeOption}>
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
            <button class="button button-quiet px-2" onclick={toggleShowCrt} aria-label="Toggle CRT effect">
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
