import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export function createClientComponentClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Brak konfiguracji Supabase')
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Test database connection
  client.from('customers').select('count').limit(1).then(({ error }) => {
    if (error) {
      console.error('Database connection error:', error)
    } else {
      console.log('Database connection successful')
    }
  })

  return client
}

// Export createClient for API routes
export { createClient }
