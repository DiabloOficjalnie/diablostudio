import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase-server'

type ContractorPricingPayload = {
  pricing_data?: any
  version?: number
} | any

// Helper: default empty structure if DB has no rows yet
function emptyPricing() {
  return {
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
}

// GET - Fetch latest contractor pricing data from JSONB table
export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('contractor_pricing')
      .select('id, pricing_data, version, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      // Graceful fallback when the table doesn't exist yet (e.g. dev env without DB migrations)
      const msg = (error as any)?.message || ''
      const code = (error as any)?.code || ''
      if (code === 'PGRST205' || /Could not find the table|relation "contractor_pricing" does not exist/i.test(msg)) {
        console.warn('contractor_pricing table missing - returning empty pricing as fallback')
        return NextResponse.json({
          success: true,
          pricing_data: emptyPricing()
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
          }
        })
      }

      console.error('Error fetching contractor pricing:', error)
      return NextResponse.json({ error: 'Failed to fetch contractor pricing data' }, { status: 500 })
    }

    if (!data) {
      // No rows yet -> return empty structure
      return NextResponse.json({
        success: true,
        pricing_data: emptyPricing()
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
        }
      })
    }

    return NextResponse.json({
      success: true,
      pricing_data: data.pricing_data ?? emptyPricing(),
      version: data.version ?? 1,
      updated_at: data.updated_at
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractor pricing data' },
      { status: 500 }
    )
  }
}

// Internal helper to require admin for write operations
async function requireAdmin(supabase: ReturnType<typeof createAdminClient>) {
  const { userId } = await auth()
  if (!userId) {
    return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (adminError || !adminData) {
    return { ok: false, res: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }

  return { ok: true as const }
}

// POST - Create/update contractor pricing data (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const adminCheck = await requireAdmin(supabase)
    if (!('ok' in adminCheck) || !adminCheck.ok) return adminCheck.res

    const body: ContractorPricingPayload = await request.json()
    const pricingData = body.pricing_data ?? body

    // Read latest row
    const { data: existing, error: readError } = await supabase
      .from('contractor_pricing')
      .select('id, version')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (readError) {
      console.error('Read pricing error:', readError)
      return NextResponse.json({ error: 'Failed to read current pricing' }, { status: 500 })
    }

    // If exists -> update latest row with incremented version (or body.version if provided)
    if (existing?.id) {
      const nextVersion = typeof body.version === 'number' ? body.version : (existing.version ?? 1) + 1
      const { data: updated, error: updateError } = await supabase
        .from('contractor_pricing')
        .update({ pricing_data: pricingData, version: nextVersion })
        .eq('id', existing.id)
        .select('id, version, updated_at')
        .single()

      if (updateError) {
        console.error('Update pricing error:', updateError)
        return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Cennik wykonawcy został zaktualizowany',
        pricing_data: pricingData,
        version: updated.version,
        updated_at: updated.updated_at
      })
    }

    // No existing -> insert new row
    const initialVersion = typeof body.version === 'number' ? body.version : 1
    const { data: inserted, error: insertError } = await supabase
      .from('contractor_pricing')
      .insert({ pricing_data: pricingData, version: initialVersion })
      .select('id, version, updated_at')
      .single()

    if (insertError) {
      console.error('Insert pricing error:', insertError)
      return NextResponse.json({ error: 'Failed to save pricing' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cennik wykonawcy został zapisany',
      pricing_data: pricingData,
      version: inserted.version,
      updated_at: inserted.updated_at
    })
  } catch (error) {
    console.error('Error updating contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor pricing data' },
      { status: 500 }
    )
  }
}

// PUT - Update contractor pricing data (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const adminCheck = await requireAdmin(supabase)
    if (!('ok' in adminCheck) || !adminCheck.ok) return adminCheck.res

    const body: ContractorPricingPayload = await request.json()
    const pricingData = body.pricing_data ?? body

    // Same semantics as POST
    const { data: existing, error: readError } = await supabase
      .from('contractor_pricing')
      .select('id, version')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (readError) {
      console.error('Read pricing error:', readError)
      return NextResponse.json({ error: 'Failed to read current pricing' }, { status: 500 })
    }

    if (existing?.id) {
      const nextVersion = typeof body.version === 'number' ? body.version : (existing.version ?? 1) + 1
      const { data: updated, error: updateError } = await supabase
        .from('contractor_pricing')
        .update({ pricing_data: pricingData, version: nextVersion })
        .eq('id', existing.id)
        .select('id, version, updated_at')
        .single()

      if (updateError) {
        console.error('Update pricing error:', updateError)
        return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Cennik wykonawcy został zaktualizowany',
        pricing_data: pricingData,
        version: updated.version,
        updated_at: updated.updated_at
      })
    }

    // No existing -> insert new
    const initialVersion = typeof body.version === 'number' ? body.version : 1
    const { data: inserted, error: insertError } = await supabase
      .from('contractor_pricing')
      .insert({ pricing_data: pricingData, version: initialVersion })
      .select('id, version, updated_at')
      .single()

    if (insertError) {
      console.error('Insert pricing error:', insertError)
      return NextResponse.json({ error: 'Failed to save pricing' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cennik wykonawcy został zapisany',
      pricing_data: pricingData,
      version: inserted.version,
      updated_at: inserted.updated_at
    })
  } catch (error) {
    console.error('Error updating contractor pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor pricing data' },
      { status: 500 }
    )
  }
}
