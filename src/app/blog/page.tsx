import Link from 'next/link'
import MainLayout from '../components/MainLayout'

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
}

async function getPosts(params: { page?: number; limit?: number; category?: string; featured?: boolean; search?: string } = {}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.category) searchParams.set('category', params.category)
  if (params.featured) searchParams.set('featured', 'true')
  if (params.search) searchParams.set('search', params.search)

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://diablostudio.vercel.app'
  
  const res = await fetch(`${baseUrl}/api/blog?${searchParams.toString()}`, {
    // Render always fresh content
    cache: 'no-store',
  })

  if (!res.ok) {
    return { posts: [] as BlogPost[], pagination: { page: 1, limit: 9, total: 0, pages: 0 } }
  }

  return res.json() as Promise<{ posts: BlogPost[]; pagination: { page: number; limit: number; total: number; pages: number } }>
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function BlogIndexPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const page = Number(params?.page || 1)
  const limit = Number(params?.limit || 9)
  const category = (params?.category as string) || undefined
  const search = (params?.q as string) || undefined

  const { posts, pagination } = await getPosts({ page, limit, category, search })

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Blog i aktualności</h1>
          <p className="mt-4 text-lg text-gray-600">
            Porady ekspertów, realizacje i nowości dotyczące posadzek żywicznych
          </p>
        </header>

        {/* Search and filters (lightweight placeholder) */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <form action="/blog" method="get" className="flex-1 max-w-lg">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <input
                type="text"
                name="q"
                defaultValue={search}
                placeholder="Szukaj artykułów..."
                className="flex-1 px-4 py-2 outline-none"
              />
              <button type="submit" className="px-4 bg-blue-600 text-white hover:bg-blue-700">
                Szukaj
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-lg border ${!category || category === 'wszystkie' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Wszystkie
            </Link>
            <Link href="/blog?category=porady-techniczne" className={`px-4 py-2 rounded-lg border ${category === 'porady-techniczne' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              Porady techniczne
            </Link>
            <Link href="/blog?category=realizacje" className={`px-4 py-2 rounded-lg border ${category === 'realizacje' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              Realizacje
            </Link>
            <Link href="/blog?category=nowosci" className={`px-4 py-2 rounded-lg border ${category === 'nowosci' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              Nowości
            </Link>
            <Link href="/blog?category=konserwacja" className={`px-4 py-2 rounded-lg border ${category === 'konserwacja' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              Konserwacja
            </Link>
            <Link href="/blog?category=porownania" className={`px-4 py-2 rounded-lg border ${category === 'porownania' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              Porównania
            </Link>
          </div>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-700 mb-2">Brak artykułów do wyświetlenia.</p>
            <p className="text-gray-500">Dodaj pierwszy wpis w panelu administratora lub uruchom skrypt dodający przykładowy post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🧪</div>
                    )}
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span className="mr-2">📅 {formatDate(post.published_at || post.created_at)}</span>
                    {post.reading_time_minutes ? <span>• 📖 {post.reading_time_minutes} min</span> : null}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-700">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Czytaj więcej →
                    </Link>
                    {post.is_featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Polecany</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }).map((_, i) => {
              const p = i + 1
              const query = new URLSearchParams()
              if (category) query.set('category', category)
              if (search) query.set('q', search)
              query.set('page', String(p))
              query.set('limit', String(limit))
              return (
                <Link
                  key={p}
                  href={`/blog?${query.toString()}`}
                  className={`px-4 py-2 rounded-md border ${p === pagination.page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
