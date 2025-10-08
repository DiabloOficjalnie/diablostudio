import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase-server'

interface Review {
  id?: string
  firstName: string
  lastName: string
  email: string
  projectDate: string
  projectType: string
  squareMeters: number
  rating: number
  reviewText: string
  status: 'pending' | 'approved' | 'rejected'
  helpful: number
  projectLocation?: string
}

// GET - Retrieve reviews from database
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews from database:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews from database' },
        { status: 500 }
      )
    }

    // Transform database format back to API format
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      firstName: review.first_name,
      lastName: review.last_name,
      email: review.email,
      projectDate: review.project_date,
      projectType: review.project_type,
      squareMeters: review.square_meters,
      rating: review.rating,
      reviewText: review.review_text,
      status: review.status,
      helpful: review.helpful,
      projectLocation: review.project_location,
      createdAt: review.created_at
    }))

    return NextResponse.json(transformedReviews)
  } catch (error) {
    console.error('Error in reviews API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save reviews to database
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const supabase = createAdminClient()
    const reviews: Review[] = await request.json()

    // Validate the reviews data
    if (!Array.isArray(reviews)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Check if user is authenticated (admin)
    // Clerk authentication is handled above via userId

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Process each review - insert new or update existing
    const results = []
    for (const review of reviews) {
      const reviewData = {
        first_name: review.firstName,
        last_name: review.lastName,
        email: review.email,
        project_date: review.projectDate,
        project_type: review.projectType,
        square_meters: review.squareMeters,
        rating: review.rating,
        review_text: review.reviewText,
        status: review.status,
        helpful: review.helpful,
        project_location: review.projectLocation
      }

      if (review.id) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', review.id)
          .select()
          .single()

        if (error) {
          console.error(`Error updating review ${review.id}:`, error)
          results.push({ id: review.id, status: 'error', error: error.message })
        } else {
          results.push({ id: review.id, status: 'updated' })
        }
      } else {
        // Insert new review
        const { data, error } = await supabase
          .from('reviews')
          .insert(reviewData)
          .select()
          .single()

        if (error) {
          console.error(`Error inserting review:`, error)
          results.push({ status: 'error', error: error.message })
        } else {
          results.push({ id: data.id, status: 'inserted' })
        }
      }
    }

    const successCount = results.filter(r => r.status === 'inserted' || r.status === 'updated').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      success: errorCount === 0,
      message: `Processed ${reviews.length} reviews: ${successCount} successful, ${errorCount} errors`,
      results,
      count: reviews.length
    })
  } catch (error) {
    console.error('Error saving reviews:', error)
    return NextResponse.json(
      { error: 'Failed to save reviews' },
      { status: 500 }
    )
  }
}

// PUT - Update review interactions (e.g., helpful)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    if (action === 'helpful') {
      if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      }

      // Read current helpful value
      const { data: existing, error: selectError } = await supabase
        .from('reviews')
        .select('helpful')
        .eq('id', id)
        .single()

      if (selectError || !existing) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }

      const newHelpful = (existing.helpful || 0) + 1

      const { error: updateError } = await supabase
        .from('reviews')
        .update({ helpful: newHelpful })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating helpful count:', updateError)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
      }

      return NextResponse.json({ success: true, id, helpful: newHelpful })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in reviews PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
