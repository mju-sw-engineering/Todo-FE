import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.swe.bluerack.org',
      },
    ],
  },
}

export default nextConfig
