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
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
