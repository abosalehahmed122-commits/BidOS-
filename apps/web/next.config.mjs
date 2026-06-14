/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bid-os/core', '@bid-os/db', '@bid-os/ai', '@bid-os/auth'],
  // Booklets can be large; allow bigger Server Action payloads for uploads.
  experimental: {
    serverActions: { bodySizeLimit: '25mb' },
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
