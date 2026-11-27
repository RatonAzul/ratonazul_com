<script module lang="ts">
    export type SelectableUser = {
        id: string;
        name: string;
        username?: string | null;
        image?: string | null;
        showImage?: boolean | null;
        color?: string | null;
    };
</script>

<script lang="ts">
    import UserAvatar from './UserAvatar.svelte';

    let { user, right = false }: { user: SelectableUser; right?: boolean } = $props();
</script>

<span class="flex min-w-0 items-center gap-2 {right ? 'flex-row-reverse' : ''}">
    <UserAvatar image={user.image} showImage={user.showImage} color={user.color} class="size-6" />
    <span class="truncate">{user.username || user.name}</span>
</span>
