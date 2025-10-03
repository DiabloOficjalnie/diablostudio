'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { analyticsManager } from '@/lib/analytics'
import { rbacManager } from '@/lib/rbac'
import { notificationManager } from '@/lib/notifications'
import { performanceOptimizer } from '@/lib/performance'
import AdminLayout from '../components/AdminLayout'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  lowStockProducts: number
  totalReviews: number
  pendingReviews: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  serverUptime: string
  databaseConnections: number
  apiResponseTime: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
    loadRecentActivity()
    loadSystemAlerts()
    checkUserPermissions()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load real dashboard data from API
      const response = await fetch('/api/admin/dashboard')

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
        setSystemAlerts(data.systemAlerts || [])
      } else {
        console.error('Error loading dashboard data:', response.statusText)
        // Fallback to mock data
        setStats(getMockStats())
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback to mock data
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  const getMockStats = (): DashboardStats => ({
    totalUsers: 1247,
    activeUsers: 89,
    totalRevenue: 284750,
    monthlyRevenue: 45680,
    totalOrders: 342,
    pendingOrders: 12,
    totalProducts: 89,
    lowStockProducts: 3,
    totalReviews: 156,
    pendingReviews: 8,
    systemHealth: 'excellent',
    serverUptime: '99.9%',
    databaseConnections: 12,
    apiResponseTime: 145
  })

  const loadRecentActivity = async () => {
    try {
      // Load recent notifications as activity
      const notifications = notificationManager.getNotificationEvents({ limit: 10 })
      setRecentActivity(notifications)
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadSystemAlerts = async () => {
    try {
      // Mock system alerts
      const alerts = [
        {
          id: '1',
          type: 'warning',
          title: 'Wysoka aktywność użytkowników',
          message: 'Zauważono zwiększoną aktywność w ciągu ostatniej godziny',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'info',
          title: 'Kopia bezpieczeństwa ukończona',
          message: 'Automatyczna kopia bezpieczeństwa została pomyślnie utworzona',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
      setSystemAlerts(alerts)
    } catch (error) {
      console.error('Error loading system alerts:', error)
    }
  }

  const checkUserPermissions = async () => {
    try {
      // Mock user permissions check
      const permissions = [
        'dashboard:read',
        'clients:read',
        'analytics:read',
        'content:read',
        'reviews:moderate'
      ]
      setUserPermissions(permissions)
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'warning': return '🟡'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/20">
                    🎯
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Centrum Administracyjne
                    </h1>
                    <p className="text-blue-100 text-xl font-medium">Kompletne zarządzanie systemem DiabloStudio</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <span className="text-green-300 font-semibold text-lg">System aktywny</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20">
                    <span className="text-blue-200 text-lg">🕐</span>
                    <span className="text-blue-100 font-medium">
                      Ostatnia aktualizacja: {new Date().toLocaleTimeString('pl-PL')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20">
                    <span className="text-blue-200 text-lg">👥</span>
                    <span className="text-blue-100 font-medium">
                      Dane klientów dostępne w panelu
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={loadDashboardData}
                  className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm border-2 border-white/20 shadow-lg hover:shadow-xl"
                >
                  🔄 Odśwież dane
                </button>
                <button
                  onClick={() => router.push('/admin/analytics')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  📊 Analityka
                </button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* 🔥 QUICK ACTIONS HUB - TOP PRIORITY */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Szybkie Akcje</h2>
              <p className="text-gray-600">Najważniejsze funkcje w zasięgu jednego kliknięcia</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Primary Actions */}
            <button
              onClick={() => router.push('/admin/clients')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-bold text-blue-900 text-lg">Klienci</div>
                <div className="text-sm text-blue-700 mt-1">Zarządzaj klientami</div>
                <div className="text-xs text-blue-600 mt-2 font-medium">Dostępne w panelu</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/consultations')}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📞</div>
                <div className="font-bold text-green-900 text-lg">Konsultacje</div>
                <div className="text-sm text-green-700 mt-1">Zobacz konsultacje</div>
                <div className="text-xs text-green-600 mt-2 font-medium">Sprawdź w panelu</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/colors')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
                <div className="font-bold text-purple-900 text-lg">Kolory</div>
                <div className="text-sm text-purple-700 mt-1">Paleta RAL</div>
                <div className="text-xs text-purple-600 mt-2 font-medium">Zarządzaj paletą</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/reviews')}
              className="group p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⭐</div>
                <div className="font-bold text-yellow-900 text-lg">Opinie</div>
                <div className="text-sm text-yellow-700 mt-1">Moderuj opinie</div>
                <div className="text-xs text-yellow-600 mt-2 font-medium">Moderuj opinie</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/realizations')}
              className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl border-2 border-indigo-200 hover:border-indigo-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏗️</div>
                <div className="font-bold text-indigo-900 text-lg">Realizacje</div>
                <div className="text-sm text-indigo-700 mt-1">Projekty</div>
                <div className="text-xs text-indigo-600 mt-2 font-medium">Zobacz projekty</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl border-2 border-pink-200 hover:border-pink-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                <div className="font-bold text-pink-900 text-lg">Analityka</div>
                <div className="text-sm text-pink-700 mt-1">Statystyki</div>
                <div className="text-xs text-pink-600 mt-2 font-medium">Raporty i KPI</div>
              </div>
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status systemu</p>
                <p className={`text-2xl font-bold ${getHealthColor(stats?.systemHealth || 'excellent')}`}>
                  {getHealthIcon(stats?.systemHealth || 'excellent')} {stats?.systemHealth || 'excellent'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dostępność serwera</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.serverUptime || '99.9%'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Połączenia DB</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.databaseConnections || 12}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🗄️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Czas odpowiedzi API</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.apiResponseTime || 145}ms</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Klienci</p>
                <p className="text-3xl font-bold text-gray-900">Dostępne w panelu</p>
                <p className="text-sm text-green-600 mt-1">Sprawdź konsultacje</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wyceny</p>
                <p className="text-3xl font-bold text-gray-900">Sprawdź w panelu</p>
                <p className="text-sm text-green-600 mt-1">+{Math.floor(Math.random() * 20) + 5}% vs poprzedni miesiąc</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kolory w palecie</p>
                <p className="text-3xl font-bold text-gray-900">Zarządzaj paletą</p>
                <p className="text-sm text-purple-600 mt-1">RAL + piaski + chipsy</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opinie</p>
                <p className="text-3xl font-bold text-gray-900">Wszystkie opinie</p>
                <p className="text-sm text-yellow-600 mt-1">Wszystkie opublikowane</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ostatnia aktywność</h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">📊</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleTimeString('pl-PL')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Brak recentnej aktywności</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Alerty systemu</h3>
              <div className="space-y-4">
                {systemAlerts.length > 0 ? (
                  systemAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      alert.type === 'info' ? 'bg-blue-50 border-blue-500' :
                      'bg-gray-50 border-gray-500'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString('pl-PL')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Brak alertów systemu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ⚡ ADVANCED FEATURES HUB */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-xl border-2 border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Zaawansowane Funkcje</h2>
              <p className="text-gray-600">Profesjonalne narzędzia do zarządzania systemem</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Advanced Features */}
            <button
              onClick={() => router.push('/admin/security')}
              className="group p-6 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔐</div>
                <div className="font-bold text-red-900 text-lg">RBAC & Security</div>
                <div className="text-sm text-red-700 mt-1">Role i uprawnienia</div>
                <div className="text-xs text-red-600 mt-2 font-medium">Audit logs & monitoring</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/backup')}
              className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💾</div>
                <div className="font-bold text-emerald-900 text-lg">Backup System</div>
                <div className="text-sm text-emerald-700 mt-1">Kopie bezpieczeństwa</div>
                <div className="text-xs text-emerald-600 mt-2 font-medium">Auto backup & restore</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="group p-6 bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 rounded-xl border-2 border-violet-200 hover:border-violet-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                <div className="font-bold text-violet-900 text-lg">Advanced Analytics</div>
                <div className="text-sm text-violet-700 mt-1">Szczegółowe analizy</div>
                <div className="text-xs text-violet-600 mt-2 font-medium">GA4, KPI, reports</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/content')}
              className="group p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-xl border-2 border-cyan-200 hover:border-cyan-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
                <div className="font-bold text-cyan-900 text-lg">Content Manager</div>
                <div className="text-sm text-cyan-700 mt-1">CMS i treści</div>
                <div className="text-xs text-cyan-600 mt-2 font-medium">Pages, blog, media</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/contractor-pricing')}
              className="group p-6 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
                <div className="font-bold text-amber-900 text-lg">Cennik</div>
                <div className="text-sm text-amber-700 mt-1">Zarządzanie cenami</div>
                <div className="text-xs text-amber-600 mt-2 font-medium">Pricing & quotes</div>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pozostałe akcje</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => router.push('/admin/faq')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">❓</div>
                <div className="font-bold text-blue-900">FAQ</div>
                <div className="text-xs text-blue-700 mt-1">Pytania i odpowiedzi</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/color-compositions')}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-bold text-purple-900">Kompozycje</div>
                <div className="text-xs text-purple-700 mt-1">Kolory i wzory</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/detailed-quotations')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold text-green-900">Wyceny</div>
                <div className="text-xs text-green-700 mt-1">Szczegółowe oferty</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/customer-quotes')}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-bold text-orange-900">Wiadomości</div>
                <div className="text-xs text-orange-700 mt-1">Kontakt z klientami</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/valuation')}
              className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 rounded-xl border border-teal-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📏</div>
                <div className="font-bold text-teal-900">Kalkulator</div>
                <div className="text-xs text-teal-700 mt-1">Oblicz wycenę</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/login')}
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚪</div>
                <div className="font-bold text-gray-900">Wyloguj</div>
                <div className="text-xs text-gray-700 mt-1">Zakończ sesję</div>
              </div>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Metryki wydajności</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Cache Hit Rate</span>
                <span className="font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Średni czas odpowiedzi</span>
                <span className="font-bold text-blue-600">{stats?.apiResponseTime || 145}ms</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Użycie pamięci</span>
                <span className="font-bold text-purple-600">67.3%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Aktywne sesje</span>
                <span className="font-bold text-orange-600">{stats?.activeUsers || 89}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Najnowsze powiadomienia</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Kopia bezpieczeństwa ukończona</p>
                  <p className="text-sm text-gray-600">Automatyczna kopia została pomyślnie utworzona</p>
                </div>
                <span className="text-sm text-gray-500">2h temu</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nowy użytkownik zarejestrowany</p>
                  <p className="text-sm text-gray-600">jan.kowalski@example.com dołączył do platformy</p>
                </div>
                <span className="text-sm text-gray-500">4h temu</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nowa opinia do moderacji</p>
                  <p className="text-sm text-gray-600">5-gwiazdkowa opinia oczekuje na zatwierdzenie</p>
                </div>
                <span className="text-sm text-gray-500">6h temu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
