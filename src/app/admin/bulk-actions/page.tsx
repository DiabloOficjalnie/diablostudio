'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface BulkAction {
  id: string
  name: string
  description: string
  category: 'clients' | 'consultations' | 'content' | 'notifications' | 'system'
  icon: string
  color: string
  available: boolean
  lastUsed?: string
  usageCount: number
}

interface BulkOperation {
  id: string
  type: string
  target: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalItems: number
  processedItems: number
  startedAt: string
  completedAt?: string
  results?: {
    success: number
    failed: number
    skipped: number
  }
  error?: string
}

export default function BulkActionsPage() {
  const [bulkActions, setBulkActions] = useState<BulkAction[]>([])
  const [operations, setOperations] = useState<BulkOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'actions' | 'operations' | 'templates'>('actions')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clients' | 'consultations' | 'content' | 'notifications' | 'system'>('all')
  const [showOperationModal, setShowOperationModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadBulkActions()
    loadOperations()
  }, [])

  const loadBulkActions = async () => {
    try {
      setLoading(true)

      // Load bulk actions from API
      const response = await fetch('/api/admin/bulk-actions')
      if (response.ok) {
        const data = await response.json()
        setBulkActions(data.actions || [])
      } else {
        // Fallback to mock data
        setBulkActions(getMockBulkActions())
      }
    } catch (error) {
      console.error('Error loading bulk actions:', error)
      setBulkActions(getMockBulkActions())
    } finally {
      setLoading(false)
    }
  }

  const loadOperations = async () => {
    try {
      // Load recent operations
      const response = await fetch('/api/admin/bulk-actions/operations')
      if (response.ok) {
        const data = await response.json()
        setOperations(data.operations || [])
      } else {
        setOperations(getMockOperations())
      }
    } catch (error) {
      console.error('Error loading operations:', error)
      setOperations(getMockOperations())
    }
  }

  const getMockBulkActions = (): BulkAction[] => [
    {
      id: '1',
      name: 'Masowa zmiana statusu klientów',
      description: 'Zmień status wielu klientów jednocześnie (aktywny/nieaktywny/VIP)',
      category: 'clients',
      icon: '👥',
      color: 'blue',
      available: true,
      lastUsed: '2024-01-20T10:30:00Z',
      usageCount: 15
    },
    {
      id: '2',
      name: 'Grupowe przypisywanie konsultacji',
      description: 'Przypisz wiele konsultacji do wybranego pracownika',
      category: 'consultations',
      icon: '📞',
      color: 'orange',
      available: true,
      lastUsed: '2024-01-19T15:45:00Z',
      usageCount: 8
    },
    {
      id: '3',
      name: 'Masowe wysyłanie newslettera',
      description: 'Wyślij newsletter do wybranych grup klientów',
      category: 'notifications',
      icon: '📧',
      color: 'green',
      available: true,
      lastUsed: '2024-01-18T09:15:00Z',
      usageCount: 23
    },
    {
      id: '4',
      name: 'Grupowa aktualizacja treści',
      description: 'Aktualizuj meta dane SEO dla wielu stron jednocześnie',
      category: 'content',
      icon: '📝',
      color: 'purple',
      available: true,
      lastUsed: '2024-01-17T14:20:00Z',
      usageCount: 12
    },
    {
      id: '5',
      name: 'Masowe usuwanie komentarzy',
      description: 'Usuń komentarze oznaczone jako spam',
      category: 'content',
      icon: '🗑️',
      color: 'red',
      available: true,
      lastUsed: '2024-01-16T11:30:00Z',
      usageCount: 5
    },
    {
      id: '6',
      name: 'Eksport danych klientów',
      description: 'Eksportuj dane klientów do pliku CSV/Excel',
      category: 'clients',
      icon: '📊',
      color: 'indigo',
      available: true,
      lastUsed: '2024-01-15T16:45:00Z',
      usageCount: 18
    },
    {
      id: '7',
      name: 'Grupowe resetowanie haseł',
      description: 'Resetuj hasła dla wielu użytkowników jednocześnie',
      category: 'system',
      icon: '🔐',
      color: 'yellow',
      available: true,
      lastUsed: '2024-01-14T13:20:00Z',
      usageCount: 3
    },
    {
      id: '8',
      name: 'Masowa zmiana uprawnień',
      description: 'Aktualizuj uprawnienia dla grupy użytkowników',
      category: 'system',
      icon: '⚙️',
      color: 'gray',
      available: true,
      lastUsed: '2024-01-13T10:10:00Z',
      usageCount: 7
    }
  ]

  const getMockOperations = (): BulkOperation[] => [
    {
      id: '1',
      type: 'status_update',
      target: 'clients',
      status: 'completed',
      progress: 100,
      totalItems: 45,
      processedItems: 45,
      startedAt: '2024-01-20T10:30:00Z',
      completedAt: '2024-01-20T10:32:00Z',
      results: {
        success: 43,
        failed: 2,
        skipped: 0
      }
    },
    {
      id: '2',
      type: 'email_send',
      target: 'newsletter',
      status: 'running',
      progress: 67,
      totalItems: 234,
      processedItems: 157,
      startedAt: '2024-01-19T15:45:00Z'
    },
    {
      id: '3',
      type: 'data_export',
      target: 'clients',
      status: 'failed',
      progress: 0,
      totalItems: 156,
      processedItems: 0,
      startedAt: '2024-01-18T09:15:00Z',
      error: 'Błąd połączenia z serwerem export'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clients': return 'bg-blue-100 text-blue-800'
      case 'consultations': return 'bg-orange-100 text-orange-800'
      case 'content': return 'bg-purple-100 text-purple-800'
      case 'notifications': return 'bg-green-100 text-green-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'clients': return 'Klienci'
      case 'consultations': return 'Konsultacje'
      case 'content': return 'Treści'
      case 'notifications': return 'Powiadomienia'
      case 'system': return 'System'
      default: return category
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ukończona'
      case 'running': return 'W trakcie'
      case 'pending': return 'Oczekująca'
      case 'failed': return 'Nieudana'
      default: return status
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

  const filteredActions = bulkActions.filter(action => {
    if (selectedCategory === 'all') return true
    return action.category === selectedCategory
  })

  const executeBulkAction = (action: BulkAction) => {
    setSelectedAction(action)
    setShowOperationModal(true)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie akcji masowych...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-indigo-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Akcje masowe</h1>
              <p className="text-gray-600">Wykonuj operacje na wielu elementach jednocześnie dla zwiększenia efektywności</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => {/* TODO: Create template */}}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                📋 Utwórz szablon
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dostępne akcje</p>
                <p className="text-3xl font-bold text-gray-900">{bulkActions.length}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie aktywne</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ukończone operacje</p>
                <p className="text-3xl font-bold text-gray-900">{operations.filter(op => op.status === 'completed').length}</p>
                <p className="text-sm text-green-600 mt-1">W tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">W trakcie</p>
                <p className="text-3xl font-bold text-gray-900">{operations.filter(op => op.status === 'running').length}</p>
                <p className="text-sm text-green-600 mt-1">Aktualnie przetwarzane</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nieudane</p>
                <p className="text-3xl font-bold text-gray-900">{operations.filter(op => op.status === 'failed').length}</p>
                <p className="text-sm text-green-600 mt-1">Wymagają uwagi</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'actions', label: 'Akcje', icon: '⚡' },
                { id: 'operations', label: 'Operacje', icon: '📋' },
                { id: 'templates', label: 'Szablony', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
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
            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">Filtruj kategorię:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Wszystkie kategorie</option>
                    <option value="clients">Klienci</option>
                    <option value="consultations">Konsultacje</option>
                    <option value="content">Treści</option>
                    <option value="notifications">Powiadomienia</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredActions.map((action) => (
                    <div key={action.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          action.color === 'blue' ? 'bg-blue-500' :
                          action.color === 'orange' ? 'bg-orange-500' :
                          action.color === 'green' ? 'bg-green-500' :
                          action.color === 'purple' ? 'bg-purple-500' :
                          action.color === 'red' ? 'bg-red-500' :
                          action.color === 'indigo' ? 'bg-indigo-500' :
                          action.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          <span className="text-white">{action.icon}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{action.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(action.category)}`}>
                              {getCategoryText(action.category)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{action.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Użyto: {action.usageCount} razy</span>
                              {action.lastUsed && (
                                <span>Ostatnio: {formatDate(action.lastUsed)}</span>
                              )}
                            </div>

                            <button
                              onClick={() => executeBulkAction(action)}
                              disabled={!action.available}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                                action.available
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {action.available ? 'Wykonaj' : 'Niedostępne'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Historia operacji</h3>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors">
                    Wyczyść historię
                  </button>
                </div>

                <div className="space-y-4">
                  {operations.map((operation) => (
                    <div key={operation.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            operation.status === 'completed' ? 'bg-green-500' :
                            operation.status === 'running' ? 'bg-blue-500' :
                            operation.status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            <span className="text-white text-sm">
                              {operation.status === 'completed' ? '✅' :
                               operation.status === 'running' ? '🔄' :
                               operation.status === 'failed' ? '❌' : '⏳'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {operation.type.replace('_', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-600">Cel: {operation.target}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                          {getStatusText(operation.status)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Postęp</span>
                          <span className="font-medium text-gray-900">
                            {operation.processedItems}/{operation.totalItems} ({operation.progress}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              operation.status === 'completed' ? 'bg-green-500' :
                              operation.status === 'running' ? 'bg-blue-500' :
                              operation.status === 'failed' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${operation.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Rozpoczęta:</span>
                          <p className="font-medium text-gray-900">{formatDate(operation.startedAt)}</p>
                        </div>
                        {operation.completedAt && (
                          <div>
                            <span className="text-gray-600">Ukończona:</span>
                            <p className="font-medium text-gray-900">{formatDate(operation.completedAt)}</p>
                          </div>
                        )}
                        {operation.results && (
                          <>
                            <div>
                              <span className="text-gray-600">Sukces:</span>
                              <p className="font-medium text-green-600">{operation.results.success}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Błędy:</span>
                              <p className="font-medium text-red-600">{operation.results.failed}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {operation.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">Błąd:</p>
                          <p className="text-sm text-red-700">{operation.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Szablony akcji masowych</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                    ➕ Nowy szablon
                  </button>
                </div>

                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak szablonów</h3>
                  <p className="text-gray-600 mb-6">
                    Utwórz szablony dla często wykonywanych akcji masowych
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                    ➕ Utwórz pierwszy szablon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Najczęściej używane</h3>
            <div className="space-y-3">
              {bulkActions
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 3)
                .map((action) => (
                  <div key={action.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-sm text-gray-700">{action.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{action.usageCount}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ostatnie operacje</h3>
            <div className="space-y-3">
              {operations.slice(0, 3).map((operation) => (
                <div key={operation.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{operation.type}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(operation.status)}`}>
                    {getStatusText(operation.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Efektywność</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Średni czas operacji</span>
                <span className="text-sm font-bold text-gray-900">2.3 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Skuteczność</span>
                <span className="text-sm font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Zaoszczędzony czas</span>
                <span className="text-sm font-bold text-blue-600">12h/miesiąc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
