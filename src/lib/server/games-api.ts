import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';

export class GamesApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export async function gamesRequest<T>(endpoint: string, actor: string, method = 'GET', body?: unknown, claims = {}): Promise<T> {
    const base = env.RATONAZUL_COM_API_URL;
    const secret = env.PRIVATE_RATONAZUL_COM_API_JWT_SECRET;
    if (!base || !secret) throw new GamesApiError(503, 'Games API is not configured. Set RATONAZUL_COM_API_URL and PRIVATE_RATONAZUL_COM_API_JWT_SECRET.');
    let response: Response;
    try {
        response = await fetch(`${base.replace(/\/$/, '')}/v1/${endpoint}`, {
            method,
            headers: { Authorization: `Bearer ${jwt.sign({ ...claims, userId: actor }, secret, { algorithm: 'HS256', expiresIn: '5m' })}`, 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(10_000)
        });
    } catch { throw new GamesApiError(503, 'Games API is unavailable. Check that ratonazul_com_api is running.'); }
    if (!response.ok) {
        const messages: Record<number, string> = { 400: 'The games API rejected this data.', 401: 'Games API authentication failed. Check its JWT configuration.', 404: 'This record no longer exists. Reload the page.', 409: 'A result or solution already exists for this player and puzzle.' };
        throw new GamesApiError(response.status, messages[response.status] ?? 'The games API could not complete the request.');
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
}
export async function listGames<T>(endpoint: string, actor: string, filters: Record<string, string> = {}): Promise<T[]> {
    const all: T[] = [];
    for (let offset = 0; ; offset += 1000) {
        const query = new URLSearchParams({ ...filters, limit: '1000', offset: String(offset) });
        const page = await gamesRequest<T[]>(`${endpoint}?${query}`, actor);
        all.push(...page);
        if (page.length < 1000) return all;
    }
}
