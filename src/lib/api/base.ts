import { MOTORSPORT_API_URL, PRIVATE_MOTORSPORT_API_JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

function generateToken(userId: string): string {
    return jwt.sign({ userId }, PRIVATE_MOTORSPORT_API_JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}

async function makeRequest<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    params: Record<string, string> = {},
    userId: string = ""
): Promise<T> {

    const url = new URL(`${MOTORSPORT_API_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const headers: Record<string, string> = {
        Authorization: `Bearer ${generateToken(userId)}`,
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

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>, userId = "") =>
        makeRequest<T>(endpoint, 'GET', undefined, params, userId),

    post: <T>(endpoint: string, body: unknown, userId = "") =>
        makeRequest<T>(endpoint, 'POST', body, undefined, userId),

    put: <T>(endpoint: string, body: unknown, userId = "") =>
        makeRequest<T>(endpoint, 'PUT', body, undefined, userId),

    patch: <T>(endpoint: string, body: unknown, userId = "") =>
        makeRequest<T>(endpoint, 'PATCH', body, undefined, userId),

    delete: <T>(endpoint: string) =>
        makeRequest<T>(endpoint, 'DELETE'),
};