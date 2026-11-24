<script lang="ts">
    import FormSelect from './FormSelect.svelte';
    import { profileColors } from '$lib/utils/profile-colors';

    type ThemeColor = (typeof profileColors)[number];

    let { color, options = profileColors }: { color: ThemeColor; options?: readonly ThemeColor[] } = $props();
    let selected = $derived<string>(color);
    let choices = $derived(options.map((value) => ({ value, label: value })));
</script>

<FormSelect label="color" name="color" options={choices} bind:value={selected}>
    {#snippet optionContent({ value })}
        <span class="size-5 border border-bg3" style:background-color={'var(--' + value + ')'}></span>
    {/snippet}
</FormSelect>
