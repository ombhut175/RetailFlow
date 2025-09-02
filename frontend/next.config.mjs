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
    PORT: '3656'
  },
  experimental:{
    browserDebugInfoInTerminal: true,
  }
}

export default nextConfig
