<script lang="ts">
    import { MediaQuery } from 'svelte/reactivity';
    import Navbar from './Navbar.svelte';
    import LogInUser from './LogInUser.svelte';
    import NotificationBell from './NotificationBell.svelte';
    const phone = new MediaQuery('(width < 40rem)');
</script>

<div class="surface-card sticky top-4 z-20 mx-auto me-0 flex h-10 w-full items-center ps-2">
    <div class="flex min-w-0 flex-1 items-center gap-2 text-body">
        <a href="/" class="ms-2 hidden text-card-title text-blue hover:text-blue-dark sm:block">ratonazul</a>
        <a href="/" class="ms-2 text-card-title text-blue hover:text-blue-dark sm:hidden">rt</a>
        <Navbar mobile={phone.current} />
        <div class="ms-auto flex h-10 shrink-0 items-center gap-2 sm:gap-3">
            <NotificationBell mobile={phone.current} />
            <LogInUser mobile={phone.current} />
        </div>
    </div>
</div>
