import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

type PublicReviewBody = {
  firstName: string
  lastName: string
  email: string
  projectDate: string
  projectType: string
  squareMeters: string | number
  rating: number
  reviewText: string
  consent?: boolean
  projectLocation?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body: PublicReviewBody = await request.json()

    // Basic validation
    const required: (keyof PublicReviewBody)[] = [
      'firstName',
      'lastName',
      'email',
      'projectDate',
      'projectType',
      'squareMeters',
      'rating',
      'reviewText'
    ]
    const missing = required.filter((k) => !body[k] && body[k] !== 0)
    if (missing.length) {
      return NextResponse.json(
        { error: `Brak wymaganych pól: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const squareMeters = Number(body.squareMeters)
    if (!Number.isFinite(squareMeters) || squareMeters <= 0) {
      return NextResponse.json(
        { error: 'Nieprawidłowa wartość powierzchni (m²)' },
        { status: 400 }
      )
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Ocena musi być w zakresie 1-5' },
        { status: 400 }
      )
    }

    // Insert review with pending status
    const insertPayload = {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      project_date: body.projectDate,
      project_type: body.projectType,
      square_meters: squareMeters,
      rating: body.rating,
      review_text: body.reviewText,
      status: 'pending' as const,
      helpful: 0,
      project_location: body.projectLocation || null
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(insertPayload)
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Error inserting public review:', error)
      return NextResponse.json(
        { error: 'Błąd podczas zapisu opinii. Spróbuj ponownie później.' },
        { status: 500 }
      )
    }

    // Optionally: could queue a notification to admins here

    return NextResponse.json({
      success: true,
      message: 'Dziękujemy! Twoja opinia została zapisana i czeka na weryfikację.',
      id: data?.id,
      createdAt: data?.created_at
    })
  } catch (err) {
    console.error('Public review POST error:', err)
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd serwera.' },
      { status: 500 }
    )
  }
}
