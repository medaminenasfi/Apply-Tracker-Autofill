/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'vm-7yktbcw1myqxoykldwvh66xv.vusercontent.net',
    'localhost',
    '127.0.0.1',
  ],
}

export default nextConfig
