import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ConsultationRequest,
  ConsultationRequestInsert,
  ConsultationRequestFormData
} from '@/lib/database-types'

// GET - Pobierz konsultacje klienta z informacjami o blokadach terminów
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const url = new URL(request.url)
    const date = url.searchParams.get('date') // Sprawdź dostępność dla konkretnej daty

    // Pobierz konsultacje klienta
    const consultationsResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
      'consultation_requests',
      [{ column: 'client_id', operator: 'eq', value: user.id }],
      { column: 'created_at', ascending: false }
    )

    if (!consultationsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch consultations' },
        { status: 500 }
      )
    }

    const consultations = consultationsResult.data?.data || []

    // Jeśli sprawdzamy dostępność dla konkretnej daty, pobierz zajęte terminy
    if (date) {
      const bookedSlotsResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
        'consultation_requests',
        [
          { column: 'preferred_date', operator: 'eq', value: date },
          { column: 'status', operator: 'in', value: '(confirmed,pending)' }
        ]
      )

      const bookedSlots = bookedSlotsResult.success
        ? bookedSlotsResult.data?.data?.map(c => c.preferred_time) || []
        : []

      return NextResponse.json({
        success: true,
        consultations: consultations,
        booked_slots: bookedSlots,
        available_slots: getAvailableSlots(bookedSlots)
      })
    }

    return NextResponse.json({
      success: true,
      consultations: consultations,
      total_count: consultations.length
    })

  } catch (error: any) {
    console.error('Error fetching client consultations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Funkcja pomocnicza do obliczania dostępnych terminów
function getAvailableSlots(bookedSlots: string[]): string[] {
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  return allSlots.filter(slot => !bookedSlots.includes(slot))
}

// POST - Utwórz nową prośbę o konsultację z zaawansowaną walidacją
export async function POST(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const body: ConsultationRequestFormData = await request.json()
    const {
      quote_id,
      preferred_date,
      preferred_time,
      message,
      service_type,
      inquiry_type
    } = body

    // Walidacja wymaganych pól
    if (!quote_id || !preferred_date || !preferred_time || !inquiry_type || !service_type) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    // Sprawdź czy data jest w przyszłości
    const selectedDate = new Date(preferred_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Nie można wybrać daty z przeszłości' },
        { status: 400 }
      )
    }

    // Sprawdź czy to dzień roboczy (poniedziałek-piątek)
    const dayOfWeek = selectedDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: 'Konsultacje dostępne są tylko w dni robocze (poniedziałek-piątek)' },
        { status: 400 }
      )
    }

    // Sprawdź czy termin nie jest już zajęty
    const existingConsultationResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
      'consultation_requests',
      [
        { column: 'preferred_date', operator: 'eq', value: preferred_date },
        { column: 'preferred_time', operator: 'eq', value: preferred_time },
        { column: 'status', operator: 'in', value: '(confirmed,pending)' }
      ]
    )

    if (existingConsultationResult.success && existingConsultationResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Wybrany termin jest już zajęty. Wybierz inny termin.' },
        { status: 400 }
      )
    }

    // Sprawdź czy wycena należy do użytkownika
    const quoteResult = await dbHelper.helpers.selectWithPagination(
      'client_quotes',
      [
        { column: 'id', operator: 'eq', value: quote_id },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!quoteResult.success || !quoteResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Nie znaleziono wyceny lub nie masz do niej dostępu' },
        { status: 404 }
      )
    }

    // Przygotuj dane konsultacji
    const consultationData: ConsultationRequestInsert = {
      client_id: user.id,
      quote_id: quote_id,
      preferred_date: preferred_date,
      preferred_time: preferred_time,
      message: message || null,
      status: 'pending'
    }

    // Utwórz konsultację
    const insertResult = await dbHelper.helpers.insert<ConsultationRequest>(
      'consultation_requests',
      consultationData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to create consultation request' },
        { status: 500 }
      )
    }

    // Aktualizuj status wyceny
    await dbHelper.helpers.update(
      'client_quotes',
      { status: 'consultation_requested' },
      [{ column: 'id', operator: 'eq', value: quote_id }]
    )

    return NextResponse.json({
      success: true,
      message: 'Prośba o konsultację została wysłana! Skontaktujemy się z Tobą w ciągu 24 godzin.',
      data: insertResult.data,
      consultation_id: insertResult.data?.id
    })

  } catch (error: any) {
    console.error('Error creating consultation request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj konsultację (odwołaj, przełóż termin)
export async function PUT(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const body = await request.json()
    const { id, action, new_date, new_time, reason } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Consultation ID and action are required' },
        { status: 400 }
      )
    }

    // Sprawdź czy konsultacja należy do użytkownika
    const consultationResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
      'consultation_requests',
      [
        { column: 'id', operator: 'eq', value: id },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!consultationResult.success || !consultationResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Consultation not found or access denied' },
        { status: 404 }
      )
    }

    const consultation = consultationResult.data.data[0]

    // Sprawdź czy można jeszcze odwołać/przełożyć (nie później niż 2h przed terminem)
    const consultationDateTime = new Date(`${consultation.preferred_date}T${consultation.preferred_time}`)
    const now = new Date()
    const hoursUntilConsultation = (consultationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilConsultation < 2 && action !== 'cancel') {
      return NextResponse.json(
        { error: 'Zmiany można dokonać najpóźniej 2 godziny przed konsultacją' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'cancel':
        // Odwołaj konsultację
        const cancelResult = await dbHelper.helpers.update<ConsultationRequest>(
          'consultation_requests',
          {
            status: 'cancelled',
            admin_notes: `Odwołana przez klienta. Powód: ${reason || 'Nie podano'}`
          },
          [{ column: 'id', operator: 'eq', value: id }]
        )

        if (!cancelResult.success) {
          return NextResponse.json(
            { error: 'Failed to cancel consultation' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Konsultacja została odwołana'
        })

      case 'reschedule':
        // Przełóż termin
        if (!new_date || !new_time) {
          return NextResponse.json(
            { error: 'New date and time are required for rescheduling' },
            { status: 400 }
          )
        }

        // Sprawdź czy nowy termin jest dostępny
        const newDateTimeCheckResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
          'consultation_requests',
          [
            { column: 'preferred_date', operator: 'eq', value: new_date },
            { column: 'preferred_time', operator: 'eq', value: new_time },
            { column: 'status', operator: 'in', value: '(confirmed,pending)' },
            { column: 'id', operator: 'neq', value: id }
          ]
        )

        if (newDateTimeCheckResult.success && newDateTimeCheckResult.data?.data?.length) {
          return NextResponse.json(
            { error: 'Wybrany nowy termin jest już zajęty' },
            { status: 400 }
          )
        }

        const rescheduleResult = await dbHelper.helpers.update<ConsultationRequest>(
          'consultation_requests',
          {
            preferred_date: new_date,
            preferred_time: new_time,
            admin_notes: `Przełożona przez klienta. Powód: ${reason || 'Nie podano'}`
          },
          [{ column: 'id', operator: 'eq', value: id }]
        )

        if (!rescheduleResult.success) {
          return NextResponse.json(
            { error: 'Failed to reschedule consultation' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Konsultacja została przełożona na nowy termin'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Error updating consultation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń konsultację (tylko jeśli została utworzona mniej niż 30 min temu)
export async function DELETE(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const url = new URL(request.url)
    const consultationId = url.searchParams.get('id')

    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy konsultacja należy do użytkownika
    const consultationResult = await dbHelper.helpers.selectWithPagination<ConsultationRequest>(
      'consultation_requests',
      [
        { column: 'id', operator: 'eq', value: consultationId },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!consultationResult.success || !consultationResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Consultation not found or access denied' },
        { status: 404 }
      )
    }

    const consultation = consultationResult.data.data[0]

    // Sprawdź czy konsultacja została utworzona mniej niż 30 minut temu
    const consultationTime = new Date(consultation.created_at)
    const now = new Date()
    const minutesDiff = (now.getTime() - consultationTime.getTime()) / (1000 * 60)

    if (minutesDiff > 30) {
      return NextResponse.json(
        { error: 'Konsultacje można usuwać tylko w ciągu 30 minut od utworzenia' },
        { status: 400 }
      )
    }

    // Usuń konsultację
    const deleteResult = await dbHelper.helpers.delete(
      'consultation_requests',
      [{ column: 'id', operator: 'eq', value: consultationId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete consultation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Konsultacja została usunięta'
    })

  } catch (error: any) {
    console.error('Error deleting consultation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
