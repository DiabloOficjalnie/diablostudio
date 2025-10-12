import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { ensureUUID } from '@/lib/id'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const body = await request.json()
    const {
      clientId,
      quoteId,
      preferredDate,
      preferredTime,
      message
    } = body

    console.log('Received consultation request:', {
      clientId,
      quoteId,
      preferredDate,
      preferredTime,
      message
    })

    // Validate required fields
    if (!clientId || !quoteId || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    // Verify the quote belongs to the client
    const { data: quote, error: quoteCheckError } = await supabase
      .from('client_quotes')
      .select('id, client_id')
      .eq('id', quoteId)
      .eq('client_id', ensureUUID(clientId))
      .single()

    if (quoteCheckError || !quote) {
      return NextResponse.json(
        { error: 'Nie znaleziono wyceny lub nie masz do niej dostępu' },
        { status: 404 }
      )
    }

    // Save consultation request
    const { data: consultation, error: consultationError } = await supabase
      .from('consultation_requests')
      .insert({
        client_id: ensureUUID(clientId),
        quote_id: quoteId,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (consultationError) {
      console.error('Consultation save error:', consultationError)
      return NextResponse.json(
        { error: 'Błąd podczas zapisywania prośby o konsultację: ' + consultationError.message },
        { status: 500 }
      )
    }

    // Update quote status
    await supabase
      .from('client_quotes')
      .update({ status: 'consultation_requested' })
      .eq('id', quoteId)

    console.log('Consultation request saved successfully:', consultation)

    return NextResponse.json({
      success: true,
      message: 'Prośba o konsultację została wysłana',
      data: consultation
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

    // Get all consultation requests with client and quote information
    const { data: consultations, error } = await supabase
      .from('consultation_requests')
      .select(`
        *,
        client_quotes (
          id,
          area,
          floor_system,
          substrate_condition,
          location,
          decorative_system,
          price_min,
          price_max,
          total_min,
          total_max,
          created_at
        ),
        client_profiles (
          id,
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching consultations:', error)
      return NextResponse.json(
        { error: 'Błąd podczas pobierania konsultacji' },
        { status: 500 }
      )
    }

    return NextResponse.json(consultations || [])

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClientComponentClient()

    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID i status są wymagane' },
        { status: 400 }
      )
    }

    // Update consultation status
    const { error } = await supabase
      .from('consultation_requests')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating consultation:', error)
      return NextResponse.json(
        { error: 'Błąd podczas aktualizacji konsultacji' },
        { status: 500 }
      )
    }

    // Update quote status if consultation is completed
    if (status === 'completed') {
      await supabase
        .from('client_quotes')
        .update({ status: 'completed' })
        .eq('id', body.quote_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Konsultacja została zaktualizowana'
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera: ' + error.message },
      { status: 500 }
    )
  }
}
