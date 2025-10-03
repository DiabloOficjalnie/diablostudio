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

// Map of sand codes to their correct image paths (without .webp extensions)
const correctSandImageMap = {
  'M01': '/assets/Piaski/webersys mix PU M_01.jpg',
  'M02': '/assets/Piaski/webersys mix PU M_02.jpg',
  'M03': '/assets/Piaski/webersys mix PU M_03.jpg',
  'M04': '/assets/Piaski/webersys mix PU M_04.jpg',
  'M05': '/assets/Piaski/webersys mix PU M_05.jpg',
  'M06': '/assets/Piaski/webersys mix PU M_06.jpg',
  'M07': '/assets/Piaski/webersys mix PU M_07.jpg',
  'M08': '/assets/Piaski/webersys mix PU M_08.jpg',
  'M09': '/assets/Piaski/webersys mix PU M_09.jpg',
  'M10': '/assets/Piaski/webersys mix PU M_10.jpg',
  'M11': '/assets/Piaski/webersys mix PU M_11.jpg',
  'M12': '/assets/Piaski/webersys mix PU M_12.jpg',
  'M13': '/assets/Piaski/webersys mix PU M_13.jpg',
  'M14': '/assets/Piaski/webersys mix PU M_14.jpg',
  'M15': '/assets/Piaski/webersys mix PU M_15.jpg',
  'M16': '/assets/Piaski/webersys mix PU M_16.jpg',
  'Piasek kwarcowy M01': '/assets/Piaski/webersys mix PU M_01.jpg',
  'Piasek kwarcowy M02': '/assets/Piaski/webersys mix PU M_02.jpg',
  'Piasek kwarcowy M03': '/assets/Piaski/webersys mix PU M_03.jpg',
  'Piasek kwarcowy M04': '/assets/Piaski/webersys mix PU M_04.jpg',
  'Piasek kwarcowy M05': '/assets/Piaski/webersys mix PU M_05.jpg',
  'Piasek kwarcowy M06': '/assets/Piaski/webersys mix PU M_06.jpg',
  'Piasek kwarcowy M07': '/assets/Piaski/webersys mix PU M_07.jpg',
  'Piasek kwarcowy M08': '/assets/Piaski/webersys mix PU M_08.jpg',
  'Piasek kwarcowy M09': '/assets/Piaski/webersys mix PU M_09.jpg',
  'Piasek kwarcowy M10': '/assets/Piaski/webersys mix PU M_10.jpg',
  'Piasek kwarcowy M11': '/assets/Piaski/webersys mix PU M_11.jpg',
  'Piasek kwarcowy M12': '/assets/Piaski/webersys mix PU M_12.jpg',
  'Piasek kwarcowy M13': '/assets/Piaski/webersys mix PU M_13.jpg',
  'Piasek kwarcowy M14': '/assets/Piaski/webersys mix PU M_14.jpg',
  'Piasek kwarcowy M15': '/assets/Piaski/webersys mix PU M_15.jpg',
  'Piasek kwarcowy M16': '/assets/Piaski/webersys mix PU M_16.jpg',
}

async function fixSandImageExtensions() {
  console.log('🔧 Fixing sand image path extensions...')

  try {
    // Get all sand colors from database
    const { data: sandColors, error } = await supabase
      .from('colors')
      .select('id, code, image_path')
      .eq('category', 'sand')
      .not('image_path', 'is', null)
      .order('code')

    if (error) {
      console.error('❌ Error fetching sand colors:', error)
      return
    }

    console.log(`📋 Found ${sandColors.length} sand colors in database`)

    // Fix each sand color with .webp extension
    let successCount = 0
    let errorCount = 0

    for (const sand of sandColors) {
      const correctImagePath = correctSandImageMap[sand.code]
      const currentPath = sand.image_path

      // Check if the path has .webp extension and needs to be fixed
      if (currentPath && currentPath.includes('.webp') && correctImagePath) {
        console.log(`🔧 Fixing ${sand.code}: ${currentPath} → ${correctImagePath}`)

        const { error } = await supabase
          .from('colors')
          .update({ image_path: correctImagePath })
          .eq('id', sand.id)

        if (error) {
          console.error(`❌ Error updating ${sand.code}:`, error)
          errorCount++
        } else {
          successCount++
        }
      } else if (currentPath && !currentPath.includes('.webp')) {
        console.log(`✅ ${sand.code} already has correct extension: ${currentPath}`)
      } else {
        console.log(`⚠️ No image path or mapping found for ${sand.code}`)
      }
    }

    console.log(`🎉 Sand image extensions fix completed!`)
    console.log(`✅ Successfully fixed: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total sand colors processed: ${sandColors.length}`)

    // Verify the fixes
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('code, image_path')
      .eq('category', 'sand')
      .not('image_path', 'is', null)
      .limit(20)

    if (!verifyError && verifyData) {
      console.log('\n📸 Sand colors with corrected image paths:')
      verifyData.forEach(sand => {
        const hasWebp = sand.image_path.includes('.webp') ? '❌ .webp' : '✅ .jpg'
        console.log(`  ${sand.code}: ${sand.image_path} ${hasWebp}`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during sand image extension fix:', error)
  }
}

fixSandImageExtensions()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
