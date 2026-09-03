import { NextRequest } from 'next/server';

/** Builds a request the way a browser would, cookies included. */
export function jsonRequest(
    url: string,
    method: 'POST' | 'DELETE',
    body: unknown,
    cookies: Record<string, string> = {},
): NextRequest {
    const cookie = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

    return new NextRequest(`http://localhost${url}`, {
        method,
        headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie } : {}),
        },
        body: JSON.stringify(body),
    });
}

/** Route handlers take their params as a promise. */
export const routeContext = (id: string) => ({ params: Promise.resolve({ id }) });
