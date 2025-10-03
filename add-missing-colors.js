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

// Missing violet and green colors that need to be added
const getMissingColors = () => {
  return [
    // RAL Colors - Violets (4000-4019) - these are missing
    { code: 'RAL 4001', name: 'Czerwono-liliowy', hex: '#8A5A83', category: 'ral-violet' },
    { code: 'RAL 4002', name: 'Czerwono-fioletowy', hex: '#933D50', category: 'ral-violet' },
    { code: 'RAL 4003', name: 'Fioletowy wrzosowy', hex: '#D5487F', category: 'ral-violet' },
    { code: 'RAL 4004', name: 'Fioletowy bordowy', hex: '#641C34', category: 'ral-violet' },
    { code: 'RAL 4005', name: 'Niebiesko-liliowy', hex: '#83639D', category: 'ral-violet' },
    { code: 'RAL 4006', name: 'Fioletowy komunikacyjny', hex: '#982B61', category: 'ral-violet' },
    { code: 'RAL 4007', name: 'Fioletowy purpurowy', hex: '#4A2C3D', category: 'ral-violet' },
    { code: 'RAL 4008', name: 'Fioletowy sygnałowy', hex: '#8E4B8B', category: 'ral-violet' },
    { code: 'RAL 4009', name: 'Fioletowy pastelowy', hex: '#A38995', category: 'ral-violet' },
    { code: 'RAL 4010', name: 'Fioletowy telemagenta', hex: '#C25A7A', category: 'ral-violet' },
    { code: 'RAL 4011', name: 'Fioletowy perłowy', hex: '#8775A6', category: 'ral-violet' },
    { code: 'RAL 4012', name: 'Fioletowo-perłowy', hex: '#6C6EAA', category: 'ral-violet' },

    // RAL Colors - Greens (6000-6029) - these are missing
    { code: 'RAL 6000', name: 'Zielony patyna', hex: '#32743F', category: 'ral-green' },
    { code: 'RAL 6001', name: 'Zielony szmaragdowy', hex: '#28713E', category: 'ral-green' },
    { code: 'RAL 6002', name: 'Zielony liściowy', hex: '#276235', category: 'ral-green' },
    { code: 'RAL 6003', name: 'Zielony oliwkowy', hex: '#4F5F2F', category: 'ral-green' },
    { code: 'RAL 6004', name: 'Niebiesko-zielony', hex: '#0E2F3A', category: 'ral-green' },
    { code: 'RAL 6005', name: 'Zielony mechowy', hex: '#0F4336', category: 'ral-green' },
    { code: 'RAL 6006', name: 'Zielony szaro-oliwkowy', hex: '#3E4F3E', category: 'ral-green' },
    { code: 'RAL 6007', name: 'Zielony butelkowy', hex: '#2E3A23', category: 'ral-green' },
    { code: 'RAL 6008', name: 'Zielony brązowy', hex: '#3A4232', category: 'ral-green' },
    { code: 'RAL 6009', name: 'Zielony jodłowy', hex: '#26392F', category: 'ral-green' },
    { code: 'RAL 6010', name: 'Zielony trawiasty', hex: '#3E7B4F', category: 'ral-green' },
    { code: 'RAL 6011', name: 'Zielony rezedowy', hex: '#68825B', category: 'ral-green' },
    { code: 'RAL 6012', name: 'Zielony czarny', hex: '#2F3D2F', category: 'ral-green' },
    { code: 'RAL 6013', name: 'Zielony trzcinowy', hex: '#7B8F4F', category: 'ral-green' },
    { code: 'RAL 6014', name: 'Zielony żółto-oliwkowy', hex: '#4A5D3A', category: 'ral-green' },
    { code: 'RAL 6015', name: 'Zielony czarno-oliwkowy', hex: '#3B3C3A', category: 'ral-green' },
    { code: 'RAL 6016', name: 'Zielony turkusowy', hex: '#006B54', category: 'ral-green' },
    { code: 'RAL 6017', name: 'Zielony majowy', hex: '#4F8C5B', category: 'ral-green' },
    { code: 'RAL 6018', name: 'Zielony żółto-zielony', hex: '#4F9461', category: 'ral-green' },
    { code: 'RAL 6019', name: 'Zielono-biały', hex: '#B5D5C5', category: 'ral-green' },
    { code: 'RAL 6020', name: 'Zielony chromowy', hex: '#3E4B4B', category: 'ral-green' },
    { code: 'RAL 6021', name: 'Zielony blady', hex: '#86B255', category: 'ral-green' },
    { code: 'RAL 6022', name: 'Zielony brązowo-oliwkowy', hex: '#4A5D3A', category: 'ral-green' },
    { code: 'RAL 6024', name: 'Zielony komunikacyjny', hex: '#008351', category: 'ral-green' },
    { code: 'RAL 6025', name: 'Zielony paprociowy', hex: '#5F7A4F', category: 'ral-green' },
    { code: 'RAL 6026', name: 'Zielony opalowy', hex: '#006B54', category: 'ral-green' },
    { code: 'RAL 6027', name: 'Zielony jasny', hex: '#7EBAB5', category: 'ral-green' },
    { code: 'RAL 6028', name: 'Zielony sosnowy', hex: '#2F5F4F', category: 'ral-green' },
    { code: 'RAL 6029', name: 'Zielony miętowy', hex: '#006F4F', category: 'ral-green' },

    // Missing RAL 9023 from ral-white
    { code: 'RAL 9023', name: 'Szary ciemny perłowy', hex: '#7A7A7A', category: 'ral-white' },
  ]
}

async function addMissingColors() {
  console.log('🎨 Adding missing violet and green colors...')

  try {
    // Get existing colors to check which ones are missing
    const { data: existingColors, error: fetchError } = await supabase
      .from('colors')
      .select('code, category')
      .in('category', ['ral-violet', 'ral-green'])

    if (fetchError) {
      console.error('❌ Error fetching existing colors:', fetchError)
      return
    }

    const existingCodes = new Set(existingColors?.map(c => c.code) || [])
    const missingColors = getMissingColors().filter(color => !existingCodes.has(color.code))

    if (missingColors.length === 0) {
      console.log('✅ All violet and green colors already exist in database')
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

    // Insert missing colors in batches
    const batchSize = 20
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

    // Verify the insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('category')
      .in('category', ['ral-violet', 'ral-green'])

    if (!verifyError && verifyData) {
      const categoryCount = verifyData.reduce((acc, color) => {
        acc[color.category] = (acc[color.category] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 Violet and Green colors by category:')
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} colors`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during missing colors addition:', error)
  }
}

addMissingColors()
  .then(() => {
    console.log('\n🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
