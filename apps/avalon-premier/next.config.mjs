/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@avalon/ui',
    '@avalon/core',
    '@avalon/config',
    '@avalon/branding',
    '@avalon/types',
    '@avalon/utils',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.kiteprop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
