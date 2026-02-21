<script>
    import {CaretLeftIcon, CaretRightIcon} from "phosphor-svelte";
</script>

<section class="bg-bg1 p-2 mb-8 flex justify-between">
    <button class="flex items-center gap-2">
        <CaretLeftIcon size={24} weight="bold" />
        <span class="flex flex-col items-start">
            <span class="text-lg text-aqua">Australia</span>
            <span class="text-base">7-9 mar</span>
        </span>
    </button>
    <button class="flex flex-col items-center">
        <span class="text-xl text-aqua">Bahrain Grand Prix</span>
        <span class="bg-green text-bg0 px-2">bet is open</span>
    </button>
    <button class="flex items-center gap-2">
        <span class="flex flex-col items-end">
            <span class="text-lg text-aqua">China</span>
            <span class="text-base">12-15 apr</span>
        </span>
        <CaretRightIcon size={24} weight="bold" />
    </button>
</section>