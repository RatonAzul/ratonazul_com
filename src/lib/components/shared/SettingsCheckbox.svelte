<script lang="ts">
    import { CheckIcon } from 'phosphor-svelte';

    let { label, name, checked = $bindable(false), disabled = false, onChange }: {
        label: string;
        name?: string;
        checked?: boolean;
        disabled?: boolean;
        onChange?: (checked: boolean) => void;
    } = $props();

    function change(event: Event & { currentTarget: HTMLInputElement }) {
        const next = event.currentTarget.checked;
        if (onChange) {
            event.currentTarget.checked = checked;
            onChange(next);
        } else {
            checked = next;
        }
    }
</script>

<label class="group inline-flex w-fit items-center gap-2 {disabled ? 'cursor-wait opacity-60' : 'cursor-pointer'}">
    <input type="checkbox" {name} {checked} {disabled} onchange={change} class="peer sr-only" />
    <span class="flex size-4 shrink-0 items-center justify-center border border-gray bg-bg3 text-transparent
        group-hover:border-green peer-checked:border-green peer-checked:bg-green peer-checked:text-bg0
        peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-purple sm:size-[18px]"
        aria-hidden="true">
        <CheckIcon class="size-3" />
    </span>
    <span class="text-meta text-gray peer-checked:text-fg0 sm:text-secondary">{label}</span>
</label>
