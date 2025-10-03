'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface Realization {
  id: string
  title: string
  description: string
  category: string
  status: 'draft' | 'published' | 'featured' | 'archived'
  location?: string
  area?: number
  completion_date?: string
  client_name?: string
  project_type: string
  images: string[]
  thumbnail?: string
  tags?: string[]
  featured?: boolean
  created_at: string
  updated_at: string
  views?: number
}

export default function RealizationsManagementPage() {
  const [realizations, setRealizations] = useState<Realization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'featured' | 'archived'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRealization, setSelectedRealization] = useState<Realization | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadRealizations()
  }, [])

  const loadRealizations = async () => {
    try {
      setLoading(true)

      // Load realizations from API
      const response = await fetch('/api/admin/realizations')
      if (response.ok) {
        const data = await response.json()
        if (data.realizations && Array.isArray(data.realizations)) {
          setRealizations(data.realizations)
        } else {
          // Fallback to mock data if API returns invalid data
          setRealizations(generateMockRealizations())
        }
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.error('Error loading realizations:', error)
      // Fallback to mock data
      setRealizations(generateMockRealizations())
    } finally {
      setLoading(false)
    }
  }

  const generateMockRealizations = (): Realization[] => [
    {
      id: '1',
      title: 'Nowoczesny salon z posadzką dekoracyjną',
      description: 'Elegancka posadzka żywiczna w stylu minimalistycznym dla prywatnego salonu. Projekt łączył nowoczesne wzornictwo z funkcjonalnością, tworząc przestrzeń idealną do wypoczynku.',
      category: 'Przestrzenie mieszkalne',
      status: 'published',
      location: 'Warszawa, Mokotów',
      area: 45,
      completion_date: '2024-01-15',
      client_name: 'Anna Kowalska',
      project_type: 'Posadzka dekoracyjna',
      images: ['/assets/realizations/salon1.jpg', '/assets/realizations/salon2.jpg'],
      thumbnail: '/assets/realizations/salon-thumb.jpg',
      tags: ['salon', 'minimalizm', 'dekoracyjna'],
      featured: true,
      created_at: '2024-01-10T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z',
      views: 1250
    },
    {
      id: '2',
      title: 'Posadzka przemysłowa w hali produkcyjnej',
      description: 'Wytrzymała posadzka epoksydowa dla zakładu produkcyjnego. Projekt uwzględniał intensywne użytkowanie, odporność na chemikalia i łatwość w utrzymaniu czystości.',
      category: 'Obiekty przemysłowe',
      status: 'published',
      location: 'Łódź, Teofilów',
      area: 1200,
      completion_date: '2023-12-20',
      client_name: 'TechProduction Sp. z o.o.',
      project_type: 'Posadzka epoksydowa',
      images: ['/assets/realizations/hala1.jpg', '/assets/realizations/hala2.jpg', '/assets/realizations/hala3.jpg'],
      thumbnail: '/assets/realizations/hala-thumb.jpg',
      tags: ['przemysł', 'epoksyd', 'wytrzymałość'],
      featured: false,
      created_at: '2023-12-15T09:15:00Z',
      updated_at: '2024-01-18T11:45:00Z',
      views: 892
    },
    {
      id: '3',
      title: 'Garaż z posadzką kwarcową',
      description: 'Funkcjonalna i estetyczna posadzka w garażu prywatnym. Zastosowano mieszankę żywiczną z kruszywem kwarcowym dla zwiększenia antypoślizgowości.',
      category: 'Garaże i parkingi',
      status: 'featured',
      location: 'Gdańsk, Oliwa',
      area: 60,
      completion_date: '2024-01-05',
      client_name: 'Piotr Nowak',
      project_type: 'Posadzka kwarcowa',
      images: ['/assets/realizations/garaz1.jpg', '/assets/realizations/garaz2.jpg'],
      thumbnail: '/assets/realizations/garaz-thumb.jpg',
      tags: ['garaż', 'kwarc', 'antypoślizgowa'],
      featured: true,
      created_at: '2023-12-28T16:20:00Z',
      updated_at: '2024-01-05T16:20:00Z',
      views: 567
    },
    {
      id: '4',
      title: 'Restauracja z posadzką 3D',
      description: 'Niepowtarzalna posadzka 3D w restauracji tematycznej. Projekt obejmował wykonanie trójwymiarowego wzoru imitującego głębię oceaniczną.',
      category: 'Obiekty gastronomiczne',
      status: 'draft',
      location: 'Kraków, Kazimierz',
      area: 180,
      client_name: 'Ocean Restaurant',
      project_type: 'Posadzka 3D',
      images: ['/assets/realizations/restauracja1.jpg'],
      thumbnail: '/assets/realizations/restauracja-thumb.jpg',
      tags: ['restauracja', '3D', 'ocean'],
      featured: false,
      created_at: '2024-01-12T13:10:00Z',
      updated_at: '2024-01-19T10:30:00Z',
      views: 0
    },
    {
      id: '5',
      title: 'Biuro nowoczesne z mikrocementem',
      description: 'Eleganckie biuro z posadzką z mikrocementu. Projekt łączył nowoczesny design z praktycznymi rozwiązaniami dla przestrzeni biurowej.',
      category: 'Biura i przestrzenie komercyjne',
      status: 'published',
      location: 'Wrocław, Centrum',
      area: 200,
      completion_date: '2023-11-30',
      client_name: 'Modern Office Solutions',
      project_type: 'Mikrocement',
      images: ['/assets/realizations/biuro1.jpg', '/assets/realizations/biuro2.jpg', '/assets/realizations/biuro3.jpg'],
      thumbnail: '/assets/realizations/biuro-thumb.jpg',
      tags: ['biuro', 'mikrocement', 'nowoczesne'],
      featured: false,
      created_at: '2023-11-25T08:45:00Z',
      updated_at: '2024-01-15T16:15:00Z',
      views: 723
    }
  ]

  const filteredRealizations = realizations.filter(realization => {
    const matchesSearch = (realization.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (realization.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (realization.location && (realization.location || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || realization.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || realization.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'featured': return 'bg-purple-100 text-purple-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Opublikowana'
      case 'featured': return 'Wyróżniona'
      case 'draft': return 'Szkic'
      case 'archived': return 'Zarchiwizowana'
      default: return status
    }
  }

  const categories = Array.from(new Set(realizations.map(r => r.category)))

  const handleDeleteRealization = async (realizationId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę realizację?')) return

    try {
      // Delete realization from database
      const response = await fetch(`/api/admin/realizations?id=${realizationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setRealizations(prev => prev.filter(realization => realization.id !== realizationId))
      } else {
        console.error('Failed to delete realization')
      }
    } catch (error) {
      console.error('Error deleting realization:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie realizacji...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-emerald-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie realizacjami</h1>
              <p className="text-gray-600">Prezentuj ukończone projekty i realizacje firmy</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj realizację
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie projekty</p>
                <p className="text-3xl font-bold text-gray-900">{realizations.length}</p>
                <p className="text-sm text-green-600 mt-1">+{realizations.filter(r => new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opublikowane</p>
                <p className="text-3xl font-bold text-gray-900">{realizations.filter(r => r.status === 'published').length}</p>
                <p className="text-sm text-green-600 mt-1">Widoczne na stronie</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wyróżnione</p>
                <p className="text-3xl font-bold text-gray-900">{realizations.filter(r => r.status === 'featured').length}</p>
                <p className="text-sm text-green-600 mt-1">Na stronie głównej</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Łączne wyświetleń</p>
                <p className="text-3xl font-bold text-gray-900">{realizations.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie projekty</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj realizacji po tytule, lokalizacji lub opisie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <span className="text-lg">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Wszystkie kategorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="published">Opublikowane</option>
                <option value="featured">Wyróżnione</option>
                <option value="draft">Szkice</option>
                <option value="archived">Zarchiwizowane</option>
              </select>

              <button
                onClick={loadRealizations}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Realizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRealizations.map((realization) => (
            <div key={realization.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {realization.thumbnail ? (
                  <img
                    src={realization.thumbnail}
                    alt={realization.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🏗️</div>
                      <div className="text-sm">Brak zdjęcia</div>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(realization.status)}`}>
                    {getStatusText(realization.status)}
                  </span>
                </div>

                {/* Featured Badge */}
                {realization.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      ⭐ Wyróżniona
                    </span>
                  </div>
                )}

                {/* Image Count */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  📷 {realization.images.length}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{realization.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{realization.description}</p>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">📍 Lokalizacja:</span>
                    <span className="font-medium text-gray-900">{realization.location || 'Nie określono'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">📐 Powierzchnia:</span>
                    <span className="font-medium text-gray-900">{realization.area ? `${realization.area}m²` : 'Nie określono'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🏷️ Kategoria:</span>
                    <span className="font-medium text-gray-900">{realization.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">👁️ Wyświetleń:</span>
                    <span className="font-medium text-gray-900">{realization.views?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {/* Tags */}
                {realization.tags && realization.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {realization.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {realization.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{realization.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRealization(realization)
                      setShowPreviewModal(true)
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Podgląd
                  </button>
                  <button
                    onClick={() => setSelectedRealization(realization)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDeleteRealization(realization.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRealizations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak realizacji</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Nie znaleziono realizacji spełniających kryteria wyszukiwania'
                : 'Dodaj pierwszą realizację do portfolio firmy'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              ➕ Dodaj pierwszą realizację
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredRealizations.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="text-sm text-gray-600">
              Pokazano {filteredRealizations.length} z {realizations.length} realizacji
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                ← Poprzednia
              </button>
              <button className="px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* Realization Preview Modal */}
        {showPreviewModal && selectedRealization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Podgląd realizacji</h2>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false)
                      setSelectedRealization(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Images Gallery */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Galeria zdjęć</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedRealization.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-2xl mb-2">📷</div>
                            <div className="text-sm">Zdjęcie {index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-blue-900 mb-4">Informacje o projekcie</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-blue-700">Tytuł projektu</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Kategoria</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Typ projektu</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.project_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Lokalizacja</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.location || 'Nie określono'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Powierzchnia</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.area ? `${selectedRealization.area}m²` : 'Nie określono'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Data ukończenia</p>
                          <p className="font-semibold text-blue-900">{selectedRealization.completion_date ? formatDate(selectedRealization.completion_date) : 'Nie określono'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-green-900 mb-4">Status i statystyki</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-green-700">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRealization.status)}`}>
                            {getStatusText(selectedRealization.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-green-700">Wyświetleń</p>
                          <p className="font-semibold text-green-900">{selectedRealization.views?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700">Data utworzenia</p>
                          <p className="font-semibold text-green-900">{formatDate(selectedRealization.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-700">Ostatnia aktualizacja</p>
                          <p className="font-semibold text-green-900">{formatDate(selectedRealization.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Opis projektu</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedRealization.description}</p>
                  </div>

                  {/* Tags */}
                  {selectedRealization.tags && selectedRealization.tags.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-purple-900 mb-4">Tagi projektu</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRealization.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowPreviewModal(false)
                        setSelectedRealization(null)
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Zamknij
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {/* TODO: Share realization */}}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                      >
                        Udostępnij
                      </button>
                      <button
                        onClick={() => {
                          setShowPreviewModal(false)
                          // Keep selectedRealization for editing
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                      >
                        Edytuj realizację
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-blue-900">Statystyki</div>
              <div className="text-sm text-blue-700 mt-1">Zobacz analitykę</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-bold text-green-900">Wyróżnione</div>
              <div className="text-sm text-green-700 mt-1">Zarządzaj wyróżnionymi</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold text-purple-900">Importuj projekty</div>
              <div className="text-sm text-purple-700 mt-1">Zaimportuj z pliku</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">🎨</div>
              <div className="font-bold text-orange-900">Kategorie</div>
              <div className="text-sm text-orange-700 mt-1">Zarządzaj kategoriami</div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
