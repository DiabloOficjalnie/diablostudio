import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

interface Notification {
  id?: string
  type: 'consultation' | 'order' | 'system' | 'warning' | 'error' | 'success' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  source: string
  action_url?: string
  metadata?: any
}

// GET - Retrieve notifications with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, check if notifications exist in database
    const { data: existingNotifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    let notifications = existingNotifications || []

    // If no notifications exist, return empty array - no mock data
    if (notifications.length === 0) {
      return NextResponse.json({
        notifications: [],
        settings: {
          email: {
            newConsultations: true,
            newOrders: true,
            systemAlerts: true,
            weeklyReports: false
          },
          push: {
            enabled: true,
            newConsultations: true,
            newOrders: true,
            systemAlerts: true,
            soundEnabled: true
          },
          realTime: {
            enabled: true,
            showDesktopNotifications: true,
            autoRefresh: true,
            refreshInterval: 30
          }
        },
        stats: {
          total: 0,
          unread: 0,
          byType: {
            consultation: 0,
            order: 0,
            system: 0,
            warning: 0,
            error: 0,
            success: 0,
            info: 0
          },
          byPriority: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          }
        },
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      })
    }

    // Transform database format back to API format
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
      read: notification.read,
      priority: notification.priority,
      source: notification.source,
      action_url: notification.action_url || undefined,
      metadata: notification.metadata || undefined
    }))

    // Apply filters if specified
    let filteredNotifications = transformedNotifications

    if (status !== 'all') {
      if (status === 'unread') {
        filteredNotifications = filteredNotifications.filter((n: Notification) => !n.read)
      } else if (status === 'read') {
        filteredNotifications = filteredNotifications.filter((n: Notification) => n.read)
      }
    }

    if (type !== 'all') {
      filteredNotifications = filteredNotifications.filter((n: Notification) => n.type === type)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)

    // Calculate stats from real data
    const stats = {
      total: transformedNotifications.length,
      unread: transformedNotifications.filter((n: Notification) => !n.read).length,
      byType: {
        consultation: transformedNotifications.filter((n: Notification) => n.type === 'consultation').length,
        order: transformedNotifications.filter((n: Notification) => n.type === 'order').length,
        system: transformedNotifications.filter((n: Notification) => n.type === 'system').length,
        warning: transformedNotifications.filter((n: Notification) => n.type === 'warning').length,
        error: transformedNotifications.filter((n: Notification) => n.type === 'error').length,
        success: transformedNotifications.filter((n: Notification) => n.type === 'success').length,
        info: transformedNotifications.filter((n: Notification) => n.type === 'info').length
      },
      byPriority: {
        critical: transformedNotifications.filter((n: Notification) => n.priority === 'critical').length,
        high: transformedNotifications.filter((n: Notification) => n.priority === 'high').length,
        medium: transformedNotifications.filter((n: Notification) => n.priority === 'medium').length,
        low: transformedNotifications.filter((n: Notification) => n.priority === 'low').length
      }
    }

    // Return specific data type if requested
    if (type !== 'all' || status !== 'all') {
      return NextResponse.json({
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: filteredNotifications.length,
          pages: Math.ceil(filteredNotifications.length / limit)
        },
        stats
      })
    }

    return NextResponse.json({
      notifications: paginatedNotifications,
      settings: {
        email: {
          newConsultations: true,
          newOrders: true,
          systemAlerts: true,
          weeklyReports: false
        },
        push: {
          enabled: true,
          newConsultations: true,
          newOrders: true,
          systemAlerts: true,
          soundEnabled: true
        },
        realTime: {
          enabled: true,
          showDesktopNotifications: true,
          autoRefresh: true,
          refreshInterval: 30
        }
      },
      stats,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        pages: Math.ceil(filteredNotifications.length / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const notificationData = await request.json()

    // Validate notification data
    if (!notificationData.title || !notificationData.message || !notificationData.type) {
      return NextResponse.json(
        { error: 'Missing required notification data' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would create notification in your database
    const newNotification = {
      id: Date.now().toString(),
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      timestamp: new Date().toISOString(),
      read: false,
      priority: notificationData.priority || 'medium',
      source: notificationData.source || 'system',
      action_url: notificationData.action_url,
      metadata: notificationData.metadata || {}
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification: newNotification
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT - Update notification (mark as read, update settings)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'mark-read' && updateData.id) {
      // Mark specific notification as read
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        notificationId: updateData.id
      })
    }

    if (action === 'mark-all-read') {
      // Mark all notifications as read
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    }

    if (action === 'settings' && updateData.settings) {
      // Update notification settings
      return NextResponse.json({
        success: true,
        message: 'Notification settings updated',
        settings: updateData.settings
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would delete notification from your database
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
