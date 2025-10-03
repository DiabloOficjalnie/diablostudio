const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addManufacturerColumn() {
  console.log('🏗️ Adding manufacturer column to colors table...')

  try {
    // Add manufacturer column to colors table
    const { error } = await supabase.rpc('execute_sql', {
      query: 'ALTER TABLE colors ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);'
    })

    if (error) {
      console.error('❌ Error adding manufacturer column:', error)
      return
    }

    console.log('✅ Manufacturer column added successfully')

    // Verify the column exists
    const { data: testData, error: testError } = await supabase
      .from('colors')
      .select('manufacturer')
      .limit(1)

    if (testError) {
      console.error('❌ Error verifying manufacturer column:', testError)
    } else {
      console.log('✅ Manufacturer column verified successfully')
    }

  } catch (error) {
    console.error('💥 Fatal error adding manufacturer column:', error)
  }
}

addManufacturerColumn()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
