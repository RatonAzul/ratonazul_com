<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";
	import Header from "$lib/components/shared/Header.svelte";
	import {showCrt, theme} from "$lib/stores/globalSettings";
	import Footer from "$lib/components/shared/Footer.svelte";

	let { children } = $props();

	$effect(() => {
		document.documentElement.className= `theme-${theme.current}`;
	})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="theme-{theme.current} w-full min-h-dvh bg-bg0 text-fg0 font-jetbrains {showCrt.current ? 'crt' : ''}">
	<div class="min-h-dvh xl:max-w-[80%] mx-auto p-4 flex flex-col items-center relative">
		<Header/>
		{@render children()}
		<Footer/>
	</div>
</div>


<style>
	.crt::after {
		content: "";
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(rgba(0, 0, 0, 0.4) 1px, transparent 1px);
		background-size: 2px 2px;
		background-repeat: repeat;
		pointer-events: none;
		z-index: 9999;
	}
</style>