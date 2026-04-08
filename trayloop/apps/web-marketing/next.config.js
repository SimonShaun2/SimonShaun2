/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trayloop/ui'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
