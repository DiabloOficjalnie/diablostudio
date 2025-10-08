'use client'

import { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'

interface Realization {
  id: string
  title: string
  category: 'Firma' | 'Przemysł' | 'Dom' | 'Biuro' | 'Inne'
  description: string
  materials: string[]
  features: string[]
  squareMeters: number
  location: string
  tags: string[]
  images: string[]
  youtubeVideoId?: string
  completionDate: string
  isPublished: boolean
}

export default function RealizationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie')
  const [selectedRealization, setSelectedRealization] = useState<Realization | null>(null)
  const [realizations, setRealizations] = useState<Realization[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ['Wszystkie', 'Firma', 'Przemysł', 'Dom', 'Biuro', 'Inne']

  const filteredRealizations = selectedCategory === 'Wszystkie'
    ? realizations
    : realizations.filter(r => r.category === selectedCategory)

  useEffect(() => {
    loadRealizations()
  }, [])

  const loadRealizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/realizations')
      if (response.ok) {
        const data = await response.json()
        // Filter only published realizations
        const publishedRealizations = data.filter((r: Realization) => r.isPublished)
        setRealizations(publishedRealizations)
      } else {
        console.error('Failed to load realizations from API')
        setRealizations([])
      }
    } catch (error) {
      console.error('Error loading realizations:', error)
      setRealizations([])
    }
    setLoading(false)
  }

  const openModal = (realization: Realization) => {
    setSelectedRealization(realization)
  }

  const closeModal = () => {
    setSelectedRealization(null)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nasze realizacje</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zobacz przykłady naszych realizacji i przekonaj się o jakości naszych posadzek żywicznych.
            Każda realizacja to dowód naszego profesjonalizmu i dbałości o szczegóły.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie realizacji...</p>
            </div>
          </div>
        )}

        {/* Realizations Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredRealizations.map((realization) => (
              <div
                key={realization.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => openModal(realization)}
              >
                {/* Image Gallery */}
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-gray-200">
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-4xl drop-shadow-lg">🔍</span>
                  </div>
                  {realization.images.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                      📷 {realization.images.length} zdjęć
                    </div>
                  )}
                  {realization.youtubeVideoId && (
                    <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                      🎥 Video
                    </div>
                  )}
                  {/* Always show placeholder text when no images */}
                  {realization.images.length === 0 && !realization.youtubeVideoId && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
                        <span className="text-3xl text-gray-400 mb-2 block">🏗️</span>
                        <p className="text-sm text-gray-600 font-medium">Zdjęcie w przygotowaniu</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
                      {realization.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        realization.category === 'Przemysł' ? 'bg-orange-100 text-orange-800' :
                        realization.category === 'Dom' ? 'bg-green-100 text-green-800' :
                        realization.category === 'Biuro' ? 'bg-blue-100 text-blue-800' :
                        realization.category === 'Firma' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {realization.category}
                      </span>
                      <span className="text-sm text-gray-500">{realization.squareMeters}m²</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{realization.description}</p>

                  {/* Key Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {realization.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Location and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="mr-1">📍</span>
                      {realization.location}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      {new Date(realization.completionDate).toLocaleDateString('pl-PL')}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {realization.tags.slice(0, 4).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-900 transition-colors font-medium">
                    Zobacz szczegóły
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredRealizations.length === 0 && !loading && (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-6">🏗️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Brak realizacji w tej kategorii
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Aktualnie nie mamy realizacji w wybranej kategorii, ale realizujemy projekty na zamówienie.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    Zapytaj o realizację
                    <span className="ml-2">💬</span>
                  </a>
                  <button
                    onClick={() => setSelectedCategory('Wszystkie')}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Pokaż wszystkie
                    <span className="ml-2">📋</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Process Section - Similar to Main Page */}
        <section id="process" className="py-12 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
                <span className="text-4xl">🔄</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Nasz proces realizacji – Twój projekt w 5 krokach
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Transparentny proces od pierwszego kontaktu do finalnego odbioru.
                Każdy etap jest dokładnie zaplanowany i realizowany z dbałością o szczegóły.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1️⃣
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Pomiary i analiza</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-blue-800">Zaczynamy od wizyty na miejscu,</strong> aby dokładnie zmierzyć powierzchnię
                  i poznać specyfikę podłoża. Badamy parametry techniczne, wilgotność, równość i stabilność podłoża.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-900 mb-2">✓ Badanie wilgotności</div>
                  <div className="text-sm font-semibold text-blue-900 mb-2">✓ Test przyczepności</div>
                  <div className="text-sm font-semibold text-blue-900">✓ Analiza podłoża</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2️⃣
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-4">Profesjonalna wycena</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-green-800">Tworzymy szczegółowy kosztorys,</strong> w którym każda pozycja jest dokładnie wyszczególniona.
                  Wiesz dokładnie, za co płacisz – bez ukrytych kosztów.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-green-900 mb-2">✓ Szczegółowy kosztorys</div>
                  <div className="text-sm font-semibold text-green-900 mb-2">✓ Brak ukrytych kosztów</div>
                  <div className="text-sm font-semibold text-green-900">✓ Transparentne warunki</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3️⃣
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4">Aplikacja posadzki</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-purple-800">Profesjonalne przygotowanie podłoża</strong> oraz aplikacja systemu żywicznego
                  przez doświadczony zespół. Dbamy o każdy detal – od gruntowania po końcowe wykończenie dekoracyjne.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-900 mb-2">✓ Profesjonalny zespół</div>
                  <div className="text-sm font-semibold text-purple-900 mb-2">✓ Dokładne wykonanie</div>
                  <div className="text-sm font-semibold text-purple-900">✓ Wykończenie dekoracyjne</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    4️⃣
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-orange-900 mb-4">Odbiór i gwarancja</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-orange-800">Po zakończeniu prac odbierasz posadzkę</strong> i otrzymujesz umowę gwarancyjną –
                  pełną pewność jakości i trwałości na wykonane prace.
                </p>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-orange-900 mb-2">✓ Protokół odbioru</div>
                  <div className="text-sm font-semibold text-orange-900 mb-2">✓ Umowa gwarancyjna</div>
                  <div className="text-sm font-semibold text-orange-900">✓ Pełna dokumentacja</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    5️⃣
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">Platforma klienta</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-indigo-800">Śledź czas gwarancji,</strong> przeglądaj faktury i zdjęcia przed i po realizacji,
                  korzystaj z rabatów oraz zyskuj wsparcie eksperta zawsze, gdy potrzebujesz.
                </p>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-indigo-900 mb-2">✓ Monitoring gwarancji</div>
                  <div className="text-sm font-semibold text-indigo-900 mb-2">✓ Dokumentacja online</div>
                  <div className="text-sm font-semibold text-indigo-900">✓ Wsparcie eksperta</div>
                </div>
              </div>
            </div>

            {/* Process Benefits */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Dlaczego warto nam zaufać?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-bold text-blue-900 mb-2">Transparentność</h4>
                  <p className="text-sm text-gray-700">
                    Każdy etap jest dokładnie opisany i zaplanowany, bez niespodzianek
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-3">👥</div>
                  <h4 className="font-bold text-green-900 mb-2">Doświadczony zespół</h4>
                  <p className="text-sm text-gray-700">
                    Certyfikowani specjaliści z wieloletnim doświadczeniem w branży
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h4 className="font-bold text-purple-900 mb-2">Pełna gwarancja</h4>
                  <p className="text-sm text-gray-700">
                    Kompleksowa ochrona inwestycji z platformą klienta i stałym wsparciem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-blue-800 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Masz projekt do realizacji?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Skontaktuj się z nami i dołącz do grona zadowolonych klientów
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-800 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skontaktuj się z nami
              <span className="ml-2">📞</span>
            </a>
            <a
              href="/valuation"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-medium rounded-lg hover:bg-white hover:text-blue-800 transition-colors"
            >
              Oblicz wycenę
              <span className="ml-2">📋</span>
            </a>
          </div>
        </div>
      </div>

      {/* Realization Detail Modal */}
      {selectedRealization && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">{selectedRealization.title}</h2>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        selectedRealization.category === 'Przemysł' ? 'bg-orange-500 text-white' :
                        selectedRealization.category === 'Dom' ? 'bg-green-500 text-white' :
                        selectedRealization.category === 'Biuro' ? 'bg-blue-500 text-white' :
                        selectedRealization.category === 'Firma' ? 'bg-purple-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {selectedRealization.category}
                      </span>
                      <span className="text-blue-100 font-semibold">{selectedRealization.squareMeters}m²</span>
                      <span className="text-blue-100 font-semibold">📍 {selectedRealization.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 text-3xl font-bold bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                {/* Image Gallery */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Galeria zdjęć</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedRealization.images.length > 0 ? (
                      selectedRealization.images.map((image, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <span className="text-4xl text-gray-400 mb-2 block">📷</span>
                            <p className="text-sm text-gray-600 font-semibold">Zdjęcie {index + 1}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <span className="text-6xl text-gray-400 mb-4 block">📷</span>
                          <p className="text-lg text-gray-600 font-semibold mb-2">Brak zdjęć</p>
                          <p className="text-sm text-gray-500">Zdjęcia będą dostępne po dodaniu realizacji</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* YouTube Video */}
                {selectedRealization.youtubeVideoId && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Film z realizacji</h3>
                    <div className="w-full rounded-lg overflow-hidden bg-black">
                      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${selectedRealization.youtubeVideoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Description */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-blue-900">Opis projektu</h3>
                    <p className="text-gray-800 leading-relaxed mb-6 text-lg font-medium">{selectedRealization.description}</p>

                    {/* Materials */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 text-green-900">Zastosowane materiały</h4>
                      <div className="space-y-3">
                        {selectedRealization.materials.map((material, index) => (
                          <div key={index} className="flex items-center bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <span className="text-blue-600 mr-3 text-xl">🔧</span>
                            <span className="text-gray-800 font-medium">{material}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Features & Details */}
                  <div className="space-y-6">
                    {/* Features */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 text-purple-900">Cechy realizacji</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedRealization.features.map((feature, index) => (
                          <div key={index} className="flex items-center bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <span className="text-green-600 mr-3 text-xl">✓</span>
                            <span className="text-gray-800 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 text-indigo-900">Szczegóły projektu</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-semibold">Powierzchnia:</span>
                          <span className="font-bold text-gray-900 text-lg">{selectedRealization.squareMeters}m²</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-semibold">Lokalizacja:</span>
                          <span className="font-bold text-gray-900 text-lg">{selectedRealization.location}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-semibold">Data realizacji:</span>
                          <span className="font-bold text-gray-900 text-lg">
                            {new Date(selectedRealization.completionDate).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Tagi</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRealization.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
