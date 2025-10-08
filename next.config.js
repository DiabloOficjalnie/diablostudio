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
}

module.exports = nextConfig
