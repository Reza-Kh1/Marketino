import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack compatibility for Next.js 16+
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.cloudstudio.run' },
      {
        protocol: "http",
        hostname: "c333224.parspack.net",
        pathname: "/:path*",
      },
      {
        protocol: "http",
        hostname: "c333224.parspack.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "c333224.parspack.net",
        pathname: "**",
      }
    ],
  },
  // Skip ngrok browser warning
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' },
        ],
      },
    ];
  },
  // API proxy to NestJS backend
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  // Webpack config (only used when --webpack flag is passed)
  webpack: (config, { dev, isServer }) => {
    // Disable filesystem cache to avoid Windows case-sensitivity issues
    config.cache = false;
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);