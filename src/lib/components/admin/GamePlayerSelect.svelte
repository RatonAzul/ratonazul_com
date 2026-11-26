<script lang="ts">
    import { Combobox } from 'bits-ui';
    import { CaretDownIcon, CheckIcon } from 'phosphor-svelte';

    let { users, label, name, value = $bindable('') }: {
        users: { id: string; name: string; username: string | null; email: string }[];
        label: string;
        name: string;
        value?: string;
    } = $props();

    let open = $state(false);
    let search = $state('');
    const options = $derived([
        { value: '', label: 'empty slot', keywords: 'empty slot' },
        ...users.map(user => ({
            value: user.id,
            label: user.name + (user.username ? ' · @' + user.username : ' · ' + user.email),
            keywords: [user.name, user.username, user.email].join(' ').toLowerCase()
        }))
    ]);
    const matching = $derived(options.filter(option => option.keywords.includes(search.trim().toLowerCase())));
    const selected = $derived(value ? options.find(option => option.value === value)?.label ?? '' : '');
</script>

<div class="form-label min-w-0">
    <span>{label}</span>
    <Combobox.Root type="single" {name} bind:value bind:open items={matching}
        inputValue={open ? search : selected} allowDeselect={false}
        onOpenChange={(next) => { if (!next) search = ''; }}>
        <div class="form-field flex items-center gap-2 py-0 focus-within:border-purple">
            <Combobox.Input class="min-h-10 w-full min-w-0 outline-none" aria-label={label} autocomplete="off"
                placeholder="search users" oninput={(event) => search = event.currentTarget.value} />
            <Combobox.Trigger class="button button-quiet min-h-10 px-1" aria-label={'choose ' + label}>
                <CaretDownIcon size={16} aria-hidden="true" />
            </Combobox.Trigger>
        </div>
        <Combobox.Portal>
            <Combobox.Content class="menu-panel z-30 min-w-(--bits-select-anchor-width)" sideOffset={4} align="start">
                <Combobox.Viewport class="max-h-60 overflow-y-auto">
                    {#each matching as option (option.value)}
                        <Combobox.Item class="menu-item justify-between" value={option.value} label={option.label}>
                            {#snippet children({ selected })}
                                <span class="min-w-0 break-words">{option.label}</span>
                                {#if selected}<CheckIcon class="size-4 shrink-0" aria-hidden="true" />{/if}
                            {/snippet}
                        </Combobox.Item>
                    {:else}
                        <p class="p-2 text-gray">no matching users</p>
                    {/each}
                </Combobox.Viewport>
            </Combobox.Content>
        </Combobox.Portal>
    </Combobox.Root>
</div>
