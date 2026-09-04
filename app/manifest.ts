import type { MetadataRoute } from 'next';

// Makes the site installable: on Android Chrome offers to add it, on iOS
// "Add to Home Screen" gives it its own icon and opens it without browser
// chrome. Served at /manifest.webmanifest.

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'InMyTime — find a time that works for everyone',
        short_name: 'InMyTime',
        description:
            'Propose some days, share one link, and see when everyone is free. No accounts.',
        // Straight to the thing people install it for.
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#fafafa',
        // Matches --primary, so the system UI does not clash with the app.
        theme_color: '#5b4bd6',
        categories: ['productivity', 'utilities'],
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
            {
                name: 'Create a poll',
                short_name: 'New poll',
                url: '/polls/create',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
        ],
    };
}
