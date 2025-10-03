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

async function checkCompositions() {
  console.log('🔍 Checking color compositions in database...')

  try {
    // Check if color_compositions table exists
    const { data: compositions, error } = await supabase
      .from('color_compositions')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching compositions:', error)
      console.log('💡 The color_compositions table might not exist yet')
      return
    }

    if (!compositions || compositions.length === 0) {
      console.log('📭 No compositions found in database')
      return
    }

    console.log(`📊 Found ${compositions.length} compositions in database\n`)

    // Display compositions
    compositions.forEach((composition, index) => {
      console.log(`${index + 1}. ${composition.name}`)
      if (composition.description) {
        console.log(`   Description: ${composition.description}`)
      }
      console.log(`   Featured: ${composition.is_featured ? 'Yes' : 'No'}`)
      console.log(`   Active: ${composition.is_active ? 'Yes' : 'No'}`)
      console.log(`   Status: ${composition.status}`)
      console.log(`   Sort Order: ${composition.sort_order}`)

      if (composition.composition_colors && composition.composition_colors.length > 0) {
        console.log('   Colors:')
        composition.composition_colors.forEach((color, colorIndex) => {
          console.log(`     ${colorIndex + 1}. ${color.color_name} (${color.color_code}) - ${color.percentage}%`)
        })
      } else {
        console.log('   Colors: None defined')
      }
      console.log('')
    })

  } catch (error) {
    console.error('💥 Error checking compositions:', error)
  }
}

checkCompositions()
  .then(() => {
    console.log('\n🏁 Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Check failed:', error)
    process.exit(1)
  })
