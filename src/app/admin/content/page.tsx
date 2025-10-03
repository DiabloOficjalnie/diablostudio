'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface ContentPage {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  type: 'page' | 'blog' | 'gallery' | 'testimonial'
  author: string
  created_at: string
  updated_at: string
  views?: number
  seo_title?: string
  seo_description?: string
  featured_image?: string
}

interface MediaFile {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'document'
  size: number
  uploaded_at: string
  category: 'gallery' | 'blog' | 'pages' | 'testimonials'
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  status: 'draft' | 'published' | 'archived'
  author: string
  published_at?: string
  featured_image?: string
  tags: string[]
  category: string
  views: number
  seo_title?: string
  seo_description?: string
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'pages' | 'blog' | 'media' | 'seo'>('pages')
  const [pages, setPages] = useState<ContentPage[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showPageModal, setShowPageModal] = useState(false)
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    try {
      setLoading(true)

      // Load all content-related data
      const [pagesData, blogData, mediaData] = await Promise.allSettled([
        loadPages(),
        loadBlogPosts(),
        loadMediaFiles()
      ])

      if (pagesData.status === 'fulfilled') {
        setPages(pagesData.value)
      }

      if (blogData.status === 'fulfilled') {
        setBlogPosts(blogData.value)
      }

      if (mediaData.status === 'fulfilled') {
        setMediaFiles(mediaData.value)
      }

    } catch (error) {
      console.error('Error loading content data:', error)
      // Fallback to mock data
      setPages(getMockPages())
      setBlogPosts(getMockBlogPosts())
      setMediaFiles(getMockMediaFiles())
    } finally {
      setLoading(false)
    }
  }

  const loadPages = async () => {
    return new Promise<ContentPage[]>(resolve => {
      setTimeout(() => {
        resolve(getMockPages())
      }, 800)
    })
  }

  const loadBlogPosts = async () => {
    return new Promise<BlogPost[]>(resolve => {
      setTimeout(() => {
        resolve(getMockBlogPosts())
      }, 1000)
    })
  }

  const loadMediaFiles = async () => {
    return new Promise<MediaFile[]>(resolve => {
      setTimeout(() => {
        resolve(getMockMediaFiles())
      }, 600)
    })
  }

  const getMockPages = (): ContentPage[] => [
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
  ]

  const getMockBlogPosts = (): BlogPost[] => [
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
  ]

  const getMockMediaFiles = (): MediaFile[] => [
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
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Opublikowana'
      case 'draft': return 'Szkic'
      case 'archived': return 'Zarchiwizowana'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800'
      case 'blog': return 'bg-purple-100 text-purple-800'
      case 'gallery': return 'bg-pink-100 text-pink-800'
      case 'testimonial': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'page': return 'Strona'
      case 'blog': return 'Blog'
      case 'gallery': return 'Galeria'
      case 'testimonial': return 'Referencja'
      default: return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie zawartości...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Zarządzanie treściami</h1>
              <p className="text-gray-600">Twórz i zarządzaj stronami, blogiem, galeriami i treściami SEO</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => {/* TODO: Quick actions */}}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ⚡ Szybkie akcje
              </button>
            </div>
          </div>
        </div>

        {/* Content Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Strony</p>
                <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
                <p className="text-sm text-green-600 mt-1">{pages.filter(p => p.status === 'published').length} opublikowanych</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wpisy bloga</p>
                <p className="text-3xl font-bold text-gray-900">{blogPosts.length}</p>
                <p className="text-sm text-green-600 mt-1">{blogPosts.filter(p => p.status === 'published').length} opublikowanych</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pliki mediów</p>
                <p className="text-3xl font-bold text-gray-900">{mediaFiles.length}</p>
                <p className="text-sm text-green-600 mt-1">{formatFileSize(mediaFiles.reduce((sum, file) => sum + file.size, 0))} łącznie</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wyświetlenia</p>
                <p className="text-3xl font-bold text-gray-900">{pages.reduce((sum, page) => sum + (page.views || 0), 0) + blogPosts.reduce((sum, post) => sum + post.views, 0)}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie treści</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pages', label: 'Strony', icon: '📄' },
                { id: 'blog', label: 'Blog', icon: '📝' },
                { id: 'media', label: 'Media', icon: '🖼️' },
                { id: 'seo', label: 'SEO', icon: '🔍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Zarządzanie stronami</h3>
                  <button
                    onClick={() => setShowPageModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowa strona
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pages.map((page) => (
                    <div key={page.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-bold">📄</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{page.title}</h4>
                            <p className="text-sm text-gray-600">/{page.slug}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                            {getStatusText(page.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(page.type)}`}>
                            {getTypeText(page.type)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Autor:</span>
                          <span className="text-gray-900">{page.author}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Wyświetleń:</span>
                          <span className="text-gray-900">{page.views || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Aktualizacja:</span>
                          <span className="text-gray-900">{formatDate(page.updated_at)}</span>
                        </div>
                      </div>

                      {page.seo_title && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">SEO Title:</p>
                          <p className="text-sm text-green-700">{page.seo_title}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            Edytuj
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                            Podgląd
                          </button>
                        </div>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                          Usuń
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Tab */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Wpisy bloga</h3>
                  <button
                    onClick={() => setShowBlogModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowy wpis
                  </button>
                </div>

                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{post.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Autor: {post.author}</span>
                              <span>Kategoria: {post.category}</span>
                              <span>Wyświetleń: {post.views}</span>
                              {post.published_at && (
                                <span>Opublikowano: {formatDate(post.published_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                              {getStatusText(post.status)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                              Edytuj
                            </button>
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                              Podgląd
                            </button>
                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                              Usuń
                            </button>
                          </div>
                        </div>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {post.seo_description && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">SEO Description:</p>
                          <p className="text-sm text-green-700">{post.seo_description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Biblioteka mediów</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      ➕ Dodaj pliki
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      📁 Nowa kategoria
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-3xl">
                            {file.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            file.category === 'gallery' ? 'bg-pink-100 text-pink-800' :
                            file.category === 'blog' ? 'bg-purple-100 text-purple-800' :
                            file.category === 'pages' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {file.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(file.uploaded_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 mt-3">
                        <button className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                          Edytuj
                        </button>
                        <button className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                          Usuń
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900">Optymalizacja SEO</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Najpopularniejsze strony</h4>
                    <div className="space-y-4">
                      {pages
                        .filter(page => page.views && page.views > 0)
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map((page) => (
                          <div key={page.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{page.title}</p>
                              <p className="text-sm text-gray-600">/{page.slug}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{page.views}</p>
                              <p className="text-sm text-gray-500">wyświetleń</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-900 mb-4">Analiza SEO</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Strony z SEO title</span>
                        <span className="font-bold text-blue-900">
                          {pages.filter(p => p.seo_title).length}/{pages.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Strony z meta description</span>
                        <span className="font-bold text-blue-900">
                          {pages.filter(p => p.seo_description).length}/{pages.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Wpisy bloga zoptymalizowane</span>
                        <span className="font-bold text-blue-900">
                          {blogPosts.filter(p => p.seo_title && p.seo_description).length}/{blogPosts.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-4">Szybkie akcje SEO</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-white hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="font-bold text-green-900">Analiza strony</div>
                        <div className="text-sm text-green-700">Sprawdź SEO</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-bold text-blue-900">Sitemap</div>
                        <div className="text-sm text-blue-700">Generuj XML</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔗</div>
                        <div className="font-bold text-purple-900">Linki</div>
                        <div className="text-sm text-purple-700">Analiza linków</div>
                      </div>
                    </button>

                    <button className="p-4 bg-white hover:bg-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all transform hover:scale-105">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-bold text-orange-900">Raport</div>
                        <div className="text-sm text-orange-700">SEO raport</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
