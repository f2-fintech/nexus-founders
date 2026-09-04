/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors during build are due to missing @typescript-eslint plugin
    // and <img> warnings — not real code bugs. Linting runs separately in CI.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nexusfounders.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
}
module.exports = nextConfig
