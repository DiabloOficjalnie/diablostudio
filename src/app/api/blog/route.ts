import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Graceful fallback when env is missing: return empty list instead of 500
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('API /api/blog: Missing Supabase env, returning empty list')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '6')
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })

    // Apply filters
    if (category && category !== 'wszystkie') {
      query = query.eq('category', category)
    }

    if (featured) {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .not('published_at', 'is', null)

    if (category && category !== 'wszystkie') {
      countQuery = countQuery.eq('category', category)
    }

    if (featured) {
      countQuery = countQuery.eq('is_featured', true)
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    const { count } = await countQuery

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      })
    }

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in blog API:', error)
    // Graceful fallback to avoid breaking public pages
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    return NextResponse.json({
      posts: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })
  }
}
