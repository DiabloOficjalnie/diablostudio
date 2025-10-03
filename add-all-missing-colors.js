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

// Read the populate-colors.js file to extract defined colors
function getDefinedColors() {
  try {
    const content = fs.readFileSync('populate-colors.js', 'utf8')

    // Extract color definitions using regex
    const colorMatches = content.match(/{ code: '([^']+)', name: '([^']+)', hex: '([^']+)', category: '([^']+)' }/g)

    if (!colorMatches) {
      console.log('❌ Could not parse color definitions from populate-colors.js')
      return []
    }

    const colors = colorMatches.map(match => {
      const [, code, name, hex, category] = match.match(/{ code: '([^']+)', name: '([^']+)', hex: '([^']+)', category: '([^']+)' }/)
      return { code, name, hex, category }
    })

    return colors
  } catch (error) {
    console.error('❌ Error reading populate-colors.js:', error)
    return []
  }
}

async function addAllMissingColors() {
  console.log('🎨 Adding all missing colors from code definition to database...')

  try {
    // Get colors defined in code
    const definedColors = getDefinedColors()
    console.log(`📋 Found ${definedColors.length} colors defined in code`)

    // Get existing colors from database
    const { data: existingColors, error } = await supabase
      .from('colors')
      .select('code')
      .order('code')

    if (error) {
      console.error('❌ Error fetching existing colors:', error)
      return
    }

    const existingCodes = new Set(existingColors.map(c => c.code))
    const missingColors = definedColors.filter(color => !existingCodes.has(color.code))

    if (missingColors.length === 0) {
      console.log('✅ All colors from code are already in database')
      return
    }

    console.log(`📥 Adding ${missingColors.length} missing colors...`)

    // Convert hex to RGB values
    const colorsWithRgb = missingColors.map(color => {
      const hex = color.hex.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)

      return {
        code: color.code,
        name: color.name,
        hex: color.hex,
        rgb_r: r,
        rgb_g: g,
        rgb_b: b,
        category: color.category,
        image_path: null
      }
    })

    // Group by category for better logging
    const byCategory = colorsWithRgb.reduce((acc, color) => {
      if (!acc[color.category]) acc[color.category] = []
      acc[color.category].push(color)
      return acc
    }, {})

    console.log('\n📂 Colors to add by category:')
    Object.entries(byCategory).forEach(([category, colors]) => {
      console.log(`  ${category}: ${colors.length} colors`)
    })

    // Insert colors in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < colorsWithRgb.length; i += batchSize) {
      const batch = colorsWithRgb.slice(i, i + batchSize)
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(colorsWithRgb.length / batchSize)} (${batch.length} colors)`)

      const { data, error } = await supabase
        .from('colors')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        errorCount += batch.length
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} colors in batch ${Math.floor(i / batchSize) + 1}`)
        successCount += data?.length || 0
      }
    }

    console.log(`🎉 Missing colors addition completed!`)
    console.log(`✅ Successfully inserted: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total colors processed: ${colorsWithRgb.length}`)

    // Verify the final state
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('category')
      .limit(1000)

    if (!verifyError && verifyData) {
      const categoryCount = verifyData.reduce((acc, color) => {
        acc[color.category] = (acc[color.category] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 Final colors by category:')
      Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} colors`)
        })
    }

  } catch (error) {
    console.error('💥 Fatal error during missing colors addition:', error)
  }
}

addAllMissingColors()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
