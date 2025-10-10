/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js integrated ESLint runner to avoid CLI options incompatibility
  eslint: {
    ignoreDuringBuilds: true, // don't fail builds
    dirs: [], // disable lint during dev (no directories to lint)
  },
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      { source: '/guide', destination: '/edukacja', permanent: true },
      { source: '/guide/:path*', destination: '/edukacja', permanent: true },
    ]
  },
}

module.exports = nextConfig
