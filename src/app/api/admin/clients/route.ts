import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Define the Client interface
interface Client {
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  created_at: string
  last_contact?: string
  total_valuations?: number
  total_spent?: number
  status: 'active' | 'inactive' | 'vip'
}

// GET - Retrieve clients with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if clients exist in database
    const { data: existingClients, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    let clients = existingClients || []

    // If no clients exist, return empty array - no mock data
    if (clients.length === 0) {
      return NextResponse.json({
        clients: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        },
        stats: {
          total: 0,
          byStatus: {
            active: 0,
            inactive: 0,
            vip: 0
          },
          totalValue: 0,
          averageValue: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      company: client.company || undefined,
      created_at: client.created_at,
      last_contact: client.last_contact || undefined,
      total_valuations: client.total_valuations,
      total_spent: client.total_spent,
      status: client.status
    }))

    // Apply filters if specified
    let filteredClients = transformedClients

    if (status !== 'all') {
      filteredClients = filteredClients.filter(c => c.status === status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedClients = filteredClients.slice(offset, offset + limit)

    return NextResponse.json({
      clients: paginatedClients,
      pagination: {
        page,
        limit,
        total: filteredClients.length,
        pages: Math.ceil(filteredClients.length / limit)
      },
      stats: {
        total: transformedClients.length,
        byStatus: {
          active: transformedClients.filter(c => c.status === 'active').length,
          inactive: transformedClients.filter(c => c.status === 'inactive').length,
          vip: transformedClients.filter(c => c.status === 'vip').length
        },
        totalValue: transformedClients.reduce((sum, c) => sum + (c.total_spent || 0), 0),
        averageValue: transformedClients.length > 0
          ? transformedClients.reduce((sum, c) => sum + (c.total_spent || 0), 0) / transformedClients.length
          : 0
      }
    })

  } catch (error) {
    console.error('Error in clients API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const clientData = await request.json()

    // Validate client data
    if (!clientData.name || !clientData.email) {
      return NextResponse.json(
        { error: 'Missing required client data' },
        { status: 400 }
      )
    }

    // Insert client into database
    const { data: newClient, error } = await supabase
      .from('customers')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    // Transform for response
    const transformedClient = {
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone || undefined,
      company: newClient.company || undefined,
      created_at: newClient.created_at,
      last_contact: newClient.last_contact || undefined,
      total_valuations: newClient.total_valuations,
      total_spent: newClient.total_spent,
      status: newClient.status
    }

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      client: transformedClient
    })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

// PUT - Update client details or status
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'update-status' && updateData.id && updateData.status) {
      // Update client status
      const { data: updatedClient, error } = await supabase
        .from('customers')
        .update({
          name: updateData.name,
          email: updateData.email,
          phone: updateData.phone || null
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating client status:', error)
        return NextResponse.json(
          { error: 'Failed to update client status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Client status updated successfully',
        client: updatedClient
      })
    }

    if (action === 'update-details' && updateData.id) {
      // Update client details
      const { data: updatedClient, error } = await supabase
        .from('customers')
        .update({
          name: updateData.name,
          email: updateData.email,
          phone: updateData.phone || null
        })
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating client details:', error)
        return NextResponse.json(
          { error: 'Failed to update client details' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Client details updated successfully',
        client: updatedClient
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE - Delete client
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing client ID' },
        { status: 400 }
      )
    }

    // Delete client from database
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
