/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.cloudstudio.run' },
    ],
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
  webpack: (config, { dev, isServer }) => {
    // Disable filesystem cache to avoid Windows case-sensitivity issues
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
