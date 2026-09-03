import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Emits a self-contained server with only the modules actually reached.
    // Without it the Docker image has to carry the whole of node_modules.
    output: 'standalone',

    async redirects() {
        return [
            // /home used to render a second copy of the landing page, which
            // splits inbound links and leaves search engines choosing between
            // two identical URLs.
            //
            // This was first done with `redirect()` inside app/home/page.tsx.
            // That works in development but not in a production build: the
            // route gets prerendered and ends up serving the landing page at
            // /home with a 200, which is the duplicate it was meant to remove.
            // Declaring it here makes it a real 308 at the edge.
            { source: '/home', destination: '/', permanent: true },
        ];
    },
};

export default nextConfig;
