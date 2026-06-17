/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Image optimization: allow TikTok CDN + placeholder hosts.
  // TikTok thumbnails are served from *.tiktokcdn.com hosts.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.tiktokcdn-us.com' },
      { protocol: 'https', hostname: 'p16-sign-va.tiktokcdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
    formats: ['image/avif', 'image/webp'],
    // The avatar/illustration placeholders are SVGs; allow them through the
    // optimizer with a strict CSP so no embedded scripts can execute.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Optimize large icon package imports.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
