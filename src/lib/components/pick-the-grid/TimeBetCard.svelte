<script lang="ts">
    import type {TimeBetDraft} from "$lib/types/motorsport";

    let { bet = $bindable() }: { bet?: TimeBetDraft } = $props();

    let minutes = $state('');
    let seconds = $state('');
    let milliseconds = $state('');
    let isEditing = $state(false);

    let secondsRef = $state<HTMLInputElement | null>(null);
    let millisecondsRef = $state<HTMLInputElement | null>(null);
    let minutesRef = $state<HTMLInputElement | null>(null);
    $effect(() => {
        if (bet?.guessedTime && !isEditing) {
            const totalMs = bet.guessedTime;
            const m = Math.floor(totalMs / 60000);
            const s = Math.floor((totalMs % 60000) / 1000);
            const ms = totalMs % 1000;
            minutes = m.toString();
            seconds = s.toString().padStart(2, '0');
            milliseconds = ms.toString().padStart(3, '0');
            isEditing = true;
        }
    });

    function startEditing() {
        isEditing = true;
        // focus minutes after svelte renders the inputs
        setTimeout(() => minutesRef?.focus(), 0);
    }

    function onMinutesInput(e: Event) {
        const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
        const num = parseInt(val) || 0;
        minutes = num > 59 ? '59' : val.slice(0, 1);
        (e.target as HTMLInputElement).value = minutes;
        if (minutes.length === 1) secondsRef?.focus();
    }

    function onSecondsInput(e: Event) {
        const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
        const num = parseInt(val) || 0;
        seconds = num > 59 ? '59' : val.slice(0, 2);
        (e.target as HTMLInputElement).value = seconds;
        if (seconds.length === 2) millisecondsRef?.focus();
    }

    function onMillisecondsInput(e: Event) {
        const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
        milliseconds = val.slice(0, 3);
        (e.target as HTMLInputElement).value = milliseconds;
    }

    function onSecondsKeydown(e: KeyboardEvent) {
        if (e.key === 'Backspace' && seconds === '') {
            minutesRef?.focus();
        }
    }

    function onMillisecondsKeydown(e: KeyboardEvent) {
        if (e.key === 'Backspace' && milliseconds === '') {
            secondsRef?.focus();
        }
    }
</script>

<div class="flex gap-2 h-10">
    <div class="flex justify-center items-center aspect-square bg-purple text-bg0">Q</div>
    <div class="bg-bg1 hover:bg-bg2 flex w-full justify-between items-center border-l-purple border-l-8 h-10">
        <div class="flex items-center ps-4 gap-0.5 flex-1 text-sm">
            {#if isEditing}
                <input
                        bind:this={minutesRef}
                        type="text"
                        inputmode="numeric"
                        placeholder="1"
                        maxlength="1"
                        value={minutes}
                        oninput={onMinutesInput}
                        class="bg-transparent w-4 text-center outline-none"
                />
                <span class="text-gray-dark">:</span>
                <input
                        bind:this={secondsRef}
                        type="text"
                        inputmode="numeric"
                        placeholder="27"
                        maxlength="2"
                        value={seconds}
                        oninput={onSecondsInput}
                        onkeydown={onSecondsKeydown}
                        class="bg-transparent w-6 text-center outline-none"
                />
                <span class="text-gray-dark">.</span>
                <input
                        bind:this={millisecondsRef}
                        type="text"
                        inputmode="numeric"
                        placeholder="343"
                        maxlength="3"
                        value={milliseconds}
                        oninput={onMillisecondsInput}
                        onkeydown={onMillisecondsKeydown}
                        class="bg-transparent w-8 text-center outline-none"
                />
            {:else}
                <button
                        onclick={startEditing}
                        class="text-gray-dark text-sm font-normal hover:cursor-text"
                >
                    Select the pole position time
                </button>
            {/if}
        </div>
        <span class="text-bg0 {bet?.points ? '' : 'bg-gray-dark'} font-medium text-lg flex justify-center items-center aspect-square h-full">
        {bet?.points ? '+' + bet?.points : '-'}
    </span>
    </div>
</div>