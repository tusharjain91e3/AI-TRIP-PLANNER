/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://correct-duckling-27.clerk.accounts.dev https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.convex.cloud https://openweathermap.org; font-src 'self' data:; connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev ws://localhost:8888; frame-ancestors 'self'; form-action 'self'; base-uri 'self';",
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "quixotic-impala-265.convex.cloud",
        port: "",
      },
      {
        protocol: "https",
        hostname: "kindred-rhinoceros-563.convex.cloud",
        port: "",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
        port: "",
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
