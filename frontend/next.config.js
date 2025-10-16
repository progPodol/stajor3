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
      {
        source: '/api/:path*',
        destination: `${destBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
