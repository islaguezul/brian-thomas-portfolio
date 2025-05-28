import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react']
  },
  images: {
    remotePatterns: [
      // Add any remote image patterns you'll use
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Remove swcMinify - it's enabled by default in Next.js 15
  reactStrictMode: true,
}

export default nextConfig