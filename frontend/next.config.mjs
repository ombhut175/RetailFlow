/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    PORT: '3656',
    // Explicitly include the API URL for client-side access
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental:{
    browserDebugInfoInTerminal: true,
    // Enable faster refresh for hackathon development
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Hackathon optimizations
  swcMinify: true,
  compiler: {
    removeConsole: false, // Keep console logs for debugging
  },
  // Faster builds during development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Faster rebuilds
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  typedRoutes: true,
}

export default nextConfig;
