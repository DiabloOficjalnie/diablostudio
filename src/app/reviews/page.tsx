'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'

interface Review {
  id: string
  firstName: string
  lastName: string
  email: string
  projectDate: string
  projectType: string
  squareMeters: number
  rating: number
  reviewText: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  helpful: number
  projectLocation?: string
}

export default function ReviewsPage() {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedRealization, setSelectedRealization] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [pageData, setPageData] = useState({
    reviews: [] as Review[],
    realizations: [] as any[],
    stats: { totalReviews: 0, averageRating: 0, totalProjects: 0 }
  })

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRealization(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Load reviews from database
  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        // Filter only approved reviews
        const approvedReviews = data.filter((r: Review) => r.status === 'approved')
        setReviews(approvedReviews)
      } else {
        console.error('Failed to load reviews from API')
        // Keep existing reviews as fallback
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      // Keep existing reviews as fallback
    }
    setLoading(false)
  }

  // Transform database reviews to display format
  const displayReviews = reviews.map(review => ({
    id: review.id,
    name: `${review.firstName} ${review.lastName}`,
    company: review.projectLocation || 'Klient indywidualny',
    rating: review.rating,
    comment: review.reviewText,
    date: review.createdAt,
    service: review.projectType,
    verified: true,
    helpful: review.helpful,
    project: review.projectLocation || 'Projekt'
  }))

  const stats = [
    { label: 'Zadowolonych klientów', value: '500+', icon: '😊' },
    { label: 'Wykonanych posadzek', value: '50 000 m²', icon: '📏' },
    { label: 'Lat doświadczenia', value: '10+', icon: '🏆' },
    { label: 'Gwarancja', value: '5 lat', icon: '🛡️' }
  ]

  const realizations = [
    {
      id: 1,
      title: 'Hala produkcyjna - Zakład chemiczny',
      category: 'Przemysł',
      rating: 5,
      reviewCount: 15,
      image: 'bg-gradient-to-br from-gray-300 to-gray-400',
      location: 'Łódź, Polska',
      squareMeters: 500
    },
    {
      id: 2,
      title: 'Garaż podziemny - Apartamentowiec',
      category: 'Dom',
      rating: 5,
      reviewCount: 12,
      image: 'bg-gradient-to-br from-blue-300 to-blue-500',
      location: 'Warszawa, Polska',
      squareMeters: 300
    },
    {
      id: 3,
      title: 'Salon wystawowy - Marka premium',
      category: 'Firma',
      rating: 5,
      reviewCount: 8,
      image: 'bg-gradient-to-br from-green-300 to-green-500',
      location: 'Kraków, Polska',
      squareMeters: 150
    },
    {
      id: 4,
      title: 'Magazyn wysokiego składowania',
      category: 'Przemysł',
      rating: 5,
      reviewCount: 19,
      image: 'bg-gradient-to-br from-orange-300 to-orange-500',
      location: 'Poznań, Polska',
      squareMeters: 800
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ))
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Opinie klientów
              <span className="block text-blue-300">Prawdziwe historie sukcesu</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Przeczytaj, co mówią nasi klienci o współpracy z nami.
              Każda opinia to dowód naszego profesjonalizmu i pasji do tworzenia wyjątkowych posadzek.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-blue-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Reviews Section */}
              <div className="lg:col-span-2">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Ładowanie opinii...</p>
                    </div>
                  </div>
                )}

                {/* Header with Rating and Add Review Button */}
                {!loading && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
                    <div className="mb-6 sm:mb-0">
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Opinie klientów
                      </h2>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 text-3xl mr-3">
                            {'★★★★★'.split('').map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                          <span className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-600 ml-2 text-lg">/ 5.0</span>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-bold text-xl">{reviews.length}</span> opinii
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      Dodaj opinię
                      <span className="ml-2">⭐</span>
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                {!loading && displayReviews.length > 0 && (
                  <div className="space-y-8">
                    {displayReviews.map((review) => (
                      <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mr-6">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="font-bold text-xl text-gray-900 mr-3">{review.name}</h3>
                                {review.verified && (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ✓ Zweryfikowana
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{review.company}</p>
                              <p className="text-gray-500 text-sm">{review.project} • {new Date(review.date).toLocaleDateString('pl-PL')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-gray-500">Usługa: {review.service}</p>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6 text-lg italic">
                          "{review.comment}"
                        </p>

                        <div className="flex items-center justify-between">
                          <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm">
                            👍 Pomocna ({review.helpful})
                          </button>
                          <div className="flex items-center text-gray-400 text-sm">
                            <span>Udostępnij</span>
                            <span className="ml-4">Zgłoś</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && displayReviews.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">⭐</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Brak opinii
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Bądź pierwszy i dodaj opinię o naszych usługach. Twoja opinia pomoże innym klientom w wyborze.
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Dodaj pierwszą opinię
                      <span className="ml-2">⭐</span>
                    </button>
                  </div>
                )}

                {/* Load More Button */}
                {!loading && displayReviews.length > 0 && (
                  <div className="text-center mt-12">
                    <button className="inline-flex items-center px-8 py-4 border-2 border-blue-800 text-blue-800 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105">
                      Załaduj więcej opinii
                      <span className="ml-2">⬇️</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar - Realizations */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Nasze realizacje</h3>

                  {/* Realization Stats */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-blue-900 mb-1">500+</div>
                        <div className="text-sm text-gray-600">Zrealizowanych projektów</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-900 mb-1">15+</div>
                        <div className="text-sm text-gray-600">Lat doświadczenia</div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  <div className="space-y-4 mb-8">
                    {realizations.map((realization) => (
                      <div
                        key={realization.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-xl transition-all duration-300"
                        onClick={() => setSelectedRealization(realization)}
                      >
                        <div className={`h-40 ${realization.image} relative`}>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-3xl">🔍</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 mb-2">{realization.title}</h4>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-2">
                                {'★★★★★'.split('').map((star, i) => (
                                  <span key={i} className="text-sm">{star}</span>
                                ))}
                              </div>
                              <span className="text-gray-600">({realization.reviewCount})</span>
                            </div>
                            <span className="text-blue-600 font-medium">Zobacz →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/realizations"
                    className="block text-center px-6 py-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Zobacz więcej realizacji →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Average Rating Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Średnia ocena klientów</h2>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="flex text-yellow-400 text-5xl mr-6">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <div className="text-6xl font-bold text-blue-900">{averageRating.toFixed(1)}</div>
                <div className="text-2xl text-gray-600 ml-2">/ 5.0</div>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Na podstawie <strong className="text-blue-800">{reviews.length} opinii</strong> klientów
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                  <div className="text-gray-600">Poleciłoby nas znajomym</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-gray-600">Zadowolonych klientów</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.9</div>
                  <div className="text-gray-600">Średnia ocena</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Dołącz do grona zadowolonych klientów
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Skorzystaj z naszej darmowej wyceny i przekonaj się o jakości naszych usług
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 text-xl font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Darmowa wycena
                <span className="ml-2">📋</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-xl font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all"
              >
                Skontaktuj się z nami
                <span className="ml-2">📞</span>
              </a>
            </div>
          </div>
        </section>

        {/* Realization Detail Modal */}
        {selectedRealization && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRealization(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedRealization.title}</h2>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                          selectedRealization.category === 'Przemysł' ? 'bg-orange-500' :
                          selectedRealization.category === 'Dom' ? 'bg-green-500' :
                          selectedRealization.category === 'Biuro' ? 'bg-blue-500' :
                          selectedRealization.category === 'Firma' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}>
                          {selectedRealization.category}
                        </span>
                        <span className="text-blue-200">{selectedRealization.squareMeters}m²</span>
                        <span className="text-blue-200">📍 {selectedRealization.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRealization(null)}
                      className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                      title="Zamknij podgląd (ESC)"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Image Gallery */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Galeria zdjęć</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`bg-gradient-to-br ${selectedRealization.image} rounded-lg h-64 flex items-center justify-center`}>
                        <span className="text-6xl text-white">📷</span>
                      </div>
                      <div className={`bg-gradient-to-br ${selectedRealization.image} rounded-lg h-64 flex items-center justify-center`}>
                        <span className="text-6xl text-white">📷</span>
                      </div>
                      <div className={`bg-gradient-to-br ${selectedRealization.image} rounded-lg h-64 flex items-center justify-center`}>
                        <span className="text-6xl text-white">📷</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Project Details */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Szczegóły projektu</h3>

                      {/* Key Features */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Cechy realizacji</h4>
                        <div className="space-y-2">
                          <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="text-green-600 mr-3 font-bold">✓</span>
                            <span className="text-gray-800 font-medium">Odporność na chemikalia</span>
                          </div>
                          <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="text-green-600 mr-3 font-bold">✓</span>
                            <span className="text-gray-800 font-medium">Łatwość czyszczenia</span>
                          </div>
                          <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="text-green-600 mr-3 font-bold">✓</span>
                            <span className="text-gray-800 font-medium">Antypoślizgowa powierzchnia</span>
                          </div>
                          <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="text-green-600 mr-3 font-bold">✓</span>
                            <span className="text-gray-800 font-medium">Odporność na ścieranie</span>
                          </div>
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Zastosowane materiały</h4>
                        <div className="space-y-2">
                          <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-blue-600 mr-3 font-bold">🔧</span>
                            <span className="text-gray-800 font-medium">Żywica epoksydowa Sika</span>
                          </div>
                          <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-blue-600 mr-3 font-bold">🔧</span>
                            <span className="text-gray-800 font-medium">Grunt epoksydowy</span>
                          </div>
                          <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="text-blue-600 mr-3 font-bold">🔧</span>
                            <span className="text-gray-800 font-medium">Kwarc dekoracyjny</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Dane techniczne</h3>

                      {/* Project Stats */}
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900 mb-1">{selectedRealization.squareMeters}m²</div>
                            <div className="text-sm text-gray-600">Powierzchnia</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-900 mb-1">{selectedRealization.reviewCount}</div>
                            <div className="text-sm text-gray-600">Opinii klientów</div>
                          </div>
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-bold text-blue-900 mb-3">Lokalizacja</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-blue-500 mr-3">📍</span>
                            <span className="text-gray-700">{selectedRealization.location}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-500 mr-3">🏭</span>
                            <span className="text-gray-700">Kategoria: {selectedRealization.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-yellow-900 mb-3">Ocena klientów</h4>
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 text-2xl mr-3">
                            {'★★★★★'.split('').map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{selectedRealization.rating}.0</span>
                        </div>
                        <p className="text-gray-600">Na podstawie {selectedRealization.reviewCount} opinii</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Opis projektu</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Kompleksowa realizacja posadzki epoksydowej w hali produkcyjnej zakładu chemicznego.
                      Posadzka została zaprojektowana z myślą o intensywnej eksploatacji oraz kontakcie z substancjami chemicznymi.
                      Wykorzystano najwyższej jakości materiały, zapewniające długotrwałą ochronę i estetyczny wygląd.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
                    >
                      Zapytaj o podobną realizację
                      <span className="ml-2">💬</span>
                    </a>
                    <a
                      href="/valuation"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-800 text-blue-800 rounded-lg hover:bg-blue-800 hover:text-white transition-colors font-medium"
                    >
                      Oblicz koszt
                      <span className="ml-2">📋</span>
                    </a>
                    <a
                      href="/realizations"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-800 text-green-800 rounded-lg hover:bg-green-800 hover:text-white transition-colors font-medium"
                    >
                      Zobacz wszystkie realizacje
                      <span className="ml-2">🏠</span>
                    </a>
                  </div>



                  {/* Bottom Close Button */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setSelectedRealization(null)}
                      className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Zamknij podgląd
                      <span className="ml-2">✕</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
