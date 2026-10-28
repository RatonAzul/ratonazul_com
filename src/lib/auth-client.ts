import { createAuthClient } from "better-auth/svelte";
import {adminClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [adminClient()]
});

export const signOut = async () => {
    const data = await authClient.signOut();
    return data;
}

export const { useSession } = createAuthClient();