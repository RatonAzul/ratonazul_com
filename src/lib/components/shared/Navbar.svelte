<script lang="ts">
    import MobileMenu from './MobileMenu.svelte';
    import FilledSectionIcon from './FilledSectionIcon.svelte';
    import { ListIcon } from 'phosphor-svelte';
    import { DropdownMenu } from 'bits-ui';
    import { page } from '$app/state';
    import { useSession } from '$lib/auth-client';
    import { isActiveLink, navigationLinks } from '$lib/utils/navigation';

    let { mobile }: { mobile: boolean } = $props();
    let open = $state(false);
    const session = useSession();
    let links = $derived(navigationLinks(page.data.canAccessCalendar, $session.data?.user.role === 'admin'));
</script>

<nav aria-label="main navigation" class="hidden items-center gap-2 whitespace-nowrap text-gray min-[1200px]:flex">
    {#each links as link (link.href)}
        {@const active = isActiveLink(page.url.pathname, link.href)}
        <a href={link.href} aria-current={active ? 'page' : undefined}
            class={active ? 'text-fg0' : 'hover:text-fg0'}>[{link.label}]</a>
    {/each}
</nav>

{#snippet menuIcon()}
    <ListIcon class="size-5" />
{/snippet}

{#snippet linkLabel(link: (typeof links)[number])}
    <FilledSectionIcon icon={link.icon} color={link.color} />
    [{link.label}]
{/snippet}

{#if mobile}
    <MobileMenu bind:open title="main menu" label="main menu" triggerClass="button button-quiet px-2 text-gray" trigger={menuIcon}>
        <nav aria-label="main navigation">
            {#each links as link (link.href)}
                {@const active = isActiveLink(page.url.pathname, link.href)}
                <a href={link.href} aria-current={active ? 'page' : undefined}
                    class="menu-item {active ? 'text-fg0' : 'text-gray'}" onclick={() => open = false}>
                    {@render linkLabel(link)}
                </a>
            {/each}
        </nav>
    </MobileMenu>
{:else}
    <DropdownMenu.Root bind:open>
        <DropdownMenu.Trigger class="button button-quiet px-2 text-gray min-[1200px]:hidden" aria-label="main menu">
            {@render menuIcon()}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
            <DropdownMenu.Content sideOffset={8} align="start" class="menu-panel min-[1200px]:hidden">
                {#each links as link (link.href)}
                    {@const active = isActiveLink(page.url.pathname, link.href)}
                    <DropdownMenu.Item>
                        {#snippet child({ props })}
                            <a {...props} href={link.href} aria-current={active ? 'page' : undefined}
                                class="menu-item {active ? 'text-fg0' : 'text-gray'}">
                                {@render linkLabel(link)}
                            </a>
                        {/snippet}
                    </DropdownMenu.Item>
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
{/if}
