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

async function checkColors() {
  console.log('🔍 Checking current colors in database...')

  try {
    // Get all colors
    const { data: colors, error } = await supabase
      .from('colors')
      .select('*')
      .order('category')
      .order('code')

    if (error) {
      console.error('❌ Error fetching colors:', error)
      return
    }

    if (!colors || colors.length === 0) {
      console.log('📭 No colors found in database')
      return
    }

    console.log(`📊 Found ${colors.length} colors in database\n`)

    // Group by category
    const categoryGroups = colors.reduce((acc, color) => {
      if (!acc[color.category]) {
        acc[color.category] = []
      }
      acc[color.category].push(color)
      return acc
    }, {})

    // Display results by category
    Object.entries(categoryGroups).forEach(([category, categoryColors]) => {
      console.log(`\n🎨 ${category.toUpperCase()} (${categoryColors.length} colors):`)

      // Show first few colors in each category
      categoryColors.slice(0, 10).forEach(color => {
        console.log(`  ${color.code} - ${color.name}`)
      })

      if (categoryColors.length > 10) {
        console.log(`  ... and ${categoryColors.length - 10} more`)
      }
    })

    // Check for missing categories
    const expectedCategories = [
      'ral-yellow', 'ral-orange', 'ral-red', 'ral-violet', 'ral-blue',
      'ral-green', 'ral-grey', 'ral-white', 'ral-black', 'sand', 'chips'
    ]

    const existingCategories = Object.keys(categoryGroups)
    const missingCategories = expectedCategories.filter(cat => !existingCategories.includes(cat))

    if (missingCategories.length > 0) {
      console.log(`\n⚠️  Missing categories: ${missingCategories.join(', ')}`)
    } else {
      console.log('\n✅ All expected categories are present')
    }

    // Check for colors that need recategorization
    const colorsNeedingRecategorization = colors.filter(color => {
      // Check if RAL colors are properly categorized by their number ranges
      if (color.category === 'ral') {
        const code = color.code
        if (code.startsWith('RAL 1')) return true // Should be ral-yellow
        if (code.startsWith('RAL 2')) return true // Should be ral-orange
        if (code.startsWith('RAL 3')) return true // Should be ral-red
        if (code.startsWith('RAL 4')) return true // Should be ral-violet
        if (code.startsWith('RAL 5')) return true // Should be ral-blue
        if (code.startsWith('RAL 6')) return true // Should be ral-green
        if (code.startsWith('RAL 7')) return true // Should be ral-grey
        if (code.startsWith('RAL 9')) {
          if (code.includes('9004') || code.includes('9005') || code.includes('9011') || code.includes('9017') || code.includes('9031')) {
            return true // Should be ral-black
          } else {
            return true // Should be ral-white
          }
        }
      }
      return false
    })

    if (colorsNeedingRecategorization.length > 0) {
      console.log(`\n🔄 Colors needing recategorization: ${colorsNeedingRecategorization.length}`)
      colorsNeedingRecategorization.slice(0, 5).forEach(color => {
        console.log(`  ${color.code} - currently: ${color.category}`)
      })
    } else {
      console.log('\n✅ All colors appear to be properly categorized')
    }

  } catch (error) {
    console.error('💥 Error checking colors:', error)
  }
}

checkColors()
  .then(() => {
    console.log('\n🏁 Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Check failed:', error)
    process.exit(1)
  })
