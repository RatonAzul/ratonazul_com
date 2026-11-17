<script lang="ts">
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import { UserIcon } from 'phosphor-svelte';
    import { profileColors } from '$lib/utils/profile-colors';
    import type { PageData, ActionData } from './$types';
    let { data, form }: { data: PageData; form: ActionData } = $props();
    let name = $derived(form?.values?.name ?? data.profile.name);
    let username = $derived(form?.values?.username ?? data.profile.username ?? '');
    let image = $derived(form?.values?.image ?? data.profile.image ?? '');
    let color = $derived(form?.values?.color ?? data.profile.color);
    let imageUrl = $derived(URL.parse(image.trim()));
    let failedImage = $state('');
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'profile' }]}>profile</H1WithBreadCrumb>
    {#if form?.message}<p class="form-feedback mb-4 {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>{/if}
    <div class="surface-card mb-4 flex max-w-xl items-center gap-4 border-l-4 p-4" style:border-left-color={`var(--${color})`}>
        <div class="flex size-20 shrink-0 items-center justify-center overflow-hidden bg-bg3 text-gray">
            {#if imageUrl && (imageUrl.protocol === 'https:' || imageUrl.protocol === 'http:') && imageUrl.href !== failedImage}
                {@const src = imageUrl.href}
                {#key src}
                    <img {src} alt="" class="size-full object-cover" onerror={() => failedImage = src} />
                {/key}
            {:else}
                <UserIcon size={32} aria-hidden="true" />
            {/if}
        </div>
        <div class="min-w-0 break-words">
            <p class="text-card-title">{username.trim() || 'no username'}</p>
            <p class="subtitle">{name.trim() || 'no name'}</p>
        </div>
    </div>
    <form method="POST" action="?/save" class="surface-card p-4 flex flex-col gap-4 max-w-xl">
        <label class="form-label">email<input class="form-field" value={data.profile.email} disabled /></label>
        <label class="form-label">name<input class="form-field" name="name" bind:value={name} maxlength="100" required /></label>
        <label class="form-label">username<input class="form-field" name="username" bind:value={username} maxlength="15" required /></label>
        <label class="form-label">image URL<input class="form-field" name="image" bind:value={image} type="url" /></label>
        <label class="form-label">
            color
            <select class="form-field" name="color" bind:value={color}>
                {#each profileColors as option (option)}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </label>
        <button type="submit" class="button button-primary self-start">save</button>
    </form>
    <form method="POST" action="?/delete" class="mt-6" onsubmit={(event) => { if (!confirm('Delete your account permanently?')) event.preventDefault(); }}>
        <button type="submit" class="button button-danger">delete account</button>
    </form>
</Body>
