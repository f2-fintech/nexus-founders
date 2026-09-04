/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  eslint: {
    // ESLint errors during build are due to missing @typescript-eslint plugin
    // and <img> warnings — not real code bugs. Linting runs separately in CI.
    ignoreDuringBuilds: true,
  },
  images: {
    // Serve AVIF then WebP to supporting browsers — significantly smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints used for srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Size used for fixed-width image components
    imageSizes: [64, 128, 256, 384],
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
