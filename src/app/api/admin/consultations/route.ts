import { NextRequest, NextResponse } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { createClient } from '@/lib/supabase'

interface Consultation {
  id?: string
  client_name: string
  client_email: string
  client_phone?: string
  project_type: string
  project_description: string
  budget_range?: string
  preferred_contact_time?: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
  scheduled_date?: string
  estimated_value?: number
  source?: string
}

// GET - Retrieve consultations with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const status = searchParams.get('status') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if consultations exist in database
    const { data: existingConsultations, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching consultations:', error)
      return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 })
    }

    let consultations = existingConsultations || []

    // If no consultations exist, return empty array - no mock data
    if (consultations.length === 0) {
      return NextResponse.json({
        consultations: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        },
        stats: {
          total: 0,
          byStatus: {
            new: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
          },
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
          },
          totalValue: 0,
          averageValue: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedConsultations = consultations.map(consultation => ({
      id: consultation.id,
      client_name: consultation.client_name,
      client_email: consultation.client_email,
      client_phone: consultation.client_phone || undefined,
      project_type: consultation.project_type,
      project_description: consultation.project_description,
      budget_range: consultation.budget_range || undefined,
      preferred_contact_time: consultation.preferred_contact_time || undefined,
      status: consultation.status,
      priority: consultation.priority,
      assigned_to: consultation.assigned_to || undefined,
      notes: consultation.notes || undefined,
      created_at: consultation.created_at,
      updated_at: consultation.updated_at,
      scheduled_date: consultation.scheduled_date || undefined,
      estimated_value: consultation.estimated_value || undefined,
      source: consultation.source || undefined
    }))

    // Apply filters if specified
    let filteredConsultations = transformedConsultations

    if (status !== 'all') {
      filteredConsultations = filteredConsultations.filter(c => c.status === status)
    }

    if (priority !== 'all') {
      filteredConsultations = filteredConsultations.filter(c => c.priority === priority)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedConsultations = filteredConsultations.slice(offset, offset + limit)

    return NextResponse.json({
      consultations: paginatedConsultations,
      pagination: {
        page,
        limit,
        total: filteredConsultations.length,
        pages: Math.ceil(filteredConsultations.length / limit)
      },
      stats: {
        total: transformedConsultations.length,
        byStatus: {
          new: transformedConsultations.filter(c => c.status === 'new').length,
          in_progress: transformedConsultations.filter(c => c.status === 'in_progress').length,
          completed: transformedConsultations.filter(c => c.status === 'completed').length,
          cancelled: transformedConsultations.filter(c => c.status === 'cancelled').length
        },
        byPriority: {
          low: transformedConsultations.filter(c => c.priority === 'low').length,
          medium: transformedConsultations.filter(c => c.priority === 'medium').length,
          high: transformedConsultations.filter(c => c.priority === 'high').length,
          urgent: transformedConsultations.filter(c => c.priority === 'urgent').length
        },
        totalValue: transformedConsultations.reduce((sum, c) => sum + (c.estimated_value || 0), 0),
        averageValue: transformedConsultations.length > 0
          ? transformedConsultations.reduce((sum, c) => sum + (c.estimated_value || 0), 0) / transformedConsultations.length
          : 0
      }
    })

  } catch (error) {
    console.error('Error in consultations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new consultation
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const consultationData = await request.json()

    // Validate consultation data
    if (!consultationData.client_name || !consultationData.client_email || !consultationData.project_type || !consultationData.project_description) {
      return NextResponse.json(
        { error: 'Missing required consultation data' },
        { status: 400 }
      )
    }

    // Insert consultation into database
    const { data: newConsultation, error } = await supabase
      .from('consultations')
      .insert({
        client_name: consultationData.client_name,
        client_email: consultationData.client_email,
        client_phone: consultationData.client_phone || null,
        project_type: consultationData.project_type,
        project_description: consultationData.project_description,
        budget_range: consultationData.budget_range || null,
        preferred_contact_time: consultationData.preferred_contact_time || null,
        status: consultationData.status || 'new',
        priority: consultationData.priority || 'medium',
        assigned_to: consultationData.assigned_to || null,
        notes: consultationData.notes || null,
        scheduled_date: consultationData.scheduled_date || null,
        estimated_value: consultationData.estimated_value || null,
        source: consultationData.source || 'website'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating consultation:', error)
      return NextResponse.json(
        { error: 'Failed to create consultation' },
        { status: 500 }
      )
    }

    // Transform for response
    const transformedConsultation = {
      id: newConsultation.id,
      client_name: newConsultation.client_name,
      client_email: newConsultation.client_email,
      client_phone: newConsultation.client_phone || undefined,
      project_type: newConsultation.project_type,
      project_description: newConsultation.project_description,
      budget_range: newConsultation.budget_range || undefined,
      preferred_contact_time: newConsultation.preferred_contact_time || undefined,
      status: newConsultation.status,
      priority: newConsultation.priority,
      assigned_to: newConsultation.assigned_to || undefined,
      notes: newConsultation.notes || undefined,
      created_at: newConsultation.created_at,
      updated_at: newConsultation.updated_at,
      scheduled_date: newConsultation.scheduled_date || undefined,
      estimated_value: newConsultation.estimated_value || undefined,
      source: newConsultation.source || undefined
    }

    return NextResponse.json({
      success: true,
      message: 'Consultation created successfully',
      consultation: transformedConsultation
    })

  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json(
      { error: 'Failed to create consultation' },
      { status: 500 }
    )
  }
}

// PUT - Update consultation status or details
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'update-status' && updateData.id && updateData.status) {
      // Update consultation status
      const { data: updatedConsultation, error } = await supabase
        .from('consultations')
        .update({
          status: updateData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating consultation status:', error)
        return NextResponse.json(
          { error: 'Failed to update consultation status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Consultation status updated successfully',
        consultation: updatedConsultation
      })
    }

    if (action === 'update-details' && updateData.id) {
      // Update consultation details
      const { data: updatedConsultation, error } = await supabase
        .from('consultations')
        .update({
          client_name: updateData.client_name,
          client_email: updateData.client_email,
          client_phone: updateData.client_phone || null,
          project_type: updateData.project_type,
          project_description: updateData.project_description,
          budget_range: updateData.budget_range || null,
          preferred_contact_time: updateData.preferred_contact_time || null,
          priority: updateData.priority || 'medium',
          assigned_to: updateData.assigned_to || null,
          notes: updateData.notes || null,
          scheduled_date: updateData.scheduled_date || null,
          estimated_value: updateData.estimated_value || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating consultation details:', error)
        return NextResponse.json(
          { error: 'Failed to update consultation details' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Consultation details updated successfully',
        consultation: updatedConsultation
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating consultation:', error)
    return NextResponse.json(
      { error: 'Failed to update consultation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete consultation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing consultation ID' },
        { status: 400 }
      )
    }

    // Delete consultation from database
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting consultation:', error)
      return NextResponse.json(
        { error: 'Failed to delete consultation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Consultation deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting consultation:', error)
    return NextResponse.json(
      { error: 'Failed to delete consultation' },
      { status: 500 }
    )
  }
}
