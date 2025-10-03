'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface Review {
  id: string
  author_name: string
  author_email?: string
  rating: number
  title?: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  project_type?: string
  location?: string
  created_at: string
  updated_at: string
  verified_purchase?: boolean
  helpful_votes?: number
  images?: string[]
  response?: {
    content: string
    author: string
    created_at: string
  }
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'featured'>('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)

      // Load reviews from API
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews)
        } else {
          // Fallback to mock data if API returns invalid data
          setReviews(generateMockReviews())
        }
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      // Fallback to mock data
      setReviews(generateMockReviews())
    } finally {
      setLoading(false)
    }
  }

  const generateMockReviews = (): Review[] => [
    {
      id: '1',
      author_name: 'Jan Kowalski',
      author_email: 'jan.kowalski@example.com',
      rating: 5,
      title: 'Doskonała jakość i profesjonalizm',
      content: 'Jestem bardzo zadowolony z wykonanej posadzki żywicznej w moim garażu. Praca została wykonana terminowo i z dbałością o szczegóły. Zespół DiabloStudio wykazał się profesjonalizmem i fachowością.',
      status: 'approved',
      project_type: 'Posadzka garażowa',
      location: 'Warszawa',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z',
      verified_purchase: true,
      helpful_votes: 12,
      images: ['/assets/reviews/review1.jpg']
    },
    {
      id: '2',
      author_name: 'Maria Nowak',
      author_email: 'maria.nowak@example.com',
      rating: 4,
      title: 'Solidne wykonanie, polecam',
      content: 'Posadzka w salonie wygląda pięknie i jest bardzo łatwa w utrzymaniu czystości. Jedyny minus to dłuższy czas schnięcia niż się spodziewałam.',
      status: 'pending',
      project_type: 'Posadzka dekoracyjna',
      location: 'Kraków',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T11:45:00Z',
      verified_purchase: true,
      helpful_votes: 8
    },
    {
      id: '3',
      author_name: 'Piotr Wiśniewski',
      author_email: 'piotr.wisniewski@example.com',
      rating: 5,
      title: 'Profesjonalna obsługa od A do Z',
      content: 'Cały proces od wyceny po wykonanie przebiegł bez zarzutu. Posadzka w hali produkcyjnej spełnia wszystkie oczekiwania pod względem wytrzymałości.',
      status: 'featured',
      project_type: 'Posadzka przemysłowa',
      location: 'Gdańsk',
      created_at: '2024-01-05T16:20:00Z',
      updated_at: '2024-01-05T16:20:00Z',
      verified_purchase: true,
      helpful_votes: 15,
      response: {
        content: 'Dziękujemy za pozytywną opinię! Cieszymy się, że posadzka spełnia Państwa oczekiwania.',
        author: 'DiabloStudio',
        created_at: '2024-01-06T10:00:00Z'
      }
    },
    {
      id: '4',
      author_name: 'Anna Jasińska',
      rating: 3,
      title: 'Dobra jakość, ale problemy z komunikacją',
      content: 'Posadzka sama w sobie jest dobrej jakości, jednak komunikacja z firmą pozostawiała wiele do życzenia. Dłuższe terminy realizacji niż obiecywano.',
      status: 'rejected',
      project_type: 'Posadzka żywiczna',
      location: 'Wrocław',
      created_at: '2024-01-12T13:10:00Z',
      updated_at: '2024-01-19T10:30:00Z',
      verified_purchase: false,
      helpful_votes: 2
    },
    {
      id: '5',
      author_name: 'Tomasz Lewandowski',
      author_email: 'tomasz.lewandowski@example.com',
      rating: 5,
      title: 'Polecam serdecznie!',
      content: 'Świetna firma, profesjonalne podejście do klienta. Posadzka w biurze wygląda nowocześnie i jest bardzo funkcjonalna.',
      status: 'approved',
      project_type: 'Posadzka biurowa',
      location: 'Poznań',
      created_at: '2023-12-28T08:45:00Z',
      updated_at: '2024-01-15T16:15:00Z',
      verified_purchase: true,
      helpful_votes: 7
    }
  ]

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = (review.author_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.title && (review.title || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter

    return matchesSearch && matchesStatus && matchesRating
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'featured': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ))
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
      case 'approved': return 'Zatwierdzona'
      case 'pending': return 'Oczekuje'
      case 'rejected': return 'Odrzucona'
      case 'featured': return 'Wyróżniona'
      default: return status
    }
  }

  const handleStatusChange = async (reviewId: string, newStatus: 'approved' | 'rejected' | 'featured') => {
    try {
      // Update review status in database
      // For now, just update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      ))
    } catch (error) {
      console.error('Error updating review status:', error)
    }
  }

  const handleAddResponse = async () => {
    if (!selectedReview || !responseText.trim()) return

    try {
      // Add response to review
      const newResponse = {
        content: responseText,
        author: 'DiabloStudio',
        created_at: new Date().toISOString()
      }

      setReviews(prev => prev.map(review =>
        review.id === selectedReview.id
          ? { ...review, response: newResponse }
          : review
      ))

      setResponseText('')
      setShowResponseModal(false)
      setSelectedReview(null)
    } catch (error) {
      console.error('Error adding response:', error)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę opinię?')) return

    try {
      // Delete review from database
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      } else {
        console.error('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie opinii...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie opiniami</h1>
              <p className="text-gray-600">Moderuj i zarządzaj opiniami klientów</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {/* TODO: Export reviews */}}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                📊 Eksportuj opinie
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie opinie</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
                <p className="text-sm text-green-600 mt-1">+{reviews.filter(r => new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oczekujące</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.filter(r => r.status === 'pending').length}</p>
                <p className="text-sm text-green-600 mt-1">Wymagają moderacji</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zatwierdzone</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.filter(r => r.status === 'approved').length}</p>
                <p className="text-sm text-green-600 mt-1">Opublikowane na stronie</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Średnia ocena</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0')}
                </p>
                <p className="text-sm text-green-600 mt-1">Na podstawie wszystkich opinii</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
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
                  placeholder="Szukaj opinii po autorze lub treści..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <span className="text-lg">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="pending">Oczekujące</option>
                <option value="approved">Zatwierdzone</option>
                <option value="rejected">Odrzucone</option>
                <option value="featured">Wyróżnione</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">Wszystkie oceny</option>
                <option value="5">5 gwiazdek</option>
                <option value="4">4 gwiazdki</option>
                <option value="3">3 gwiazdki</option>
                <option value="2">2 gwiazdki</option>
                <option value="1">1 gwiazdka</option>
              </select>

              <button
                onClick={loadReviews}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Lista opinii ({filteredReviews.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Opinia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Ocena
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-sm font-bold text-gray-900">{review.author_name}</div>
                          {review.verified_purchase && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              ✓ Zweryfikowany zakup
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <div className="text-sm font-semibold text-gray-900 mb-1">{review.title}</div>
                        )}
                        <div className="text-sm text-gray-600 line-clamp-3 mb-2">{review.content}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>👍 {review.helpful_votes || 0}</span>
                          {review.location && <span>• 📍 {review.location}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {getRatingStars(review.rating)}
                      </div>
                      <div className="text-sm font-bold text-gray-900">{review.rating}/5</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {review.project_type || 'Nie określono'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {formatDate(review.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Szczegóły
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(review.id, 'approved')}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Zatwierdź
                            </button>
                            <button
                              onClick={() => handleStatusChange(review.id, 'rejected')}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Odrzuć
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak opinii</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Nie znaleziono opinii spełniających kryteria wyszukiwania'
                  : 'Brak opinii w systemie'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="text-sm text-gray-600">
              Pokazano {filteredReviews.length} z {reviews.length} opinii
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                ← Poprzednia
              </button>
              <button className="px-3 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-700">
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* Review Detail Modal */}
        {selectedReview && !showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Szczegóły opinii</h2>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Review Header */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-900">{selectedReview.author_name}</div>
                        {selectedReview.verified_purchase && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            ✓ Zweryfikowany zakup
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getRatingStars(selectedReview.rating)}
                        </div>
                        <span className="text-lg font-bold text-gray-900">{selectedReview.rating}/5</span>
                      </div>
                    </div>

                    {selectedReview.title && (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedReview.title}</h3>
                    )}

                    <p className="text-gray-700 leading-relaxed mb-4">{selectedReview.content}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {selectedReview.location || 'Nie określono'}</span>
                      <span>🏗️ {selectedReview.project_type || 'Nie określono'}</span>
                      <span>📅 {formatDate(selectedReview.created_at)}</span>
                      <span>👍 {selectedReview.helpful_votes || 0} pomocnych</span>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Status opinii</h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                        {getStatusText(selectedReview.status)}
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedReview.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(selectedReview.id, 'approved')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Zatwierdź
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedReview.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Odrzuć
                            </button>
                          </>
                        )}
                        {selectedReview.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(selectedReview.id, 'featured')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Wyróżnij
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Response Section */}
                  {selectedReview.response ? (
                    <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                      <h3 className="text-lg font-bold text-green-900 mb-4">Odpowiedź firmy</h3>
                      <p className="text-green-800 mb-3">{selectedReview.response.content}</p>
                      <div className="text-sm text-green-700">
                        <span className="font-semibold">{selectedReview.response.author}</span> • {formatDate(selectedReview.response.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Odpowiedź na opinię</h3>
                      <p className="text-gray-600 mb-4">Dodaj odpowiedź na tę opinię, aby podziękować klientowi lub wyjaśnić sytuację.</p>
                      <button
                        onClick={() => setShowResponseModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                      >
                        ➕ Dodaj odpowiedź
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedReview(null)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Zamknij
                    </button>
                    <button
                      onClick={() => {/* TODO: Edit review */}}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Edytuj opinię
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Odpowiedź na opinię</h2>
                  <button
                    onClick={() => {
                      setShowResponseModal(false)
                      setResponseText('')
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Review Preview */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{selectedReview.author_name}</span>
                      <div className="flex items-center gap-1">
                        {getRatingStars(selectedReview.rating)}
                      </div>
                    </div>
                    {selectedReview.title && (
                      <p className="font-semibold text-gray-900 mb-1">{selectedReview.title}</p>
                    )}
                    <p className="text-gray-600 text-sm">{selectedReview.content}</p>
                  </div>

                  {/* Response Form */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Twoja odpowiedź
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Napisz profesjonalną odpowiedź na opinię klienta..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowResponseModal(false)
                        setResponseText('')
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleAddResponse}
                      disabled={!responseText.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Opublikuj odpowiedź
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-green-900">Raport opinii</div>
              <div className="text-sm text-green-700 mt-1">Zobacz statystyki</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-bold text-blue-900">Wyróżnione opinie</div>
              <div className="text-sm text-blue-700 mt-1">Zarządzaj wyróżnionymi</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold text-purple-900">Eksport opinii</div>
              <div className="text-sm text-purple-700 mt-1">Eksportuj do CSV</div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
