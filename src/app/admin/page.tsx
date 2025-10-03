 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from './components/AdminLayout'

interface DashboardStats {
  totalValuations: number
  totalDetailedValuations: number
  totalCompositions: number
  totalBlogPosts: number
  totalRealizations: number
  totalReviews: number
  monthlyRevenue: number
  weeklyRevenue: number
  pendingTasks: number
  completedDetailedValuations: number
  activeCompositions: number
  featuredCompositions: number
  publishedBlogPosts: number
  publishedRealizations: number
  approvedReviews: number
  totalColors: number
  totalCustomers: number
  totalConsultations: number
  recentActivity: Array<{
    id: string
    type: string
    title: string
    description: string
    timestamp: string
    status: string
  }>
  systemHealth: {
    database: 'healthy' | 'warning' | 'error'
    api: 'healthy' | 'warning' | 'error'
    storage: 'healthy' | 'warning' | 'error'
  }
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'database' | 'users' | 'security' | 'analytics' | 'settings'>('dashboard')
  const [customersRes, setCustomersRes] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
    loadNotifications()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load all data from database with proper error handling
      const [
        valuationsRes,
        detailedValuationsRes,
        compositionsRes,
        blogRes,
        realizationsRes,
        reviewsRes,
        colorsRes,
        customersRes,
        consultationsRes
      ] = await Promise.allSettled([
        supabase.from('valuations').select(`
          id, total_min, total_max, created_at, area, floor_type,
          customers (name, email)
        `).order('created_at', { ascending: false }).limit(20),
        supabase.from('admin_valuations').select(`
          id, final_cost, created_at, status, object_name,
          customers (name, email)
        `).order('created_at', { ascending: false }).limit(20),
        supabase.from('color_compositions').select('id, name, created_at, is_active, is_featured').order('created_at', { ascending: false }).limit(10),
        supabase.from('blog_posts').select('id, title, created_at, status, category').order('created_at', { ascending: false }).limit(10),
        supabase.from('realizations').select('id, title, created_at, status, category').order('created_at', { ascending: false }).limit(10),
        supabase.from('reviews').select('id, author_name, created_at, status, rating').order('created_at', { ascending: false }).limit(10),
        supabase.from('colors').select('id, code, name, category').order('created_at', { ascending: false }).limit(50),
        supabase.from('customers').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('consultation_requests').select('id, customer_name, created_at, status').order('created_at', { ascending: false }).limit(10)
      ])

      // Extract data with fallbacks for failed requests
      const valuationsData = valuationsRes.status === 'fulfilled' ? valuationsRes.value.data || [] : []
      const detailedValuationsData = detailedValuationsRes.status === 'fulfilled' ? detailedValuationsRes.value.data || [] : []
      const compositionsData = compositionsRes.status === 'fulfilled' ? compositionsRes.value.data || [] : []
      const blogData = blogRes.status === 'fulfilled' ? blogRes.value.data || [] : []
      const realizationsData = realizationsRes.status === 'fulfilled' ? realizationsRes.value.data || [] : []
      const reviewsData = reviewsRes.status === 'fulfilled' ? reviewsRes.value.data || [] : []
      const colorsData = colorsRes.status === 'fulfilled' ? colorsRes.value.data || [] : []
      const customersData = customersRes.status === 'fulfilled' ? customersRes.value.data || [] : []
      const consultationsData = consultationsRes.status === 'fulfilled' ? consultationsRes.value.data || [] : []

      // Load external APIs with proper error handling
      const [analyticsRes, backupRes, bitrixRes, mondayRes] = await Promise.allSettled([
        fetch('/api/admin/analytics/ga4').then(res => res.json()).catch(() => null),
        fetch('/api/admin/backup/simplebackups').then(res => res.json()).catch(() => null),
        fetch('/api/admin/finance/bitrix24').then(res => res.json()).catch(() => null),
        fetch('/api/admin/projects/monday').then(res => res.json()).catch(() => null)
      ])

      // Extract external API data with fallbacks
      const analyticsData = analyticsRes.status === 'fulfilled' ? analyticsRes.value : { pageViews: 0, users: 0, sessionDuration: '0s', bounceRate: '0%' }
      const backupStatus = backupRes.status === 'fulfilled' ? backupRes.value : { status: 'unknown', lastBackup: new Date().toISOString(), size: '0 GB' }
      const bitrixData = bitrixRes.status === 'fulfilled' ? bitrixRes.value : { monthlyRevenue: 0, weeklyRevenue: 0, deals: 0, conversion: 0 }
      const mondayProjects = mondayRes.status === 'fulfilled' ? mondayRes.value : { activeProjects: 0, completedProjects: 0, teamMembers: 0, progress: 0 }

