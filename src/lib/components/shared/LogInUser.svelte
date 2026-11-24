<script lang="ts">
    import { authClient, signOut } from '$lib/auth-client';
    import { page } from '$app/state';
    import { invalidateAll } from '$app/navigation';
    import { SignOutIcon, SignInIcon, GoogleLogoIcon, PencilIcon } from 'phosphor-svelte';
    import { Dialog, Popover } from 'bits-ui';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import UserAvatar from './UserAvatar.svelte';
    import VisualSettings from './VisualSettings.svelte';

    const session = authClient.useSession();
    let user = $derived($session.data?.user);
    let profileColor = $derived(isProfileColor(user?.color) ? user.color : defaultProfileColor);
    let open = $state(false);
    let editing = $state(false);
    let promptedUser = $state('');
    let username = $state('');
    let name = $state('');
    let saving = $state(false);
    let feedback = $state('');
    let logoutFailed = $state(false);

    function editNames(current: NonNullable<typeof user>) {
        username = current.username ?? '';
        name = current.name;
        feedback = '';
        editing = true;
    }

    $effect(() => {
        if (user && user.id !== promptedUser) {
            promptedUser = user.id;
            if (!user.username) editNames(user);
        }
    });

    async function saveNames(event: SubmitEvent) {
        event.preventDefault();
        if (!username.trim() || !name.trim() || saving) return;
        saving = true;
        feedback = '';
        try {
            const result = await authClient.updateUser({ username: username.trim(), name: name.trim() });
            if (result.error) throw result.error;
            editing = false;
            await invalidateAll();
        } catch {
            feedback = 'unable to save your name. please try again.';
        } finally {
            saving = false;
        }
    }
    async function logout() {
        logoutFailed = false;
        try {
            const result = await signOut();
            if (result.error) throw result.error;
            open = false;
            await invalidateAll();
        } catch {
            logoutFailed = true;
        }
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger class="button h-10 {user ? 'gap-1 bg-bg1 px-0 py-0 text-fg0 hover:bg-bg2 sm:border-r-4' : 'button-primary px-3'}"
        style={user ? 'border-right-color: var(--' + profileColor + ')' : undefined}
        aria-label={user ? 'account menu' : 'sign in and settings'}>
        {#if user}
            <UserAvatar image={user.image} name={user.name} class="size-10 bg-transparent! text-inherit!" />
            <span class="hidden max-w-36 truncate px-3 sm:block" style:color={'var(--' + profileColor + ')'}>{user.username || user.name}</span>
        {:else}
            <SignInIcon class="size-5" />
        {/if}
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} class="menu-panel w-64 max-w-[calc(100vw-2rem)] p-3">
            {#if user}
                {@const current = user}
                <div class="flex items-center gap-3">
                    <UserAvatar image={user.image} name={user.name} class="size-12" />
                    <div class="min-w-0 flex-1 break-words border-r-4 pe-2" style:border-right-color={'var(--' + profileColor + ')'}>
                        <div class="flex items-center gap-2">
                            <a href={'/profile/' + encodeURIComponent(user.id)}
                                class="min-w-0 text-card-title hover:underline" style:color={'var(--' + profileColor + ')'}
                                onclick={() => open = false}>
                                {user.username || 'no username'}
                            </a>
                            <button type="button" class="relative inline-flex size-3 shrink-0 cursor-pointer items-center text-fg0 after:absolute after:inset-s-0 after:-inset-e-6 after:-inset-y-3 hover:text-gray"
                                aria-label="edit username and display name" onclick={() => { open = false; editNames(current); }}>
                                <PencilIcon class="size-3" />
                            </button>
                        </div>
                        <p class="text-secondary text-fg0">{user.name}</p>
                    </div>
                </div>
            {:else}
                <button type="button" class="button button-primary"
                    onclick={() => authClient.signIn.social({ provider: 'google', callbackURL: page.url.href })}>
                    <GoogleLogoIcon class="size-4" /> log in with google
                </button>
            {/if}
            <div class="my-3 border-y border-bg4 py-3">
                <p class="mb-2 text-card-title text-green">visuals</p>
                <VisualSettings />
            </div>
            {#if user}
                <button type="button" class="button button-danger min-h-8 px-3 py-1 text-meta" onclick={logout}>
                    <SignOutIcon class="size-4" /> log out
                </button>
                {#if logoutFailed}<p class="form-feedback mt-2 text-red" role="alert">unable to log out. please try again.</p>{/if}
            {/if}
        </Popover.Content>
    </Popover.Portal>
</Popover.Root>

<Dialog.Root bind:open={editing}>
    <Dialog.Portal>
        <Dialog.Overlay class="dialog-backdrop" />
        <Dialog.Content class="dialog-panel fixed top-1/2 left-1/2 z-50 max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2">
            <Dialog.Title class="mb-3 text-card-title text-blue">edit profile names</Dialog.Title>
            <form class="flex flex-col gap-3" onsubmit={saveNames}>
                <label class="form-label">username<input class="form-field" autocomplete="username" maxlength="15" bind:value={username} required /></label>
                <label class="form-label">display name<input class="form-field" autocomplete="name" maxlength="100" bind:value={name} required /></label>
                {#if feedback}<p class="form-feedback text-red" role="alert">{feedback}</p>{/if}
                <div class="flex justify-end gap-2">
                    <Dialog.Close class="button button-danger">cancel</Dialog.Close>
                    <button class="button button-primary" type="submit" disabled={saving}>save</button>
                </div>
            </form>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
