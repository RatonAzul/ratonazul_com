<script lang="ts">
    import SectionSeparator from './SectionSeparator.svelte';
</script>

<footer class="w-full text-center lg:px-4">
    <SectionSeparator />
    <div>
        {@render link("https://github.com/ratonazul", "github")}
        {@render link("https://twitter.com/ratonazul_", "twitter")}
    </div>
</footer>

{#snippet link(link, name)}
    <a class="external-link" href={link}>{name}</a>
{/snippet}
