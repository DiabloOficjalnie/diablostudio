import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MainLayout from '../../components/MainLayout'
import { createClient } from '@supabase/supabase-js'
import { Suspense } from 'react'
import NewsletterForm from '../../components/NewsletterForm'

type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  category?: string
  tags?: string[]
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  created_at: string
  updated_at: string
  view_count: number
  reading_time_minutes?: number
  is_featured: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
}

async function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing Supabase env vars for public read.')
  }
  return createClient(url, anon)
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await getSupabaseAnon()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .single()

  if (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
  return data as unknown as BlogPost
}

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Wpis nie znaleziony | DecoSol',
      description: 'Wpis o podanym adresie nie istnieje lub został usunięty.',
    }
  }

  return {
    title: post.meta_title || `${post.title} | DecoSol`,
    description: post.meta_description || post.excerpt || 'Artykuł o posadzkach żywicznych od ekspertów DecoSol',
    keywords: post.meta_keywords?.join(', ') || 'posadzki żywiczne, epoksyd, poliuretan, DecoSol',
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || 'Artykuł o posadzkach żywicznych',
      type: 'article',
      url: `https://decosol.pl/blog/${post.slug}`,
      images: post.og_image ? [
        {
          url: post.og_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ['DecoSol'],
      tags: post.tags || undefined,
      locale: 'pl_PL',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || 'Artykuł o posadzkach żywicznych',
      images: post.og_image ? [post.og_image] : undefined,
    },
    alternates: {
      canonical: post.canonical_url || `https://decosol.pl/blog/${post.slug}`,
    },
  }
}

async function incrementViewCount(postId: string, currentViews?: number | null) {
  try {
    const supabase = await getSupabaseAnon()
    const nextViews = (currentViews ?? 0) + 1
    await supabase
      .from('blog_posts')
      .update({ view_count: nextViews })
      .eq('id', postId)
  } catch (error) {
    console.error('Error incrementing view count:', error)
    // Non-critical error, don't fail the page
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Increment view count (fire and forget)
  incrementViewCount(post.id, post.view_count)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryInfo = (categorySlug?: string) => {
    const categories = {
      'porady-techniczne': { name: 'Porady techniczne', icon: '🔧', color: '#10B981' },
      'realizacje': { name: 'Realizacje', icon: '🏗️', color: '#3B82F6' },
      'nowosci': { name: 'Nowości', icon: '📰', color: '#8B5CF6' },
      'konserwacja': { name: 'Konserwacja', icon: '🧽', color: '#F59E0B' },
      'porownania': { name: 'Porównania', icon: '⚖️', color: '#EF4444' },
    }
    return categories[categorySlug as keyof typeof categories] || { name: 'Artykuł', icon: '📝', color: '#6B7280' }
  }

  const categoryInfo = getCategoryInfo(post.category)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.meta_title || post.title,
    "description": post.meta_description || post.excerpt || undefined,
    "image": post.og_image ? [post.og_image] : undefined,
    "author": { "@type": "Organization", "name": "DecoSol" },
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://decosol.pl/blog/${post.slug}` }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><a href="/" className="hover:text-blue-600">Strona główna</a></li>
            <li><span className="mx-2">/</span></li>
            <li><a href="/blog" className="hover:text-blue-600">Blog</a></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center mb-4">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium mr-4"
              style={{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }}
            >
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.name}
            </span>
            {post.is_featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ Polecany
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">👨‍💼</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">DecoSol Expert</div>
                <div>{formatDate(post.published_at || post.created_at)}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">📖</span>
              {post.reading_time_minutes} min czytania
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 mr-2">👁️</span>
              {post.view_count} wyświetleń
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-12">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="rich-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        {/* SEO: JSON-LD Article */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tagi:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Udostępnij artykuł:</h3>
          <div className="flex space-x-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://decosol.pl/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📘 Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://decosol.pl/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              🐦 Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://decosol.pl/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              💼 LinkedIn
            </a>
          </div>
        </div>

        {/* Newsletter CTA */}
        <section className="mt-12">
          <Suspense fallback={null}>
            <NewsletterForm variant="card" source="blog_post_card" />
          </Suspense>
        </section>

        {/* Related Articles CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Przeczytaj więcej artykułów</h3>
          <p className="text-xl mb-6 opacity-90">
            Znajdziesz u nas porady, trendy i case studies dotyczące posadzek żywicznych
          </p>
          <a
            href="/blog"
            className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Zobacz wszystkie artykuły
            <span className="ml-2">📚</span>
          </a>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-white rounded-2xl p-8 border-2 border-gray-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Masz pytania o posadzki żywiczne?
          </h3>
          <p className="text-gray-600 mb-6">
            Skontaktuj się z naszymi ekspertami i otrzymaj profesjonalne doradztwo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/valuation"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Darmowa wycena
              <span className="ml-2">📋</span>
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Skontaktuj się
              <span className="ml-2">📞</span>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
