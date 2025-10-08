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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
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
} = env
