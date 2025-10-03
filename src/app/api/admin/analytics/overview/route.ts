import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Get real data from database
    const [
      clientsResult,
      consultationsResult,
      reviewsResult,
      realizationsResult
    ] = await Promise.allSettled([
      supabase.from('customers').select('*', { count: 'exact' }),
      supabase.from('consultations').select('*', { count: 'exact' }),
      supabase.from('reviews').select('*', { count: 'exact' }),
      supabase.from('realizations').select('*', { count: 'exact' })
    ])

    // Extract data with fallbacks
    const clientsData = clientsResult.status === 'fulfilled' ? clientsResult.value : { data: [], count: 0 }
    const consultationsData = consultationsResult.status === 'fulfilled' ? consultationsResult.value : { data: [], count: 0 }
    const reviewsData = reviewsResult.status === 'fulfilled' ? reviewsResult.value : { data: [], count: 0 }
    const realizationsData = realizationsResult.status === 'fulfilled' ? realizationsResult.value : { data: [], count: 0 }

    // Calculate real metrics from database data
    const consultationsList = consultationsData.data || []
    const clientsList = clientsData.data || []
    const reviewsList = reviewsData.data || []
    const realizationsList = realizationsData.data || []

    // Calculate total revenue from consultations (using estimated_value)
    const totalRevenue = consultationsList.reduce((sum: number, c: any) => sum + (c.estimated_value || 0), 0)

    // Calculate monthly growth (comparing current month with previous month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthConsultations = consultationsList.filter((c: any) => {
      const createdDate = new Date(c.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    })

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const previousMonthConsultations = consultationsList.filter((c: any) => {
      const createdDate = new Date(c.created_at)
      return createdDate.getMonth() === previousMonth && createdDate.getFullYear() === previousMonthYear
    })

    const currentMonthRevenue = currentMonthConsultations.reduce((sum: number, c: any) => sum + (c.estimated_value || 0), 0)
    const previousMonthRevenue = previousMonthConsultations.reduce((sum: number, c: any) => sum + (c.estimated_value || 0), 0)

    const monthlyGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0

    // Calculate other metrics
    const totalOrders = consultationsData.count || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate conversion rate (consultations per client as proxy)
    const conversionRate = clientsData.count && clientsData.count > 0
      ? (totalOrders / clientsData.count) * 100
      : 0

    // Calculate customer lifetime value (average spending per client)
    const totalClientSpending = clientsList.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0)
    const customerLifetimeValue = clientsData.count && clientsData.count > 0
      ? totalClientSpending / clientsData.count
      : 0

    const overviewData = {
      totalRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
      totalOrders,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100
    }

    return NextResponse.json(overviewData)

  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}