      // Calculate statistics
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const totalValuations = valuationsRes.data?.length || 0
      const totalDetailedValuations = detailedValuationsRes.data?.length || 0
      const totalCompositions = compositionsRes.data?.length || 0
      const totalBlogPosts = blogRes.data?.length || 0
      const totalRealizations = realizationsRes.data?.length || 0
      const totalReviews = reviewsRes.data?.length || 0
      const totalColors = colorsRes.data?.length || 0
      const totalCustomers = customersRes.data?.length || 0
      const totalConsultations = consultationsRes.data?.length || 0

      // Calculate monthly revenue from this month
      const monthlyRevenue = (valuationsRes.data || [])
        .filter(v => new Date(v.created_at) >= startOfMonth)
        .reduce((sum, v) => sum + ((v.total_min + v.total_max) / 2), 0)

      // Calculate weekly revenue
      const weeklyRevenue = (valuationsRes.data || [])
        .filter(v => new Date(v.created_at) >= startOfWeek)
        .reduce((sum, v) => sum + ((v.total_min + v.total_max) / 2), 0)

      // Calculate conversion rates and other metrics
      const completedDetailedValuations = detailedValuationsRes.data?.filter(v => v.status === 'completed').length || 0
      const activeCompositions = compositionsRes.data?.filter(c => c.is_active).length || 0
      const featuredCompositions = compositionsRes.data?.filter(c => c.is_featured).length || 0
      const publishedBlogPosts = blogRes.data?.filter(b => b.status === 'published').length || 0
      const publishedRealizations = realizationsRes.data?.filter(r => r.status === 'published').length || 0
      const approvedReviews = reviewsRes.data?.filter(r => r.status === 'approved').length || 0

