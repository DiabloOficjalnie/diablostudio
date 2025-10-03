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

// Map of chips codes to their correct image paths (all chips now have images)
const chipsImageMap = {
  'Chips 01': '/assets/Chips/webersys chips_01.jpg',
  'Chips 02': '/assets/Chips/webersys chips_02.jpg',
  'Chips 03': '/assets/Chips/webersys chips_03.jpg',
  'Chips 04': '/assets/Chips/webersys chips_04.jpg',
  'Chips 05': '/assets/Chips/webersys chips_05.jpg',
  'Chips 06': '/assets/Chips/webersys chips_06.jpg',
  'Chips 07': '/assets/Chips/webersys chips_07.jpg',
  'Chips 08': '/assets/Chips/webersys chips_08.jpg',
  'Chips 09': '/assets/Chips/webersys chips_09.jpg',
  'Chips 10': '/assets/Chips/webersys chips_10.jpg',
  'Chips 11': '/assets/Chips/webersys chips_11.jpg',
  'Chips 12': '/assets/Chips/webersys chips_12.jpg',
  'Chips 13': '/assets/Chips/webersys chips_13.jpg',
  'Chips 14': '/assets/Chips/webersys chips_14.jpg',
  'Chips 15': '/assets/Chips/webersys chips_15.jpg',
  'Chips 16': '/assets/Chips/webersys chips_16.jpg',
  'Chips 17': '/assets/Chips/webersys chips_17.jpg',
  'Chips 18': '/assets/Chips/webersys chips_18.jpg',
  'Chips 19': '/assets/Chips/webersys chips_19.jpg',
  'Chips 20': '/assets/Chips/webersys chips_20.jpg',
  'Chips 21': '/assets/Chips/webersys chips_21.jpg',
  // All chips now have corresponding image files
}

async function updateChipsImages() {
  console.log('💎 Updating chips product image paths...')

  try {
    // Get all chips colors from database
    const { data: chipsColors, error } = await supabase
      .from('colors')
      .select('id, code, image_path')
      .eq('category', 'chips')
      .order('code')

    if (error) {
      console.error('❌ Error fetching chips colors:', error)
      return
    }

    console.log(`📋 Found ${chipsColors.length} chips colors in database`)

    // Update each chips color with correct image path
    let successCount = 0
    let errorCount = 0

    for (const chip of chipsColors) {
      const correctImagePath = chipsImageMap[chip.code]

      if (correctImagePath && chip.image_path !== correctImagePath) {
        console.log(`📸 Updating ${chip.code}: ${chip.image_path} → ${correctImagePath}`)

        const { error } = await supabase
          .from('colors')
          .update({ image_path: correctImagePath })
          .eq('id', chip.id)

        if (error) {
          console.error(`❌ Error updating ${chip.code}:`, error)
          errorCount++
        } else {
          successCount++
        }
      } else if (correctImagePath && chip.image_path === correctImagePath) {
        console.log(`✅ ${chip.code} already has correct image path`)
      } else {
        console.log(`⚠️ No image path found for ${chip.code}`)
      }
    }

    console.log(`🎉 Chips image paths update completed!`)
    console.log(`✅ Successfully updated: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total chips colors processed: ${chipsColors.length}`)

    // Verify the updates
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('code, image_path')
      .eq('category', 'chips')
      .not('image_path', 'is', null)
      .limit(20)

    if (!verifyError && verifyData) {
      console.log('\n📸 Chips colors with image paths:')
      verifyData.forEach(chip => {
        console.log(`  ${chip.code}: ${chip.image_path}`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during chips image update:', error)
  }
}

updateChipsImages()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
