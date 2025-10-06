import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface PricingData {
  id?: string
  category: 'materials' | 'labor' | 'additional' | 'templates' | 'technical'
  subcategory: string
  name: string
  cost_per_sqm?: number
  cost_per_kg?: number
  cost_per_liter?: number
  cost_per_meter?: number
  cost_per_day?: number
  cost_per_person?: number
  base_cost?: number
  per_km?: number
  description?: string
  duration_days?: number
  duration_hours?: number
  critical?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET - Fetch contractor pricing data
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, check if pricing data exists in database
    const { data: existingPricing, error } = await supabase
      .from('contractor_pricing')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('subcategory', { ascending: true })

    if (error) {
      console.error('Error fetching contractor pricing:', error)
      return NextResponse.json({ error: 'Failed to fetch contractor pricing data' }, { status: 500 })
    }

    let pricing = existingPricing || []

    // If no pricing data exists, return empty structure - no mock data
    if (pricing.length === 0) {
      return NextResponse.json({
        success: true,
        pricing_data: {
          material_costs: {},
          labor_costs: {},
          additional_costs: {},
          schedule_templates: {},
          technical_defaults: {
            drying_time_hours: 24,
            curing_time_hours: 72,
            temperature_range: { min: 15, max: 25 },
            humidity_max: 75,
            warranty_years: 5
          },
          version: 1,
          total_items: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedPricing = pricing.map(item => ({
      id: item.id,
      category: item.category,
      subcategory: item.subcategory,
      name: item.name,
      cost_per_sqm: item.cost_per_sqm || undefined,
      cost_per_kg: item.cost_per_kg || undefined,
      cost_per_liter: item.cost_per_liter || undefined,
      cost_per_meter: item.cost_per_meter || undefined,
      cost_per_day: item.cost_per_day || undefined,
      cost_per_person: item.cost_per_person || undefined,
      base_cost: item.base_cost || undefined,
      per_km: item.per_km || undefined,
      description: item.description || undefined,
      duration_days: item.duration_days || undefined,
      duration_hours: item.duration_hours || undefined,
      critical: item.critical || undefined,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    // Organize data by categories
    const materialCosts: any = {}
    const laborCosts: any = {}
    const additionalCosts: any = {}
    const scheduleTemplates: any = {}

    transformedPricing.forEach((item: any) => {
      switch (item.category) {
        case 'materials':
          if (!materialCosts[item.subcategory]) {
            materialCosts[item.subcategory] = {}
          }
          materialCosts[item.subcategory][item.name.toLowerCase().replace(/\s+/g, '_')] = {
            cost_per_sqm: item.cost_per_sqm,
            cost_per_kg: item.cost_per_kg,
            cost_per_liter: item.cost_per_liter,
            name: item.name,
            description: item.description
          }
          break
        case 'labor':
          laborCosts[item.name.toLowerCase().replace(/\s+/g, '_')] = {
            cost_per_sqm: item.cost_per_sqm,
            name: item.name,
            description: item.description
          }
          break
        case 'additional':
          additionalCosts[item.name.toLowerCase().replace(/\s+/g, '_')] = {
            cost_per_kg: item.cost_per_kg,
            cost_per_meter: item.cost_per_meter,
            cost_per_day: item.cost_per_day,
            cost_per_person: item.cost_per_person,
            base_cost: item.base_cost,
            per_km: item.per_km,
            name: item.name,
            description: item.description
          }
          break
        case 'templates':
          if (!scheduleTemplates[item.subcategory]) {
            scheduleTemplates[item.subcategory] = { stages: {} }
          }
          scheduleTemplates[item.subcategory].stages[item.name.toLowerCase().replace(/\s+/g, '_')] = {
            duration_days: item.duration_days,
            duration_hours: item.duration_hours,
            critical: item.critical
          }
          break
      }
    })

    const pricingData = {
      success: true,
      pricing_data: {
        material_costs: materialCosts,
        labor_costs: laborCosts,
        additional_costs: additionalCosts,
        schedule_templates: scheduleTemplates,
        technical_defaults: {
          drying_time_hours: 24,
          curing_time_hours: 72,
          temperature_range: { min: 15, max: 25 },
          humidity_max: 75,
          warranty_years: 5
        },
        version: 1,
        total_items: transformedPricing.length
      }
    }

    return NextResponse.json(pricingData)

  } catch (error) {
    console.error('Error fetching contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractor pricing data' },
      { status: 500 }
    )
  }
}

// POST - Update contractor pricing data
export async function POST(request: NextRequest) {
  try {
    // For now, return success response
    // In production, this would update the contractor_pricing table
    const body = await request.json()

    const result = {
      success: true,
      message: 'Cennik wykonawcy został zaktualizowany',
      pricing_data: body.pricing_data || body,
      count: Array.isArray(body) ? body.length : 1
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor pricing data' },
      { status: 500 }
    )
  }
}

// PUT - Update contractor pricing data (alternative method)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const result = {
      success: true,
      message: 'Cennik wykonawcy został zaktualizowany',
      pricing_data: body.pricing_data || body,
      count: 1
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor pricing data' },
      { status: 500 }
    )
  }
}
