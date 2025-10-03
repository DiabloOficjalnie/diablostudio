'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'consultation' | 'order' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: string
  action_url?: string
  metadata?: {
    user_id?: string
    consultation_id?: string
    order_id?: string
    [key: string]: any
  }
}

interface NotificationSettings {
  email: {
    newConsultations: boolean
    newOrders: boolean
    systemAlerts: boolean
    weeklyReports: boolean
  }
  push: {
    enabled: boolean
    newConsultations: boolean
    newOrders: boolean
    systemAlerts: boolean
    soundEnabled: boolean
  }
  realTime: {
    enabled: boolean
    showDesktopNotifications: boolean
    autoRefresh: boolean
    refreshInterval: number
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error' | 'consultation' | 'order' | 'system'>('all')
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [realTimeConnected, setRealTimeConnected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
    loadNotificationSettings()
    initializeRealTimeConnection()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, activeTab, typeFilter])

  const loadNotifications = async () => {
    try {
      setLoading(true)

      // Load notifications from API
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        // Fallback to mock data
        setNotifications(getMockNotifications())
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications(getMockNotifications())
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationSettings = async () => {
    try {
      // Load notification settings
      const response = await fetch('/api/admin/notifications/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        setSettings(getMockNotificationSettings())
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
      setSettings(getMockNotificationSettings())
    }
  }

  const initializeRealTimeConnection = async () => {
    try {
      // Initialize WebSocket or SSE connection for real-time notifications
      // For now, simulate connection
      setTimeout(() => {
        setRealTimeConnected(true)
      }, 1000)
    } catch (error) {
      console.error('Error initializing real-time connection:', error)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by read status
    if (activeTab === 'unread') {
      filtered = filtered.filter(notification => !notification.read)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter)
    }

    setFilteredNotifications(filtered)
  }

  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      type: 'consultation',
      title: 'Nowa konsultacja',
      message: 'Klient Anna Kowalska umówiła konsultację na 25 października 2024',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      source: 'system',
      action_url: '/admin/consultations',
      metadata: {
        user_id: 'user_123',
        consultation_id: 'cons_456'
      }
    },
    {
      id: '2',
      type: 'order',
      title: 'Nowe zamówienie',
      message: 'Zamówienie #1234 zostało złożone przez klienta Jana Nowaka',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      source: 'system',
      action_url: '/admin/orders',
      metadata: {
        order_id: 'order_1234'
      }
    },
    {
      id: '3',
      type: 'system',
      title: 'Aktualizacja systemu',
      message: 'Dostępna nowa wersja systemu - v2.1.0 z poprawkami bezpieczeństwa',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      source: 'system'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Wysoka aktywność',
      message: 'Wykryto zwiększoną liczbę prób logowania w ciągu ostatniej godziny',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      source: 'security',
      action_url: '/admin/security'
    },
    {
      id: '5',
      type: 'success',
      title: 'Backup ukończony',
      message: 'Automatyczny backup systemu został pomyślnie ukończony',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      source: 'system'
    },
    {
      id: '6',
      type: 'info',
      title: 'Nowy klient',
      message: 'Zarejestrował się nowy klient: firma ABC Sp. z o.o.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      source: 'system',
      action_url: '/admin/clients'
    }
  ]

  const getMockNotificationSettings = (): NotificationSettings => ({
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
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '📞'
      case 'order': return '📦'
      case 'system': return '⚙️'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'order': return 'bg-green-100 text-green-800 border-green-200'
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Przed chwilą'
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h temu`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d temu`
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Update notification as read
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        )
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie powiadomień...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔔 Powiadomienia</h1>
              <p className="text-gray-600">Centrum powiadomień i ustawienia alertów systemu</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${realTimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {realTimeConnected ? 'Połączono' : 'Rozłączono'}
                </span>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ⚙️ Ustawienia
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nieprzeczytane</p>
                <p className="text-3xl font-bold text-gray-900">{unreadCount}</p>
                <p className="text-sm text-green-600 mt-1">Wymagają uwagi</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Konsultacje</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.filter(n => n.type === 'consultation').length}</p>
                <p className="text-sm text-green-600 mt-1">Nowe zgłoszenia</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zamówienia</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.filter(n => n.type === 'order').length}</p>
                <p className="text-sm text-green-600 mt-1">Nowe zamówienia</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerty systemu</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.filter(n => n.type === 'system' || n.type === 'warning' || n.type === 'error').length}</p>
                <p className="text-sm text-green-600 mt-1">Wymagają uwagi</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Tabs and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                  { id: 'all', label: 'Wszystkie' },
                  { id: 'unread', label: 'Nieprzeczytane' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'unread' && unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Wszystkie typy</option>
                <option value="consultation">Konsultacje</option>
                <option value="order">Zamówienia</option>
                <option value="system">System</option>
                <option value="warning">Ostrzeżenia</option>
                <option value="error">Błędy</option>
                <option value="success">Sukcesy</option>
                <option value="info">Informacje</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              )}
              <button
                onClick={loadNotifications}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900">
              Powiadomienia ({filteredNotifications.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Brak powiadomień</h3>
                <p className="text-gray-600">
                  {activeTab === 'unread'
                    ? 'Wszystkie powiadomienia zostały przeczytane'
                    : 'Brak powiadomień w systemie'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {notification.title}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                            {!notification.read && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Nowe
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-3">{notification.message}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(notification.timestamp)}</span>
                            <span>Priorytet: {notification.priority}</span>
                            <span>Źródło: {notification.source}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                            >
                              Oznacz jako przeczytane
                            </button>
                          )}

                          {notification.action_url && (
                            <button
                              onClick={() => router.push(notification.action_url!)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                              Zobacz
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Pokazano {filteredNotifications.length} powiadomień
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                    ← Poprzednia
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    Następna →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Status połączenia real-time</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${realTimeConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                <span className="text-2xl text-white">
                  {realTimeConnected ? '🔗' : '❌'}
                </span>
              </div>
              <h4 className="font-bold text-green-900 mb-2">
                {realTimeConnected ? 'Połączono' : 'Rozłączono'}
              </h4>
              <p className="text-sm text-green-700">
                {realTimeConnected
                  ? 'Otrzymujesz powiadomienia w czasie rzeczywistym'
                  : 'Brak połączenia z serwerem powiadomień'
                }
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">📡</span>
              </div>
              <h4 className="font-bold text-blue-900 mb-2">WebSocket</h4>
              <p className="text-sm text-blue-700">
                Połączenie przez WebSocket dla natychmiastowych powiadomień
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">🔄</span>
              </div>
              <h4 className="font-bold text-purple-900 mb-2">Auto-refresh</h4>
              <p className="text-sm text-purple-700">
                Automatyczne odświeżanie co 30 sekund
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
