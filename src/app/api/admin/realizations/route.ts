import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Define the Realization interface
interface Realization {
  id?: string
  title: string
  description: string
  category: string
  status: 'draft' | 'published' | 'featured' | 'archived'
  location?: string
  area?: number
  completion_date?: string
  client_name?: string
  project_type: string
  images: string[]
  thumbnail?: string
  tags?: string[]
  featured?: boolean
  created_at: string
  updated_at: string
  views?: number
}

// GET - Retrieve realizations with filtering
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
    const category = searchParams.get('category') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if realizations exist in database
    const { data: existingRealizations, error } = await supabase
      .from('realizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching realizations:', error)
      return NextResponse.json({ error: 'Failed to fetch realizations' }, { status: 500 })
    }

    let realizations = existingRealizations || []

    // If no realizations exist, insert default realizations
    if (realizations.length === 0) {
      const defaultRealizations = getDefaultRealizations()

      const { data: insertedRealizations, error: insertError } = await supabase
        .from('realizations')
        .insert(defaultRealizations.map(realization => ({
          title: realization.title,
          description: realization.description,
          category: realization.category,
          status: realization.status,
          location: realization.location || null,
          area: realization.area || null,
          completion_date: realization.completion_date || null,
          client_name: realization.client_name || null,
          project_type: realization.project_type,
          images: realization.images,
          thumbnail: realization.thumbnail || null,
          tags: realization.tags || null,
          featured: realization.featured || false,
          views: realization.views || 0
        })))
        .select()

      if (insertError) {
        console.error('Error inserting default realizations:', insertError)
        return NextResponse.json([])
      }

      realizations = insertedRealizations || []
    }

    // Transform database format back to API format
    const transformedRealizations = realizations.map(realization => ({
      id: realization.id,
      title: realization.title,
      description: realization.description,
      category: realization.category,
      status: realization.status,
      location: realization.location || undefined,
      area: realization.area || undefined,
      completion_date: realization.completion_date || undefined,
      client_name: realization.client_name || undefined,
      project_type: realization.project_type,
      images: realization.images,
      thumbnail: realization.thumbnail || undefined,
      tags: realization.tags || undefined,
      featured: realization.featured,
      created_at: realization.created_at,
      updated_at: realization.updated_at,
      views: realization.views
    }))

    // Apply filters if specified
    let filteredRealizations = transformedRealizations

    if (status !== 'all') {
      filteredRealizations = filteredRealizations.filter(r => r.status === status)
    }

    if (category !== 'all') {
      filteredRealizations = filteredRealizations.filter(r => r.category === category)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedRealizations = filteredRealizations.slice(offset, offset + limit)

    return NextResponse.json({
      realizations: paginatedRealizations,
      pagination: {
        page,
        limit,
        total: filteredRealizations.length,
        pages: Math.ceil(filteredRealizations.length / limit)
      },
      stats: {
        total: transformedRealizations.length,
        byStatus: {
          draft: transformedRealizations.filter(r => r.status === 'draft').length,
          published: transformedRealizations.filter(r => r.status === 'published').length,
          featured: transformedRealizations.filter(r => r.status === 'featured').length,
          archived: transformedRealizations.filter(r => r.status === 'archived').length
        },
        totalViews: transformedRealizations.reduce((sum, r) => sum + (r.views || 0), 0)
      }
    })

  } catch (error) {
    console.error('Error in realizations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new realization
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const realizationData = await request.json()

    // Validate realization data
    if (!realizationData.title || !realizationData.description || !realizationData.project_type) {
      return NextResponse.json(
        { error: 'Missing required realization data' },
        { status: 400 }
      )
    }

    // Insert realization into database
    const { data: newRealization, error } = await supabase
      .from('realizations')
      .insert({
        title: realizationData.title,
        description: realizationData.description,
        category: realizationData.category || 'Inne',
        status: realizationData.status || 'draft',
        location: realizationData.location || null,
        area: realizationData.area || null,
        completion_date: realizationData.completion_date || null,
        client_name: realizationData.client_name || null,
        project_type: realizationData.project_type,
        images: realizationData.images || [],
        thumbnail: realizationData.thumbnail || null,
        tags: realizationData.tags || null,
        featured: realizationData.featured || false,
        views: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating realization:', error)
      return NextResponse.json(
        { error: 'Failed to create realization' },
        { status: 500 }
      )
    }

    // Transform for response
    const transformedRealization = {
      id: newRealization.id,
      title: newRealization.title,
      description: newRealization.description,
      category: newRealization.category,
      status: newRealization.status,
      location: newRealization.location || undefined,
      area: newRealization.area || undefined,
      completion_date: newRealization.completion_date || undefined,
      client_name: newRealization.client_name || undefined,
      project_type: newRealization.project_type,
      images: newRealization.images,
      thumbnail: newRealization.thumbnail || undefined,
      tags: newRealization.tags || undefined,
      featured: newRealization.featured,
      created_at: newRealization.created_at,
      updated_at: newRealization.updated_at,
      views: newRealization.views
    }

    return NextResponse.json({
      success: true,
      message: 'Realization created successfully',
      realization: transformedRealization
    })

  } catch (error) {
    console.error('Error creating realization:', error)
    return NextResponse.json(
      { error: 'Failed to create realization' },
      { status: 500 }
    )
  }
}

// PUT - Update realization status or details
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
      // Update realization status
      const { data: updatedRealization, error } = await supabase
        .from('realizations')
        .update({ status: updateData.status, updated_at: new Date().toISOString() })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating realization status:', error)
        return NextResponse.json(
          { error: 'Failed to update realization status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Realization status updated successfully',
        realization: updatedRealization
      })
    }

    if (action === 'update-details' && updateData.id) {
      // Update realization details
      const { data: updatedRealization, error } = await supabase
        .from('realizations')
        .update({
          title: updateData.title,
          description: updateData.description,
          category: updateData.category,
          location: updateData.location,
          area: updateData.area,
          completion_date: updateData.completion_date,
          client_name: updateData.client_name,
          project_type: updateData.project_type,
          images: updateData.images,
          thumbnail: updateData.thumbnail,
          tags: updateData.tags,
          featured: updateData.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating realization details:', error)
        return NextResponse.json(
          { error: 'Failed to update realization details' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Realization details updated successfully',
        realization: updatedRealization
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating realization:', error)
    return NextResponse.json(
      { error: 'Failed to update realization' },
      { status: 500 }
    )
  }
}

// DELETE - Delete realization
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
        { error: 'Missing realization ID' },
        { status: 400 }
      )
    }

    // Delete realization from database
    const { error } = await supabase
      .from('realizations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting realization:', error)
      return NextResponse.json(
        { error: 'Failed to delete realization' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Realization deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting realization:', error)
    return NextResponse.json(
      { error: 'Failed to delete realization' },
      { status: 500 }
    )
  }
}

// Default realizations data - removed to eliminate mock data
const getDefaultRealizations = (): Omit<Realization, 'id'>[] => {
  return []
}
