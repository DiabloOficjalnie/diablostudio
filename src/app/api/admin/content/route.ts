import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET - Retrieve content data (pages, blog posts, media)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const contentType = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // For now, return comprehensive mock data
    // In production, this would fetch from your CMS database
    const contentData = {
      pages: [
        {
          id: '1',
          title: 'Strona główna',
          slug: '/',
          status: 'published',
          type: 'page',
          author: 'admin@diablostudio.pl',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T10:30:00Z',
          views: 15420,
          seo_title: 'DiabloStudio - Profesjonalne posadzki żywiczne',
          seo_description: 'Specjaliści w dziedzinie posadzek żywicznych, mikrocementu i dekoracji. Realizacje na najwyższym poziomie.'
        },
        {
          id: '2',
          title: 'O nas',
          slug: '/o-nas',
          status: 'published',
          type: 'page',
          author: 'admin@diablostudio.pl',
          created_at: '2024-01-05T09:00:00Z',
          updated_at: '2024-01-18T14:20:00Z',
          views: 3240,
          seo_title: 'O firmie DiabloStudio - Poznaj naszą historię',
          seo_description: 'Poznaj historię i wartości firmy DiabloStudio. Dowiedz się więcej o naszym doświadczeniu w branży posadzek.'
        },
        {
          id: '3',
          title: 'Kontakt',
          slug: '/kontakt',
          status: 'published',
          type: 'page',
          author: 'admin@diablostudio.pl',
          created_at: '2024-01-10T14:20:00Z',
          updated_at: '2024-01-15T16:30:00Z',
          views: 5670,
          seo_title: 'Kontakt - DiabloStudio',
          seo_description: 'Skontaktuj się z nami. Chętnie odpowiemy na wszystkie pytania dotyczące posadzek żywicznych.'
        },
        {
          id: '4',
          title: 'Polityka prywatności',
          slug: '/polityka-prywatnosci',
          status: 'published',
          type: 'page',
          author: 'admin@diablostudio.pl',
          created_at: '2024-01-15T16:30:00Z',
          updated_at: '2024-01-15T16:30:00Z',
          views: 890,
          seo_title: 'Polityka prywatności - DiabloStudio',
          seo_description: 'Polityka prywatności serwisu DiabloStudio. Dowiedz się jak przetwarzamy Twoje dane osobowe.'
        }
      ],
      blogPosts: [
        {
          id: '1',
          title: 'Nowe trendy w posadzkach żywicznych 2024',
          excerpt: 'Poznaj najnowsze trendy w branży posadzek żywicznych na nadchodzący rok...',
          content: 'Treść artykułu o trendach w posadzkach żywicznych...',
          status: 'published',
          author: 'admin@diablostudio.pl',
          published_at: '2024-01-20T10:00:00Z',
          featured_image: '/assets/blog/trendy-2024.jpg',
          tags: ['trendy', 'posadzki', '2024'],
          category: 'Poradniki',
          views: 2340,
          seo_title: 'Nowe trendy w posadzkach żywicznych 2024 - DiabloStudio',
          seo_description: 'Odkryj najnowsze trendy w posadzkach żywicznych na 2024 rok. Ekspertów porady i inspiracje.'
        },
        {
          id: '2',
          title: 'Jak wybrać odpowiednią posadzkę do domu?',
          excerpt: 'Poradnik krok po kroku jak wybrać idealną posadzkę żywiczna do swojego domu...',
          content: 'Treść poradnika o wyborze posadzek...',
          status: 'published',
          author: 'editor@diablostudio.pl',
          published_at: '2024-01-18T15:30:00Z',
          featured_image: '/assets/blog/wybor-posadzki.jpg',
          tags: ['poradnik', 'wybór', 'dom'],
          category: 'Poradniki',
          views: 3450,
          seo_title: 'Jak wybrać posadzkę do domu - Kompletny poradnik',
          seo_description: 'Kompletny poradnik jak wybrać odpowiednią posadzkę żywiczna do domu. Praktyczne wskazówki.'
        },
        {
          id: '3',
          title: 'Mikrocement w łazience - inspiracje',
          excerpt: 'Zobacz jak mikrocement może odmienić wygląd Twojej łazienki...',
          content: 'Treść artykułu o mikrocementcie w łazience...',
          status: 'draft',
          author: 'editor@diablostudio.pl',
          tags: ['mikrocement', 'łazienka', 'inspiracje'],
          category: 'Inspiracje',
          views: 0,
          seo_title: 'Mikrocement w łazience - Inspiracje i pomysły',
          seo_description: 'Zobacz jak mikrocement może odmienić wygląd Twojej łazienki. Inspiracje i praktyczne porady.'
        }
      ],
      mediaFiles: [
        {
          id: '1',
          name: 'hero-background.jpg',
          url: '/assets/hero-header.png',
          type: 'image',
          size: 2457600,
          uploaded_at: '2024-01-01T00:00:00Z',
          category: 'pages'
        },
        {
          id: '2',
          name: 'posadzka-zywiczna-01.jpg',
          url: '/assets/Chips/webersys chips_01.jpg',
          type: 'image',
          size: 1843200,
          uploaded_at: '2024-01-05T09:00:00Z',
          category: 'gallery'
        },
        {
          id: '3',
          name: 'mikrocement-lazienka.jpg',
          url: '/assets/Piaski/webersys mix PU M_01.jpg',
          type: 'image',
          size: 2097152,
          uploaded_at: '2024-01-10T14:20:00Z',
          category: 'blog'
        },
        {
          id: '4',
          name: 'trendy-2024.jpg',
          url: '/assets/blog/trendy-2024.jpg',
          type: 'image',
          size: 1572864,
          uploaded_at: '2024-01-15T16:30:00Z',
          category: 'blog'
        }
      ],
      seo: {
        totalPages: 4,
        optimizedPages: 4,
        totalPosts: 3,
        optimizedPosts: 2,
        sitemapEntries: 12,
        lastSitemapUpdate: '2024-01-20T10:00:00Z'
      }
    }

    // Apply filters if specified
    let filteredPages = contentData.pages
    let filteredPosts = contentData.blogPosts

    if (status !== 'all') {
      filteredPages = filteredPages.filter(page => page.status === status)
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedPages = filteredPages.slice(offset, offset + limit)
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    // Return specific content type if requested
    if (contentType !== 'all') {
      switch (contentType) {
        case 'pages':
          return NextResponse.json({
            pages: paginatedPages,
            pagination: {
              page,
              limit,
              total: filteredPages.length,
              pages: Math.ceil(filteredPages.length / limit)
            }
          })
        case 'blog':
          return NextResponse.json({
            posts: paginatedPosts,
            pagination: {
              page,
              limit,
              total: filteredPosts.length,
              pages: Math.ceil(filteredPosts.length / limit)
            }
          })
        case 'media':
          return NextResponse.json({
            files: contentData.mediaFiles,
            total: contentData.mediaFiles.length
          })
        case 'seo':
          return NextResponse.json(contentData.seo)
        default:
          return NextResponse.json(contentData[contentType as keyof typeof contentData])
      }
    }

    return NextResponse.json({
      pages: paginatedPages,
      blogPosts: paginatedPosts,
      mediaFiles: contentData.mediaFiles,
      seo: contentData.seo,
      pagination: {
        page,
        limit,
        totalPages: filteredPages.length,
        totalPosts: filteredPosts.length
      }
    })

  } catch (error) {
    console.error('Error fetching content data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content data' },
      { status: 500 }
    )
  }
}

