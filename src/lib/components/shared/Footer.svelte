<div>
    {@render link("https://github.com/ratonazul", "github")}
    {@render link("https://twitter.com/ratonazul_", "twitter")}
</div>

{#snippet link(link, name)}
    <a class="text-purple hover:text-purple-dark underline" href={link}>{name}</a>
{/snippet}