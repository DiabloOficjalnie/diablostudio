// Analytics and Data Visualization System for DiabloStudio Admin Panel

export interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  sessionDuration: string
  topPages: Array<{
    path: string
    views: number
    percentage: number
  }>
  trafficSources: Array<{
    source: string
    sessions: number
    percentage: number
  }>
  deviceTypes: Array<{
    device: string
    sessions: number
    percentage: number
  }>
  geographicData: Array<{
    country: string
    sessions: number
    percentage: number
  }>
  timeSeriesData: Array<{
    date: string
    pageViews: number
    visitors: number
    sessions: number
  }>
}

export interface BusinessMetrics {
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  conversionRate: number
  customerLifetimeValue: number
  churnRate: number
  customerAcquisitionCost: number
  returnOnInvestment: number
}

export interface ContentMetrics {
  totalContent: number
  publishedContent: number
  draftContent: number
  totalViews: number
  averageViewsPerContent: number
  topPerformingContent: Array<{
    id: string
    title: string
    views: number
    type: string
  }>
  contentEngagement: Array<{
    type: string
    views: number
    engagement: number
  }>
}

// Mock data generators for development
export class AnalyticsManager {
  private static instance: AnalyticsManager
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager()
    }
    return AnalyticsManager.instance
  }

  // Get cached data or fetch fresh data
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data
    }

    const freshData = await fetcher()
    this.cache.set(key, { data: freshData, timestamp: now })
    return freshData
  }

  // Get Google Analytics 4 data (mock implementation)
  async getGA4Data(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    return this.getCachedData('ga4_data', async () => {
      // In production, this would call the real GA4 API
      return {
        pageViews: 2847,
        uniqueVisitors: 1234,
        bounceRate: 23.4,
        sessionDuration: '4m 32s',
        topPages: [
          { path: '/', views: 1250, percentage: 43.9 },
          { path: '/kolory', views: 892, percentage: 31.4 },
          { path: '/realizacje', views: 567, percentage: 19.9 },
          { path: '/kontakt', views: 138, percentage: 4.8 }
        ],
        trafficSources: [
          { source: 'Organic Search', sessions: 1456, percentage: 51.2 },
          { source: 'Direct', sessions: 892, percentage: 31.4 },
          { source: 'Social Media', sessions: 342, percentage: 12.0 },
          { source: 'Referral', sessions: 157, percentage: 5.4 }
        ],
        deviceTypes: [
          { device: 'Desktop', sessions: 1654, percentage: 58.1 },
          { device: 'Mobile', sessions: 892, percentage: 31.4 },
          { device: 'Tablet', sessions: 301, percentage: 10.5 }
        ],
        geographicData: [
          { country: 'Poland', sessions: 2456, percentage: 86.3 },
          { country: 'Germany', sessions: 234, percentage: 8.2 },
          { country: 'United Kingdom', sessions: 89, percentage: 3.1 },
          { country: 'Other', sessions: 68, percentage: 2.4 }
        ],
        timeSeriesData: this.generateTimeSeriesData()
      }
    })
  }

  // Get business metrics
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    return this.getCachedData('business_metrics', async () => {
      return {
        totalRevenue: 456789,
        monthlyRevenue: 45678,
        averageOrderValue: 1250,
        conversionRate: 3.4,
        customerLifetimeValue: 3450,
        churnRate: 2.1,
        customerAcquisitionCost: 45,
        returnOnInvestment: 285
      }
    })
  }

  // Get content metrics
  async getContentMetrics(): Promise<ContentMetrics> {
    return this.getCachedData('content_metrics', async () => {
      return {
        totalContent: 156,
        publishedContent: 134,
        draftContent: 22,
        totalViews: 45678,
        averageViewsPerContent: 293,
        topPerformingContent: [
          { id: '1', title: 'Kompletny przewodnik po posadzkach żywicznych', views: 3421, type: 'article' },
          { id: '2', title: 'O nas - historia firmy DiabloStudio', views: 2156, type: 'page' },
          { id: '3', title: 'Najczęściej zadawane pytania', views: 1892, type: 'faq' },
          { id: '4', title: 'Nowoczesny salon z posadzką dekoracyjną', views: 1250, type: 'realization' }
        ],
        contentEngagement: [
          { type: 'Articles', views: 15432, engagement: 78 },
          { type: 'Pages', views: 12341, engagement: 65 },
          { type: 'FAQ', views: 8934, engagement: 82 },
          { type: 'Realizations', views: 8971, engagement: 71 }
        ]
      }
    })
  }

  // Generate time series data for charts
  private generateTimeSeriesData() {
    const data = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        pageViews: Math.floor(Math.random() * 200) + 50,
        visitors: Math.floor(Math.random() * 100) + 25,
        sessions: Math.floor(Math.random() * 150) + 30
      })
    }

    return data
  }

  // Export analytics data to CSV
  async exportAnalyticsCSV(type: 'ga4' | 'business' | 'content'): Promise<string> {
    let data: any = []
    let headers: string[] = []

    switch (type) {
      case 'ga4':
        data = (await this.getGA4Data()).timeSeriesData
        headers = ['Date', 'Page Views', 'Visitors', 'Sessions']
        break
      case 'business':
        data = [await this.getBusinessMetrics()]
        headers = ['Metric', 'Value']
        break
      case 'content':
        data = (await this.getContentMetrics()).topPerformingContent
        headers = ['Title', 'Type', 'Views']
        break
    }

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map(header => {
          const key = header.toLowerCase().replace(' ', '_')
          return typeof row[key] === 'string' ? `"${row[key]}"` : row[key] || ''
        }).join(',')
      )
    ].join('\n')

    return csvContent
  }

  // Get real-time analytics (mock)
  async getRealtimeAnalytics() {
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      currentPageViews: Math.floor(Math.random() * 20) + 5,
      topActivePages: [
        { path: '/', users: Math.floor(Math.random() * 10) + 2 },
        { path: '/kolory', users: Math.floor(Math.random() * 8) + 1 },
        { path: '/realizacje', users: Math.floor(Math.random() * 6) + 1 }
      ],
      recentEvents: [
        { type: 'page_view', page: '/kontakt', timestamp: new Date().toISOString() },
        { type: 'form_submit', form: 'valuation_form', timestamp: new Date(Date.now() - 1000 * 30).toISOString() },
        { type: 'file_download', file: 'price_list.pdf', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
      ]
    }
  }

  // Clear analytics cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Chart data transformers for different chart libraries
