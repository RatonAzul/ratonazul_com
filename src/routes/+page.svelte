<script>
import ColorPalette from "$lib/components/shared/ColorPalette.svelte";
import HomeNavbar from "$lib/components/shared/HomeNavbar.svelte";
</script>

<div class="mx-auto flex flex-col justify-center text-center items-center gap-2 w-full my-auto">
    <img src="/images/pfp.avif" alt="ratonazul" class="lg:w-28 w-24">
    <h1 class="text-display"><a class="hover:text-blue-dark" href="/">ratonazul</a></h1>
    <HomeNavbar/>
    <ColorPalette/>
    <p class="subtitle mt-2">"I believe we're stronger than they know"</p>
</div>
