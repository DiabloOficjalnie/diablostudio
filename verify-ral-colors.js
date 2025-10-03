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

async function verifyRalColors() {
  console.log('🔍 Verifying RAL colors in database vs code definition...\n')

  try {
    // Get colors defined in code
    const definedColors = getDefinedColors()
    console.log(`📋 Found ${definedColors.length} colors defined in code`)

    // Get colors from database
    const { data: dbColors, error } = await supabase
      .from('colors')
      .select('code, name, hex, category')
      .order('category')
      .order('code')

    if (error) {
      console.error('❌ Error fetching colors from database:', error)
      return
    }

    console.log(`📊 Found ${dbColors.length} colors in database\n`)

    // Group colors by category
    const definedByCategory = definedColors.reduce((acc, color) => {
      if (!acc[color.category]) acc[color.category] = []
      acc[color.category].push(color)
      return acc
    }, {})

    const dbByCategory = dbColors.reduce((acc, color) => {
      if (!acc[color.category]) acc[color.category] = []
      acc[color.category].push(color)
      return acc
    }, {})

    // Compare categories
    const definedCategories = Object.keys(definedByCategory).sort()
    const dbCategories = Object.keys(dbByCategory).sort()

    console.log('📂 Categories comparison:')
    console.log(`   Defined in code: ${definedCategories.length} categories`)
    console.log(`   In database: ${dbCategories.length} categories`)

    // Check for missing categories
    const missingCategories = definedCategories.filter(cat => !dbCategories.includes(cat))
    const extraCategories = dbCategories.filter(cat => !definedCategories.includes(cat))

    if (missingCategories.length > 0) {
      console.log(`\n⚠️  Missing categories in database: ${missingCategories.join(', ')}`)
    }

    if (extraCategories.length > 0) {
      console.log(`\n⚠️  Extra categories in database: ${extraCategories.join(', ')}`)
    }

    // Check each category for missing colors
    console.log('\n🎨 Detailed comparison by category:')
    definedCategories.forEach(category => {
      const definedInCategory = definedByCategory[category]
      const dbInCategory = dbByCategory[category] || []

      const definedCodes = new Set(definedInCategory.map(c => c.code))
      const dbCodes = new Set(dbInCategory.map(c => c.code))

      const missingInDb = definedInCategory.filter(c => !dbCodes.has(c.code))
      const extraInDb = dbInCategory.filter(c => !definedCodes.has(c.code))

      console.log(`\n📁 ${category} (${definedInCategory.length} defined, ${dbInCategory.length} in DB):`)

      if (missingInDb.length > 0) {
        console.log(`   ❌ Missing in database (${missingInDb.length}):`)
        missingInDb.slice(0, 5).forEach(color => {
          console.log(`      ${color.code} - ${color.name}`)
        })
        if (missingInDb.length > 5) {
          console.log(`      ... and ${missingInDb.length - 5} more`)
        }
      }

      if (extraInDb.length > 0) {
        console.log(`   ➕ Extra in database (${extraInDb.length}):`)
        extraInDb.slice(0, 5).forEach(color => {
          console.log(`      ${color.code} - ${color.name}`)
        })
        if (extraInDb.length > 5) {
          console.log(`      ... and ${extraInDb.length - 5} more`)
        }
      }

      if (missingInDb.length === 0 && extraInDb.length === 0) {
        console.log(`   ✅ All colors match`)
      }
    })

    // Summary
    const totalDefined = definedColors.length
    const totalInDb = dbColors.length

    console.log(`\n📈 Summary:`)
    console.log(`   Total colors defined in code: ${totalDefined}`)
    console.log(`   Total colors in database: ${totalInDb}`)
    console.log(`   Difference: ${Math.abs(totalInDb - totalDefined)}`)

    if (totalDefined === totalInDb) {
      console.log(`\n✅ All colors from code are present in database!`)
    } else {
      console.log(`\n⚠️  Color count mismatch! Need to investigate.`)
    }

  } catch (error) {
    console.error('💥 Error during verification:', error)
  }
}

verifyRalColors()
  .then(() => {
    console.log('\n🏁 Verification completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })
