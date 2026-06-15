/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-hosting (Docker/VPS): emit a minimal standalone server bundle.
  output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
  transpilePackages: ['@bid-os/core', '@bid-os/db', '@bid-os/ai', '@bid-os/auth'],
  // Booklets can be large; allow bigger Server Action payloads for uploads.
  experimental: {
    serverActions: { bodySizeLimit: '25mb' },
    serverComponentsExternalPackages: ['unpdf'],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
