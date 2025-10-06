import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface Review {
  id?: string
  author_name: string
  author_email?: string
  rating: number
  title?: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  project_type?: string
  location?: string
  created_at: string
  updated_at: string
  verified_purchase?: boolean
  helpful_votes?: number
  images?: string[]
  response?: {
    content: string
    author: string
    created_at: string
  }
}

// GET - Retrieve reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if reviews exist in database
    const { data: existingReviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    let reviews = existingReviews || []

    // If no reviews exist, return empty array - no mock data
    if (reviews.length === 0) {
      return NextResponse.json({
        reviews: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        },
        stats: {
          total: 0,
          byStatus: {
            pending: 0,
            approved: 0,
            rejected: 0,
            featured: 0
          },
          averageRating: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      author_name: review.author_name,
      author_email: review.author_email || undefined,
      rating: review.rating,
      title: review.title || undefined,
      content: review.content,
      status: review.status,
      project_type: review.project_type || undefined,
      location: review.location || undefined,
      created_at: review.created_at,
      updated_at: review.updated_at,
      verified_purchase: review.verified_purchase,
      helpful_votes: review.helpful_votes,
      images: review.images || undefined,
      response: review.response || undefined
    }))

    // Apply filters if specified
    let filteredReviews = transformedReviews

    if (status !== 'all') {
      filteredReviews = filteredReviews.filter(r => r.status === status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedReviews = filteredReviews.slice(offset, offset + limit)

    return NextResponse.json({
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total: filteredReviews.length,
        pages: Math.ceil(filteredReviews.length / limit)
      },
      stats: {
        total: transformedReviews.length,
        byStatus: {
          pending: transformedReviews.filter(r => r.status === 'pending').length,
          approved: transformedReviews.filter(r => r.status === 'approved').length,
          rejected: transformedReviews.filter(r => r.status === 'rejected').length,
          featured: transformedReviews.filter(r => r.status === 'featured').length
        },
        averageRating: transformedReviews.length > 0
          ? (transformedReviews.reduce((sum, r) => sum + r.rating, 0) / transformedReviews.length).toFixed(1)
          : '0.0'
      }
    })

  } catch (error) {
    console.error('Error in reviews API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const reviewData = await request.json()

    // Validate review data
    if (!reviewData.author_name || !reviewData.content || !reviewData.rating) {
      return NextResponse.json(
        { error: 'Missing required review data' },
        { status: 400 }
      )
    }

    // Insert review into database
    const { data: newReview, error } = await supabase
      .from('reviews')
      .insert({
        author_name: reviewData.author_name,
        author_email: reviewData.author_email || null,
        rating: reviewData.rating,
        title: reviewData.title || null,
        content: reviewData.content,
        status: reviewData.status || 'pending',
        project_type: reviewData.project_type || null,
        location: reviewData.location || null,
        verified_purchase: reviewData.verified_purchase || false,
        helpful_votes: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Transform for response
    const transformedReview = {
      id: newReview.id,
      author_name: newReview.author_name,
      author_email: newReview.author_email || undefined,
      rating: newReview.rating,
      title: newReview.title || undefined,
      content: newReview.content,
      status: newReview.status,
      project_type: newReview.project_type || undefined,
      location: newReview.location || undefined,
      created_at: newReview.created_at,
      updated_at: newReview.updated_at,
      verified_purchase: newReview.verified_purchase,
      helpful_votes: newReview.helpful_votes,
      images: newReview.images || undefined,
      response: newReview.response || undefined
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: transformedReview
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// PUT - Update review status or details
export async function PUT(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'update-status' && updateData.id && updateData.status) {
      // Update review status
      const { data: updatedReview, error } = await supabase
        .from('reviews')
        .update({
          status: updateData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating review status:', error)
        return NextResponse.json(
          { error: 'Failed to update review status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Review status updated successfully',
        review: updatedReview
      })
    }

    if (action === 'add-response' && updateData.id && updateData.response) {
      // Add response to review
      const { data: updatedReview, error } = await supabase
        .from('reviews')
        .update({
          response: updateData.response,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error adding review response:', error)
        return NextResponse.json(
          { error: 'Failed to add review response' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Review response added successfully',
        review: updatedReview
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      )
    }

    // Delete review from database
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting review:', error)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
