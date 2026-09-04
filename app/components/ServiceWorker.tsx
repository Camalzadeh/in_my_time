'use client';

import { useEffect } from 'react';

// Registers public/sw.js. Renders nothing.
//
// Only in production: in development the worker would sit in front of the dev
// server and serve stale responses after edits, which is a confusing way to
// lose an afternoon.

export default function ServiceWorker() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!('serviceWorker' in navigator)) return;

        // After load, so registration never competes with the first render.
        const register = () => {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.error('[sw] registration failed', error);
            });
        };

        if (document.readyState === 'complete') register();
        else window.addEventListener('load', register, { once: true });
    }, []);

    return null;
}
