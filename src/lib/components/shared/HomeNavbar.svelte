<script lang="ts">
    import { fly } from 'svelte/transition';
    import { MediaQuery } from 'svelte/reactivity';
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { useSession } from '$lib/auth-client';
    import { page } from '$app/state';
    import { navigationLinks } from '$lib/utils/navigation';

    const session = useSession();
    let links = $derived(navigationLinks(page.data.canAccessCalendar, $session.data?.user.role === 'admin'));
    const phone = new MediaQuery('(width < 40rem)');
    const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
    let pageSize = $derived(phone.current ? 3 : 4);
    let selectedPage = $state(0);
    let direction = $state(1);
    let pageCount = $derived(Math.ceil(links.length / pageSize));
    let currentPage = $derived(Math.min(selectedPage, pageCount - 1));
    let visible = $derived(links.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
    let start: { x: number; y: number } | undefined;

    function move(step: number) {
        direction = step;
        selectedPage = (currentPage + step + pageCount) % pageCount;
    }

    function select(index: number) {
        direction = index < currentPage ? -1 : 1;
        selectedPage = index;
    }

    function startSwipe(event: TouchEvent) {
        const touch = event.touches[0];
        start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : undefined;
    }

    function finishSwipe(event: TouchEvent) {
        if (!start) return;
        const touch = event.changedTouches[0];
        const x = touch.clientX - start.x;
        const y = touch.clientY - start.y;
        start = undefined;
        if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y)) move(x < 0 ? 1 : -1);
    }
</script>

<nav aria-label="home navigation" class="-mt-2 w-full max-w-md text-gray">
    <div role="group" class="grid touch-pan-y items-center {pageCount > 1 ? 'grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]' : ''}"
        ontouchstart={startSwipe} ontouchend={finishSwipe} ontouchcancel={() => start = undefined}>
        {#if pageCount > 1}
            <button type="button" class="-my-1.5 inline-flex size-10 items-center justify-center cursor-pointer hover:text-fg0"
                onclick={() => move(-1)} aria-label="previous page">
                <CaretLeftIcon class="size-4" />
            </button>
        {/if}
        <div class="min-w-0 overflow-clip" aria-live="polite">
            {#key currentPage}
                <div class="flex min-h-7 items-center justify-center gap-x-2"
                    in:fly={{ x: direction * 24, duration: reducedMotion.current ? 0 : 180 }}>
                    {#each visible as link (link.href)}
                        <a href={link.href} class="internal-link whitespace-nowrap max-sm:text-meta">[{link.label}]</a>
                    {/each}
                </div>
            {/key}
        </div>
        {#if pageCount > 1}
            <button type="button" class="-my-1.5 inline-flex size-10 items-center justify-center cursor-pointer hover:text-fg0"
                onclick={() => move(1)} aria-label="next page">
                <CaretRightIcon class="size-4" />
            </button>
        {/if}
    </div>
    {#if pageCount > 1}
        <div class="flex justify-center" role="group" aria-label="home navigation pages">
            {#each Array(pageCount) as _, index (index)}
                <button type="button" class="group inline-flex h-3 w-5 cursor-pointer items-center justify-center"
                    aria-label={'page ' + (index + 1)} aria-current={currentPage === index ? 'page' : undefined}
                    onclick={() => select(index)}>
                    <span class="size-1 rounded-full {currentPage === index ? 'bg-blue' : 'bg-gray group-hover:bg-fg0'}"></span>
                </button>
            {/each}
        </div>
    {/if}
</nav>
