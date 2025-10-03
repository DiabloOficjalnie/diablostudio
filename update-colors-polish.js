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
    const colorMatches = content.match(/{ code: '([^']+)', name: '([^']+)', hex: '([^']+)', category: '([^']+)', manufacturer: '([^']+)' }/g)

    if (!colorMatches) {
      console.log('❌ Could not parse color definitions from populate-colors.js')
      return []
    }

    const colors = colorMatches.map(match => {
      const [, code, name, hex, category, manufacturer] = match.match(/{ code: '([^']+)', name: '([^']+)', hex: '([^']+)', category: '([^']+)', manufacturer: '([^']+)' }/)
      return { code, name, hex, category, manufacturer }
    })

    return colors
  } catch (error) {
    console.error('❌ Error reading populate-colors.js:', error)
    return []
  }
}

async function updateColorsWithPolishNames() {
  console.log('🇵🇱 Updating colors with Polish names and manufacturer information...')

  try {
    // Get colors defined in code
    const definedColors = getDefinedColors()
    console.log(`📋 Found ${definedColors.length} colors defined in code`)

    // Get existing colors from database
    const { data: existingColors, error } = await supabase
      .from('colors')
      .select('id, code, name, category')
      .order('code')

    if (error) {
      console.error('❌ Error fetching existing colors:', error)
      return
    }

    console.log(`📊 Found ${existingColors.length} colors in database`)

    // Create a map of code to new color data
    const colorUpdates = new Map()
    definedColors.forEach(color => {
      colorUpdates.set(color.code, {
        name: color.name,
        manufacturer: color.manufacturer
      })
    })

    // Find colors that need updating
    const colorsToUpdate = existingColors.filter(existingColor => {
      const update = colorUpdates.get(existingColor.code)
      return update && existingColor.name !== update.name
    })

    if (colorsToUpdate.length === 0) {
      console.log('✅ All colors already have Polish names and manufacturer information')
      return
    }

    console.log(`📝 Updating ${colorsToUpdate.length} colors with Polish names and manufacturer info...`)

    // Group by category for better logging
    const byCategory = colorsToUpdate.reduce((acc, color) => {
      if (!acc[color.category]) acc[color.category] = []
      acc[color.category].push(color)
      return acc
    }, {})

    console.log('\n📂 Colors to update by category:')
    Object.entries(byCategory).forEach(([category, colors]) => {
      console.log(`  ${category}: ${colors.length} colors`)
    })

    // Update colors in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < colorsToUpdate.length; i += batchSize) {
      const batch = colorsToUpdate.slice(i, i + batchSize)
      console.log(`📦 Processing update batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(colorsToUpdate.length / batchSize)} (${batch.length} colors)`)

      // Update each color in the batch
      for (const color of batch) {
        const update = colorUpdates.get(color.code)

        const { error } = await supabase
          .from('colors')
          .update({
            name: update.name
          })
          .eq('id', color.id)

        if (error) {
          console.error(`❌ Error updating ${color.code}:`, error)
          errorCount++
        } else {
          successCount++
        }
      }
    }

    console.log(`🎉 Polish names and manufacturer update completed!`)
    console.log(`✅ Successfully updated: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total colors processed: ${colorsToUpdate.length}`)

    // Verify the updates
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('category, manufacturer')
      .limit(1000)

    if (!verifyError && verifyData) {
      const categoryCount = verifyData.reduce((acc, color) => {
        acc[color.category] = (acc[color.category] || 0) + 1
        return acc
      }, {})

      const manufacturerCount = verifyData.reduce((acc, color) => {
        acc[color.manufacturer] = (acc[color.manufacturer] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 Final colors by category:')
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} colors`)
      })

      console.log('\n🏭 Colors by manufacturer:')
      Object.entries(manufacturerCount).forEach(([manufacturer, count]) => {
        console.log(`  ${manufacturer}: ${count} colors`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during Polish names update:', error)
  }
}

updateColorsWithPolishNames()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
