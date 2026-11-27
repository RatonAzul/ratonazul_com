<script lang="ts">
    import { Select } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';
    import UserSelectLabel, { type SelectableUser } from '$lib/components/shared/UserSelectLabel.svelte';
    import UserAvatar from '$lib/components/shared/UserAvatar.svelte';

    let { player, options, points, color, backgroundColor, right, selectPlayer }: {
        player: SelectableUser;
        options: SelectableUser[];
        points: number | null;
        color: string;
        backgroundColor: string;
        right: boolean;
        selectPlayer: (id: string) => void;
    } = $props();

    function accent(user: SelectableUser) {
        return isProfileColor(user.color) ? user.color : defaultProfileColor;
    }

    let card = $state<HTMLDivElement>();
    let name = $derived(player.username || player.name);
</script>

<Select.Root type="single" value={player.id} allowDeselect={false} onValueChange={selectPlayer}>
    <div class="surface-card flex min-w-0 items-stretch gap-1 sm:gap-2 {right ? 'flex-row-reverse border-r-4' : 'border-l-4'}"
        style:border-color={color} style:color style:background-color={backgroundColor} bind:this={card}>
        <div class="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 {right ? 'flex-row-reverse pr-1 sm:pr-2' : 'pl-1 sm:pl-2'}">
            <a href={'/games/profile/' + encodeURIComponent(player.id)} aria-label={`View ${name}’s Games profile`}
                class="shrink-0 hover:brightness-110">
                <UserAvatar image={player.image} showImage={player.showImage} color={player.color} class="my-1 size-8 sm:size-12" />
            </a>
            <span class="min-w-0 truncate text-body font-semibold sm:text-section-title {right ? 'text-right' : 'text-left'}"
                title={name}>{name}</span>
        </div>
        <Select.Trigger aria-label={`${right ? 'Right' : 'Left'} player: ${name}${points === null ? '' : `, ${points} points`}`}
            class="flex shrink-0 cursor-pointer items-center gap-1 hover:brightness-110 focus-visible:brightness-110 sm:gap-2
                {right ? 'flex-row-reverse' : ''}">
            <CaretDownIcon class="size-3 shrink-0 lg:size-5 {right ? 'lg:ml-2' : 'lg:mr-2'}" aria-hidden="true" />
            <span class="flex w-9 shrink-0 items-center justify-center self-stretch text-body font-bold tabular-nums sm:w-24 sm:text-card-title lg:w-32"
                style:background-color={backgroundColor}>{points ?? '–'}</span>
        </Select.Trigger>
    </div>
    <Select.Portal>
        <Select.Content class="menu-panel z-30 min-w-(--bits-select-anchor-width)" sideOffset={4} customAnchor={card} align={right ? 'end' : 'start'}>
            <Select.Viewport class="max-h-60 overflow-y-auto">
                {#each options as option (option.id)}
                    <Select.Item class="menu-item justify-between {right ? 'flex-row-reverse border-r-4' : 'border-l-4'}" value={option.id} label={option.username || option.name}
                        style={`border-color: var(--${accent(option)})`}>
                        {#snippet children({ selected })}
                            <UserSelectLabel user={option} {right} />
                            {#if selected}<CheckIcon class="size-4 shrink-0" aria-hidden="true" />{/if}
                        {/snippet}
                    </Select.Item>
                {/each}
            </Select.Viewport>
        </Select.Content>
    </Select.Portal>
</Select.Root>
