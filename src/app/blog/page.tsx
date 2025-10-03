'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'

interface BlogPost {
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
  blog_categories?: {
    name: string
    slug: string
    color: string
    icon: string
  }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon: string
  sort_order: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('wszystkie')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const postsPerPage = 6

  useEffect(() => {
    loadPosts()
    loadCategories()
  }, [selectedCategory, currentPage, searchTerm])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: postsPerPage.toString(),
        category: selectedCategory,
        search: searchTerm
      })

      const response = await fetch(`/api/blog?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Failed to load posts')
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    try {
      // For now, use hardcoded categories until we create the categories API
      setCategories([
        { id: '1', name: 'Wszystkie', slug: 'wszystkie', description: 'Wszystkie artykuły', color: '#3B82F6', icon: '📚', sort_order: 0 },
        { id: '2', name: 'Porady techniczne', slug: 'porady-techniczne', description: 'Praktyczne wskazówki', color: '#10B981', icon: '🔧', sort_order: 1 },
        { id: '3', name: 'Realizacje', slug: 'realizacje', description: 'Opisy projektów', color: '#3B82F6', icon: '🏗️', sort_order: 2 },
        { id: '4', name: 'Nowości', slug: 'nowosci', description: 'Aktualności branżowe', color: '#8B5CF6', icon: '📰', sort_order: 3 },
        { id: '5', name: 'Konserwacja', slug: 'konserwacja', description: 'Pielęgnacja posadzek', color: '#F59E0B', icon: '🧽', sort_order: 4 },
        { id: '6', name: 'Porównania', slug: 'porownania', description: 'Analizy i porównania', color: '#EF4444', icon: '⚖️', sort_order: 5 }
      ])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/blog?featured=true&limit=2')
      if (response.ok) {
        const data = await response.json()
        setFeaturedPosts(data.posts)
      }
    } catch (error) {
      console.error('Error loading featured posts:', error)
    }
  }

  useEffect(() => {
    loadFeaturedPosts()
  }, [])

  const filteredPosts = selectedCategory === 'wszystkie'
    ? posts
    : posts.filter(post => post.category === selectedCategory)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryInfo = (categorySlug?: string) => {
    return categories.find(cat => cat.slug === categorySlug) || categories[0]
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Baza wiedzy o posadzkach żywicznych
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Przeczytaj nasze artykuły eksperckie i dowiedz się wszystkiego o posadzkach żywicznych.
            Porady techniczne, trendy, porównania i case studies od naszych specjalistów.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              ⭐ Polecane artykuły
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Polecany
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
                      📖 {post.reading_time_minutes} min czytania
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2">
                        {getCategoryInfo(post.category)?.icon}
                      </span>
                      <span className="text-sm text-gray-600">{getCategoryInfo(post.category)?.name}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {post.excerpt || 'Kliknij, aby przeczytać pełny artykuł...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 text-sm">👨‍💼</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Expert</div>
                          <div className="text-xs text-gray-500">{formatDate(post.published_at || post.created_at)}</div>
                        </div>
                      </div>
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        Czytaj więcej →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.filter(cat => cat.slug !== 'wszystkie').map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.slug)
                  setCurrentPage(1)
                }}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center space-x-2 ${
                  selectedCategory === category.slug
                    ? 'bg-blue-800 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj artykułów..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie artykułów...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      📖 {post.reading_time_minutes} min
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                        {getCategoryInfo(post.category)?.icon}
                      </span>
                      <span className="text-xs text-gray-600">{getCategoryInfo(post.category)?.name}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {post.excerpt || 'Kliknij, aby przeczytać pełny artykuł...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      <a href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Czytaj →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Poprzednia
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Następna →
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Brak artykułów w tej kategorii
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Aktualnie nie mamy artykułów w wybranej kategorii, ale regularnie publikujemy nowe treści.
                </p>
                <button
                  onClick={() => setSelectedCategory('wszystkie')}
                  className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Pokaż wszystkie artykuły
                  <span className="ml-2">📋</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            📧 Chcesz być na bieżąco?
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Zapisz się do naszego newslettera i otrzymuj najnowsze artykuły bezpośrednio na swoją skrzynkę
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Twój adres e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Zapisz się
            </button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Nie wysyłamy spamu. Możesz się wypisać w każdej chwili.
          </p>
        </section>
      </div>
    </MainLayout>
  )
}
