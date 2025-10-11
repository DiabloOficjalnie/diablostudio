import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { verifyReCaptcha, extractClientIp } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  try {
    // Use service role key to avoid RLS policy issues
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Brak konfiguracji bazy danych' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await request.json()
    const {
      clientId,
      quoteData,
      contactPreferences,
      consents,
      recaptchaToken,
    } = body

    console.log('Received client quote data:', {
      clientId,
      quoteData,
      contactPreferences,
      consents
    })

    // Verify Google reCAPTCHA (optional for authenticated dashboard flows)
    if (recaptchaToken) {
      const ip = extractClientIp(request.headers)
      const captcha = await verifyReCaptcha(recaptchaToken, ip)
      if (!captcha.success) {
        return NextResponse.json(
          { error: 'Weryfikacja antybot nie powiodła się', details: captcha['error-codes'] || [] },
          { status: 400 }
        )
      }
    }

    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { error: 'ID klienta jest wymagane' },
        { status: 400 }
      )
    }

    if (!quoteData.area || !quoteData.floorSystem || !quoteData.substrateCondition || !quoteData.location || !quoteData.decorativeSystem) {
      return NextResponse.json(
        { error: 'Wszystkie pola kalkulacji są wymagane' },
        { status: 400 }
      )
    }

    // Save quote data for logged-in client
    const { data: quote, error: quoteError } = await supabase
      .from('client_quotes')
      .insert({
        client_id: clientId,
        area: quoteData.area,
        floor_system: quoteData.floorSystem,
        substrate_condition: quoteData.substrateCondition,
        location: quoteData.location,
        decorative_system: quoteData.decorativeSystem,
        price_min: quoteData.priceMin,
        price_max: quoteData.priceMax,
        total_min: quoteData.totalMin,
        total_max: quoteData.totalMax,
        status: 'saved',
        contact_preferences: contactPreferences || null,
        consents: consents || null
      })
      .select()
      .single()

    if (quoteError) {
      console.error('Client quote save error:', quoteError)
      return NextResponse.json(
        { error: 'Błąd podczas zapisywania wyceny: ' + quoteError.message },
        { status: 500 }
      )
    }

    console.log('Client quote saved successfully:', quote)

    return NextResponse.json({
      success: true,
      message: 'Wycena została zapisana w Twoim koncie',
      data: quote
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use service role key to avoid RLS policy issues
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Brak konfiguracji bazy danych' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // For admin access, get all client quotes
    const { data: quotes, error } = await supabase
      .from('client_quotes')
      .select(`
        *,
        client_profiles (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching client quotes:', error)
      return NextResponse.json(
        { error: 'Błąd podczas pobierania wycen' },
        { status: 500 }
      )
    }

    return NextResponse.json(quotes || [])

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Use service role key to avoid RLS policy issues
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Brak konfiguracji bazy danych' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const url = new URL(request.url)
    const quoteId = url.searchParams.get('id')

    if (!quoteId) {
      return NextResponse.json(
        { error: 'ID wyceny jest wymagane' },
        { status: 400 }
      )
    }

    // Delete quote (admin can delete any quote)
    const { error } = await supabase
      .from('client_quotes')
      .delete()
      .eq('id', quoteId)

    if (error) {
      console.error('Error deleting quote:', error)
      return NextResponse.json(
        { error: 'Błąd podczas usuwania wyceny' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Wycena została usunięta'
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera: ' + error.message },
      { status: 500 }
    )
  }
}
