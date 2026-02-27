import { MOTORSPORT_API_URL, PRIVATE_MOTORSPORT_API_JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

function generateToken(): string {
    return jwt.sign({}, PRIVATE_MOTORSPORT_API_JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}

async function makeRequest<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    params: Record<string, string> = {}
): Promise<T> {
    const url = new URL(`${MOTORSPORT_API_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const headers: Record<string, string> = {
        Authorization: `Bearer ${generateToken()}`,
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

    return (await res.json()) as T;
}

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) =>
        makeRequest<T>(endpoint, 'GET', undefined, params),

    post: <T>(endpoint: string, body: unknown) =>
        makeRequest<T>(endpoint, 'POST', body),

    put: <T>(endpoint: string, body: unknown) =>
        makeRequest<T>(endpoint, 'PUT', body),

    patch: <T>(endpoint: string, body: unknown) =>
        makeRequest<T>(endpoint, 'PATCH', body),

    delete: <T>(endpoint: string) =>
        makeRequest<T>(endpoint, 'DELETE'),
};