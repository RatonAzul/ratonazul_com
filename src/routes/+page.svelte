<script>
import ColorPalette from "$lib/components/shared/ColorPalette.svelte";
import Header from "$lib/components/shared/Header.svelte";
import Footer from "$lib/components/shared/Footer.svelte";
</script>

<div class="mx-auto flex flex-col justify-center text-center items-center gap-2 min-h-screen">
    <img src="/images/pfp.avif" alt="ratonazul" class="w-28">
    <a class="font-bold text-5xl text-blue" href="/">ratonazul</a>
    <Header/>
    <ColorPalette/>
    <p class="mt-2 italic">"I believe we're stronger than they know"</p>
    <Footer/>
</div>