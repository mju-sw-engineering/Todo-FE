import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bluerack.org',
      },
      {
        protocol: 'http',
        hostname: '**.bluerack.org',
      },
      {
        protocol: 'https',
        hostname: '**.sslip.io',
      },
      {
        protocol: 'http',
        hostname: '**.sslip.io',
      },
    ],
  },
}

export default nextConfig
