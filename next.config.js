/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.clerk.com https://*.clerk.dev https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.beehiiv.com https://www.google-analytics.com https://region1.google-analytics.com https://*.clerk.com https://*.clerk.dev;
  frame-src 'self' https://*.clerk.com https://*.clerk.dev https://www.google.com/recaptcha/ https://recaptcha.google.com;
`.replace(/\\n/g, ' ');

/** Hardened security headers for all routes */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }, // 2 years
  { key: 'X-Frame-Options', value: 'DENY' }, // also enforced by frame-ancestors
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  poweredByHeader: false, // hide X-Powered-By to reduce fingerprinting

  // Disable Next.js integrated ESLint runner to avoid CLI options incompatibility
  eslint: {
    ignoreDuringBuilds: true, // don't fail builds
    dirs: [], // disable lint during dev (no directories to lint)
  },

  images: {
    domains: ['decosol.pl', 'www.decosol.pl', 'localhost'],
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      { source: '/guide', destination: '/edukacja', permanent: true },
      { source: '/guide/:path*', destination: '/edukacja', permanent: true },
    ];
  },
};

module.exports = nextConfig;
