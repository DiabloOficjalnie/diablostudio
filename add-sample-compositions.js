const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0';

async function addSampleCompositions() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Adding sample color compositions...');

  // Sample compositions
  const compositions = [
    {
      name: 'Elegancki Minimalizm',
      description: 'Subtelna kompozycja szarości z delikatnymi akcentami srebra',
      is_featured: true,
      is_active: true,
      status: 'published',
      sort_order: 1,
      composition_colors: [
        { color_code: 'RAL 7035', color_name: 'Szary jasny', color_hex: '#C8CCD0', percentage: 70 },
        { color_code: 'RAL 9006', color_name: 'Srebrny metaliczny', color_hex: '#A5A7AB', percentage: 20 },
        { color_code: 'Chips 12', color_name: 'Srebrne chipsy', color_hex: '#C0C0C0', percentage: 10 }
      ]
    },
    {
      name: 'Naturalny Kamień',
      description: 'Kompozycja inspirowana naturalnym kamieniem z ciepłymi beżami',
      is_featured: true,
      is_active: true,
      status: 'published',
      sort_order: 2,
      composition_colors: [
        { color_code: 'M03', color_name: 'Piasek beżowy', color_hex: '#D0C8B8', percentage: 60 },
        { color_code: 'M05', color_name: 'Piasek złoty', color_hex: '#C4A882', percentage: 25 },
        { color_code: 'Chips 01', color_name: 'Brązowe chipsy', color_hex: '#8B4513', percentage: 15 }
      ]
    },
    {
      name: 'Morski Błękit',
      description: 'Świeże połączenie błękitów z białymi akcentami',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 3,
      composition_colors: [
        { color_code: 'RAL 5012', color_name: 'Błękit jasny', color_hex: '#3B83BD', percentage: 50 },
        { color_code: 'RAL 9003', color_name: 'Biały sygnałowy', color_hex: '#F4F4F4', percentage: 30 },
        { color_code: 'Chips 09', color_name: 'Niebieskie chipsy', color_hex: '#4169E1', percentage: 20 }
      ]
    },
    {
      name: 'Leśna Polana',
      description: 'Zielona kompozycja inspirowana naturą z organicznymi elementami',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 4,
      composition_colors: [
        { color_code: 'RAL 6002', color_name: 'Zielony liściowy', color_hex: '#276235', percentage: 45 },
        { color_code: 'M08', color_name: 'Piasek zielony', color_hex: '#A8C8A8', percentage: 35 },
        { color_code: 'Chips 10', color_name: 'Zielone chipsy', color_hex: '#32CD32', percentage: 20 }
      ]
    },
    {
      name: 'Industrialny Styl',
      description: 'Surowa kompozycja szarości z metalicznymi akcentami',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 5,
      composition_colors: [
        { color_code: 'RAL 7016', color_name: 'Szary antracytowy', color_hex: '#3A4756', percentage: 55 },
        { color_code: 'RAL 9005', color_name: 'Czarny odrzutowy', color_hex: '#0A0A0A', percentage: 25 },
        { color_code: 'Chips 12', color_name: 'Srebrne chipsy', color_hex: '#C0C0C0', percentage: 20 }
      ]
    }
  ];

  try {
    for (const composition of compositions) {
      // Insert composition
      const { data: compData, error: compError } = await supabase
        .from('color_compositions')
        .insert({
          name: composition.name,
          description: composition.description,
          is_featured: composition.is_featured,
          is_active: composition.is_active,
          status: composition.status,
          sort_order: composition.sort_order
        })
        .select()
        .single();

      if (compError) {
        console.error(`Error inserting composition ${composition.name}:`, compError);
        continue;
      }

      console.log(`✅ Added composition: ${composition.name}`);

      // Insert composition colors
      const colorsToInsert = composition.composition_colors.map(color => ({
        composition_id: compData.id,
        color_code: color.color_code,
        color_name: color.color_name,
        color_hex: color.color_hex,
        percentage: color.percentage
      }));

      const { error: colorsError } = await supabase
        .from('composition_colors')
        .insert(colorsToInsert);

      if (colorsError) {
        console.error(`Error inserting colors for ${composition.name}:`, colorsError);
      } else {
        console.log(`✅ Added ${colorsToInsert.length} colors for ${composition.name}`);
      }
    }

    console.log('🎉 All sample compositions added successfully!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addSampleCompositions();
