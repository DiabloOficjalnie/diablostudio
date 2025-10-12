import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { verifyCaptcha, extractClientIp } from '@/lib/recaptcha'
import { ensureUUID } from '@/lib/id'

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
      const captcha = await verifyCaptcha(recaptchaToken, ip, 'client_quotes')
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
    // Accept both UUID and external ids (e.g. Clerk "user_...") by mapping to deterministic UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const resolvedClientId = uuidRegex.test(String(clientId))
      ? String(clientId)
      : ensureUUID(String(clientId))
    // Verify that client exists to satisfy FK constraint
    const { data: clientProfile, error: clientCheckError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', resolvedClientId)
      .single();

    if (clientCheckError || !clientProfile) {
      // Try to create minimal client profile using provided details if available
      const clientFirstName = body?.clientFirstName || body?.firstName || 'Klient'
      const clientLastName = body?.clientLastName || body?.lastName || ''
      const clientEmail = body?.clientEmail || body?.email

      if (!clientEmail) {
        return NextResponse.json(
          { error: 'Brak profilu klienta. Podaj clientEmail (oraz opcjonalnie clientFirstName/clientLastName) lub użyj UUID istniejącego klienta.' },
          { status: 400 }
        )
      }

      const { error: createProfileErr } = await supabase
        .from('client_profiles')
        .insert({
          id: resolvedClientId,
          first_name: clientFirstName,
          last_name: clientLastName,
          email: clientEmail
        })

      if (createProfileErr) {
        return NextResponse.json(
          { error: 'Nie udało się utworzyć profilu klienta: ' + createProfileErr.message },
          { status: 500 }
        )
      }
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
        client_id: resolvedClientId,
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
