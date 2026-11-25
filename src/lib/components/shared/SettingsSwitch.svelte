<script lang="ts">
    import { Switch } from 'bits-ui';

    const id = $props.id();

    let { label, labelId = id, checked, onChange, disabled = false, accessibleLabel }: {
        label: string;
        labelId?: string;
        checked: boolean;
        onChange: (checked: boolean) => void;
        disabled?: boolean;
        accessibleLabel?: string;
    } = $props();
</script>

<div class="flex items-center gap-3">
    <Switch.Root bind:checked={() => checked, onChange} {disabled}
        aria-label={accessibleLabel} aria-labelledby={accessibleLabel ? undefined : labelId}
        class="group inline-flex h-6 w-12 shrink-0 cursor-pointer items-center bg-bg3 p-[3px] hover:bg-bg4 disabled:cursor-wait max-sm:h-5 max-sm:w-10">
        <Switch.Thumb class="size-[18px] transition-transform group-data-[state=checked]:translate-x-6 max-sm:size-3.5 max-sm:group-data-[state=checked]:translate-x-5"
            style={checked ? 'background-color: var(--green)' : 'background-color: color-mix(in srgb, var(--gray) 70%, var(--fg0))'} />
    </Switch.Root>
    <span id={labelId} class="text-secondary max-sm:text-meta {checked ? 'text-fg0' : 'text-gray'}">{label}</span>
</div>
