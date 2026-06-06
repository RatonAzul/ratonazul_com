<script>
import ColorPalette from "$lib/components/shared/ColorPalette.svelte";
import HomeNavbar from "$lib/components/shared/HomeNavbar.svelte";
</script>

<div class="mx-auto flex flex-col justify-center text-center items-center gap-2 w-full my-auto">
    <img src="/images/pfp.avif" alt="ratonazul" class="lg:w-28 w-24">
    <a class="font-bold lg:text-5xl text-4xl text-blue hover:text-blue-dark" href="/">ratonazul</a>
    <HomeNavbar/>
    <ColorPalette/>
    <p class="mt-2 text-sm font-light">"I believe we're stronger than they know"</p>
</div>