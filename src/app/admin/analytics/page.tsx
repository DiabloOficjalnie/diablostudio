'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    monthlyGrowth: number
    totalOrders: number
    conversionRate: number
    averageOrderValue: number
    customerLifetimeValue: number
  }
  traffic: {
    totalVisitors: number
    uniqueVisitors: number
    pageViews: number
    bounceRate: number
    sessionDuration: number
    topPages: Array<{
      page: string
      views: number
      percentage: number
    }>
  }
  sales: {
    daily: Array<{ date: string, revenue: number, orders: number }>
    monthly: Array<{ month: string, revenue: number, orders: number }>
    bySource: Array<{ source: string, revenue: number, percentage: number }>
    byProduct: Array<{ product: string, revenue: number, orders: number }>
  }
  customers: {
    newCustomers: number
    returningCustomers: number
    churnRate: number
    satisfactionScore: number
    topCountries: Array<{ country: string, customers: number, percentage: number }>
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'sales' | 'customers'>('overview')
  const router = useRouter()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // Load analytics data from various sources
      const [overviewData, trafficData, salesData, customersData] = await Promise.allSettled([
        loadOverviewData(),
        loadTrafficData(),
        loadSalesData(),
        loadCustomersData()
      ])

      const analyticsData: AnalyticsData = {
        overview: overviewData.status === 'fulfilled' ? overviewData.value : getMockOverviewData(),
        traffic: trafficData.status === 'fulfilled' ? trafficData.value : getMockTrafficData(),
        sales: salesData.status === 'fulfilled' ? salesData.value : getMockSalesData(),
        customers: customersData.status === 'fulfilled' ? customersData.value : getMockCustomersData()
      }

      setData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setData(getMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  const loadOverviewData = async () => {
    // Load data from internal database
    try {
      const response = await fetch('/api/admin/analytics/overview')
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error loading overview data:', error)
    }

    // Fallback to mock data if API fails
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalRevenue: 284750,
          monthlyGrowth: 12.5,
          totalOrders: 1247,
          conversionRate: 3.2,
          averageOrderValue: 228,
          customerLifetimeValue: 1250
        })
      }, 500)
    })
  }

  const loadTrafficData = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalVisitors: 45680,
          uniqueVisitors: 32150,
          pageViews: 128900,
          bounceRate: 34.2,
          sessionDuration: 245,
          topPages: [
            { page: '/', views: 45200, percentage: 35.1 },
            { page: '/colors', views: 28900, percentage: 22.4 },
            { page: '/realizations', views: 18600, percentage: 14.4 },
            { page: '/contact', views: 12400, percentage: 9.6 },
            { page: '/valuation', views: 9800, percentage: 7.6 }
          ]
        })
      }, 800)
    })
  }

  const loadSalesData = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 5000) + 2000,
            orders: Math.floor(Math.random() * 20) + 5
          })),
          monthly: [
            { month: 'Lipiec', revenue: 45600, orders: 234 },
            { month: 'Sierpień', revenue: 52100, orders: 267 },
            { month: 'Wrzesień', revenue: 48900, orders: 251 },
            { month: 'Październik', revenue: 58400, orders: 298 }
          ],
          bySource: [
            { source: 'Organic Search', revenue: 185000, percentage: 65.1 },
            { source: 'Direct', revenue: 56200, percentage: 19.7 },
            { source: 'Social Media', revenue: 28400, percentage: 10.0 },
            { source: 'Email', revenue: 14700, percentage: 5.2 }
          ],
          byProduct: [
            { product: 'Posadzki żywiczne', revenue: 145000, orders: 89 },
            { product: 'Mikrocement', revenue: 89000, orders: 156 },
            { product: 'Konsultacje', revenue: 28400, orders: 234 },
            { product: 'Inne', revenue: 15350, orders: 78 }
          ]
        })
      }, 1200)
    })
  }

  const loadCustomersData = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          newCustomers: 234,
          returningCustomers: 567,
          churnRate: 3.2,
          satisfactionScore: 4.7,
          topCountries: [
            { country: 'Polska', customers: 1456, percentage: 78.2 },
            { country: 'Niemcy', customers: 234, percentage: 12.6 },
            { country: 'Czechy', customers: 89, percentage: 4.8 },
            { country: 'Słowacja', customers: 45, percentage: 2.4 },
            { country: 'Inne', customers: 37, percentage: 2.0 }
          ]
        })
      }, 900)
    })
  }

  const getMockOverviewData = () => ({
    totalRevenue: 284750,
    monthlyGrowth: 12.5,
    totalOrders: 1247,
    conversionRate: 3.2,
    averageOrderValue: 228,
    customerLifetimeValue: 1250
  })

  const getMockTrafficData = () => ({
    totalVisitors: 45680,
    uniqueVisitors: 32150,
    pageViews: 128900,
    bounceRate: 34.2,
    sessionDuration: 245,
    topPages: [
      { page: '/', views: 45200, percentage: 35.1 },
      { page: '/colors', views: 28900, percentage: 22.4 },
      { page: '/realizations', views: 18600, percentage: 14.4 },
      { page: '/contact', views: 12400, percentage: 9.6 },
      { page: '/valuation', views: 9800, percentage: 7.6 }
    ]
  })

  const getMockSalesData = () => ({
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 20) + 5
    })),
    monthly: [
      { month: 'Lipiec', revenue: 45600, orders: 234 },
      { month: 'Sierpień', revenue: 52100, orders: 267 },
      { month: 'Wrzesień', revenue: 48900, orders: 251 },
      { month: 'Październik', revenue: 58400, orders: 298 }
    ],
    bySource: [
      { source: 'Organic Search', revenue: 185000, percentage: 65.1 },
      { source: 'Direct', revenue: 56200, percentage: 19.7 },
      { source: 'Social Media', revenue: 28400, percentage: 10.0 },
      { source: 'Email', revenue: 14700, percentage: 5.2 }
    ],
    byProduct: [
      { product: 'Posadzki żywiczne', revenue: 145000, orders: 89 },
      { product: 'Mikrocement', revenue: 89000, orders: 156 },
      { product: 'Konsultacje', revenue: 28400, orders: 234 },
      { product: 'Inne', revenue: 15350, orders: 78 }
    ]
  })

  const getMockCustomersData = () => ({
    newCustomers: 234,
    returningCustomers: 567,
    churnRate: 3.2,
    satisfactionScore: 4.7,
    topCountries: [
      { country: 'Polska', customers: 1456, percentage: 78.2 },
      { country: 'Niemcy', customers: 234, percentage: 12.6 },
      { country: 'Czechy', customers: 89, percentage: 4.8 },
      { country: 'Słowacja', customers: 45, percentage: 2.4 },
      { country: 'Inne', customers: 37, percentage: 2.0 }
    ]
  })

  const getMockAnalyticsData = (): AnalyticsData => ({
    overview: getMockOverviewData(),
    traffic: getMockTrafficData(),
    sales: getMockSalesData(),
    customers: getMockCustomersData()
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie danych analitycznych...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Nie udało się załadować danych analitycznych</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analityka i raporty</h1>
              <p className="text-gray-600">Szczegółowa analiza ruchu, sprzedaży i zachowań klientów</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Ostatnie 7 dni</option>
                <option value="30d">Ostatnie 30 dni</option>
                <option value="90d">Ostatnie 90 dni</option>
                <option value="1y">Ostatni rok</option>
              </select>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => {/* TODO: Export reports */}}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                📊 Eksportuj raport
              </button>
            </div>
          </div>
        </div>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Przychody całkowite</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className={`text-sm mt-1 ${data.overview.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.overview.monthlyGrowth >= 0 ? '↗' : '↘'} {Math.abs(data.overview.monthlyGrowth)}% vs poprzedni miesiąc
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zamówienia</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(data.overview.totalOrders)}</p>
                <p className="text-sm text-green-600 mt-1">Średnia wartość: {formatCurrency(data.overview.averageOrderValue)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Konwersja</p>
                <p className="text-3xl font-bold text-gray-900">{data.overview.conversionRate}%</p>
                <p className="text-sm text-green-600 mt-1">CLV: {formatCurrency(data.overview.customerLifetimeValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Odwiedzający</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(data.traffic.uniqueVisitors)}</p>
                <p className="text-sm text-green-600 mt-1">{formatNumber(data.traffic.totalVisitors)} sesji</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytics Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Przegląd', icon: '📊' },
                { id: 'traffic', label: 'Ruch', icon: '🚦' },
                { id: 'sales', label: 'Sprzedaż', icon: '💼' },
                { id: 'customers', label: 'Klienci', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Traffic Overview */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🚦</span>
                      Ruch na stronie
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Unikalni odwiedzający</span>
                        <span className="font-bold text-gray-900">{formatNumber(data.traffic.uniqueVisitors)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Wyświetlenia stron</span>
                        <span className="font-bold text-gray-900">{formatNumber(data.traffic.pageViews)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Współczynnik odrzuceń</span>
                        <span className="font-bold text-gray-900">{data.traffic.bounceRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Średni czas sesji</span>
                        <span className="font-bold text-gray-900">{Math.floor(data.traffic.sessionDuration / 60)}:{(data.traffic.sessionDuration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Pages */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📄</span>
                      Najpopularniejsze strony
                    </h3>
                    <div className="space-y-3">
                      {data.traffic.topPages.map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{page.page}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatNumber(page.views)}</div>
                            <div className="text-sm text-gray-500">{page.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Traffic Tab */}
            {activeTab === 'traffic' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Źródła ruchu</h3>
                    <div className="space-y-4">
                      {data.sales.bySource.map((source) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <span className="text-gray-700">{source.source}</span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(source.revenue)}</div>
                            <div className="text-sm text-gray-500">{source.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Geolokalizacja</h3>
                    <div className="space-y-3">
                      {data.customers.topCountries.map((country) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <span className="text-gray-700">{country.country}</span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatNumber(country.customers)}</div>
                            <div className="text-sm text-gray-500">{country.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sprzedaż według produktów</h3>
                    <div className="space-y-4">
                      {data.sales.byProduct.map((product) => (
                        <div key={product.product} className="flex items-center justify-between">
                          <span className="text-gray-700">{product.product}</span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(product.revenue)}</div>
                            <div className="text-sm text-gray-500">{product.orders} zamówień</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Trend miesięczny</h3>
                    <div className="space-y-3">
                      {data.sales.monthly.map((month) => (
                        <div key={month.month} className="flex items-center justify-between">
                          <span className="text-gray-700">{month.month}</span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{formatCurrency(month.revenue)}</div>
                            <div className="text-sm text-gray-500">{month.orders} zamówień</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-900 mb-2">{data.customers.newCustomers}</div>
                    <div className="text-blue-700">Nowi klienci</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-900 mb-2">{data.customers.returningCustomers}</div>
                    <div className="text-green-700">Powracający klienci</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-900 mb-2">{data.customers.satisfactionScore}/5</div>
                    <div className="text-purple-700">Ocena satysfakcji</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Churn Rate</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-red-600">{data.customers.churnRate}%</div>
                    <div className="text-gray-600">
                      Współczynnik rezygnacji klientów w wybranym okresie
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Eksport raportów</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-blue-900">Raport PDF</div>
                <div className="text-sm text-blue-700">Kompletny raport</div>
              </div>
            </button>

            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-bold text-green-900">Excel</div>
                <div className="text-sm text-green-700">Dane surowe</div>
              </div>
            </button>

            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold text-purple-900">CSV</div>
                <div className="text-sm text-purple-700">Eksport tabel</div>
              </div>
            </button>

            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-bold text-orange-900">Email</div>
                <div className="text-sm text-orange-700">Wyślij raport</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