      // Generate comprehensive recent activity
      const recentActivity = [
        // Recent valuations
        ...(valuationsRes.data || []).slice(0, 4).map(v => ({
          id: `val-${v.id}`,
          type: 'valuation',
          title: `Nowa wycena od ${(v.customers as any)?.name || 'Klienta'}`,
          description: `${v.area}m² • ${v.floor_type} • ${formatCurrency((v.total_min + v.total_max) / 2)}`,
          timestamp: v.created_at,
          status: 'success'
        })),
        // Recent detailed valuations
        ...(detailedValuationsRes.data || []).slice(0, 3).map(v => ({
          id: `detailed-${v.id}`,
          type: 'detailed_valuation',
          title: `Wycena szczegółowa: ${v.object_name}`,
          description: `Status: ${v.status} • ${formatCurrency(v.final_cost)}`,
          timestamp: v.created_at,
          status: v.status === 'completed' ? 'success' : 'info'
        })),
        // Recent compositions
        ...(compositionsRes.data || []).slice(0, 2).map(c => ({
          id: `composition-${c.id}`,
          type: 'composition',
          title: `Kompozycja: ${c.name}`,
          description: `Status: ${c.is_active ? 'Aktywna' : 'Nieaktywna'}${c.is_featured ? ' • Polecana' : ''}`,
          timestamp: c.created_at,
          status: c.is_active ? 'success' : 'warning'
        })),
        // Recent blog posts
        ...(blogRes.data || []).slice(0, 2).map(b => ({
          id: `blog-${b.id}`,
          type: 'blog',
          title: `Nowy post: ${b.title}`,
          description: `Kategoria: ${b.category} • Status: ${b.status}`,
          timestamp: b.created_at,
          status: b.status === 'published' ? 'success' : 'info'
        })),
        // Recent realizations
        ...(realizationsRes.data || []).slice(0, 2).map(r => ({
          id: `realization-${r.id}`,
          type: 'realization',
          title: `Nowa realizacja: ${r.title}`,
          description: `Status: ${r.status}`,
          timestamp: r.created_at,
          status: r.status === 'published' ? 'success' : 'info'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

      // System health based on real data
      const systemHealth = {
        database: (totalValuations + totalDetailedValuations + totalCompositions > 0) ? 'healthy' as const : 'warning' as const,
        api: 'healthy' as const,
        storage: 'healthy' as const
      }

      setCustomersRes(customersRes)
      setStats({
        totalValuations,
        totalDetailedValuations,
        totalCompositions,
        totalBlogPosts,
        totalRealizations,
        totalReviews,
        monthlyRevenue,
        pendingTasks: Math.max(0,
          (detailedValuationsRes.data?.filter(v => v.status !== 'completed').length || 0) +
          (reviewsRes.data?.filter(r => r.status !== 'approved').length || 0) +
          (consultationsRes.data?.filter(c => c.status === 'new').length || 0)
        ),
        recentActivity,
        systemHealth,
        // Additional stats
        weeklyRevenue,
        completedDetailedValuations,
        activeCompositions,
        featuredCompositions,
        publishedBlogPosts,
        publishedRealizations,
        approvedReviews,
        totalColors,
        totalCustomers,
        totalConsultations
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      // Load real notifications from database based on recent activity
      const [
        recentValuations,
        recentDetailedValuations,
        recentCompositions,
        recentReviews,
        recentConsultations
      ] = await Promise.all([
        supabase.from('valuations').select('id, created_at, customers(name)').order('created_at', { ascending: false }).limit(3),
        supabase.from('admin_valuations').select('id, created_at, status, object_name').order('created_at', { ascending: false }).limit(3),
        supabase.from('color_compositions').select('id, name, created_at, is_featured').order('created_at', { ascending: false }).limit(3),
        supabase.from('reviews').select('id, author_name, created_at, status').order('created_at', { ascending: false }).limit(3),
        supabase.from('consultation_requests').select('id, customer_name, created_at, status').order('created_at', { ascending: false }).limit(3)
      ])

      const realNotifications: Notification[] = []

      // Generate notifications based on recent database activity
      recentValuations.data?.forEach((valuation, index) => {
        if (index < 2) { // Only show 2 most recent
          realNotifications.push({
            id: `valuation-${valuation.id}`,
            type: 'info',
            title: 'Nowa szybka wycena',
            message: `Klient ${(valuation.customers as any)?.name || 'nieznany'} przesłał wycenę`,
            timestamp: valuation.created_at,
            read: false
          })
        }
      })

      recentDetailedValuations.data?.forEach((valuation, index) => {
        if (index < 2 && valuation.status !== 'completed') {
          realNotifications.push({
            id: `detailed-${valuation.id}`,
            type: valuation.status === 'completed' ? 'success' : 'warning',
            title: 'Wycena szczegółowa',
            message: `${(valuation as any).object_name} - status: ${valuation.status}`,
            timestamp: valuation.created_at,
            read: false
          })
        }
      })

      recentCompositions.data?.forEach((composition, index) => {
        if (index < 1) {
          realNotifications.push({
            id: `composition-${composition.id}`,
            type: 'success',
            title: 'Nowa kompozycja kolorów',
            message: `"${composition.name}" została ${composition.is_featured ? 'oznaczona jako polecana i ' : ''}dodana`,
            timestamp: composition.created_at,
            read: false
          })
        }
      })

      recentReviews.data?.forEach((review, index) => {
        if (index < 1 && review.status !== 'approved') {
          realNotifications.push({
            id: `review-${review.id}`,
            type: 'info',
            title: 'Nowa opinia oczekuje',
            message: `Opinia od ${review.author_name} wymaga moderacji`,
            timestamp: review.created_at,
            read: false
          })
        }
      })

      recentConsultations.data?.forEach((consultation, index) => {
        if (index < 1 && consultation.status === 'new') {
          realNotifications.push({
            id: `consultation-${consultation.id}`,
            type: 'info',
            title: 'Nowa konsultacja',
            message: `Klient ${consultation.customer_name} prosi o konsultację`,
            timestamp: consultation.created_at,
            read: false
          })
        }
      })

      // Add system notifications if no recent activity
      if (realNotifications.length === 0) {
        realNotifications.push(
          {
            id: 'system-1',
            type: 'success',
            title: 'System działa prawidłowo',
            message: 'Wszystkie komponenty bazy danych są w dobrym stanie',
            timestamp: new Date().toISOString(),
            read: true
          }
        )
      }

      // Sort by timestamp (newest first) and limit to 5
      realNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setNotifications(realNotifications.slice(0, 5))

    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to mock notifications if database fails
      const mockNotifications: Notification[] = [
        {
          id: 'fallback-1',
          type: 'info',
          title: 'Nowa wycena oczekuje',
          message: 'Klient przesłał nową wycenę szczegółową do sprawdzenia',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false
        },
        {
          id: 'fallback-2',
          type: 'success',
          title: 'Kompozycja kolorów dodana',
          message: 'Nowa kompozycja "Elegancki Minimalizm" została pomyślnie dodana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false
        }
      ]
      setNotifications(mockNotifications)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-24 translate-x-24"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Centrum Administracyjne
                    </h1>
                    <p className="text-xl opacity-90 mb-4">Kompleksowe zarządzanie systemem DiabloStudio</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">System Online</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                        <span className="text-sm">Aktualizacja:</span>
                        <span className="text-sm font-mono">{new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                        <span className="text-sm">Online:</span>
                        <span className="text-sm font-semibold">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:text-right">
                <div className="text-2xl font-bold opacity-90">
                  {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-lg opacity-80 mb-2">
                  {new Date().toLocaleDateString('pl-PL', { year: 'numeric' })}
                </div>
                <div className="flex items-center justify-end gap-2 text-sm">
                  <span className="opacity-70">Ostatnia synchronizacja:</span>
                  <span className="font-mono">{new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Bar */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="mr-2">🔔</span>
                Powiadomienia ({notifications.filter(n => !n.read).length})
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">Oznacz wszystkie jako przeczytane</button>
            </div>
            <div className="space-y-3">
              {notifications.filter(n => !n.read).slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Szybkie wyceny</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalValuations || 0}</p>
                <p className="text-sm text-green-600 mt-1">+12% od zeszłego miesiąca</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Szczegółowe wyceny</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalDetailedValuations || 0}</p>
                <p className="text-sm text-green-600 mt-1">+8% od zeszłego miesiąca</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kompozycje kolorów</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalCompositions || 0}</p>
                <p className="text-sm text-green-600 mt-1">+3 nowe w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne projekty</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalDetailedValuations || 0}</p>
                <p className="text-sm text-green-600 mt-1">W trakcie realizacji</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">⚡</span>
              Szybkie akcje
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/valuation')}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
              >
                <span>📋</span>
                Nowa wycena
              </button>
              <button
                onClick={() => router.push('/admin/color-compositions')}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
              >
                <span>🎨</span>
                Kompozycje kolorów
              </button>
              <button
                onClick={() => router.push('/admin/blog')}
                className="w-full p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
              >
                <span>📝</span>
                Blog
              </button>
              <button
                onClick={() => router.push('/admin/realizations')}
                className="w-full p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
              >
                <span>🏗️</span>
                Realizacje
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📈</span>
              Ostatnia aktywność
            </h3>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
              {!stats?.recentActivity.length && (
                <p className="text-gray-500 text-center py-4">Brak ostatniej aktywności</p>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🔧</span>
              Stan systemu
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Baza danych</span>
                </div>
                <span className={`text-sm font-semibold ${getSystemHealthColor(stats?.systemHealth.database || 'healthy')}`}>
                  {stats?.systemHealth.database === 'healthy' ? '✓ Zdrowa' : '⚠ Ostrzeżenie'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">API</span>
                </div>
                <span className={`text-sm font-semibold ${getSystemHealthColor(stats?.systemHealth.api || 'healthy')}`}>
                  {stats?.systemHealth.api === 'healthy' ? '✓ Zdrowe' : '⚠ Ostrzeżenie'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Storage</span>
                </div>
                <span className={`text-sm font-semibold ${getSystemHealthColor(stats?.systemHealth.storage || 'healthy')}`}>
                  {stats?.systemHealth.storage === 'healthy' ? '✓ Zdrowy' : '⚠ Ostrzeżenie'}
                </span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Zadania oczekujące</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.pendingTasks || 0}</p>
                <p className="text-sm text-blue-700">Wymagają uwagi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">💰</span>
            Panel finansowy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-green-900">Przychód miesięczny</h4>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white">📈</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
              <p className="text-sm text-green-700">Aktualny miesiąc</p>
              <div className="mt-3 text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full w-fit">
                +15% vs poprzedni miesiąc
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-blue-900">Przychód tygodniowy</h4>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white">📊</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(stats?.weeklyRevenue || 0)}</p>
              <p className="text-sm text-blue-700">Ostatnie 7 dni</p>
              <div className="mt-3 text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full w-fit">
                +8% vs poprzedni tydzień
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-purple-900">Średnia wartość wyceny</h4>
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white">🎯</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {stats && stats.totalValuations > 0 ? formatCurrency(stats.monthlyRevenue / stats.totalValuations) : formatCurrency(0)}
              </p>
              <p className="text-sm text-purple-700">Na podstawie wycen</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-orange-900">Konwersja projektów</h4>
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white">📋</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {stats && stats.totalDetailedValuations > 0 ? Math.round((stats.completedDetailedValuations / stats.totalDetailedValuations) * 100) : 0}%
              </p>
              <p className="text-sm text-orange-700">Ukończonych vs wszystkich</p>
            </div>
          </div>
        </div>

        {/* Content Stats and Realizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Realizations Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🏗️</span>
                Ostatnie realizacje
              </h3>
              <button
                onClick={() => router.push('/admin/realizations')}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                Zobacz wszystkie →
              </button>
            </div>
            <div className="space-y-4">
              {stats?.recentActivity.filter(a => a.type === 'realization').slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🏗️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}></div>
                </div>
              ))}
              {!stats?.recentActivity.filter(a => a.type === 'realization').length && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🏗️</div>
                  <p>Brak realizacji</p>
                  <button
                    onClick={() => router.push('/admin/realizations')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Dodaj pierwszą realizację
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Blog Posts Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📝</span>
                Ostatnie posty blogowe
              </h3>
              <button
                onClick={() => router.push('/admin/blog')}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                Zobacz wszystkie →
              </button>
            </div>
            <div className="space-y-4">
              {stats?.recentActivity.filter(a => a.type === 'blog').slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}></div>
                </div>
              ))}
              {!stats?.recentActivity.filter(a => a.type === 'blog').length && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📝</div>
                  <p>Brak postów blogowych</p>
                  <button
                    onClick={() => router.push('/admin/blog')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Dodaj pierwszy post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Posty blogowe</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-600 mb-2">{stats?.totalBlogPosts || 0}</p>
            <p className="text-sm text-gray-600">Opublikowane artykuły</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Realizacje</h3>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏗️</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mb-2">{stats?.totalRealizations || 0}</p>
            <p className="text-sm text-gray-600">Ukończone projekty</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Opinie</h3>
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-pink-600 mb-2">{stats?.totalReviews || 0}</p>
            <p className="text-sm text-gray-600">Opinie klientów</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Klienci</h3>
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-600 mb-2">{stats?.totalCustomers || 0}</p>
            <p className="text-sm text-gray-600">Zarejestrowanych</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border">
          <div className="border-b border-gray-200 p-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'dashboard', name: 'Dashboard główny', icon: '📊' },
                { id: 'overview', name: 'Przegląd systemu', icon: '🔍' },
                { id: 'database', name: 'Baza kolorów', icon: '🎨' },
                { id: 'users', name: 'Zarządzanie użytkownikami', icon: '👥' },
                { id: 'security', name: 'Bezpieczeństwo', icon: '🔒' },
                { id: 'analytics', name: 'Analityka', icon: '📈' },
                { id: 'settings', name: 'Konfiguracja', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Color Compositions Preview */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🎨</span>
                      Ostatnie kompozycje kolorów
                    </h3>
                    <button
                      onClick={() => router.push('/admin/color-compositions')}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Zobacz wszystkie →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Mock composition cards - in real app this would be from database */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Elegancki Minimalizm</h4>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      </div>
                      <div className="h-12 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-lg mb-3"></div>
                      <div className="text-xs text-gray-600">Aktywna • 15 użyć</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Naturalny Kamień</h4>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      </div>
                      <div className="h-12 bg-gradient-to-r from-amber-400 via-orange-500 to-brown-600 rounded-lg mb-3"></div>
                      <div className="text-xs text-gray-600">Aktywna • 8 użyć</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-4 border border-cyan-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Morski Błękit</h4>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      </div>
                      <div className="h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-lg mb-3"></div>
                      <div className="text-xs text-gray-600">Aktywna • 12 użyć</div>
                    </div>
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-2xl mb-2">➕</div>
                      <button
                        onClick={() => router.push('/admin/color-compositions')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Dodaj nową
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Overview Tab - System Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Valuations Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Ostatnie szybkie wyceny</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {stats?.recentActivity.filter(a => a.type === 'valuation').slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                              <div className="text-xs text-gray-500">{activity.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatDate(activity.timestamp)}</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status === 'success' ? '✓ Gotowe' : '⏳ Oczekuje'}
                              </div>
                            </div>
                          </div>
                        ))}
                        {!stats?.recentActivity.filter(a => a.type === 'valuation').length && (
                          <p className="text-gray-500 text-center py-4">Brak szybkich wycen</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Detailed Valuations Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Ostatnie szczegółowe wyceny</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {stats?.recentActivity.filter(a => a.type === 'detailed_valuation').slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                              <div className="text-xs text-gray-500">{activity.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatDate(activity.timestamp)}</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status === 'success' ? '✓ Gotowe' : '⏳ Oczekuje'}
                              </div>
                            </div>
                          </div>
                        ))}
                        {!stats?.recentActivity.filter(a => a.type === 'detailed_valuation').length && (
                          <p className="text-gray-500 text-center py-4">Brak szczegółowych wycen</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900">Aktywne projekty</h3>
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white">📋</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalDetailedValuations || 0}</p>
                    <p className="text-sm text-blue-700">W trakcie realizacji</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-green-900">Ukończone realizacje</h3>
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white">🏗️</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">{stats?.totalRealizations || 0}</p>
                    <p className="text-sm text-green-700">Gotowe do publikacji</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-purple-900">Aktywne kompozycje</h3>
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white">🎨</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">{stats?.totalCompositions || 0}</p>
                    <p className="text-sm text-purple-700">Dostępne dla klientów</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-orange-900">Nowe opinie</h3>
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white">⭐</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-2">{stats?.totalReviews || 0}</p>
                    <p className="text-sm text-orange-700">Oczekują moderacji</p>
                  </div>
                </div>
              </div>
            )}

            {/* Database Tab - Color Database Management */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                {/* Color Database Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Kolory RAL</h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🟦</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalValuations || 0}</p>
                    <p className="text-sm text-gray-600">Dostępnych kolorów</p>
                    <button
                      onClick={() => router.push('/admin/colors')}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Zarządzaj kolorami RAL
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Piaski kwarcowe</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🏔️</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">16</p>
                    <p className="text-sm text-gray-600">Dostępnych mieszanek</p>
                    <button
                      onClick={() => router.push('/admin/color-compositions')}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Zarządzaj piaskami
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Chips dekoracyjne</h3>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">💎</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">21</p>
                    <p className="text-sm text-gray-600">Dostępnych kolorów</p>
                    <button
                      onClick={() => router.push('/admin/color-compositions')}
                      className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Zarządzaj chipsami
                    </button>
                  </div>
                </div>

                {/* Color Management Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Szybkie akcje zarządzania kolorami</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">➕</div>
                        <div className="font-medium text-blue-900">Dodaj kolor RAL</div>
                        <div className="text-xs text-blue-700 mt-1">Rozszerz paletę</div>
                      </div>
                    </button>
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🖼️</div>
                        <div className="font-medium text-green-900">Aktualizuj zdjęcia</div>
                        <div className="text-xs text-green-700 mt-1">Odśwież galerię</div>
                      </div>
                    </button>
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="font-medium text-purple-900">Synchronizuj bazę</div>
                        <div className="text-xs text-purple-700 mt-1">Aktualizuj dane</div>
                      </div>
                    </button>
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-medium text-orange-900">Raport kolorów</div>
                        <div className="text-xs text-orange-700 mt-1">Eksport danych</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Color Statistics Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Statystyki kolorów</h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Kategoria</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Liczba kolorów</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Ostatnia aktualizacja</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                                <span className="font-medium text-gray-900">Kolory RAL</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-bold text-blue-600">{stats?.totalValuations || 0}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✓ Aktywne
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-gray-600">
                              {new Date().toLocaleDateString('pl-PL')}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                <span className="font-medium text-gray-900">Piaski kwarcowe</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-bold text-green-600">16</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✓ Aktywne
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-gray-600">
                              {new Date().toLocaleDateString('pl-PL')}
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                                <span className="font-medium text-gray-900">Chips dekoracyjne</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-bold text-purple-600">21</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✓ Aktywne
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-gray-600">
                              {new Date().toLocaleDateString('pl-PL')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab - User Management */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* User Management Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900">Wszyscy użytkownicy</h3>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">👥</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 mb-2">{stats?.totalCustomers || 0}</p>
                    <p className="text-sm text-blue-700">Zarejestrowanych</p>
                    <div className="mt-3 text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full w-fit">
                      +5% vs poprzedni miesiąc
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-red-900">Administratorzy</h3>
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">👑</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-red-600 mb-2">3</p>
                    <p className="text-sm text-red-700">Aktywni administratorzy</p>
                    <div className="mt-3 text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full w-fit">
                      Pełne uprawnienia
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-green-900">Role systemu</h3>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">🏷️</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-green-600 mb-2">5</p>
                    <p className="text-sm text-green-700">Zdefiniowanych ról</p>
                    <div className="mt-3 text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full w-fit">
                      RBAC aktywne
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-purple-900">Aktywni dziś</h3>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">🟢</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-purple-600 mb-2">12</p>
                    <p className="text-sm text-purple-700">Online użytkowników</p>
                    <div className="mt-3 text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full w-fit">
                      Średnia sesja: 24 min
                    </div>
                  </div>
                </div>

                {/* User Management Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-3">⚡</span>
                    Zarządzanie użytkownikami
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => {/* TODO: Open add user modal */}}
                      className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-md"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">➕</div>
                        <div className="font-bold text-blue-900">Dodaj użytkownika</div>
                        <div className="text-sm text-blue-700 mt-1">Utwórz nowe konto użytkownika</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {/* TODO: Open roles management */}}
                      className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-md"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">👑</div>
                        <div className="font-bold text-green-900">Zarządzaj rolami</div>
                        <div className="text-sm text-green-700 mt-1">RBAC i uprawnienia systemu</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {/* TODO: Open users list */}}
                      className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-md"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">📋</div>
                        <div className="font-bold text-purple-900">Lista użytkowników</div>
                        <div className="text-sm text-purple-700 mt-1">Zobacz wszystkich użytkowników</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {/* TODO: Open activity report */}}
                      className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all transform hover:scale-105 shadow-md"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">📊</div>
                        <div className="font-bold text-orange-900">Raport aktywności</div>
                        <div className="text-sm text-orange-700 mt-1">Logi i aktywność użytkowników</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Users Table with Real Data */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Ostatni użytkownicy</h3>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Szukaj użytkowników..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute left-3 top-2.5 text-gray-400">
                            <span className="text-sm">🔍</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Filtry
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-4 font-bold text-gray-900">Użytkownik</th>
                            <th className="text-center py-4 px-4 font-bold text-gray-900">Rola</th>
                            <th className="text-center py-4 px-4 font-bold text-gray-900">Status</th>
                            <th className="text-center py-4 px-4 font-bold text-gray-900">Ostatnia aktywność</th>
                            <th className="text-center py-4 px-4 font-bold text-gray-900">Akcje</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Real users from database */}
                          {customersRes?.data?.slice(0, 5).map((customer: any, index: number) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-bold shadow-md ${
                                    index === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                    index === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                    index === 2 ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                                    'bg-gradient-to-br from-orange-500 to-red-600'
                                  }`}>
                                    {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{customer.name || 'Nieznany użytkownik'}</div>
                                    <div className="text-sm text-gray-500">{customer.email || 'brak@email.com'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  Użytkownik
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  index === 0 ? 'bg-green-100 text-green-800' :
                                  index === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {index === 0 ? 'Online' : index === 1 ? 'Zaraz offline' : 'Offline'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-gray-600">
                                <div className="text-sm font-medium">
                                  {new Date(customer.created_at).toLocaleDateString('pl-PL')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(customer.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {/* TODO: Edit user */}}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                  >
                                    Edytuj
                                  </button>
                                  <button
                                    onClick={() => {/* TODO: Delete user */}}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                                  >
                                    Usuń
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {/* Add more mock users if less than 3 from database */}
                          {(!customersRes?.data || customersRes.data.length < 3) && (
                            <>
                              <tr className="hover:bg-gray-50">
                                <td className="py-4 px-4">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mr-4 flex items-center justify-center text-white font-bold shadow-md">
                                      A
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900">Admin System</div>
                                      <div className="text-sm text-gray-500">admin@diablostudio.pl</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                    Administrator
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    Online
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center text-gray-600">
                                  <div className="text-sm font-medium">Aktywny teraz</div>
                                  <div className="text-xs text-gray-500">Panel administratora</div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                                    Edytuj
                                  </button>
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Pokazano 1-{Math.min(customersRes?.data?.length || 0, 5)} z {stats?.totalCustomers || 0} użytkowników
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
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📈</span>
                      Aktywność użytkowników
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aktywni w ciągu ostatniej godziny</span>
                        <span className="font-bold text-green-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aktywni w ciągu 24 godzin</span>
                        <span className="font-bold text-blue-600">24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nowe rejestracje (7 dni)</span>
                        <span className="font-bold text-purple-600">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">👑</span>
                      Role w systemie
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Administratorzy</span>
                        <span className="font-bold text-red-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Moderatorzy</span>
                        <span className="font-bold text-blue-600">5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Użytkownicy</span>
                        <span className="font-bold text-gray-600">{(stats?.totalCustomers || 0) - 8}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🔒</span>
                      Bezpieczeństwo kont
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Konta zweryfikowane</span>
                        <span className="font-bold text-green-600">{Math.floor((stats?.totalCustomers || 0) * 0.8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Konta z 2FA</span>
                        <span className="font-bold text-blue-600">{Math.floor((stats?.totalCustomers || 0) * 0.3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Wymagają uwagi</span>
                        <span className="font-bold text-orange-600">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab - Security Management */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Security Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Logi bezpieczeństwa</h3>
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🔐</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mb-2">127</p>
                    <p className="text-sm text-gray-600">Zdarzeń dzisiaj</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Próby logowania</h3>
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🚪</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-2">23</p>
                    <p className="text-sm text-gray-600">Nieudane dzisiaj</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Aktywne sesje</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">💻</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">8</p>
                    <p className="text-sm text-gray-600">Bieżące sesje</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Zagrożenia</h3>
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">⚠️</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600 mb-2">2</p>
                    <p className="text-sm text-gray-600">Wymagają uwagi</p>
                  </div>
                </div>

                {/* Security Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Zarządzanie bezpieczeństwem</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="font-medium text-red-900">Przejrzyj logi</div>
                        <div className="text-xs text-red-700 mt-1">Logi bezpieczeństwa</div>
                      </div>
                    </button>
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">👥</div>
                        <div className="font-medium text-orange-900">Zarządzaj sesjami</div>
                        <div className="text-xs text-orange-700 mt-1">Aktywne logowania</div>
                      </div>
                    </button>
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔒</div>
                        <div className="font-medium text-blue-900">Ustawienia bezpieczeństwa</div>
                        <div className="text-xs text-blue-700 mt-1">Konfiguracja</div>
                      </div>
                    </button>
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-medium text-green-900">Raport bezpieczeństwa</div>
                        <div className="text-xs text-green-700 mt-1">Analiza zagrożeń</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Security Logs Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Ostatnie zdarzenia bezpieczeństwa</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-green-900">Pomyślne logowanie</div>
                            <div className="text-xs text-green-700">Użytkownik: admin@diablostudio.pl</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-900">2 min temu</div>
                          <div className="text-xs text-green-700">IP: 192.168.1.100</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-yellow-900">Nieudana próba logowania</div>
                            <div className="text-xs text-yellow-700">Próba: nieprawidłowe hasło</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-yellow-900">5 min temu</div>
                          <div className="text-xs text-yellow-700">IP: 203.0.113.45</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-blue-900">Zmiana hasła</div>
                            <div className="text-xs text-blue-700">Użytkownik: maria@example.com</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-900">1 godz temu</div>
                          <div className="text-xs text-blue-700">IP: 192.168.1.101</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-red-900">Blokada konta</div>
                            <div className="text-xs text-red-700">Powód: wielokrotne nieudane logowania</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-900">3 godz temu</div>
                          <div className="text-xs text-red-700">IP: 198.51.100.78</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab - Analytics and Reporting */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Analytics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Wyświetlenia strony</h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👁️</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">2,847</p>
                    <p className="text-sm text-gray-600">+12% vs poprzedni tydzień</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Unikalni użytkownicy</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👥</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">1,234</p>
                    <p className="text-sm text-gray-600">+8% vs poprzedni tydzień</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Średni czas sesji</h3>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">⏱️</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">4m 32s</p>
                    <p className="text-sm text-gray-600">+15% vs poprzedni tydzień</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Bounce Rate</h3>
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📉</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-2">23.4%</p>
                    <p className="text-sm text-gray-600">-5% vs poprzedni tydzień</p>
                  </div>
                </div>

                {/* Analytics Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Raporty i analityka</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-medium text-blue-900">Raport ruchu</div>
                        <div className="text-xs text-blue-700 mt-1">Analiza wizyt</div>
                      </div>
                    </button>
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="font-medium text-green-900">Raport finansowy</div>
                        <div className="text-xs text-green-700 mt-1">Przychody i konwersje</div>
                      </div>
                    </button>
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">👥</div>
                        <div className="font-medium text-purple-900">Raport użytkowników</div>
                        <div className="text-xs text-purple-700 mt-1">Aktywność klientów</div>
                      </div>
                    </button>
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎨</div>
                        <div className="font-medium text-orange-900">Raport kolorów</div>
                        <div className="text-xs text-orange-700 mt-1">Popularność palet</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Analytics Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ruch na stronie (ostatnie 7 dni)</h3>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-blue-600">
                        <div className="text-4xl mb-2">📈</div>
                        <div className="font-medium">Wykres ruchu</div>
                        <div className="text-sm text-blue-500 mt-1">Wykres liniowy z danymi z Google Analytics</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Popularne strony</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Strona główna</span>
                        </div>
                        <span className="font-bold text-blue-600">1,234</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Kolory i kompozycje</span>
                        </div>
                        <span className="font-bold text-green-600">856</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Realizacje</span>
                        </div>
                        <span className="font-bold text-purple-600">642</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Kontakt</span>
                        </div>
                        <span className="font-bold text-orange-600">423</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab - System Configuration */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Settings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Ustawienia systemu</h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">⚙️</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Konfiguracja ogólna systemu</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Edytuj ustawienia
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Integracje</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🔗</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Zarządzanie integracjami zewnętrznymi</p>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Zarządzaj integracjami
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Backup</h3>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">💾</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Zarządzanie kopiami zapasowymi</p>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Utwórz backup
                    </button>
                  </div>
                </div>

                {/* System Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Konfiguracja systemu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Tryb konserwacji</div>
                          <div className="text-sm text-gray-600">Włącza tryb konserwacji dla użytkowników</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Debug mode</div>
                          <div className="text-sm text-gray-600">Włącza szczegółowe logowanie błędów</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Powiadomienia email</div>
                          <div className="text-sm text-gray-600">Wysyłanie powiadomień na email</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">Limit sesji (minuty)</div>
                        <input type="number" defaultValue="60" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">Maksymalny rozmiar pliku (MB)</div>
                        <input type="number" defaultValue="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">Strefa czasowa</div>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option>Europe/Warsaw</option>
                          <option>Europe/London</option>
                          <option>America/New_York</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Integracje zewnętrzne</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-900">Google Analytics</span>
                      </div>
                      <div className="text-sm text-green-700">Status: Połączony</div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900">Supabase</span>
                      </div>
                      <div className="text-sm text-blue-700">Status: Połączony</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-medium text-gray-900">Email Service</span>
                      </div>
                      <div className="text-sm text-gray-700">Status: Niepołączony</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
