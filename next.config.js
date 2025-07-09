/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', 'child_process' on the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      }
    }
    return config
  },
  images: {
    // Allow loading images from these domains
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    // Fallback image if loading fails
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig
