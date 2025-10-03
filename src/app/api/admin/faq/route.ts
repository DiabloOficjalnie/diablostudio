import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Define the FAQ interface
interface FAQItem {
  id?: string
  question: string
  answer: string
  category: string
  status: 'active' | 'inactive' | 'draft'
  author: string
  created_at: string
  updated_at: string
  views?: number
  helpful_votes?: number
  not_helpful_votes?: number
  tags?: string[]
}

// GET - Retrieve FAQs with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if FAQs exist in database
    const { data: existingFAQs, error } = await supabase
      .from('faq')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
    }

    let faqs = existingFAQs || []

    // If no FAQs exist, return empty array - no mock data
    if (faqs.length === 0) {
      return NextResponse.json({
        faqs: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        },
        stats: {
          total: 0,
          byStatus: {
            active: 0,
            inactive: 0,
            draft: 0
          },
          totalViews: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedFAQs = faqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
      author: faq.author,
      created_at: faq.created_at,
      updated_at: faq.updated_at,
      views: faq.views,
      helpful_votes: faq.helpful_votes,
      not_helpful_votes: faq.not_helpful_votes,
      tags: faq.tags || undefined
    }))

    // Apply filters if specified
    let filteredFAQs = transformedFAQs

    if (status !== 'all') {
      filteredFAQs = filteredFAQs.filter(f => f.status === status)
    }

    if (category !== 'all') {
      filteredFAQs = filteredFAQs.filter(f => f.category === category)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedFAQs = filteredFAQs.slice(offset, offset + limit)

    return NextResponse.json({
      faqs: paginatedFAQs,
      pagination: {
        page,
        limit,
        total: filteredFAQs.length,
        pages: Math.ceil(filteredFAQs.length / limit)
      },
      stats: {
        total: transformedFAQs.length,
        byStatus: {
          active: transformedFAQs.filter(f => f.status === 'active').length,
          inactive: transformedFAQs.filter(f => f.status === 'inactive').length,
          draft: transformedFAQs.filter(f => f.status === 'draft').length
        },
        totalViews: transformedFAQs.reduce((sum, f) => sum + (f.views || 0), 0)
      }
    })

  } catch (error) {
    console.error('Error in FAQs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const faqData = await request.json()

    // Validate FAQ data
    if (!faqData.question || !faqData.answer || !faqData.category) {
      return NextResponse.json(
        { error: 'Missing required FAQ data' },
        { status: 400 }
      )
    }

    // Insert FAQ into database
    const { data: newFAQ, error } = await supabase
      .from('faq')
      .insert({
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category || null,
        is_active: faqData.status === 'active',
        sort_order: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      )
    }

    // Transform for response
    const transformedFAQ = {
      id: newFAQ.id,
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category,
      status: newFAQ.status,
      author: newFAQ.author,
      created_at: newFAQ.created_at,
      updated_at: newFAQ.updated_at,
      views: newFAQ.views,
      helpful_votes: newFAQ.helpful_votes,
      not_helpful_votes: newFAQ.not_helpful_votes,
      tags: newFAQ.tags || undefined
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ created successfully',
      faq: transformedFAQ
    })

  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}

// PUT - Update FAQ status or details
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'update-status' && updateData.id && updateData.status) {
      // Update FAQ status
      const { data: updatedFAQ, error } = await supabase
        .from('faq')
        .update({
          is_active: updateData.status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id || '')
        .select()
        .single()

      if (error) {
        console.error('Error updating FAQ status:', error)
        return NextResponse.json(
          { error: 'Failed to update FAQ status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'FAQ status updated successfully',
        faq: updatedFAQ
      })
    }

    if (action === 'update-details' && updateData.id) {
      // Update FAQ details
      const { data: updatedFAQ, error } = await supabase
        .from('faq')
        .update({
          question: updateData.question,
          answer: updateData.answer,
          category: updateData.category || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating FAQ details:', error)
        return NextResponse.json(
          { error: 'Failed to update FAQ details' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'FAQ details updated successfully',
        faq: updatedFAQ
      })
    }

    if (action === 'increment-views' && updateData.id) {
      // Increment view count
      const { data: updatedFAQ, error } = await supabase
        .from('faq')
        .update({
          sort_order: (updateData.currentViews || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error incrementing FAQ views:', error)
        return NextResponse.json(
          { error: 'Failed to increment views' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Views incremented successfully',
        faq: updatedFAQ
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    )
  }
}

// DELETE - Delete FAQ
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing FAQ ID' },
        { status: 400 }
      )
    }

    // Delete FAQ from database
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting FAQ:', error)
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}
