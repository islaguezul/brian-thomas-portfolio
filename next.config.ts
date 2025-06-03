import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react']
  },
  images: {
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
}

export default nextConfig