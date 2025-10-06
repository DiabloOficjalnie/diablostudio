import { NextRequest, NextResponse } from 'next/server'
import { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env'
import { createClient } from '@/lib/supabase'

// GET - Retrieve integrations data (integrations, webhooks, API keys)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const dataType = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'

    // For now, return comprehensive mock data
    // In production, this would fetch from your integrations database
    const integrationsData = {
      integrations: [
        {
          id: '1',
          name: 'Google Analytics 4',
          description: 'Integracja z Google Analytics dla śledzenia ruchu i konwersji',
          category: 'analytics',
          status: 'connected',
          icon: '📊',
          color: 'green',
          lastSync: '2024-01-20T10:30:00Z',
          config: {
            apiKey: 'GA-XXXXXXXXX',
            settings: {
              trackingId: 'G-XXXXXXXXXX',
              enhancedEcommerce: true,
              customDimensions: ['user_role', 'consultation_type']
            }
          }
        },
        {
          id: '2',
          name: 'Slack',
          description: 'Powiadomienia Slack dla nowych konsultacji i zamówień',
          category: 'communication',
          status: 'connected',
          icon: '💬',
          color: 'purple',
          lastSync: '2024-01-20T10:25:00Z',
          config: {
            webhookUrl: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/...',
            settings: {
              channel: '#notifications',
              username: 'DiabloStudio Bot',
              events: ['consultation.created', 'order.created']
            }
          }
        },
        {
          id: '3',
          name: 'Stripe',
          description: 'Procesowanie płatności online',
          category: 'payment',
          status: 'disconnected',
          icon: '💳',
          color: 'gray',
          config: {
            apiKey: 'sk_test_...',
            settings: {
              currency: 'PLN',
              locale: 'pl'
            }
          }
        },
        {
          id: '4',
          name: 'Pipedrive CRM',
          description: 'Synchronizacja klientów i konsultacji z systemem CRM',
          category: 'crm',
          status: 'error',
          icon: '👥',
          color: 'red',
          lastSync: '2024-01-18T09:15:00Z',
          config: {
            apiKey: 'pipedrive_api_key',
            settings: {
              syncClients: true,
              syncConsultations: true,
              autoCreateDeals: true
            }
          }
        },
        {
          id: '5',
          name: 'Zapier',
          description: 'Automatyzacja workflow z ponad 2000 aplikacjami',
          category: 'automation',
          status: 'pending',
          icon: '⚡',
          color: 'yellow',
          config: {
            apiKey: 'zapier_webhook_url',
            settings: {
              triggers: ['new_consultation', 'client_created'],
              actions: ['send_email', 'create_task']
            }
          }
        }
      ],
      webhooks: [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://example.com/webhook-placeholder',
          events: ['consultation.created', 'consultation.updated', 'order.created'],
          status: 'active',
          lastTriggered: '2024-01-20T10:30:00Z',
          successCount: 45,
          errorCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        },
        {
          id: '2',
          name: 'CRM Integration',
          url: 'https://api.example-crm.com/webhooks/diablostudio',
          events: ['client.created', 'client.updated', 'consultation.completed'],
          status: 'active',
          lastTriggered: '2024-01-19T15:45:00Z',
          successCount: 23,
          errorCount: 0,
          createdAt: '2024-01-05T09:00:00Z',
          secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        },
        {
          id: '3',
          name: 'Analytics Webhook',
          url: 'https://analytics.example.com/webhook',
          events: ['page.view', 'form.submit', 'user.register'],
          status: 'error',
          lastTriggered: '2024-01-18T09:15:00Z',
          successCount: 12,
          errorCount: 5,
          createdAt: '2024-01-10T14:20:00Z',
          secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        }
      ],
      apiKeys: [
        {
          id: '1',
          name: 'Production API Key',
          key: 'ds_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          permissions: ['read:clients', 'write:consultations', 'read:analytics'],
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          lastUsed: '2024-01-20T10:30:00Z',
          usageCount: 15420,
          expiresAt: '2024-12-31T23:59:59Z'
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'ds_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          permissions: ['read:*', 'write:*'],
          status: 'active',
          createdAt: '2024-01-05T09:00:00Z',
          lastUsed: '2024-01-19T15:45:00Z',
          usageCount: 3240
        },
        {
          id: '3',
          name: 'Analytics Read Only',
          key: 'ds_analytics_ro_xxxxxxxxxxxxxxxxxxxx',
          permissions: ['read:analytics', 'read:reports'],
          status: 'expired',
          createdAt: '2024-01-10T14:20:00Z',
          lastUsed: '2024-01-15T16:30:00Z',
          usageCount: 890,
          expiresAt: '2024-01-20T00:00:00Z'
        }
      ],
      logs: [
        {
          id: '1',
          timestamp: '2024-01-20T10:30:00Z',
          type: 'webhook',
          event: 'consultation.created',
          status: 'success',
          responseTime: 245,
          details: 'Webhook delivered successfully to Slack'
        },
        {
          id: '2',
          timestamp: '2024-01-20T10:25:00Z',
          type: 'api',
          event: 'client.read',
          status: 'success',
          responseTime: 123,
          details: 'API request from external application'
        }
      ],
      stats: {
        totalIntegrations: 5,
        activeIntegrations: 2,
        totalWebhooks: 3,
        activeWebhooks: 2,
        totalApiKeys: 3,
        activeApiKeys: 2,
        totalApiCalls: 19550,
        webhookDeliveries: 80,
        averageResponseTime: 184
      }
    }

    // Apply status filter if specified
    if (status !== 'all') {
      integrationsData.integrations = integrationsData.integrations.filter(i => i.status === status)
      integrationsData.webhooks = integrationsData.webhooks.filter(w => w.status === status)
      integrationsData.apiKeys = integrationsData.apiKeys.filter(k => k.status === status)
    }

    // Return specific data type if requested
    if (dataType !== 'all') {
      switch (dataType) {
        case 'integrations':
          return NextResponse.json({
            integrations: integrationsData.integrations,
            total: integrationsData.integrations.length
          })
        case 'webhooks':
          return NextResponse.json({
            webhooks: integrationsData.webhooks,
            total: integrationsData.webhooks.length
          })
        case 'api':
          return NextResponse.json({
            apiKeys: integrationsData.apiKeys,
            total: integrationsData.apiKeys.length
          })
        case 'logs':
          return NextResponse.json({
            logs: integrationsData.logs,
            total: integrationsData.logs.length
          })
        case 'stats':
          return NextResponse.json(integrationsData.stats)
        default:
          return NextResponse.json(integrationsData[dataType as keyof typeof integrationsData])
      }
    }

    return NextResponse.json({
      integrations: integrationsData.integrations,
      webhooks: integrationsData.webhooks,
      apiKeys: integrationsData.apiKeys,
      logs: integrationsData.logs,
      stats: integrationsData.stats
    })

  } catch (error) {
    console.error('Error fetching integrations data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations data' },
      { status: 500 }
    )
  }
}

