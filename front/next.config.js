/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.cloudstudio.run' },
      { protocol: 'http', hostname: 'c333224.parspack.net', pathname: '/**' },
      { protocol: 'https', hostname: 'c333224.parspack.net', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api-backend/:path*',
        headers: [{ key: 'ngrok-skip-browser-warning', value: 'true' }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;