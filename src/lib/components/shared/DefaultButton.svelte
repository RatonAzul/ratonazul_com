<script lang="ts">
    import {ButtonStatus, getButtonStyles} from "$lib/types/shared";

    let { children, status = ButtonStatus.default, handleOnClick }: { children: any, status?: ButtonStatus, handleOnClick?: () => void } = $props();
</script>

<button
    type="button"
    class="button {getButtonStyles(status)}"
    onclick={handleOnClick}
    disabled={status === ButtonStatus.disabled}
>
    {@render children()}
</button>
