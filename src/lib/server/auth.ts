import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { defaultProfileColor, isProfileColor, profileColors } from '$lib/utils/profile-colors';
import {admin} from "better-auth/plugins";
import {adminClient} from "better-auth/client/plugins";

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string,
		}
	},
	user: {
		deleteUser: { enabled: true },
		additionalFields: {
			username: {
				type: "string",
				required: false,
			},
			color: {
				type: [...profileColors],
				required: false,
				defaultValue: defaultProfileColor,
				validator: {
					input: {
						'~standard': {
							version: 1,
							vendor: 'ratonazul',
							validate: (value) => isProfileColor(value) ? { value } : { issues: [{ message: 'Choose a profile color from the palette.' }] }
						}
					}
				}
			}
		}
	},
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent)
	]
});
