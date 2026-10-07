<script lang="ts">
    let {title, bgColor}: {
        title: string,
        bgColor: string,
    } = $props()
</script>

<div class="{bgColor} lg:text-base text-sm text-bg0 ps-2">{title}</div>