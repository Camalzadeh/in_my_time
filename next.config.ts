import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Emits a self-contained server with only the modules actually reached.
    // Without it the Docker image has to carry the whole of node_modules.
    output: 'standalone',

    // /home used to redirect here, back when it was a second copy of the
    // landing page. It now lists the visitor's own polls, so the redirect is
    // gone; app/home/page.tsx carries `noindex` to keep the empty-handed
    // fallback out of search, which is what the redirect was really protecting.
};

export default nextConfig;
