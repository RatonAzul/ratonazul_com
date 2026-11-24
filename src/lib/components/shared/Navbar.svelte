<script lang="ts">
    import FilledSectionIcon from './FilledSectionIcon.svelte';
    import { ListIcon } from 'phosphor-svelte';
    import { DropdownMenu } from 'bits-ui';
    import { page } from '$app/state';
    import { useSession } from '$lib/auth-client';
    import { isActiveLink, navigationLinks } from '$lib/utils/navigation';

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

<DropdownMenu.Root>
    <DropdownMenu.Trigger class="button button-quiet px-2 text-gray min-[1200px]:hidden" aria-label="main menu">
        <ListIcon class="size-5" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="start" class="menu-panel min-[1200px]:hidden">
            {#each links as link (link.href)}
                {@const active = isActiveLink(page.url.pathname, link.href)}
                <DropdownMenu.Item>
                    {#snippet child({ props })}
                        <a {...props} href={link.href} aria-current={active ? 'page' : undefined}
                            class="menu-item {active ? 'text-fg0' : 'text-gray'}">
                            <FilledSectionIcon icon={link.icon} color={link.color} />
                            [{link.label}]
                        </a>
                    {/snippet}
                </DropdownMenu.Item>
            {/each}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>
