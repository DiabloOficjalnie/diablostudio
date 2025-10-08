import { createClientComponentClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClientComponentClient()

    // Fetch approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(4)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    // Fetch realizations
    const { data: realizations, error: realizationsError } = await supabase
      .from('realizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)

    if (realizationsError) {
      console.error('Error fetching realizations:', realizationsError)
    }

    // Transform reviews for display
    const transformedReviews = reviews?.map(review => ({
      id: review.id,
      name: `${review.first_name} ${review.last_name}`,
      company: review.project_location || 'Klient indywidualny',
      rating: review.rating,
      comment: review.review_text,
      date: review.created_at,
      service: review.project_type,
      verified: false,
      helpful: review.helpful || 0,
      project: review.project_location || 'Projekt'
    })) || []

    // Transform realizations for display
    const transformedRealizations = realizations?.map(realization => ({
      id: realization.id,
      title: realization.title,
      category: realization.category,
      rating: realization.rating || 5,
      reviewCount: realization.review_count || 0,
      image: realization.image_url || 'bg-gradient-to-br from-gray-300 to-gray-400',
      location: realization.location,
      squareMeters: realization.square_meters
    })) || []

    return NextResponse.json({
      reviews: transformedReviews,
      realizations: transformedRealizations,
      stats: {
        totalReviews: transformedReviews.length,
        averageRating: transformedReviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(transformedReviews.length, 1),
        totalProjects: transformedRealizations.length
      }
    })

  } catch (error) {
    console.error('Error in main-page-data API:', error)
    return NextResponse.json(
      {
        reviews: [],
        realizations: [],
        stats: { totalReviews: 0, averageRating: 0, totalProjects: 0 }
      },
      { status: 500 }
    )
  }
}
