import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Default compositions data
const getDefaultCompositions = () => {
  return [
    {
      id: '1',
      name: 'Elegancki Minimalizm',
      description: 'Subtelna kompozycja szarości z delikatnymi akcentami srebra',
      application: 'Garaże, warsztaty, przestrzenie komercyjne',
      is_featured: true,
      is_active: true,
      status: 'published',
      sort_order: 1,
      resin_type: 'epoxy',
      system_type: 'self-leveling',
      floor_type: 'epoxy-3d',
      decorative_type: 'chips',
      tags: ['industrialne', 'szare', 'klasyczne'],
      composition_colors: [
        { color_code: 'RAL 7035', color_name: 'Szary jasny', color_hex: '#C8CCD0', percentage: 70 },
        { color_code: 'RAL 9006', color_name: 'Srebrny metaliczny', color_hex: '#A5A7AB', percentage: 20 },
        { color_code: 'Chips 12', color_name: 'Srebrne chipsy', color_hex: '#C0C0C0', percentage: 10 }
      ]
    },
    {
      id: '2',
      name: 'Naturalny Kamień',
      description: 'Kompozycja inspirowana naturalnym kamieniem z ciepłymi beżami',
      application: 'Salony, biura, przestrzenie reprezentacyjne',
      is_featured: true,
      is_active: true,
      status: 'published',
      sort_order: 2,
      resin_type: 'polyurethane',
      system_type: 'thin-layer',
      floor_type: 'quartzcolor',
      decorative_type: 'sand',
      tags: ['naturalne', 'ciepłe', 'eleganckie'],
      composition_colors: [
        { color_code: 'M03', color_name: 'Piasek beżowy', color_hex: '#D0C8B8', percentage: 60 },
        { color_code: 'M05', color_name: 'Piasek złoty', color_hex: '#C4A882', percentage: 25 },
        { color_code: 'Chips 01', color_name: 'Brązowe chipsy', color_hex: '#8B4513', percentage: 15 }
      ]
    },
    {
      id: '3',
      name: 'Morski Błękit',
      description: 'Świeże połączenie błękitów z białymi akcentami',
      application: 'Łazienki, kuchnie, przestrzenie wellness',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 3,
      resin_type: 'epoxy',
      system_type: 'self-leveling',
      floor_type: 'wylewna',
      decorative_type: 'chips',
      tags: ['morskie', 'świeże', 'białe'],
      composition_colors: [
        { color_code: 'RAL 5012', color_name: 'Błękit jasny', color_hex: '#3B83BD', percentage: 50 },
        { color_code: 'RAL 9003', color_name: 'Biały sygnałowy', color_hex: '#F4F4F4', percentage: 30 },
        { color_code: 'Chips 09', color_name: 'Niebieskie chipsy', color_hex: '#4169E1', percentage: 20 }
      ]
    },
    {
      id: '4',
      name: 'Leśna Polana',
      description: 'Zielona kompozycja inspirowana naturą z organicznymi elementami',
      application: 'Sypialnie, pokoje dziecięce, przestrzenie rekreacyjne',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 4,
      resin_type: 'epoxy',
      system_type: 'decorative',
      floor_type: 'mikrocement',
      decorative_type: 'sand',
      tags: ['zielone', 'naturalne', 'organiczne'],
      composition_colors: [
        { color_code: 'RAL 6002', color_name: 'Zielony liściowy', color_hex: '#276235', percentage: 45 },
        { color_code: 'M08', color_name: 'Piasek zielony', color_hex: '#A8C8A8', percentage: 35 },
        { color_code: 'Chips 10', color_name: 'Zielone chipsy', color_hex: '#32CD32', percentage: 20 }
      ]
    },
    {
      id: '5',
      name: 'Industrialny Styl',
      description: 'Surowa kompozycja szarości z metalicznymi akcentami',
      application: 'Magazyny, hale produkcyjne, lofty',
      is_featured: false,
      is_active: true,
      status: 'published',
      sort_order: 5,
      resin_type: 'epoxy',
      system_type: 'industrial',
      floor_type: 'antypoślizgowa',
      decorative_type: 'chips',
      tags: ['industrialne', 'surowe', 'metaliczne'],
      composition_colors: [
        { color_code: 'RAL 7016', color_name: 'Szary antracytowy', color_hex: '#3A4756', percentage: 55 },
        { color_code: 'RAL 9005', color_name: 'Czarny odrzutowy', color_hex: '#0A0A0A', percentage: 25 },
        { color_code: 'Chips 12', color_name: 'Srebrne chipsy', color_hex: '#C0C0C0', percentage: 20 }
      ]
    }
  ]
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epujffkujstgprcamgpi.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
    const { data: compositions, error } = await supabase
      .from('color_compositions')
      .select(`
        id,
        name,
        description,
        application,
        is_featured,
        is_active,
        status,
        sort_order,
        resin_type,
        system_type,
        floor_type,
        decorative_type,
        tags,
        created_at,
        updated_at,
        composition_colors (
          id,
          color_code,
          color_name,
          color_hex,
          percentage
        )
      `)
      .eq('is_active', true)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error) {
      console.log('Database query failed, using default compositions:', error)
      // Fallback to default compositions if database is not available
      const defaultCompositions = getDefaultCompositions()
      return NextResponse.json({ compositions: defaultCompositions })
    }

    if (compositions && compositions.length > 0) {
      return NextResponse.json({ compositions })
    }

    // If no compositions in database, return default ones
    const defaultCompositions = getDefaultCompositions()
    return NextResponse.json({ compositions: defaultCompositions })

  } catch (error) {
    console.error('Error in color compositions API:', error)
    // Return default compositions as fallback
    const defaultCompositions = getDefaultCompositions()
    return NextResponse.json({ compositions: defaultCompositions })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const compositionData = {
      name: body.name,
      description: body.description,
      application: body.application,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
      status: body.status || 'draft',
      sort_order: body.sort_order || 0,
      resin_type: body.resin_type,
      system_type: body.system_type,
      floor_type: body.floor_type,
      decorative_type: body.decorative_type,
      tags: body.tags || []
    }

    // Insert composition first
    const { data: compositionResult, error: compositionError } = await supabase
      .from('color_compositions')
      .insert(compositionData)
      .select()
      .single()

    if (compositionError) {
      return NextResponse.json(
        { success: false, error: compositionError.message },
        { status: 400 }
      )
    }

    // Insert composition colors if provided
    if (body.composition_colors && body.composition_colors.length > 0) {
      const colorsData = body.composition_colors.map((color: any) => ({
        composition_id: compositionResult.id,
        color_code: color.color_code || color.code,
        color_name: color.color_name || color.name,
        color_hex: color.color_hex || color.hex,
        percentage: color.percentage
      }))

      const { error: colorsError } = await supabase
        .from('composition_colors')
        .insert(colorsData)

      if (colorsError) {
        console.error('Error inserting composition colors:', colorsError)
        // Don't fail the whole operation if colors fail to insert
      }
    }

    return NextResponse.json({
      success: true,
      composition: compositionResult,
      message: 'Kompozycja została utworzona pomyślnie'
    })
  } catch (error) {
    console.error('Error creating composition:', error)
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas tworzenia kompozycji' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID kompozycji jest wymagane' },
        { status: 400 }
      )
    }

    const compositionData = {
      name: body.name,
      description: body.description,
      application: body.application,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
      status: body.status || 'draft',
      sort_order: body.sort_order || 0,
      resin_type: body.resin_type,
      system_type: body.system_type,
      floor_type: body.floor_type,
      decorative_type: body.decorative_type,
      tags: body.tags || []
    }

    const { data: result, error } = await supabase
      .from('color_compositions')
      .update(compositionData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Update composition colors if provided
    if (body.composition_colors && body.composition_colors.length > 0) {
      // First delete existing colors
      await supabase
        .from('composition_colors')
        .delete()
        .eq('composition_id', body.id)

      // Insert new colors
      const colorsData = body.composition_colors.map((color: any) => ({
        composition_id: body.id,
        color_code: color.color_code || color.code,
        color_name: color.color_name || color.name,
        color_hex: color.color_hex || color.hex,
        percentage: color.percentage
      }))

      const { error: colorsError } = await supabase
        .from('composition_colors')
        .insert(colorsData)

      if (colorsError) {
        console.error('Error updating composition colors:', colorsError)
      }
    }

    return NextResponse.json({
      success: true,
      composition: result,
      message: 'Kompozycja została zaktualizowana pomyślnie'
    })
  } catch (error) {
    console.error('Error updating composition:', error)
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas aktualizacji kompozycji' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kompozycji jest wymagane' },
        { status: 400 }
      )
    }

    // Delete composition colors first (due to foreign key constraint)
    await supabase
      .from('composition_colors')
      .delete()
      .eq('composition_id', id)

    // Delete composition
    const { error } = await supabase
      .from('color_compositions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kompozycja została usunięta pomyślnie'
    })
  } catch (error) {
    console.error('Error deleting composition:', error)
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas usuwania kompozycji' },
      { status: 500 }
    )
  }
}
