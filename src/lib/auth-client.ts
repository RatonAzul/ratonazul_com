import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '$lib/server/auth';
import { createAuthClient } from "better-auth/svelte";
import {adminClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [adminClient(), inferAdditionalFields<typeof auth>()]
});

export const signOut = async () => {
    const data = await authClient.signOut();
    return data;
}

export const { useSession } = authClient;