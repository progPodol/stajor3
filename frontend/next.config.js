const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.imgbb.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const destBase = process.env.API_INTERNAL_URL || 'http://backend:8000/api';
    return [
      // Proxy only backend API namespaces; leave /api/revalidate to Next.js
      { source: '/api/girls/:path*', destination: `${destBase}/girls/:path*` },
      { source: '/api/services/:path*', destination: `${destBase}/services/:path*` },
      { source: '/api/sites/:path*', destination: `${destBase}/sites/:path*` },
      { source: '/api/users/:path*', destination: `${destBase}/users/:path*` },
    ];
  },
};

module.exports = nextConfig;
