<script lang="ts">
    let { title, bgColor }: { title: string; bgColor: 'bg-green' | 'bg-yellow' } = $props();
</script>

<h3 class="section-label text-bg0 {bgColor}">{title}</h3>
