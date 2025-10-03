const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Initialize Supabase client
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  try {
    console.log('Creating color composition tables...')

    // Read and execute the SQL file
    const sql = fs.readFileSync('create-compositions-table.sql', 'utf8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`Executing ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      const { error } = await supabase.rpc('execute_sql', { query: statement })

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('🎉 All statements executed')

    // Verify tables exist
    const { data: compositions, error: compError } = await supabase
      .from('color_compositions')
      .select('id')
      .limit(1)

    if (compError) {
      console.error('❌ Error verifying color_compositions table:', compError)
    } else {
      console.log('✅ color_compositions table verified')
    }

    const { data: compColors, error: colorsError } = await supabase
      .from('composition_colors')
      .select('id')
      .limit(1)

    if (colorsError) {
      console.error('❌ Error verifying composition_colors table:', colorsError)
    } else {
      console.log('✅ composition_colors table verified')
    }

  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

createTables()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
