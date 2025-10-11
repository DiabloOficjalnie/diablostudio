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
      customerData,
      quoteData,
      contactPreferences,
      consents,
      recaptchaToken,
    } = body

    console.log('Received customer quote data:', {
      customerData,
      quoteData,
      contactPreferences,
      consents
    })

    // Verify Google reCAPTCHA (required for anonymous submissions)
    const ip = extractClientIp(request.headers)
    const captcha = await verifyReCaptcha(recaptchaToken, ip)
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'Weryfikacja antybot nie powiodła się', details: captcha['error-codes'] || [] },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: 'Imię i email są wymagane' },
        { status: 400 }
      )
    }

    if (!quoteData.area || !quoteData.floorSystem || !quoteData.substrateCondition || !quoteData.location || !quoteData.decorativeSystem) {
      return NextResponse.json(
        { error: 'Wszystkie pola kalkulacji są wymagane' },
        { status: 400 }
      )
    }

    // Save customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone || null
      })
      .select()
      .single()

    if (customerError) {
      console.error('Customer save error:', customerError)
      return NextResponse.json(
        { error: 'Błąd podczas zapisywania danych klienta: ' + customerError.message },
        { status: 500 }
      )
    }

    // Save quote data
    const { data: quote, error: quoteError } = await supabase
      .from('customer_quotes')
      .insert({
        customer_id: customer.id,
        area: quoteData.area,
        floor_system: quoteData.floorSystem,
        substrate_condition: quoteData.substrateCondition,
        location: quoteData.location,
        decorative_system: quoteData.decorativeSystem,
        price_min: quoteData.priceMin,
        price_max: quoteData.priceMax,
        total_min: quoteData.totalMin,
        total_max: quoteData.totalMax,
        contact_preferences: contactPreferences || null,
        consents: consents || null
      })
      .select()
      .single()

    if (quoteError) {
      console.error('Quote save error:', quoteError)
      return NextResponse.json(
        { error: 'Błąd podczas zapisywania wyceny: ' + quoteError.message },
        { status: 500 }
      )
    }

    console.log('Customer quote saved successfully:', { customer, quote })

    return NextResponse.json({
      success: true,
      message: 'Wycena została zapisana pomyślnie',
      data: { customer, quote }
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

    // Get all customer quotes with customer information
    const { data: quotes, error } = await supabase
      .from('customer_quotes')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customer quotes:', error)
      return NextResponse.json(
        { error: 'Błąd podczas pobierania wycen klientów' },
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
