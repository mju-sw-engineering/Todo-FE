import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  deploymentId: process.env.DEPLOYMENT_VERSION,
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
