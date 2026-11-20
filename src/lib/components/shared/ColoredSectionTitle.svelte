<script lang="ts">
    let { title, bgColor, id, class: className = '' }: {
        title: string;
        bgColor: 'bg-green' | 'bg-yellow';
        id?: string;
        class?: string;
    } = $props();
</script>

<h3 {id} class="section-label text-bg0 {bgColor} {className}">{title}</h3>
