<script lang="ts">
    import {ButtonStatus, getButtonStyles} from "$lib/types/shared";

    let { children, status = ButtonStatus.default, handleOnClick }: { children: any, status?: ButtonStatus, handleOnClick?: () => void } = $props();
</script>

<button
    class="{getButtonStyles(status)} {status === ButtonStatus.disabled ? 'cursor-not-allowed' : 'cursor-pointer'} px-8 h-10"
    onclick={handleOnClick}
    disabled={status === ButtonStatus.disabled}
>
    {@render children()}
</button>
