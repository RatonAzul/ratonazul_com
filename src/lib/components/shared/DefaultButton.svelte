<script lang="ts">
    import {ButtonStatus, getButtonStyles} from "$lib/types/shared";

    let { children, status = ButtonStatus.default }: { children: any, status?: ButtonStatus } = $props();
</script>

<button class="{getButtonStyles(status)} px-8 h-10">
    {@render children()}
</button>