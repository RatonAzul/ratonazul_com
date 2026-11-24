<script lang="ts">
    import { enhance } from '$app/forms';
    import FormSelect from '$lib/components/shared/FormSelect.svelte';
    import Body from '$lib/components/shared/Body.svelte';
    import H1WithBreadCrumb from '$lib/components/shared/H1WithBreadCrumb.svelte';
    import NotificationSectionSelect from '$lib/components/admin/NotificationSectionSelect.svelte';
    import { notificationGroups } from '$lib/utils/notification-groups';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
    let publishing = $state(false);
    let audience = $derived(form?.values?.audience ?? '');
    const audiences = [
        { value: 'global', label: 'site-wide' },
        ...notificationGroups.map((group) => ({ value: group, label: group }))
    ];
</script>

<Body>
    <H1WithBreadCrumb items={[{ label: 'admin', href: '/admin' }, { label: 'notifications' }]}>notifications</H1WithBreadCrumb>
    <form method="POST" class="surface-card flex max-w-xl flex-col gap-4 p-4" use:enhance={({ cancel }) => {
        if (publishing) {
            cancel();
            return;
        }
        publishing = true;
        return async ({ update }) => {
            try {
                await update();
            } finally {
                publishing = false;
            }
        };
    }}>
        <FormSelect label="audience" name="audience" options={audiences} bind:value={audience} placeholder="choose an audience" required />
        <label class="form-label">title<input class="form-field" name="title" maxlength="100" value={form?.values?.title ?? ''} required /></label>
        <label class="form-label">description<textarea class="form-field" name="description" maxlength="400" rows="4" required>{form?.values?.description ?? ''}</textarea></label>
        <NotificationSectionSelect section={form?.values?.section} />
        <label class="form-label">page path (optional)<input class="form-field" name="link" maxlength="400" placeholder="/calendar" value={form?.values?.link ?? ''} /></label>
        <button type="submit" class="button button-primary self-start" disabled={publishing}>{publishing ? 'publishing…' : 'publish'}</button>
        {#if form?.message}
            <p class="form-feedback {form.success ? 'text-green' : 'text-red'}" role={form.success ? 'status' : 'alert'}>{form.message}</p>
        {/if}
    </form>
</Body>
