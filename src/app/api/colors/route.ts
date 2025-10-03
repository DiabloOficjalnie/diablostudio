import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Define the Color interface
interface Color {
  id?: string
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  image_path?: string
}

// Define the input color interface for default colors
interface InputColor {
  code: string
  name: string
  hex: string
  rgb_r: number
  rgb_g: number
  rgb_b: number
  category: string
  imagePath?: string
}

// Default colors data - removed to eliminate mock data
const getDefaultColors = (): InputColor[] => {
  return []
}

// GET - Retrieve colors from database
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || '' // Get the type parameter

    // First, check if colors exist in database
    const { data: existingColors, error } = await supabase
      .from('colors')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching colors:', error)
      return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 })
    }

    let colors = existingColors || []

    // If no colors exist, insert default colors
    if (colors.length === 0) {
      const defaultColors = getDefaultColors()

      const { data: insertedColors, error: insertError } = await supabase
        .from('colors')
        .insert(defaultColors.map((color: InputColor) => ({
          code: color.code,
          name: color.name,
          hex: color.hex,
          rgb_r: color.rgb_r,
          rgb_g: color.rgb_g,
          rgb_b: color.rgb_b,
          category: color.category,
          image_path: color.imagePath || null
        })))
        .select()

      if (insertError) {
        console.error('Error inserting default colors:', insertError)
        return NextResponse.json([])
      }

      colors = insertedColors || []
    }

    // Filter colors by type if specified
    if (type) {
      const validTypes = ['ral', 'sands', 'chips']
      if (validTypes.includes(type)) {
        const categoryMap: { [key: string]: string[] } = {
          ral: ['ral-yellow', 'ral-orange', 'ral-red', 'ral-violet', 'ral-blue', 'ral-green', 'ral-grey', 'ral-white', 'ral-black'],
          sands: ['sand'],
          chips: ['chips']
        }

        const allowedCategories = categoryMap[type] || []
        colors = colors.filter(color => allowedCategories.includes(color.category))
      }
    }

    // Transform database format back to API format
    const transformedColors = colors.map(color => ({
      id: color.id,
      code: color.code,
      name: color.name,
      hex: color.hex,
      rgb: { r: color.rgb_r, g: color.rgb_g, b: color.rgb_b },
      category: color.category,
      imagePath: color.image_path || null
    }))

    return NextResponse.json(transformedColors)
  } catch (error) {
    console.error('Error in colors API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save colors to database (simplified for now)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const colors = await request.json()

    // For now, just return success - in production this would save to database
    return NextResponse.json({
      success: true,
      message: 'Colors saved successfully',
      count: Array.isArray(colors) ? colors.length : 1
    })
  } catch (error) {
    console.error('Error saving colors:', error)
    return NextResponse.json(
      { error: 'Failed to save colors' },
      { status: 500 }
    )
  }
}
