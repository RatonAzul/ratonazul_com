<script lang="ts">
    import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
    import { useSession } from '$lib/auth-client';
    import { page } from '$app/state';
    import { navigationLinks } from '$lib/utils/navigation';

    const session = useSession();
    let links = $derived(navigationLinks(page.data.canAccessCalendar, $session.data?.user.role === 'admin'));
    const pageSize = 4;
    let selectedPage = $state(0);
    let pageCount = $derived(Math.ceil(links.length / pageSize));
    let currentPage = $derived(Math.min(selectedPage, pageCount - 1));
    let visible = $derived(links.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
    let start: { x: number; y: number } | undefined;

    function move(step: number) {
        selectedPage = (currentPage + step + pageCount) % pageCount;
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
    <div class="grid touch-pan-y items-center {pageCount > 1 ? 'grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]' : ''}"
        ontouchstart={startSwipe} ontouchend={finishSwipe} ontouchcancel={() => start = undefined}>
        {#if pageCount > 1}
            <button type="button" class="-my-1.5 inline-flex size-10 items-center justify-center cursor-pointer hover:text-fg0"
                onclick={() => move(-1)} aria-label="previous page">
                <CaretLeftIcon class="size-4" />
            </button>
        {/if}
        <div class="grid min-h-7 grid-cols-2 items-center justify-items-center gap-x-2 gap-y-1 sm:flex sm:justify-center" aria-live="polite">
            {#each visible as link (link.href)}
                <a href={link.href} class="internal-link whitespace-nowrap only:col-span-2">[{link.label}]</a>
            {/each}
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
                    onclick={() => selectedPage = index}>
                    <span class="size-1 rounded-full {currentPage === index ? 'bg-blue' : 'bg-gray group-hover:bg-fg0'}"></span>
                </button>
            {/each}
        </div>
    {/if}
</nav>
