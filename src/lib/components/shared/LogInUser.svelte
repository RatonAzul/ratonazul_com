<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { UserIcon, SignOutIcon, SignInIcon, GoogleLogoIcon, PencilIcon } from "phosphor-svelte";
    import { DropdownMenu } from "bits-ui";

    const session = authClient.useSession();
    let editingName = $state(false);
    let newName = $state("");
    let hasPromptedName = $state(false);

    $effect(() => {
        if ($session.data?.user && !hasPromptedName) {
            if (!$session.data.user.username) {
                editingName = true;
            }
            hasPromptedName = true;
        }
    });

    async function saveName() {
        if (!newName.trim()) return;
        await authClient.updateUser({ username: newName.trim() });
        editingName = false;
    }

    let displayName = $derived($session.data?.user.username || 'user');
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger class="button h-10 px-3 {$session.data ? 'button-accent' : 'button-primary'}">
        <span class="flex items-center gap-2">
            {#if $session.data}
                <UserIcon weight="fill" class="sm:size-6 size-5" />
                <span class="sm:block hidden">{displayName}</span>
            {:else}
                <SignInIcon weight="fill" class="sm:size-6 size-5" />
            {/if}
        </span>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end" class="menu-panel min-w-44">
            {#if $session.data}
                <DropdownMenu.Item class="menu-item" onSelect={() => goto(`/profile/${encodeURIComponent($session.data!.user.id)}`)}>
                    <UserIcon weight="fill" class="sm:size-6 size-5" />
                    go to profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                        class="menu-item"
                        onSelect={() => {
                        newName = $session.data?.user.username ?? "";
                        editingName = true;
                    }}
                >
                    <PencilIcon weight="fill" class="sm:size-6 size-5" />
                    change username
                </DropdownMenu.Item>
                <DropdownMenu.Item
                        class="menu-item text-red"
                        onSelect={() => authClient.signOut()}
                >
                    <SignOutIcon weight="fill" class="sm:size-6 size-5" />
                    log out
                </DropdownMenu.Item>
            {:else}
                <DropdownMenu.Item
                        class="menu-item"
                        onSelect={() =>
                        authClient.signIn.social({
                            provider: "google",
                            callbackURL: `${page.url}`,
                        })}
                >
                    <GoogleLogoIcon />
                    log in with google
                </DropdownMenu.Item>
            {/if}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>

{#if editingName}
    <div class="dialog-backdrop">
        <div class="dialog-panel flex max-w-sm flex-col gap-3">
            <label for="account-username" class="form-label">{$session.data?.user.username ? 'edit username' : 'choose a username'}</label>
            <input
                    id="account-username"
                    autocomplete="username"
                    class="form-field"
                    maxlength="15"
                    bind:value={newName}
                    onkeydown={(e) => e.key === "Enter" && saveName()}
            />
            <div class="flex gap-2 justify-end">
                {#if $session.data?.user.username}
                    <button
                            class="button button-danger"
                            onclick={() => (editingName = false)}
                    >
                        cancel
                    </button>
                {/if}
                <button
                        class="button button-primary"
                        onclick={saveName}
                >
                    save
                </button>
            </div>
        </div>
    </div>
{/if}
