<script lang="ts">
    import { Dialog } from 'bits-ui';
    import { XIcon } from 'phosphor-svelte';
    import type { Snippet } from 'svelte';

    let {
        title, label, triggerClass, trigger, children,
        open = $bindable(false), onOpenChange
    }: {
        title: string;
        label: string;
        triggerClass: string;
        trigger: Snippet;
        children: Snippet;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    } = $props();
</script>

<Dialog.Root bind:open {onOpenChange}>
    <Dialog.Trigger class={triggerClass} aria-label={label}>
        {@render trigger()}
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Content class="fixed inset-0 z-50 flex h-dvh flex-col bg-bg1 text-fg0">
            <div class="flex shrink-0 items-center justify-between gap-4 border-b border-bg3 p-4">
                <Dialog.Title class="text-section-title text-green">{title}</Dialog.Title>
                <Dialog.Close class="button size-10 px-0 py-0 text-fg0 hover:text-gray" aria-label={'close ' + title}>
                    <XIcon class="size-5" aria-hidden="true" />
                </Dialog.Close>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                {@render children()}
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