// POST - Create new content (page or blog post)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const contentData = await request.json()

    // Validate content data
    if (!contentData.title || !contentData.type) {
      return NextResponse.json(
        { error: 'Missing required content data' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would create content in your CMS database
    const newContent = {
      id: Date.now().toString(),
      title: contentData.title,
      slug: contentData.slug || generateSlug(contentData.title),
      status: contentData.status || 'draft',
      type: contentData.type,
      author: contentData.author || 'admin@diablostudio.pl',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      seo_title: contentData.seo_title,
      seo_description: contentData.seo_description,
      featured_image: contentData.featured_image,
      ...(contentData.type === 'blog' && {
        excerpt: contentData.excerpt,
        content: contentData.content,
        tags: contentData.tags || [],
        category: contentData.category || 'Ogólne'
      })
    }

    return NextResponse.json({
      success: true,
      message: `${contentData.type === 'blog' ? 'Blog post' : 'Page'} created successfully`,
      content: newContent
    })

  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

// PUT - Update existing content
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const updateData = await request.json()

    // Validate update data
    if (!updateData.id || !updateData.title) {
      return NextResponse.json(
        { error: 'Missing required update data' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would update content in your CMS database
    const updatedContent = {
      id: updateData.id,
      title: updateData.title,
      slug: updateData.slug,
      status: updateData.status,
      type: updateData.type,
      author: updateData.author,
      updated_at: new Date().toISOString(),
      seo_title: updateData.seo_title,
      seo_description: updateData.seo_description,
      featured_image: updateData.featured_image,
      ...(updateData.type === 'blog' && {
        excerpt: updateData.excerpt,
        content: updateData.content,
        tags: updateData.tags,
        category: updateData.category
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      content: updatedContent
    })

  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// DELETE - Delete content or media file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // For now, return success with mock response
    // In production, this would delete content from your CMS database
    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
      deletedId: id
    })

  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}

// Helper function to generate URL slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
    .substring(0, 50)
}
