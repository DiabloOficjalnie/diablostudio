import { createClientComponentClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClientComponentClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'published'
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          name,
          slug,
          color,
          icon
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'wszystkie') {
      query = query.eq('status', status)
    }

    if (category && category !== 'wszystkie') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      )
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
    console.error('Error in admin blog API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientComponentClient()
    const body = await request.json()

    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      category,
      tags,
      status,
      published_at,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      allow_comments,
      is_featured,
      sort_order
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      )
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const reading_time_minutes = Math.ceil(wordCount / 200)

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        content,
        excerpt,
        featured_image,
        category,
        tags,
        status,
        published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
        meta_title,
        meta_description,
        meta_keywords,
        og_title,
        og_description,
        og_image,
        reading_time_minutes,
        allow_comments,
        is_featured,
        sort_order
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json(newPost)

  } catch (error) {
    console.error('Error in admin blog POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
