import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ClientGuide,
  ClientGuideInsert,
  ClientGuideUpdate
} from '@/lib/database-types'

// GET - Pobierz poradniki dla klientów
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, false) // Publiczne poradniki nie wymagają autoryzacji

    const url = new URL(request.url)
    const guideType = url.searchParams.get('type') as 'pdf' | 'video' | 'text' | 'link' | null
    const search = url.searchParams.get('search')

    // Buduj filtry dla aktywnych poradników
    const filters = [
      { column: 'is_active', operator: 'eq', value: true }
    ]

    if (guideType) {
      filters.push({ column: 'guide_type', operator: 'eq', value: guideType })
    }

    // Pobierz poradniki
    const guidesResult = await dbHelper.helpers.selectWithPagination<ClientGuide>(
      'client_guides',
      filters,
      { column: 'sort_order', ascending: true },
      { page: 1, limit: 100 }
    )

    if (!guidesResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch guides' },
        { status: 500 }
      )
    }

    let guides = guidesResult.data?.data || []

    // Filtrowanie po wyszukiwaniu (jeśli podano)
    if (search) {
      const searchLower = search.toLowerCase()
      guides = guides.filter(guide =>
        guide.title.toLowerCase().includes(searchLower) ||
        (guide.description && guide.description.toLowerCase().includes(searchLower))
      )
    }

    // Grupuj poradniki według typu
    const guidesByType = guides.reduce((acc, guide) => {
      if (!acc[guide.guide_type]) {
        acc[guide.guide_type] = []
      }
      acc[guide.guide_type].push(guide)
      return acc
    }, {} as Record<string, ClientGuide[]>)

    return NextResponse.json({
      success: true,
      guides: guides,
      guides_by_type: guidesByType,
      total_count: guides.length,
      guide_types: Object.keys(guidesByType)
    })

  } catch (error: any) {
    console.error('Error fetching client guides:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Utwórz nowy poradnik (tylko dla adminów)
export async function POST(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest administratorem
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest adminem
    const adminResult = await dbHelper.helpers.selectWithPagination(
      'admin_users',
      [
        { column: 'id', operator: 'eq', value: userResult.data.user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!adminResult.success || !adminResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body: ClientGuideInsert = await request.json()
    const { title, description, guide_type, content_url, is_active, sort_order } = body

    if (!title || !guide_type) {
      return NextResponse.json(
        { error: 'Title and guide type are required' },
        { status: 400 }
      )
    }

    // Walidacja typu poradnika
    const validTypes = ['pdf', 'video', 'text', 'link']
    if (!validTypes.includes(guide_type)) {
      return NextResponse.json(
        { error: 'Invalid guide type' },
        { status: 400 }
      )
    }

    // Utwórz poradnik
    const guideData: ClientGuideInsert = {
      title,
      description: description || null,
      guide_type,
      content_url: content_url || null,
      is_active: is_active !== undefined ? is_active : true,
      sort_order: sort_order || 0
    }

    const insertResult = await dbHelper.helpers.insert<ClientGuide>(
      'client_guides',
      guideData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to create guide' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guide created successfully',
      data: insertResult.data
    })

  } catch (error: any) {
    console.error('Error creating client guide:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj poradnik (tylko dla adminów)
export async function PUT(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest administratorem
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest adminem
    const adminResult = await dbHelper.helpers.selectWithPagination(
      'admin_users',
      [
        { column: 'id', operator: 'eq', value: userResult.data.user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!adminResult.success || !adminResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      )
    }

    // Aktualizuj poradnik
    const updateResult = await dbHelper.helpers.update<ClientGuide>(
      'client_guides',
      updateData,
      [{ column: 'id', operator: 'eq', value: id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update guide' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guide updated successfully',
      data: updateResult.data?.[0]
    })

  } catch (error: any) {
    console.error('Error updating client guide:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń poradnik (tylko dla adminów)
export async function DELETE(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest administratorem
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest adminem
    const adminResult = await dbHelper.helpers.selectWithPagination(
      'admin_users',
      [
        { column: 'id', operator: 'eq', value: userResult.data.user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!adminResult.success || !adminResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const guideId = url.searchParams.get('id')

    if (!guideId) {
      return NextResponse.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      )
    }

    // Usuń poradnik
    const deleteResult = await dbHelper.helpers.delete(
      'client_guides',
      [{ column: 'id', operator: 'eq', value: guideId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete guide' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guide deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting client guide:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
