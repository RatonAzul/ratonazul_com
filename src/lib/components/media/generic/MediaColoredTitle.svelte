<script lang="ts">
    let {title, bgColor}: {
        title: string,
        bgColor: string,
    } = $props()
</script>

<div class="section-label h-7 text-sm sm:h-8 sm:text-base {bgColor}">{title}</div>
