import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ProjectPhoto,
  ProjectPhotoInsert,
  ProjectPhotoUpdate,
  ProjectPhotoFilters,
  ProjectPhotoFormData,
  FileUploadResponse
} from '@/lib/database-types'

// GET - Pobierz zdjęcia projektu klienta
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const url = new URL(request.url)
    const quoteId = url.searchParams.get('quote_id')
    const photoType = url.searchParams.get('photo_type') as 'before' | 'after' | 'during' | 'final' | null
    const approved = url.searchParams.get('approved') // 'true', 'false', or null

    // Buduj filtry
    const filters = [
      { column: 'client_id', operator: 'eq', value: user.id }
    ]

    if (quoteId) {
      filters.push({ column: 'quote_id', operator: 'eq', value: quoteId })
    }

    if (photoType) {
      filters.push({ column: 'photo_type', operator: 'eq', value: photoType })
    }

    if (approved !== null) {
      filters.push({ column: 'is_approved', operator: 'eq', value: approved === 'true' })
    }

    // Pobierz zdjęcia projektu klienta
    const photosResult = await dbHelper.helpers.selectWithPagination<ProjectPhoto>(
      'project_photos',
      filters,
      { column: 'created_at', ascending: false },
      { page: 1, limit: 100 }
    )

    if (!photosResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch project photos' },
        { status: 500 }
      )
    }

    const photos = photosResult.data?.data || []

    // Grupuj zdjęcia według typu i statusu zatwierdzenia
    const photosByType = photos.reduce((acc, photo) => {
      if (!acc[photo.photo_type]) {
        acc[photo.photo_type] = {
          all: [],
          approved: [],
          pending: []
        }
      }
      acc[photo.photo_type].all.push(photo)
      if (photo.is_approved) {
        acc[photo.photo_type].approved.push(photo)
      } else {
        acc[photo.photo_type].pending.push(photo)
      }
      return acc
    }, {} as Record<string, { all: ProjectPhoto[], approved: ProjectPhoto[], pending: ProjectPhoto[] }>)

    return NextResponse.json({
      success: true,
      photos: photos,
      photos_by_type: photosByType,
      total_count: photos.length,
      approved_count: photos.filter(p => p.is_approved).length,
      pending_count: photos.filter(p => !p.is_approved).length,
      photo_types: Object.keys(photosByType)
    })

  } catch (error: any) {
    console.error('Error fetching project photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Upload nowego zdjęcia projektu
export async function POST(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const formData = await request.formData()

    const file = formData.get('file') as File
    const photoType = formData.get('photo_type') as 'before' | 'after' | 'during' | 'final'
    const quoteId = formData.get('quote_id') as string
    const description = formData.get('description') as string

    if (!file || !photoType) {
      return NextResponse.json(
        { error: 'File and photo type are required' },
        { status: 400 }
      )
    }

    // Walidacja typu zdjęcia
    const validTypes = ['before', 'after', 'during', 'final']
    if (!validTypes.includes(photoType)) {
      return NextResponse.json(
        { error: 'Invalid photo type' },
        { status: 400 }
      )
    }

    // Sprawdź rozmiar pliku (max 15MB dla zdjęć)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 15MB)' },
        { status: 400 }
      )
    }

    // Sprawdź typ MIME - tylko obrazy
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${photoType}_${timestamp}.${fileExtension}`

    // W rzeczywistej aplikacji tutaj zapisz plik do storage (AWS S3, etc.)
    // Na razie symulujemy zapis
    const filePath = `/uploads/project-photos/${user.id}/${fileName}`

    // Sprawdź czy zdjęcie jest powiązane z wyceną
    let relatedQuote = null
    if (quoteId) {
      const quoteResult = await dbHelper.helpers.selectWithPagination(
        'client_quotes',
        [
          { column: 'id', operator: 'eq', value: quoteId },
          { column: 'client_id', operator: 'eq', value: user.id }
        ]
      )

      if (quoteResult.success && quoteResult.data?.data?.length) {
        relatedQuote = quoteResult.data.data[0]
      }
    }

    // Zapisz informacje o zdjęciu w bazie danych
    const photoData: ProjectPhotoInsert = {
      client_id: user.id,
      quote_id: quoteId || null,
      photo_type: photoType,
      file_name: fileName,
      file_path: filePath,
      description: description || null,
      uploaded_by_client: true,
      is_approved: false // Zdjęcia wymagają zatwierdzenia przez admina
    }

    const insertResult = await dbHelper.helpers.insert<ProjectPhoto>(
      'project_photos',
      photoData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to save photo information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully and is pending approval',
      data: insertResult.data,
      file_path: filePath,
      file_name: fileName,
      requires_approval: true
    })

  } catch (error: any) {
    console.error('Error uploading project photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj zdjęcie projektu
export async function PUT(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy zdjęcie należy do użytkownika
    const existingPhotoResult = await dbHelper.helpers.selectWithPagination<ProjectPhoto>(
      'project_photos',
      [
        { column: 'id', operator: 'eq', value: id },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!existingPhotoResult.success || !existingPhotoResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      )
    }

    // Aktualizuj zdjęcie
    const updateResult = await dbHelper.helpers.update<ProjectPhoto>(
      'project_photos',
      updateData,
      [{ column: 'id', operator: 'eq', value: id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo updated successfully',
      data: updateResult.data?.[0]
    })

  } catch (error: any) {
    console.error('Error updating project photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń zdjęcie projektu
export async function DELETE(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user
    const url = new URL(request.url)
    const photoId = url.searchParams.get('id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy zdjęcie należy do użytkownika
    const existingPhotoResult = await dbHelper.helpers.selectWithPagination<ProjectPhoto>(
      'project_photos',
      [
        { column: 'id', operator: 'eq', value: photoId },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!existingPhotoResult.success || !existingPhotoResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      )
    }

    const photo = existingPhotoResult.data.data[0]

    // Sprawdź czy zdjęcie zostało dodane mniej niż 30 minut temu (można usunąć tylko świeże zdjęcia)
    const photoTime = new Date(photo.created_at)
    const now = new Date()
    const timeDiff = (now.getTime() - photoTime.getTime()) / (1000 * 60) // minutes

    if (timeDiff > 30) {
      return NextResponse.json(
        { error: 'Photos can only be deleted within 30 minutes of upload' },
        { status: 400 }
      )
    }

    // Usuń zdjęcie
    const deleteResult = await dbHelper.helpers.delete(
      'project_photos',
      [{ column: 'id', operator: 'eq', value: photoId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting project photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
