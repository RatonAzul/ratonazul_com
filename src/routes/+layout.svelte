<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="theme-gruvbox w-full min-h-screen bg-bg0 text-fg0">
	{@render children()}
</div>

<div style="display:none">
	{#each locales as locale}
		<a
			href={localizeHref(page.url.pathname, { locale })}
		>
			{locale}
		</a>
	{/each}
</div>

