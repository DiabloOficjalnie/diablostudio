import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET - Retrieve users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'

    const offset = (page - 1) * limit

    // For now, return mock data since Supabase Auth admin functions
    // require special configuration in production
    const mockUsers = [
      {
        id: '1',
        email: 'admin@diablostudio.pl',
        name: 'Administrator',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-20T10:30:00Z',
        profile: {
          first_name: 'Admin',
          last_name: 'DiabloStudio',
          phone: '+48 123 456 789'
        }
      },
      {
        id: '2',
        email: 'moderator@diablostudio.pl',
        name: 'Moderator Systemu',
        role: 'moderator',
        status: 'active',
        created_at: '2024-01-05T09:00:00Z',
        last_login: '2024-01-19T15:45:00Z',
        profile: {
          first_name: 'Moderator',
          last_name: 'User',
          phone: '+48 987 654 321'
        }
      },
      {
        id: '3',
        email: 'editor@diablostudio.pl',
        name: 'Edytor Treści',
        role: 'editor',
        status: 'active',
        created_at: '2024-01-10T14:20:00Z',
        last_login: '2024-01-18T11:20:00Z',
        profile: {
          first_name: 'Editor',
          last_name: 'Content',
          phone: '+48 555 123 456'
        }
      },
      {
        id: '4',
        email: 'user@diablostudio.pl',
        name: 'Zwykły Użytkownik',
        role: 'user',
        status: 'inactive',
        created_at: '2024-01-15T16:30:00Z',
        profile: {
          first_name: 'User',
          last_name: 'Test',
          phone: '+48 444 789 012'
        }
      }
    ]

    // Apply filters
    let filteredUsers = mockUsers

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.profile?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.profile?.last_name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    // Apply pagination
    const totalUsers = filteredUsers.length
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const userData = await request.json()

    // Validate required fields
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, return success with mock data
    // In production, this would create user in Supabase Auth
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`,
      role: userData.role || 'user',
      status: userData.status || 'active',
      created_at: new Date().toISOString(),
      profile: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || ''
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
