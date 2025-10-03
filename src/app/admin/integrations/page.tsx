'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive' | 'error'
  lastTriggered?: string
  successCount: number
  errorCount: number
  createdAt: string
  secret: string
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  status: 'active' | 'expired' | 'revoked'
  createdAt: string
  lastUsed?: string
  usageCount: number
  expiresAt?: string
}

interface Integration {
  id: string
  name: string
  description: string
  category: 'crm' | 'analytics' | 'payment' | 'communication' | 'automation'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  icon: string
  color: string
  lastSync?: string
  config: {
    apiKey?: string
    webhookUrl?: string
    settings?: Record<string, any>
  }
}

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'api' | 'logs'>('integrations')
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadIntegrationsData()
  }, [])

  const loadIntegrationsData = async () => {
    try {
      setLoading(true)

      // Load all integration-related data
      const [webhooksData, apiKeysData, integrationsData] = await Promise.allSettled([
        loadWebhooks(),
        loadApiKeys(),
        loadIntegrations()
      ])

      if (webhooksData.status === 'fulfilled') {
        setWebhooks(webhooksData.value)
      }

      if (apiKeysData.status === 'fulfilled') {
        setApiKeys(apiKeysData.value)
      }

      if (integrationsData.status === 'fulfilled') {
        setIntegrations(integrationsData.value)
      }

    } catch (error) {
      console.error('Error loading integrations data:', error)
      // Fallback to mock data
      setWebhooks(getMockWebhooks())
      setApiKeys(getMockApiKeys())
      setIntegrations(getMockIntegrations())
    } finally {
      setLoading(false)
    }
  }

  const loadWebhooks = async () => {
    return new Promise<Webhook[]>(resolve => {
      setTimeout(() => {
        resolve(getMockWebhooks())
      }, 800)
    })
  }

  const loadApiKeys = async () => {
    return new Promise<APIKey[]>(resolve => {
      setTimeout(() => {
        resolve(getMockApiKeys())
      }, 600)
    })
  }

  const loadIntegrations = async () => {
    return new Promise<Integration[]>(resolve => {
      setTimeout(() => {
        resolve(getMockIntegrations())
      }, 1000)
    })
  }

  const getMockWebhooks = (): Webhook[] => [
    {
      id: '1',
      name: 'Slack Notifications',
      url: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || 'https://example.com/webhook-placeholder',
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
  ]

  const getMockApiKeys = (): APIKey[] => [
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
  ]

  const getMockIntegrations = (): Integration[] => [
    {
      id: '1',
      name: 'Wewnętrzna analityka',
      description: 'Wewnętrzny system analityczny dla śledzenia ruchu i konwersji',
      category: 'analytics',
      status: 'connected',
      icon: '📊',
      color: 'green',
      lastSync: '2024-01-20T10:30:00Z',
      config: {
        apiKey: 'internal_analytics',
        settings: {
          trackingEnabled: true,
          eventTracking: true,
          conversionTracking: true
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
        webhookUrl: 'https://hooks.slack.com/services/...',
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
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'revoked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Połączono'
      case 'disconnected': return 'Rozłączono'
      case 'error': return 'Błąd'
      case 'pending': return 'Oczekuje'
      case 'active': return 'Aktywny'
      case 'inactive': return 'Nieaktywny'
      case 'expired': return 'Wygasły'
      case 'revoked': return 'Wycofany'
      default: return status
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crm': return 'bg-blue-100 text-blue-800'
      case 'analytics': return 'bg-purple-100 text-purple-800'
      case 'payment': return 'bg-green-100 text-green-800'
      case 'communication': return 'bg-orange-100 text-orange-800'
      case 'automation': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'crm': return 'CRM'
      case 'analytics': return 'Analityka'
      case 'payment': return 'Płatności'
      case 'communication': return 'Komunikacja'
      case 'automation': return 'Automatyzacja'
      default: return category
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie integracji...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔗 Integracje</h1>
              <p className="text-gray-600">Zarządzaj integracjami, webhookami i API dla zewnętrznych aplikacji</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/integrations/api-config')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ⚙️ Konfiguracja API
              </button>
            </div>
          </div>
        </div>

        {/* Integration Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne integracje</p>
                <p className="text-3xl font-bold text-gray-900">{integrations.filter(i => i.status === 'connected').length}</p>
                <p className="text-sm text-green-600 mt-1">{integrations.length} łącznie</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne webhooki</p>
                <p className="text-3xl font-bold text-gray-900">{webhooks.filter(w => w.status === 'active').length}</p>
                <p className="text-sm text-green-600 mt-1">{webhooks.length} łącznie</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🪝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne klucze API</p>
                <p className="text-3xl font-bold text-gray-900">{apiKeys.filter(k => k.status === 'active').length}</p>
                <p className="text-sm text-green-600 mt-1">{apiKeys.length} łącznie</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wywołania API</p>
                <p className="text-3xl font-bold text-gray-900">{apiKeys.reduce((sum, key) => sum + key.usageCount, 0)}</p>
                <p className="text-sm text-green-600 mt-1">Ten miesiąc</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'integrations', label: 'Integracje', icon: '🔗' },
                { id: 'webhooks', label: 'Webhooki', icon: '🪝' },
                { id: 'api', label: 'API', icon: '🔑' },
                { id: 'logs', label: 'Logi', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Dostępne integracje</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                    ➕ Dodaj integrację
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          integration.color === 'green' ? 'bg-green-500' :
                          integration.color === 'purple' ? 'bg-purple-500' :
                          integration.color === 'gray' ? 'bg-gray-500' :
                          integration.color === 'red' ? 'bg-red-500' :
                          integration.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          <span className="text-white">{integration.icon}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                              {getStatusText(integration.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(integration.category)}`}>
                              {getCategoryText(integration.category)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                          <div className="space-y-2 mb-4">
                            {integration.lastSync && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Ostatnia synchronizacja:</span>
                                <span className="text-gray-900">{formatDate(integration.lastSync)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                                Konfiguruj
                              </button>
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                                Testuj
                              </button>
                            </div>
                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                              {integration.status === 'connected' ? 'Rozłącz' : 'Usuń'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Webhooki</h3>
                  <button
                    onClick={() => setShowWebhookModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowy webhook
                  </button>
                </div>

                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{webhook.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                              {getStatusText(webhook.status)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 font-mono bg-gray-100 p-2 rounded">
                            {webhook.url}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Sukces: {webhook.successCount}</span>
                            <span>Błędy: {webhook.errorCount}</span>
                            {webhook.lastTriggered && (
                              <span>Ostatnie wywołanie: {formatDate(webhook.lastTriggered)}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edytuj
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                            Testuj
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Klucze API</h3>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowy klucz API
                  </button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{apiKey.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                              {getStatusText(apiKey.status)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 font-mono bg-gray-100 p-2 rounded">
                            {apiKey.key}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Użycia: {apiKey.usageCount}</span>
                            {apiKey.lastUsed && (
                              <span>Ostatnie użycie: {formatDate(apiKey.lastUsed)}</span>
                            )}
                            {apiKey.expiresAt && (
                              <span>Wygasa: {formatDate(apiKey.expiresAt)}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {apiKey.permissions.map((permission) => (
                              <span key={permission} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edytuj
                          </button>
                          <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors">
                            Odnów
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Wycofaj
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Logi integracji</h3>

                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Logi integracji</h3>
                  <p className="text-gray-600 mb-6">
                    Szczegółowe logi wszystkich integracji, webhooków i wywołań API
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-white hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="font-bold text-blue-900">Filtry</div>
                        <div className="text-sm text-blue-700">Zaawansowane filtry</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-bold text-green-900">Raport</div>
                        <div className="text-sm text-green-700">Generuj raport</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="font-bold text-purple-900">Odśwież</div>
                        <div className="text-sm text-purple-700">Real-time logi</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📥</div>
                        <div className="font-bold text-orange-900">Eksport</div>
                        <div className="text-sm text-orange-700">Pobierz logi</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Documentation Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Dokumentacja API</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Endpoint główny</h4>
                <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                  GET https://api.diablostudio.pl/v1/
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Klienci</h4>
                <div className="space-y-2">
                  <div className="bg-gray-800 text-blue-400 p-2 rounded font-mono text-sm">
                    GET /clients
                  </div>
                  <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-sm">
                    POST /clients
                  </div>
                  <div className="bg-gray-800 text-yellow-400 p-2 rounded font-mono text-sm">
                    PUT /clients/&#123;id&#125;
                  </div>
                  <div className="bg-gray-800 text-red-400 p-2 rounded font-mono text-sm">
                    DELETE /clients/&#123;id&#125;
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-4">Autoryzacja</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Header:</span>
                    <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-sm mt-1">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Przykład:</span>
                    <div className="bg-gray-800 text-gray-300 p-2 rounded font-mono text-sm mt-1">
                      curl -H "Authorization: Bearer ds_prod_xxx" \<br />
                      &nbsp;&nbsp;https://api.diablostudio.pl/v1/clients
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-4">Rate Limiting</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Żądania/minutę:</span>
                    <span className="font-bold text-green-900">1000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Żądania/godzinę:</span>
                    <span className="font-bold text-green-900">50000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Żądania/dzień:</span>
                    <span className="font-bold text-green-900">500000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
              📚 Zobacz pełną dokumentację API
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
