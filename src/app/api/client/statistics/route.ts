import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase-server'
import { ensureUUID } from '@/lib/id'

type QuoteRow = {
  area?: number | null
  price_min?: number | null
  price_max?: number | null
  total_min?: number | null
  total_max?: number | null
  status?: string | null
  created_at?: string | null
}

function toNumber(n: any, fallback = 0): number {
  const x = Number(n)
  return Number.isFinite(x) ? x : fallback
}

function pctGrowth(prev: number, curr: number): number {
  if (prev <= 0 && curr <= 0) return 0
  if (prev <= 0) return 100
  return Math.round(((curr - prev) / prev) * 100)
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Gracefully handle missing table or errors
    let quotes: QuoteRow[] = []
    try {
      const { data, error } = await supabase
        .from('client_quotes')
        .select('area, price_min, price_max, total_min, total_max, status, created_at')
        .eq('client_id', ensureUUID(userId))

      if (!error && Array.isArray(data)) {
        quotes = data as QuoteRow[]
      }
    } catch {
      quotes = []
    }

    // Time windows: previous 30 days vs current 30 days
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const currentFrom = now - 30 * dayMs
    const currentTo = now
    const previousFrom = now - 60 * dayMs
    const previousTo = now - 30 * dayMs

    const inRange = (ts: string | null | undefined, from: number, to: number) => {
      if (!ts) return false
      const t = Date.parse(ts)
      if (Number.isNaN(t)) return false
      return t >= from && t < to
    }

    const currentList = quotes.filter(q => inRange(q.created_at || null, currentFrom, currentTo))
    const previousList = quotes.filter(q => inRange(q.created_at || null, previousFrom, previousTo))

    const sumArea = (list: QuoteRow[]) => list.reduce((acc, q) => acc + toNumber(q.area, 0), 0)
    const sumSavings = (list: QuoteRow[]) =>
      list.reduce((acc, q) => {
        const min = toNumber(q.total_min, 0)
        const max = toNumber(q.total_max, 0)
        const diff = Math.max(0, max - min)
        return acc + diff
      }, 0)
    const countProjects = (list: QuoteRow[]) => list.length

    const allArea = sumArea(quotes)
    const allSavings = sumSavings(quotes)
    const completedProjects = quotes.filter(q => (q.status || '').toLowerCase() === 'completed').length

    const prevArea = sumArea(previousList)
    const prevSavings = sumSavings(previousList)
    const prevProjects = countProjects(previousList)

    const currArea = sumArea(currentList)
    const currSavings = sumSavings(currentList)
    const currProjects = countProjects(currentList)

    const statistics = {
      completed_projects: completedProjects,
      total_square_meters: allArea,
      total_savings: allSavings,
      current_discount: 0 // Placeholder: if you add a discount program per client, map it here
    }

    const trends = {
      previous_period: {
        square_meters: prevArea,
        savings: prevSavings,
        projects: prevProjects
      },
      current_period: {
        square_meters: currArea,
        savings: currSavings,
        projects: currProjects
      },
      square_meters_growth: pctGrowth(prevArea, currArea),
      savings_growth: pctGrowth(prevSavings, currSavings),
      projects_growth: pctGrowth(prevProjects, currProjects)
    }

    return NextResponse.json({ success: true, statistics, trends }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 })
  }
}
