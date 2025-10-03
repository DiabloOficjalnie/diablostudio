'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'

interface APIConfig {
  general: {
    baseUrl: string
    version: string
    environment: 'development' | 'staging' | 'production'
    rateLimiting: {
      enabled: boolean
      requestsPerMinute: number
      requestsPerHour: number
      requestsPerDay: number
    }
    cors: {
      enabled: boolean
      allowedOrigins: string[]
      allowedMethods: string[]
      allowedHeaders: string[]
    }
  }
  security: {
    apiKeyRequired: boolean
    jwtEnabled: boolean
    encryptionEnabled: boolean
    ipWhitelist: string[]
    ipBlacklist: string[]
    requestLogging: boolean
    auditLogging: boolean
  }
  endpoints: {
    clients: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    consultations: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    analytics: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    colors: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    faq: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    reviews: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    realizations: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
  }
  monitoring: {
    healthCheckEnabled: boolean
    metricsEnabled: boolean
    alertingEnabled: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    retentionDays: number
  }
}

export default function APIConfigPage() {
  const [config, setConfig] = useState<APIConfig>({
    general: {
      baseUrl: 'https://api.diablostudio.pl',
      version: 'v1',
      environment: 'production',
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 1000,
        requestsPerHour: 50000,
        requestsPerDay: 500000
      },
      cors: {
        enabled: true,
        allowedOrigins: ['https://diablostudio.pl', 'http://localhost:3000'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
      }
    },
    security: {
      apiKeyRequired: true,
      jwtEnabled: false,
      encryptionEnabled: true,
      ipWhitelist: [],
      ipBlacklist: [],
      requestLogging: true,
      auditLogging: true
    },
    endpoints: {
      clients: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: true
      },
      consultations: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: true
      },
      analytics: {
        enabled: true,
        methods: ['GET'],
        requiresAuth: true
      },
      colors: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: false
      },
      faq: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: true
      },
      reviews: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: true
      },
      realizations: {
        enabled: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        requiresAuth: true
      }
    },
    monitoring: {
      healthCheckEnabled: true,
      metricsEnabled: true,
      alertingEnabled: false,
      logLevel: 'info',
      retentionDays: 30
    }
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'endpoints' | 'monitoring'>('general')
  const router = useRouter()

  const saveConfig = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/integrations/api-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage('✅ Konfiguracja API została zapisana!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Błąd podczas zapisywania konfiguracji!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving API config:', error)
      setMessage('❌ Błąd podczas zapisywania konfiguracji!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/integrations/api-config')

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        console.error('Error loading API config:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading API config:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadConfig()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Konfiguracja API</h1>
              <p className="text-gray-600">Zarządzaj ustawieniami API, bezpieczeństwem i dostępnymi endpointami</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/integrations')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Integracje
              </button>
              <button
                onClick={saveConfig}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading ? '💾 Zapisywanie...' : '💾 Zapisz konfigurację'}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Configuration Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', label: 'Ogólne', icon: '🌐' },
                { id: 'security', label: 'Bezpieczeństwo', icon: '🔒' },
                { id: 'endpoints', label: 'Endpointy', icon: '🔗' },
                { id: 'monitoring', label: 'Monitorowanie', icon: '📊' }
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
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">🌐</span>
                      Podstawowe ustawienia
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bazowy URL API
                        </label>
                        <input
                          type="url"
                          value={config.general.baseUrl}
                          onChange={(e) => setConfig({
                            ...config,
                            general: { ...config.general, baseUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="https://api.diablostudio.pl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wersja API
                        </label>
                        <input
                          type="text"
                          value={config.general.version}
                          onChange={(e) => setConfig({
                            ...config,
                            general: { ...config.general, version: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="v1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Środowisko
                        </label>
                        <select
                          value={config.general.environment}
                          onChange={(e) => setConfig({
                            ...config,
                            general: { ...config.general, environment: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="development">Development</option>
                          <option value="staging">Staging</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Rate Limiting */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">⏱️</span>
                      Ograniczanie żądań
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="rateLimitingEnabled"
                          checked={config.general.rateLimiting.enabled}
                          onChange={(e) => setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              rateLimiting: { ...config.general.rateLimiting, enabled: e.target.checked }
                            }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="rateLimitingEnabled" className="text-sm font-medium text-gray-700">
                          Włącz ograniczanie żądań
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Na minutę
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={config.general.rateLimiting.requestsPerMinute}
                            onChange={(e) => setConfig({
                              ...config,
                              general: {
                                ...config.general,
                                rateLimiting: { ...config.general.rateLimiting, requestsPerMinute: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Na godzinę
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={config.general.rateLimiting.requestsPerHour}
                            onChange={(e) => setConfig({
                              ...config,
                              general: {
                                ...config.general,
                                rateLimiting: { ...config.general.rateLimiting, requestsPerHour: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Na dzień
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={config.general.rateLimiting.requestsPerDay}
                            onChange={(e) => setConfig({
                              ...config,
                              general: {
                                ...config.general,
                                rateLimiting: { ...config.general.rateLimiting, requestsPerDay: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CORS Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">🌍</span>
                    Ustawienia CORS
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="corsEnabled"
                        checked={config.general.cors.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          general: {
                            ...config.general,
                            cors: { ...config.general.cors, enabled: e.target.checked }
                          }
                        })}
                        className="mr-3"
                      />
                      <label htmlFor="corsEnabled" className="text-sm font-medium text-gray-700">
                        Włącz CORS
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dozwolone źródła
                        </label>
                        <textarea
                          value={config.general.cors.allowedOrigins.join('\n')}
                          onChange={(e) => setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              cors: { ...config.general.cors, allowedOrigins: e.target.value.split('\n').filter(Boolean) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={3}
                          placeholder="https://diablostudio.pl&#10;http://localhost:3000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dozwolone metody
                        </label>
                        <input
                          type="text"
                          value={config.general.cors.allowedMethods.join(', ')}
                          onChange={(e) => setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              cors: { ...config.general.cors, allowedMethods: e.target.value.split(',').map(m => m.trim()).filter(Boolean) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="GET, POST, PUT, DELETE"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dozwolone nagłówki
                        </label>
                        <input
                          type="text"
                          value={config.general.cors.allowedHeaders.join(', ')}
                          onChange={(e) => setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              cors: { ...config.general.cors, allowedHeaders: e.target.value.split(',').map(h => h.trim()).filter(Boolean) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Content-Type, Authorization"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Authentication */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">🔐</span>
                      Uwierzytelnianie
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="apiKeyRequired"
                          checked={config.security.apiKeyRequired}
                          onChange={(e) => setConfig({
                            ...config,
                            security: { ...config.security, apiKeyRequired: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="apiKeyRequired" className="text-sm font-medium text-gray-700">
                          Wymagaj klucza API
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="jwtEnabled"
                          checked={config.security.jwtEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            security: { ...config.security, jwtEnabled: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="jwtEnabled" className="text-sm font-medium text-gray-700">
                          Włącz JWT
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="encryptionEnabled"
                          checked={config.security.encryptionEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            security: { ...config.security, encryptionEnabled: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="encryptionEnabled" className="text-sm font-medium text-gray-700">
                          Szyfrowanie danych
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">🚪</span>
                      Kontrola dostępu
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Biała lista IP
                        </label>
                        <textarea
                          value={config.security.ipWhitelist.join('\n')}
                          onChange={(e) => setConfig({
                            ...config,
                            security: { ...config.security, ipWhitelist: e.target.value.split('\n').filter(Boolean) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={3}
                          placeholder="192.168.1.1&#10;10.0.0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Czarna lista IP
                        </label>
                        <textarea
                          value={config.security.ipBlacklist.join('\n')}
                          onChange={(e) => setConfig({
                            ...config,
                            security: { ...config.security, ipBlacklist: e.target.value.split('\n').filter(Boolean) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={3}
                          placeholder="192.168.1.100&#10;10.0.0.100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logging */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">📋</span>
                    Logowanie
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requestLogging"
                        checked={config.security.requestLogging}
                        onChange={(e) => setConfig({
                          ...config,
                          security: { ...config.security, requestLogging: e.target.checked }
                        })}
                        className="mr-3"
                      />
                      <label htmlFor="requestLogging" className="text-sm font-medium text-gray-700">
                        Logowanie żądań
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auditLogging"
                        checked={config.security.auditLogging}
                        onChange={(e) => setConfig({
                          ...config,
                          security: { ...config.security, auditLogging: e.target.checked }
                        })}
                        className="mr-3"
                      />
                      <label htmlFor="auditLogging" className="text-sm font-medium text-gray-700">
                        Logowanie audytu
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Object.entries(config.endpoints).map(([key, endpoint]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 capitalize">
                          {key === 'clients' ? 'Klienci' :
                           key === 'consultations' ? 'Konsultacje' :
                           key === 'analytics' ? 'Analityka' :
                           key === 'colors' ? 'Kolory' :
                           key === 'faq' ? 'FAQ' :
                           key === 'reviews' ? 'Opinie' :
                           'Realizacje'}
                        </h3>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={endpoint.enabled}
                            onChange={(e) => setConfig({
                              ...config,
                              endpoints: {
                                ...config.endpoints,
                                [key]: { ...endpoint, enabled: e.target.checked }
                              }
                            })}
                            className="mr-2"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Włączony
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={endpoint.requiresAuth}
                            onChange={(e) => setConfig({
                              ...config,
                              endpoints: {
                                ...config.endpoints,
                                [key]: { ...endpoint, requiresAuth: e.target.checked }
                              }
                            })}
                            className="mr-3"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Wymaga autoryzacji
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dozwolone metody
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
                              <button
                                key={method}
                                onClick={() => {
                                  const methods = endpoint.methods.includes(method)
                                    ? endpoint.methods.filter(m => m !== method)
                                    : [...endpoint.methods, method]
                                  setConfig({
                                    ...config,
                                    endpoints: {
                                      ...config.endpoints,
                                      [key]: { ...endpoint, methods }
                                    }
                                  })
                                }}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  endpoint.methods.includes(method)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Health Check */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">💚</span>
                      Health Check
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="healthCheckEnabled"
                          checked={config.monitoring.healthCheckEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: { ...config.monitoring, healthCheckEnabled: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="healthCheckEnabled" className="text-sm font-medium text-gray-700">
                          Włącz health check endpoint
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="metricsEnabled"
                          checked={config.monitoring.metricsEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: { ...config.monitoring, metricsEnabled: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="metricsEnabled" className="text-sm font-medium text-gray-700">
                          Zbieraj metryki
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="alertingEnabled"
                          checked={config.monitoring.alertingEnabled}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: { ...config.monitoring, alertingEnabled: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="alertingEnabled" className="text-sm font-medium text-gray-700">
                          Włącz alerty
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Logging Settings */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">📊</span>
                      Ustawienia logowania
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Poziom logowania
                        </label>
                        <select
                          value={config.monitoring.logLevel}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: { ...config.monitoring, logLevel: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warn">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retencja logów (dni)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={config.monitoring.retentionDays}
                          onChange={(e) => setConfig({
                            ...config,
                            monitoring: { ...config.monitoring, retentionDays: parseInt(e.target.value) || 30 }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Podsumowanie konfiguracji</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-900 mb-2">
                {Object.values(config.endpoints).filter(e => e.enabled).length}
              </div>
              <div className="text-blue-700">Aktywnych endpointów</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-900 mb-2">
                {config.general.rateLimiting.enabled ? '✅' : '❌'}
              </div>
              <div className="text-green-700">Rate limiting</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-900 mb-2">
                {config.security.apiKeyRequired ? '🔒' : '🔓'}
              </div>
              <div className="text-purple-700">Autoryzacja</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-900 mb-2">
                {config.monitoring.healthCheckEnabled ? '💚' : '🤍'}
              </div>
              <div className="text-orange-700">Health check</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
