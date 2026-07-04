import jwt from 'jsonwebtoken';
import {MOTORSPORT_API_URL, PRIVATE_MOTORSPORT_API_JWT_SECRET} from "$env/static/private";

function generateToken(userId: string, secret: string): string {
    return jwt.sign({ userId }, secret, { algorithm: 'HS256', expiresIn: '1h' });
}

async function makeRequest<T>(
    baseUrl: string,
    secret: string,
    endpoint: string,
    method: string,
    body?: unknown,
    params: Record<string, string> = {},
    userId: string = ""
): Promise<T> {
    const url = new URL(`${baseUrl}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const headers: Record<string, string> = {
        Authorization: `Bearer ${generateToken(userId, secret)}`,
    };
    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        throw new Error(`${method} ${endpoint} failed: ${res.status}`);
    }
    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return undefined as T;
    }

    return (await res.json()) as T;
}

export function createApiClient(baseUrl: string, secret: string) {
    return {
        get: <T>(endpoint: string, params?: Record<string, string>, userId = "") =>
            makeRequest<T>(baseUrl, secret, endpoint, 'GET', undefined, params, userId),
        post: <T>(endpoint: string, body: unknown, userId = "") =>
            makeRequest<T>(baseUrl, secret, endpoint, 'POST', body, undefined, userId),
        put: <T>(endpoint: string, body: unknown, userId = "") =>
            makeRequest<T>(baseUrl, secret, endpoint, 'PUT', body, undefined, userId),
        patch: <T>(endpoint: string, body: unknown, userId = "") =>
            makeRequest<T>(baseUrl, secret, endpoint, 'PATCH', body, undefined, userId),
        delete: <T>(endpoint: string, userId = "") =>
            makeRequest<T>(baseUrl, secret, endpoint, 'DELETE', undefined, undefined, userId),
    };
}


// API CLIENTS
export const motorsportApi = createApiClient(MOTORSPORT_API_URL, PRIVATE_MOTORSPORT_API_JWT_SECRET);