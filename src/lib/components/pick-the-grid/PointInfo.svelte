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
        class="button button-quiet mt-2 px-2"
        type="button"
        aria-label="Show point system rules"
        aria-expanded={isOpen}
        onclick={() => isOpen = !isOpen}
    >
        <QuestionIcon size={14} />
        point system
    </button>

    {#if isOpen}
        <div class="dialog-backdrop" role="presentation">
            <div class="dialog-panel relative max-w-xl text-secondary" role="dialog" aria-modal="true" aria-labelledby="point-system-title">
                <button
                    class="action-icon action-icon-danger absolute right-3 top-3"
                    type="button"
                    aria-label="Close point system"
                    onclick={() => isOpen = false}
                >
                    <XIcon size={20} />
                </button>
                <h2 id="point-system-title" class="mb-4 min-h-10 content-center pr-12 text-blue">point system</h2>
                <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <section>
                        <h3 class="mb-3 bg-green">qualifying time</h3>
                        <div class="flex flex-col gap-2 text-meta">
                            {@render pointRow("exact time", "+20 pts", "bg-purple")}
                            {@render pointRow("within 0.500s", "+5 pts", "bg-green")}
                            {@render pointRow("within 1.000s", "+2 pts", "bg-yellow")}
                            {@render pointRow("over 1.000s", "+0 pts", "bg-red")}
                        </div>
                    </section>

                    <section>
                        <h3 class="mb-3 bg-green">driver guesses</h3>
                        <div class="flex flex-col gap-2 text-meta">
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
