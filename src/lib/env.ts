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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Check for missing required variables
  const missing: string[] = []

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
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
} = env
