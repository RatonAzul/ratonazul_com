<script lang="ts">
    import Body from "$lib/components/shared/Body.svelte";
    import CustomH2 from "$lib/components/shared/CustomH2.svelte";
    import H1WithBreadCrumb from "$lib/components/shared/H1WithBreadCrumb.svelte";
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'motorsport' }]}>motorsport</H1WithBreadCrumb>
</Body>
