<script lang="ts">
    let {title, bgColor}: {
        title: string,
        bgColor: string,
    } = $props()
</script>

<div class="section-label {bgColor}">{title}</div>
