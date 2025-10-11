/**
 * Centralized Environment Variables Configuration
 *
 * This file ensures type-safe access to environment variables and prevents
 * runtime errors from missing or undefined environment variables.
 */

interface EnvironmentVariables {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Beehiiv Newsletter (optional but recommended for newsletter integration)
  BEEHIIV_API_KEY?: string
  BEEHIIV_PUBLICATION_ID?: string

  // Cloudflare Turnstile
  // NOTE: site key must be public, use NEXT_PUBLIC_ prefix for client
  TURNSTILE_SITE_KEY?: string
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string
  TURNSTILE_SECRET_KEY?: string

  // Google reCAPTCHA
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY?: string
  RECAPTCHA_SECRET_KEY?: string

  // Google reCAPTCHA Enterprise (optional)
  NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED?: string
  RECAPTCHA_ENTERPRISE_PROJECT_ID?: string
  RECAPTCHA_ENTERPRISE_SITE_KEY?: string

  // Optional: Add other environment variables as needed
  // NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  // DATABASE_URL?: string
  // REDIS_URL?: string
}

/**
 * Validates that all required environment variables are present
 */
function validateEnvironmentVariables(): EnvironmentVariables {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',

    // Beehiiv config (optional)
    BEEHIIV_API_KEY: process.env.BEEHIIV_API_KEY,
    BEEHIIV_PUBLICATION_ID: process.env.BEEHIIV_PUBLICATION_ID,

    // Cloudflare Turnstile
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,

    // Google reCAPTCHA (defaults provided by client request if env not set)
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LdtneYrAAAAALSd7B-3_tKv1nzZ3Olmg4qk4zmr',
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '6LdtneYrAAAAAMMmrG4WEopRN2-PDiPWX6y69_mC',

    // Google reCAPTCHA Enterprise (optional)
    NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED: process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED || 'false',
    RECAPTCHA_ENTERPRISE_PROJECT_ID: process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID,
    RECAPTCHA_ENTERPRISE_SITE_KEY: process.env.RECAPTCHA_ENTERPRISE_SITE_KEY,
  }

  // Check for missing required variables (using placeholder values)
  const missing: string[] = []

  if (env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (env.SUPABASE_SERVICE_ROLE_KEY === 'placeholder-key') {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missing.length > 0) {
    // During build time, environment variables might not be available
    // Only throw error if we're in a runtime environment (not build time)
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
      )
    } else {
      // During build time or development, use placeholder values
      console.warn(`Warning: Using placeholder values for missing environment variables: ${missing.join(', ')}`)
    }
  }

  return env as EnvironmentVariables
}

// Validate environment variables on module load
const env = validateEnvironmentVariables()

export { env }
export default env

// Export individual variables for convenience
export const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  BEEHIIV_API_KEY,
  BEEHIIV_PUBLICATION_ID,
  TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY,
  NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED,
  RECAPTCHA_ENTERPRISE_PROJECT_ID,
  RECAPTCHA_ENTERPRISE_SITE_KEY,
} = env
