<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import { page } from "$app/state";
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
    <DropdownMenu.Trigger class="hover:cursor-pointer text-gray hover:text-gray-dark flex items-center gap-2 h-10">
        <span class="h-full flex items-center justify-center gap-2 text-bg1 sm:px-4 font-medium sm:aspect-auto aspect-square
                {$session.data ? 'bg-blue hover:bg-blue-dark' : 'bg-green hover:bg-green-dark'}">
            {#if $session.data}
                <UserIcon weight="fill" class="sm:size-6 size-5" />
                <span class="sm:block hidden">{displayName}</span>
            {:else}
                <SignInIcon weight="fill" class="sm:size-6 size-5" />
            {/if}
        </span>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={12} align="end" class="bg-bg1 flex flex-col font-jetbrains h-full">
            {#if $session.data}
                <DropdownMenu.Item
                        class="hover:cursor-pointer hover:bg-bg2 text-sm text-fg0 p-2 flex items-center gap-2"
                        onSelect={() => {
                        newName = $session.data?.user.username ?? "";
                        editingName = true;
                    }}
                >
                    <PencilIcon weight="fill" class="sm:size-6 size-5" />
                    change username
                </DropdownMenu.Item>
                <DropdownMenu.Item
                        class="hover:cursor-pointer hover:bg-bg2 text-sm text-red p-2 flex items-center gap-2"
                        onSelect={() => authClient.signOut()}
                >
                    <SignOutIcon weight="fill" class="sm:size-6 size-5" />
                    log out
                </DropdownMenu.Item>
            {:else}
                <DropdownMenu.Item
                        class="hover:cursor-pointer hover:bg-bg3 text-sm text-gray p-2 flex items-center gap-2"
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
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-bg1 p-4 flex flex-col gap-3">
            <p class="text-gray text-sm">{$session.data?.user.username ? 'edit username' : 'choose a username'}</p>
            <input
                    class="bg-bg2 text-gray p-2 text-sm outline-none"
                    maxlength="15"
                    bind:value={newName}
                    onkeydown={(e) => e.key === "Enter" && saveName()}
            />
            <div class="flex gap-2 justify-end">
                {#if $session.data?.user.username}
                    <button
                            class="text-gray text-sm hover:text-gray-dark hover:cursor-pointer"
                            onclick={() => (editingName = false)}
                    >
                        cancel
                    </button>
                {/if}
                <button
                        class="text-green text-sm hover:text-green-dark hover:cursor-pointer"
                        onclick={saveName}
                >
                    save
                </button>
            </div>
        </div>
    </div>
{/if}