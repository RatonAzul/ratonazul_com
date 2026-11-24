<script lang="ts">
    import FilledSectionIcon from '$lib/components/shared/FilledSectionIcon.svelte';
    import type { Component } from 'svelte';
    import type { pageColors } from '$lib/utils/page-colors';

    let { href, title, description, icon, color }: {
        href: string;
        title: string;
        description: string;
        icon: Component<{ class?: string }>;
        color: (typeof pageColors)[keyof typeof pageColors];
    } = $props();
</script>

<a {href} class="card-link" style:--section-color={'var(--' + color + ')'}
    style:border-left-color="var(--section-color)">
    <span class="flex items-center gap-2 text-card-title" style:color="var(--section-color)">
        <FilledSectionIcon {icon} {color} />
        {title}
    </span>
    <span class="subtitle">{description}</span>
</a>
