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

// Map of sand codes to their correct image paths
const sandImageMap = {
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
}

async function updateSandImages() {
  console.log('🏖️ Updating sand product image paths...')

  try {
    // Get all sand colors from database
    const { data: sandColors, error } = await supabase
      .from('colors')
      .select('id, code, image_path')
      .eq('category', 'sand')
      .order('code')

    if (error) {
      console.error('❌ Error fetching sand colors:', error)
      return
    }

    console.log(`📋 Found ${sandColors.length} sand colors in database`)

    // Update each sand color with correct image path
    let successCount = 0
    let errorCount = 0

    for (const sand of sandColors) {
      const correctImagePath = sandImageMap[sand.code]

      if (correctImagePath && sand.image_path !== correctImagePath) {
        console.log(`📸 Updating ${sand.code}: ${sand.image_path} → ${correctImagePath}`)

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
      } else if (correctImagePath && sand.image_path === correctImagePath) {
        console.log(`✅ ${sand.code} already has correct image path`)
      } else {
        console.log(`⚠️ No image path found for ${sand.code}`)
      }
    }

    console.log(`🎉 Sand image paths update completed!`)
    console.log(`✅ Successfully updated: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total sand colors processed: ${sandColors.length}`)

    // Verify the updates
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('code, image_path')
      .eq('category', 'sand')
      .not('image_path', 'is', null)
      .limit(20)

    if (!verifyError && verifyData) {
      console.log('\n📸 Sand colors with image paths:')
      verifyData.forEach(sand => {
        console.log(`  ${sand.code}: ${sand.image_path}`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during sand image update:', error)
  }
}

updateSandImages()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
