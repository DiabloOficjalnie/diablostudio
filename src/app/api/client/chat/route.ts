import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ClientChat,
  ClientChatInsert,
  ChatMessageFormData,
  ClientChatResponse
} from '@/lib/database-types'

// GET - Pobierz wiadomości czatu klienta
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
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Pobierz wiadomości czatu klienta
    const chatResult = await dbHelper.helpers.selectWithPagination<ClientChat>(
      'client_chat',
      [{ column: 'client_id', operator: 'eq', value: user.id }],
      { column: 'created_at', ascending: false },
      { page: 1, limit: limit }
    )

    if (!chatResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch chat messages' },
        { status: 500 }
      )
    }

    const messages = chatResult.data?.data || []

    // Pobierz informacje o opiekunie klienta jeśli istnieje
    let managerInfo = null
    const managerResult = await dbHelper.helpers.selectWithPagination(
      'client_managers',
      [
        { column: 'client_id', operator: 'eq', value: user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (managerResult.success && managerResult.data?.data?.length) {
      const manager = managerResult.data.data[0] as any

      // Pobierz informacje o adminie
      const adminResult = await dbHelper.helpers.selectWithPagination(
        'admin_users',
        [{ column: 'id', operator: 'eq', value: manager.admin_id }]
      )

      if (adminResult.success && adminResult.data?.data?.length) {
        const adminInfo = adminResult.data.data[0]
        managerInfo = {
          ...manager,
          admin_info: adminInfo
        }
      }
    }

    // Policz nieprzeczytane wiadomości
    const unreadCount = messages.filter(msg => !msg.is_read && msg.is_from_client === false).length

    // Oznacz wiadomości jako przeczytane
    const unreadMessages = messages.filter(msg => !msg.is_read && msg.is_from_client === false)
    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map(msg => msg.id)
      await dbHelper.helpers.update<ClientChat>(
        'client_chat',
        { is_read: true },
        [
          { column: 'id', operator: 'in', value: `(${unreadIds.join(',')})` },
          { column: 'client_id', operator: 'eq', value: user.id }
        ]
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages,
      unread_count: unreadCount,
      manager_info: managerInfo,
      total_count: messages.length
    })

  } catch (error: any) {
    console.error('Error fetching client chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Wyślij nową wiadomość w czacie
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
    const body: ChatMessageFormData = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Sprawdź czy klient ma przypisanego opiekuna
    const managerResult = await dbHelper.helpers.selectWithPagination(
      'client_managers',
      [
        { column: 'client_id', operator: 'eq', value: user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!managerResult.success || !managerResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'No assigned manager found. Please contact administration.' },
        { status: 400 }
      )
    }

    const manager = managerResult.data.data[0] as any

    // Utwórz wiadomość w czacie
    const chatData: ClientChatInsert = {
      client_id: user.id,
      admin_id: manager.admin_id,
      message: message.trim(),
      is_from_client: true,
      is_read: false
    }

    const insertResult = await dbHelper.helpers.insert<ClientChat>(
      'client_chat',
      chatData
    )

    if (!insertResult.success) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: insertResult.data
    })

  } catch (error: any) {
    console.error('Error sending chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Oznacz wiadomość jako przeczytaną
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
    const { message_id, is_read = true } = body

    if (!message_id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy wiadomość należy do użytkownika
    const messageResult = await dbHelper.helpers.selectWithPagination<ClientChat>(
      'client_chat',
      [
        { column: 'id', operator: 'eq', value: message_id },
        { column: 'client_id', operator: 'eq', value: user.id }
      ]
    )

    if (!messageResult.success || !messageResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      )
    }

    // Aktualizuj status przeczytania
    const updateResult = await dbHelper.helpers.update<ClientChat>(
      'client_chat',
      { is_read: is_read },
      [{ column: 'id', operator: 'eq', value: message_id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: updateResult.data
    })

  } catch (error: any) {
    console.error('Error updating chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Usuń wiadomość (tylko własne wiadomości)
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
    const messageId = url.searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy wiadomość należy do użytkownika i czy jest od niego
    const messageResult = await dbHelper.helpers.selectWithPagination<ClientChat>(
      'client_chat',
      [
        { column: 'id', operator: 'eq', value: messageId },
        { column: 'client_id', operator: 'eq', value: user.id },
        { column: 'is_from_client', operator: 'eq', value: true }
      ]
    )

    if (!messageResult.success || !messageResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Message not found or cannot be deleted' },
        { status: 404 }
      )
    }

    // Usuń wiadomość (tylko jeśli została wysłana mniej niż 5 minut temu)
    const message = messageResult.data.data[0]
    const messageTime = new Date(message.created_at)
    const now = new Date()
    const timeDiff = (now.getTime() - messageTime.getTime()) / (1000 * 60) // minutes

    if (timeDiff > 5) {
      return NextResponse.json(
        { error: 'Messages can only be deleted within 5 minutes of sending' },
        { status: 400 }
      )
    }

    const deleteResult = await dbHelper.helpers.delete(
      'client_chat',
      [{ column: 'id', operator: 'eq', value: messageId }]
    )

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