// POST - Create new integration, webhook, or API key
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const integrationData = await request.json()

    // Validate integration data
    if (!integrationData.type || !integrationData.name) {
      return NextResponse.json(
        { error: 'Missing required integration data' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would create integration in your database
    let newItem

    if (integrationData.type === 'webhook') {
      newItem = {
        id: Date.now().toString(),
        name: integrationData.name,
        url: integrationData.url,
        events: integrationData.events || [],
        status: 'active',
        successCount: 0,
        errorCount: 0,
        createdAt: new Date().toISOString(),
        secret: `whsec_${Math.random().toString(36).substring(2)}`
      }
    } else if (integrationData.type === 'api_key') {
      newItem = {
        id: Date.now().toString(),
        name: integrationData.name,
        key: `ds_${integrationData.environment}_${Math.random().toString(36).substring(2)}`,
        permissions: integrationData.permissions || ['read:*'],
        status: 'active',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        expiresAt: integrationData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    } else if (integrationData.type === 'integration') {
      newItem = {
        id: Date.now().toString(),
        name: integrationData.name,
        description: integrationData.description,
        category: integrationData.category,
        status: 'pending',
        icon: integrationData.icon || '🔗',
        color: integrationData.color || 'blue',
        config: integrationData.config || {}
      }
    }

    return NextResponse.json({
      success: true,
      message: `${integrationData.type} created successfully`,
      item: newItem
    })

  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}

// PUT - Update integration, webhook, or API key
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const updateData = await request.json()

    if (action === 'test-webhook' && updateData.webhookId) {
      // Test webhook
      return NextResponse.json({
        success: true,
        message: 'Webhook test completed',
        webhookId: updateData.webhookId,
        responseTime: Math.floor(Math.random() * 500) + 100,
        status: Math.random() > 0.1 ? 'success' : 'error'
      })
    }

    if (action === 'test-integration' && updateData.integrationId) {
      // Test integration
      return NextResponse.json({
        success: true,
        message: 'Integration test completed',
        integrationId: updateData.integrationId,
        status: Math.random() > 0.2 ? 'connected' : 'error'
      })
    }

    if (action === 'regenerate-key' && updateData.apiKeyId) {
      // Regenerate API key
      return NextResponse.json({
        success: true,
        message: 'API key regenerated',
        apiKeyId: updateData.apiKeyId,
        newKey: `ds_regenerated_${Math.random().toString(36).substring(2)}`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete integration, webhook, or API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would delete from your database
    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