export class ChartDataTransformer {
  // Transform data for Chart.js
  static forChartJS(data: AnalyticsData['timeSeriesData'], type: 'line' | 'bar' = 'line') {
    return {
      type,
      data: {
        labels: data.map(d => new Date(d.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })),
        datasets: [
          {
            label: 'Wyświetlenia stron',
            data: data.map(d => d.pageViews),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Użytkownicy',
            data: data.map(d => d.visitors),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  }

  // Transform data for pie chart
  static forPieChart(data: AnalyticsData['trafficSources']) {
    return {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.source),
        datasets: [{
          data: data.map(d => d.sessions),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
          },
        }
      }
    }
  }

  // Transform business metrics for KPI cards
  static forKPICards(metrics: BusinessMetrics) {
    return [
      {
        title: 'Przychód miesięczny',
        value: new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(metrics.monthlyRevenue),
        change: '+12.5%',
        trend: 'up',
        icon: '💰'
      },
      {
        title: 'Średnia wartość zamówienia',
        value: new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(metrics.averageOrderValue),
        change: '+8.3%',
        trend: 'up',
        icon: '📊'
      },
      {
        title: 'Współczynnik konwersji',
        value: `${metrics.conversionRate}%`,
        change: '+2.1%',
        trend: 'up',
        icon: '🎯'
      },
      {
        title: 'CAC',
        value: new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(metrics.customerAcquisitionCost),
        change: '-5.2%',
        trend: 'down',
        icon: '📈'
      }
    ]
  }
}

// Export singleton instance
export const analyticsManager = AnalyticsManager.getInstance()
