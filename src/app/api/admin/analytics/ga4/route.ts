import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would use Google Analytics Data API
    // For now, we'll return mock data that represents GA4 data

    const supabase = createClient()

    // Get real data from your database to enhance GA4 data
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('count')
      .single()

    const { data: uniqueUsers } = await supabase
      .from('unique_visitors')
      .select('count')
      .single()

    // Mock GA4-like response
    const ga4Data = {
      pageViews: pageViews?.count || 2847,
      users: uniqueUsers?.count || 1234,
      sessions: Math.floor((pageViews?.count || 2847) * 0.7),
      sessionDuration: '4m 32s',
      bounceRate: '23.4%',
      topPages: [
        { page: '/', views: 1234, percentage: 43.4 },
        { page: '/colors', views: 856, percentage: 30.1 },
        { page: '/realizations', views: 642, percentage: 22.6 },
        { page: '/contact', views: 423, percentage: 14.9 }
      ],
      demographics: {
        age: { '25-34': 35, '35-44': 28, '18-24': 22, '45-54': 15 },
        gender: { male: 52, female: 48 },
        location: { poland: 78, germany: 12, uk: 10 }
      },
      trafficSources: {
        organic: 45,
        direct: 30,
        referral: 15,
        social: 10
      },
      devices: {
        desktop: 55,
        mobile: 40,
        tablet: 5
      }
    }

    return NextResponse.json(ga4Data)

  } catch (error) {
    console.error('Error fetching GA4 data:', error)
    return NextResponse.json(
      {
        pageViews: 2847,
        users: 1234,
        sessionDuration: '4m 32s',
        bounceRate: '23.4%'
      },
      { status: 200 }
    )
  }
}
