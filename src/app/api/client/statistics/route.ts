import { NextRequest, NextResponse } from 'next/server'
import { dbApiHelper } from '@/lib/database-manager'
import {
  ClientStatistics,
  ClientStatisticsInsert,
  ClientStatisticsUpdate,
  StatisticsCalculation
} from '@/lib/database-types'

// GET - Pobierz statystyki klienta
export async function GET(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest zalogowany
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = userResult.data.user

    // Pobierz istniejące statystyki klienta
    const statsResult = await dbHelper.helpers.selectWithPagination<ClientStatistics>(
      'client_statistics',
      [{ column: 'client_id', operator: 'eq', value: user.id }]
    )

    if (!statsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    let statistics = statsResult.data?.data?.[0] || null

    // Jeśli statystyki nie istnieją lub są starsze niż 24h, przelicz je
    const shouldRecalculate = !statistics || statistics.last_calculation < new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    if (shouldRecalculate) {
      statistics = await calculateClientStatistics(user.id, dbHelper)
    }

    // Pobierz dodatkowe dane dla trendów
    const trends = await calculateTrends(user.id, dbHelper)

    return NextResponse.json({
      success: true,
      statistics: statistics,
      trends: trends,
      last_calculated: statistics?.last_calculation || new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching client statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Funkcja pomocnicza do obliczania statystyk klienta
async function calculateClientStatistics(clientId: string, dbHelper: ReturnType<typeof dbApiHelper>): Promise<ClientStatistics | null> {
  try {
    // Pobierz wszystkie wyceny klienta
    const quotesResult = await dbHelper.helpers.selectWithPagination(
      'client_quotes',
      [{ column: 'client_id', operator: 'eq', value: clientId }]
    )

    if (!quotesResult.success) {
      return null
    }

    const quotes: any[] = quotesResult.data?.data || []

    // Oblicz podstawowe statystyki
    const completedQuotes = quotes.filter((quote: any) => quote.status === 'completed')
    const totalSquareMeters = completedQuotes.reduce((sum: number, quote: any) => sum + quote.area, 0)
    const completedProjects = completedQuotes.length

    // Oblicz oszczędności (przykład: średnia różnica między max a min ceną * powierzchnia)
    const totalSavings = completedQuotes.reduce((sum: number, quote: any) => {
      const avgPricePerM2 = (quote.price_min + quote.price_max) / 2
      const totalPrice = avgPricePerM2 * quote.area
      return sum + totalPrice
    }, 0)

    // Pobierz aktualny rabat z programu afiliacyjnego
    const affiliateResult = await dbHelper.helpers.selectWithPagination(
      'affiliate_program',
      [{ column: 'client_id', operator: 'eq', value: clientId }]
    )

    const currentDiscount = affiliateResult.success && affiliateResult.data?.data?.length
      ? (affiliateResult.data.data[0] as any).total_discount
      : 0

    // Przygotuj dane do wstawienia/aktualizacji
    const statsData: ClientStatisticsInsert = {
      client_id: clientId,
      total_square_meters: totalSquareMeters,
      total_savings: totalSavings,
      current_discount: currentDiscount,
      completed_projects: completedProjects,
      last_calculation: new Date().toISOString()
    }

    // Sprawdź czy statystyki już istnieją
    const existingStatsResult = await dbHelper.helpers.selectWithPagination<ClientStatistics>(
      'client_statistics',
      [{ column: 'client_id', operator: 'eq', value: clientId }]
    )

    let result
    if (existingStatsResult.success && existingStatsResult.data?.data?.length) {
      // Aktualizuj istniejące statystyki
      result = await dbHelper.helpers.update<ClientStatistics>(
        'client_statistics',
        statsData,
        [{ column: 'client_id', operator: 'eq', value: clientId }]
      )
    } else {
      // Utwórz nowe statystyki
      result = await dbHelper.helpers.insert<ClientStatistics>(
        'client_statistics',
        statsData
      )
    }

    if (!result.success) {
      console.error('Failed to save statistics:', result.error)
      return null
    }

    return result.data || null

  } catch (error) {
    console.error('Error calculating client statistics:', error)
    return null
  }
}

// Funkcja pomocnicza do obliczania trendów
async function calculateTrends(clientId: string, dbHelper: ReturnType<typeof dbApiHelper>) {
  try {
    // Pobierz wyceny z ostatnich 30 dni dla porównania trendów
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const recentQuotesResult = await dbHelper.helpers.selectWithPagination(
      'client_quotes',
      [
        { column: 'client_id', operator: 'eq', value: clientId },
        { column: 'created_at', operator: 'gte', value: thirtyDaysAgo }
      ]
    )

    const recentQuotes = recentQuotesResult.success ? recentQuotesResult.data?.data || [] : []
    const completedRecentQuotes = recentQuotes.filter(quote => quote.status === 'completed')

    // Oblicz trendy (porównanie z poprzednimi 30 dniami)
    const previousPeriodStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const previousPeriodEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const previousQuotesResult = await dbHelper.helpers.selectWithPagination(
      'client_quotes',
      [
        { column: 'client_id', operator: 'eq', value: clientId },
        { column: 'created_at', operator: 'gte', value: previousPeriodStart },
        { column: 'created_at', operator: 'lte', value: previousPeriodEnd }
      ]
    )

    const previousQuotes = previousQuotesResult.success ? previousQuotesResult.data?.data || [] : []
    const completedPreviousQuotes = previousQuotes.filter(quote => quote.status === 'completed')

    // Oblicz wzrosty
    const currentSquareMeters = completedRecentQuotes.reduce((sum: number, quote: any) => sum + (quote as any).area, 0)
    const previousSquareMeters = completedPreviousQuotes.reduce((sum: number, quote: any) => sum + (quote as any).area, 0)

    const currentSavings = completedRecentQuotes.reduce((sum: number, quote: any) => {
      const avgPricePerM2 = ((quote as any).price_min + (quote as any).price_max) / 2
      return sum + (avgPricePerM2 * (quote as any).area)
    }, 0)

    const previousSavings = completedPreviousQuotes.reduce((sum: number, quote: any) => {
      const avgPricePerM2 = ((quote as any).price_min + (quote as any).price_max) / 2
      return sum + (avgPricePerM2 * (quote as any).area)
    }, 0)

    const squareMetersGrowth = previousSquareMeters > 0
      ? ((currentSquareMeters - previousSquareMeters) / previousSquareMeters) * 100
      : (currentSquareMeters > 0 ? 100 : 0)

    const savingsGrowth = previousSavings > 0
      ? ((currentSavings - previousSavings) / previousSavings) * 100
      : (currentSavings > 0 ? 100 : 0)

    const projectsGrowth = completedPreviousQuotes.length > 0
      ? ((completedRecentQuotes.length - completedPreviousQuotes.length) / completedPreviousQuotes.length) * 100
      : (completedRecentQuotes.length > 0 ? 100 : 0)

    return {
      square_meters_growth: Math.round(squareMetersGrowth * 100) / 100,
      savings_growth: Math.round(savingsGrowth * 100) / 100,
      projects_growth: Math.round(projectsGrowth * 100) / 100,
      current_period: {
        square_meters: currentSquareMeters,
        savings: currentSavings,
        projects: completedRecentQuotes.length
      },
      previous_period: {
        square_meters: previousSquareMeters,
        savings: previousSavings,
        projects: completedPreviousQuotes.length
      }
    }

  } catch (error) {
    console.error('Error calculating trends:', error)
    return {
      square_meters_growth: 0,
      savings_growth: 0,
      projects_growth: 0,
      current_period: { square_meters: 0, savings: 0, projects: 0 },
      previous_period: { square_meters: 0, savings: 0, projects: 0 }
    }
  }
}

// POST - Ręczne przeliczenie statystyk (tylko dla adminów)
export async function POST(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest administratorem
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest adminem
    const adminResult = await dbHelper.helpers.selectWithPagination(
      'admin_users',
      [
        { column: 'id', operator: 'eq', value: userResult.data.user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!adminResult.success || !adminResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { client_id } = body

    if (!client_id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Przelicz statystyki dla klienta
    const statistics = await calculateClientStatistics(client_id, dbHelper)

    if (!statistics) {
      return NextResponse.json(
        { error: 'Failed to calculate statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Statistics recalculated successfully',
      statistics: statistics
    })

  } catch (error: any) {
    console.error('Error recalculating client statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizuj statystyki klienta (tylko dla adminów)
export async function PUT(request: NextRequest) {
  try {
    const dbHelper = dbApiHelper(request, true)

    // Sprawdź czy użytkownik jest administratorem
    const userResult = await dbHelper.getCurrentUser()
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest adminem
    const adminResult = await dbHelper.helpers.selectWithPagination(
      'admin_users',
      [
        { column: 'id', operator: 'eq', value: userResult.data.user.id },
        { column: 'is_active', operator: 'eq', value: true }
      ]
    )

    if (!adminResult.success || !adminResult.data?.data?.length) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { client_id, ...updateData } = body

    if (!client_id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Aktualizuj statystyki
    const updateResult = await dbHelper.helpers.update<ClientStatistics>(
      'client_statistics',
      { ...updateData, last_calculation: new Date().toISOString() },
      [{ column: 'client_id', operator: 'eq', value: client_id }]
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Statistics updated successfully',
      statistics: updateResult.data
    })

  } catch (error: any) {
    console.error('Error updating client statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
