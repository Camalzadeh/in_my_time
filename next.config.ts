import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Emits a self-contained server with only the modules actually reached.
    // Without it the Docker image has to carry the whole of node_modules.
    output: 'standalone',
};

export default nextConfig;
