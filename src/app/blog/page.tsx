import Link from 'next/link'
import type { Metadata } from 'next'
import MainLayout from '../components/MainLayout'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  category?: string
  tags?: string[]
  published_at?: string
  created_at: string
  reading_time_minutes?: number
  is_featured: boolean
  view_count?: number
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Brak kluczy Supabase (NEXT_PUBLIC_SUPABASE_URL/ANON).')
  }
  return createClient(url, anon)
}

async function getPostsDirect(params: { page: number; limit: number; category?: string; featured?: boolean; search?: string }) {
  const supabase = await getSupabaseAnon()
  const { page, limit, category, featured, search } = params
  const from = (page - 1) * limit
  const to = from + limit - 1

  let listQuery = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (category && category !== 'wszystkie') {
    listQuery = listQuery.eq('category', category)
  }
  if (featured) {
    listQuery = listQuery.eq('is_featured', true)
  }
  if (search) {
    listQuery = listQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  listQuery = listQuery.range(from, to)

  const { data, error, count } = await listQuery
  if (error) {
    console.error('Blog index fetch error:', error)
    return { posts: [] as BlogPost[], total: 0 }
  }
  return { posts: (data as BlogPost[]) || [], total: count || 0 }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog i aktualności | DecoSol',
    description:
      'Porady ekspertów, realizacje i nowości dotyczące posadzek żywicznych. Sprawdź przewodniki inwestora, porównania systemów i inspiracje.',
    alternates: { canonical: 'https://decosol.pl/blog' },
    openGraph: {
      title: 'Blog i aktualności | DecoSol',
      description:
        'Porady ekspertów, realizacje i nowości dotyczące posadzek żywicznych. Sprawdź przewodniki inwestora, porównania systemów i inspiracje.',
      type: 'website',
      url: 'https://decosol.pl/blog',
      locale: 'pl_PL'
    }
  }
}

export default async function BlogIndexPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page || 1))
  const limit = Math.min(24, Math.max(6, Number(params?.limit || 9)))
  const category = (params?.category as string) || undefined
  const search = (params?.q as string) || undefined

  const { posts, total } = await getPostsDirect({ page, limit, category, featured: false, search })
  const pages = Math.ceil(total / limit)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Blog i aktualności
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Porady ekspertów, realizacje i nowości dotyczące posadzek żywicznych. Zadbaliśmy o SEO i czytelny układ.
          </p>
        </header>

        {/* Search + Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <form action="/blog" method="get" className="flex-1 max-w-xl">
            <div className="flex rounded-xl border border-gray-300 overflow-hidden bg-white shadow-sm">
              <input
                type="text"
                name="q"
                defaultValue={search}
                placeholder="Szukaj artykułów..."
                className="flex-1 px-4 py-2 outline-none text-gray-900"
                aria-label="Szukaj artykułów"
              />
              <button type="submit" className="px-4 bg-blue-600 text-white hover:bg-blue-700">
                Szukaj
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { label: 'Wszystkie', val: 'wszystkie' },
              { label: 'Porady techniczne', val: 'porady-techniczne' },
              { label: 'Realizacje', val: 'realizacje' },
              { label: 'Nowości', val: 'nowosci' },
              { label: 'Konserwacja', val: 'konserwacja' },
              { label: 'Porównania', val: 'porownania' }
            ].map((c) => {
              const href = c.val === 'wszystkie' ? '/blog' : `/blog?category=${encodeURIComponent(c.val)}`
              const active = (category || 'wszystkie') === c.val
              return (
                <Link
                  key={c.val}
                  href={href}
                  className={`px-4 py-2 whitespace-nowrap rounded-xl border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-800 font-semibold mb-2">Brak artykułów do wyświetlenia.</p>
            <p className="text-gray-500">
              Dodaj pierwszy wpis w panelu administratora lub uruchom skrypt seeda z przykładowym artykułem.
            </p>
            <div className="mt-6">
              <a
                href="/admin/blog"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Przejdź do panelu bloga
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    {(post.featured_image && (post.featured_image.startsWith('http') || post.featured_image.startsWith('/assets/'))) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                        🧪
                      </div>
                    )}
                    {post.is_featured && (
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        ⭐ Polecany
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
                    <span className="inline-flex items-center">
                      📅 {formatDate(post.published_at || post.created_at)}
                    </span>
                    {post.reading_time_minutes ? <span>• 📖 {post.reading_time_minutes} min</span> : null}
                    {typeof post.view_count === 'number' ? <span>• 👁️ {post.view_count}</span> : null}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-700">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  )}
                  <div className="mt-auto flex justify-between items-center">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      aria-label={`Czytaj: ${post.title}`}
                    >
                      Czytaj więcej →
                    </Link>
                    {post.category ? (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginacja artykułów">
            {Array.from({ length: pages }).map((_, i) => {
              const p = i + 1
              const query = new URLSearchParams()
              if (category) query.set('category', category)
              if (search) query.set('q', search)
              query.set('page', String(p))
              query.set('limit', String(limit))
              const active = p === page
              return (
                <Link
                  key={p}
                  href={`/blog?${query.toString()}`}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {p}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </MainLayout>
  )
}
