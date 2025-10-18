/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rosy-shark-333.convex.cloud",
        port: "",
      },
      {
        protocol: "https",
        hostname: "little-schnauzer-930.convex.cloud",
        port: "",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'self' 'unsafe-inline'; img-src * data: blob:",
    minimumCacheTTL: 60,
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;