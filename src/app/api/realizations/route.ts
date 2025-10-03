import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient } from '@/lib/supabase'

interface Realization {
  id?: string
  title: string
  category: 'Firma' | 'Przemysł' | 'Dom' | 'Biuro' | 'Inne'
  description: string
  materials: string[]
  features: string[]
  squareMeters: number
  location: string
  tags: string[]
  images: string[]
  youtubeVideoId?: string
  completionDate: string
  isPublished: boolean
}

// GET - Retrieve realizations from database
export async function GET() {
  try {
    const supabase = createClientComponentClient()

    const { data: realizations, error } = await supabase
      .from('realizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching realizations from database:', error)
      return NextResponse.json(
        { error: 'Failed to fetch realizations from database' },
        { status: 500 }
      )
    }

    // Transform database format back to API format
    const transformedRealizations = realizations.map(realization => ({
      id: realization.id,
      title: realization.title,
      category: realization.category,
      description: realization.description,
      materials: realization.materials || [],
      features: realization.features || [],
      squareMeters: realization.square_meters,
      location: realization.location,
      tags: realization.tags || [],
      images: realization.images || [],
      youtubeVideoId: realization.youtube_video_id,
      completionDate: realization.completion_date,
      isPublished: realization.is_published,
      createdAt: realization.created_at
    }))

    return NextResponse.json(transformedRealizations)
  } catch (error) {
    console.error('Error in realizations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save realizations to database
export async function POST(request: NextRequest) {
  try {
    const supabase = createClientComponentClient()
    const realizations: Realization[] = await request.json()

    // Validate the realizations data
    if (!Array.isArray(realizations)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Check if user is authenticated (admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Process each realization - insert new or update existing
    const results = []
    for (const realization of realizations) {
      const realizationData = {
        title: realization.title,
        category: realization.category,
        description: realization.description,
        materials: realization.materials,
        features: realization.features,
        square_meters: realization.squareMeters,
        location: realization.location,
        tags: realization.tags,
        images: realization.images,
        youtube_video_id: realization.youtubeVideoId,
        completion_date: realization.completionDate,
        is_published: realization.isPublished
      }

      if (realization.id) {
        // Update existing realization
        const { data, error } = await supabase
          .from('realizations')
          .update(realizationData)
          .eq('id', realization.id)
          .select()
          .single()

        if (error) {
          console.error(`Error updating realization ${realization.id}:`, error)
          results.push({ id: realization.id, status: 'error', error: error.message })
        } else {
          results.push({ id: realization.id, status: 'updated' })
        }
      } else {
        // Insert new realization
        const { data, error } = await supabase
          .from('realizations')
          .insert(realizationData)
          .select()
          .single()

        if (error) {
          console.error(`Error inserting realization:`, error)
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
      message: `Processed ${realizations.length} realizations: ${successCount} successful, ${errorCount} errors`,
      results,
      count: realizations.length
    })
  } catch (error) {
    console.error('Error saving realizations:', error)
    return NextResponse.json(
      { error: 'Failed to save realizations' },
      { status: 500 }
    )
  }
}
