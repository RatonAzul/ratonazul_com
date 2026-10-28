<div class="mt-8">
    {@render link("https://github.com/ratonazul", "github")}
    {@render link("https://twitter.com/ratonazul_", "twitter")}
</div>

{#snippet link(link, name)}
    <a class="external-link" href={link}>{name}</a>
{/snippet}
