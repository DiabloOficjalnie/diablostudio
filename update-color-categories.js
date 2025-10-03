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

// Category mapping from old to new names
const categoryMapping = {
  'black': 'ral-black',
  'blue': 'ral-blue',
  'gray': 'ral-grey',
  'orange': 'ral-orange',
  'red': 'ral-red',
  'white': 'ral-white',
  'yellow': 'ral-yellow',
  'green': 'ral-green',
  'violet': 'ral-violet',
  'sand': 'sand',
  'chips': 'chips'
}

async function updateColorCategories() {
  console.log('🔄 Updating color categories to use proper subcategory names...')

  try {
    // Get all colors
    const { data: colors, error } = await supabase
      .from('colors')
      .select('id, code, name, category')
      .order('category')

    if (error) {
      console.error('❌ Error fetching colors:', error)
      return
    }

    if (!colors || colors.length === 0) {
      console.log('📭 No colors found in database')
      return
    }

    console.log(`📊 Found ${colors.length} colors to update`)

    let updateCount = 0
    let errorCount = 0

    // Update colors in batches
    const batchSize = 20
    for (let i = 0; i < colors.length; i += batchSize) {
      const batch = colors.slice(i, i + batchSize)

      for (const color of batch) {
        const oldCategory = color.category
        const newCategory = categoryMapping[oldCategory]

        if (newCategory && newCategory !== oldCategory) {
          console.log(`🔄 Updating ${color.code}: ${oldCategory} → ${newCategory}`)

          const { error: updateError } = await supabase
            .from('colors')
            .update({ category: newCategory })
            .eq('id', color.id)

          if (updateError) {
            console.error(`❌ Error updating ${color.code}:`, updateError)
            errorCount++
          } else {
            updateCount++
          }
        }
      }
    }

    console.log(`\n🎉 Category update completed!`)
    console.log(`✅ Successfully updated: ${updateCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)

    // Verify the updates
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('category')
      .limit(1000)

    if (!verifyError && verifyData) {
      const categoryCount = verifyData.reduce((acc, color) => {
        acc[color.category] = (acc[color.category] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 Updated colors by category:')
      Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} colors`)
        })
    }

  } catch (error) {
    console.error('💥 Fatal error during category update:', error)
  }
}

updateColorCategories()
  .then(() => {
    console.log('\n🏁 Update completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Update failed:', error)
    process.exit(1)
  })
