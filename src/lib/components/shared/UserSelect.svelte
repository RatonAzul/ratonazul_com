<script lang="ts">
    import FormSelect, { type SelectOption } from './FormSelect.svelte';
    import UserSelectLabel, { type SelectableUser } from './UserSelectLabel.svelte';
    import { defaultProfileColor, isProfileColor } from '$lib/utils/profile-colors';

    let { users, label, name, value = $bindable(''), placeholder, required = false, extraOptions = [] }: {
        users: SelectableUser[];
        label: string;
        name: string;
        value?: string;
        placeholder?: string;
        required?: boolean;
        extraOptions?: SelectOption[];
    } = $props();

    const options = $derived([
        ...extraOptions,
        ...users.map(user => ({
            value: user.id,
            label: user.username || user.name,
            accent: isProfileColor(user.color) ? user.color : defaultProfileColor
        }))
    ]);
</script>

<FormSelect {label} {name} {options} {placeholder} {required} bind:value>
    {#snippet optionContent(option)}
        {@const user = users.find(candidate => candidate.id === option.value)}
        {#if user}
            <UserSelectLabel {user} />
        {:else}
            <span class="truncate">{option.label}</span>
        {/if}
    {/snippet}
</FormSelect>
