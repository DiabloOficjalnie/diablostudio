import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ClientDocument,
  ClientDocumentInsert,
  ClientDocumentUpdate,
  ClientDocumentFilters,
  ClientDocumentListResponse,
  FileUploadResponse
} from '@/lib/database-types'

// GET - Pobierz dokumenty klienta
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany i ma profil klienta
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user

    // Sprawdź czy użytkownik ma profil klienta
    const profileResult = await dbHelper.helpers.selectWithPagination<ClientDocument>(
      'client_documents',
      [{ column: 'client_id', operator: 'eq', value: user.id }],
      { column: 'created_at', ascending: false },
      { page: 1, limit: 100 }
    )

    if (!profileResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    const documents = profileResult.data?.data || []

    // Grupuj dokumenty według typu dla łatwiejszego wyświetlania
    const documentsByType = documents.reduce((acc, doc) => {
      if (!acc[doc.document_type]) {
        acc[doc.document_type] = []
      }
      acc[doc.document_type].push(doc)
      return acc
    }, {} as Record<string, ClientDocument[]>)

    return NextResponse.json({
      success: true,
      data: documents,
      documents_by_type: documentsByType,
      total_count: documents.length,
      document_types: Object.keys(documentsByType)
    })

  } catch (error: any) {
    console.error('Error fetching client documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Upload nowego dokumentu
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
    const documentType = formData.get('document_type') as string
    const quoteId = formData.get('quote_id') as string
    const description = formData.get('description') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      )
    }

    // Walidacja typu dokumentu
    const validTypes = ['contract', 'warranty', 'invoice', 'protocol', 'quote_pdf']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Sprawdź rozmiar pliku (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Sprawdź typ MIME
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, images, Word documents' },
        { status: 400 }
      )
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${documentType}_${timestamp}.${fileExtension}`

    // W rzeczywistej aplikacji tutaj zapisz plik do storage (AWS S3, etc.)
    // Na razie symulujemy zapis
    const filePath = `/uploads/client-documents/${user.id}/${fileName}`

    // Zapisz informacje o dokumencie w bazie danych
    const documentData: ClientDocumentInsert = {
      client_id: user.id,
      quote_id: quoteId || null,
      document_type: documentType as any,
      file_name: fileName,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    }

    const insertResult = await dbHelper.helpers.insert<ClientDocument>(
      'client_documents',
      documentData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to save document information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: insertResult.data,
      file_path: filePath,
      file_name: fileName
    })

  } catch (error: any) {
    console.error('Error uploading client document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj dokument
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
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy dokument należy do użytkownika
    const existingDocResult = await dbHelper.helpers.selectWithPagination<ClientDocument>(
      'client_documents',
      [
        { column: 'id', operator: 'eq', value: id },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!existingDocResult.success || !existingDocResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      )
    }

    // Aktualizuj dokument
    const updateResult = await dbHelper.helpers.update<ClientDocument>(
      'client_documents',
      updateData,
      [{ column: 'id', operator: 'eq', value: id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      data: updateResult.data
    })

  } catch (error: any) {
    console.error('Error updating client document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń dokument
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
    const documentId = url.searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy dokument należy do użytkownika
    const existingDocResult = await dbHelper.helpers.selectWithPagination<ClientDocument>(
      'client_documents',
      [
        { column: 'id', operator: 'eq', value: documentId },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!existingDocResult.success || !existingDocResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      )
    }

    // Usuń dokument
    const deleteResult = await dbHelper.helpers.delete(
      'client_documents',
      [{ column: 'id', operator: 'eq', value: documentId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting client document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
