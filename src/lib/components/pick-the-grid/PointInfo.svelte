<script lang="ts">
    import { QuestionIcon, XIcon } from "phosphor-svelte";

    let isOpen = $state(false);
</script>

{#snippet pointRow(label: string, points: string, color: string)}
    <div class="flex items-center justify-between gap-3 bg-bg3 ps-2">
        <span class="text-fg0">{label}</span>
        <span class="{color} w-20 px-2 py-1 font-semibold text-bg0">{points}</span>
    </div>
{/snippet}

<div class="flex justify-start">
    <button
        class="cursor-pointer flex items-center gap-1 text-xs text-gray hover:text-gray-dark mt-2 ps-2"
        type="button"
        aria-label="Show point system rules"
        aria-expanded={isOpen}
        onclick={() => isOpen = !isOpen}
    >
        <QuestionIcon size={14} weight="bold" />
        point system
    </button>

    {#if isOpen}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
            <div class="surface-card relative w-full max-w-xl p-4 text-sm" role="dialog" aria-modal="true" aria-label="Point system">
                <button
                    class="absolute right-3 top-3 cursor-pointer text-gray hover:text-gray-dark"
                    type="button"
                    aria-label="Close point system"
                    onclick={() => isOpen = false}
                >
                    <XIcon size={20} weight="bold" />
                </button>
                <h3 class="mb-4 pr-8 text-lg font-semibold text-blue">point system</h3>
                <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <section>
                        <h4 class="mb-3 font-semibold text-gray">qualifying time</h4>
                        <div class="flex flex-col gap-2 text-xs">
                            {@render pointRow("exact time", "+20 pts", "bg-purple")}
                            {@render pointRow("within 0.500s", "+5 pts", "bg-green")}
                            {@render pointRow("within 1.000s", "+2 pts", "bg-yellow")}
                            {@render pointRow("over 1.000s", "+0 pts", "bg-red")}
                        </div>
                    </section>

                    <section>
                        <h4 class="mb-3 font-semibold text-gray">driver guesses</h4>
                        <div class="flex flex-col gap-2 text-xs">
                            {@render pointRow("exact position", "+5 pts", "bg-purple")}
                            {@render pointRow("within 1 position", "+3 pts", "bg-green")}
                            {@render pointRow("within 2 positions", "+1 pt", "bg-yellow")}
                            {@render pointRow("3+ positions away", "+0 pts", "bg-red")}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    {/if}
</div>
