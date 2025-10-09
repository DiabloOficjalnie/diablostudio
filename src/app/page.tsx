'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import MainLayout from './components/MainLayout'
import ReviewForm from './components/ReviewForm'

interface Review {
  id: string
  name: string
  company: string
  rating: number
  comment: string
  date: string
  service: string
  verified: boolean
  helpful: number
  project: string
}

interface Realization {
  id: string
  title: string
  category: string
  rating: number
  reviewCount: number
  image: string
  location: string
  squareMeters: number
}

interface PageData {
  reviews: Review[]
  realizations: Realization[]
  stats: {
    totalReviews: number
    averageRating: number
    totalProjects: number
  }
}

interface PricingData {
  material_costs: {
    resin_types: {
      epoxy_standard: { cost_per_sqm: number, name: string },
      epoxy_premium: { cost_per_sqm: number, name: string },
      pu_standard: { cost_per_sqm: number, name: string },
      pu_premium: { cost_per_sqm: number, name: string }
    }
  }
}

export default function HomePage() {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [pageData, setPageData] = useState<PageData>({
    reviews: [],
    realizations: [],
    stats: { totalReviews: 0, averageRating: 0, totalProjects: 0 }
  })
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({})

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const res = await fetch('/api/reviews/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: reviewData.firstName,
          lastName: reviewData.lastName,
          email: reviewData.email,
          projectDate: reviewData.projectDate,
          projectType: reviewData.projectType,
          squareMeters: Number(reviewData.squareMeters),
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Błąd podczas zapisu opinii')
      }
      alert('Dziękujemy! Twoja opinia została zapisana i czeka na weryfikację.')
      setShowReviewForm(false)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Wystąpił błąd podczas wysyłania opinii. Spróbuj ponownie.')
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      setShowNavigation(false)
    }
  }

  const navigationItems = [
    { id: 'hero', name: 'Strona główna', icon: '🏠' },
    { id: 'why-resin', name: 'Dlaczego żywiczne?', icon: '🏗️' },
    { id: 'comparison', name: 'Porównanie', icon: '⚖️' },
    { id: 'decorative', name: 'Systemy dekoracyjne', icon: '🎨' },
    { id: 'pricing', name: 'Cennik', icon: '💰' },
    { id: 'process', name: 'Jak pracujemy', icon: '🔄' },
    { id: 'reviews', name: 'Opinie', icon: '⭐' },
    { id: 'faq', name: 'FAQ', icon: '❓' },
    { id: 'why-us', name: 'Dlaczego my?', icon: '🏆' },
    { id: 'contact', name: 'Kontakt', icon: '📞' }
  ]

  // Load data from database
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/main-page-data')
        if (response.ok) {
          const data = await response.json()
          setPageData(data)
        } else {
          console.error('Failed to load page data')
          // Keep default empty state
        }
      } catch (error) {
        console.error('Error loading page data:', error)
        // Keep default empty state
      }
      setLoading(false)
    }

    loadPageData()
  }, [])

  // Load pricing data from database
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const response = await fetch('/api/contractor-pricing')
        if (response.ok) {
          const data = await response.json()
          setPricingData(data.pricing_data)
        } else {
          console.error('Failed to load pricing data')
        }
      } catch (error) {
        console.error('Error loading pricing data:', error)
      }
    }

    loadPricingData()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [navigationItems])

  return (
    <MainLayout>


      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/assets/hero-header.png)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                DecoSol — Profesjonalne posadzki żywiczne
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                Tworzymy nowoczesne posadzki żywiczne: garaże, tarasy, hale i luksusowe wnętrza.
                Zobacz nasze realizacje, przeczytaj poradniki i otrzymaj darmową wycenę.
              </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/valuation"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Darmowa wycena
              <span className="ml-2">📋</span>
            </a>
            <a
              href="/realizations"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-xl font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all"
            >
              Zobacz realizacje
              <span className="ml-2">🏠</span>
            </a>
          </div>
        </div>
      </section>

      {/* Why Resin Floors? (USP) - Enhanced Design */}
      <section id="why-resin" className="py-12 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Introduction */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6 animate-pulse">
              <span className="text-4xl">🏗️</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Dlaczego posadzki żywiczne?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nowoczesne rozwiązanie łączące <strong className="text-blue-800">trwałość</strong>,
              <strong className="text-green-800"> estetykę</strong> i <strong className="text-purple-800">funkcjonalność</strong>
            </p>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Durability Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-blue-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">💪</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                    <span className="text-3xl">💪</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Trwałość</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Wyjątkowa odporność na uszkodzenia mechaniczne, chemiczne i termiczne.
                  <strong className="text-blue-800"> Odporne na ścieranie, uderzenia</strong> oraz działanie substancji chemicznych.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">10-25 lat</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Odporność chemiczna</span>
                </div>
              </div>
            </div>

            {/* Aesthetics Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-green-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🎨</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Estetyka</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Szeroka gama <strong className="text-green-800">kolorów i wykończeń</strong> – od wysokiego połysku po matowe.
                  <strong className="text-green-800"> Brak fug i spoin</strong> zapewnia jednolitą, elegancką powierzchnię.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Wysoki połysk</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Bezspoinowe</span>
                </div>
              </div>
            </div>

            {/* Versatility Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-purple-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🔧</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                    <span className="text-3xl">🔧</span>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900">Wszechstronność</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Idealne rozwiązanie dla <strong className="text-purple-800">każdego sektora</strong> – od hal przemysłowych po mieszkania.
                  Sprawdzają się w miejscach o dużym natężeniu ruchu.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Domy i biura</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Hale przemysłowe</span>
                </div>
              </div>
            </div>

            {/* Easy Maintenance Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-yellow-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🧽</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl mr-4 group-hover:bg-yellow-200 transition-colors">
                    <span className="text-3xl">🧽</span>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-900">Łatwe utrzymanie</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-yellow-800">Higieniczne i proste</strong> w codziennej pielęgnacji.
                  Gładka powierzchnia nie gromadzi brudu ani kurzu.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Łatwe czyszczenie</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Higieniczne</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Gotowy na nowoczesną posadzkę?</h3>
            <p className="text-xl mb-6 opacity-90">
              Dowiedz się, jak posadzki żywiczne mogą odmienić Twoje wnętrze
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Darmowa wycena
                <span className="ml-2">📋</span>
              </a>
              <a
                href="/guide"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                Przeczytaj poradnik
                <span className="ml-2">📖</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Floor Comparison */}
      <section id="comparison" className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Posadzki żywiczne vs tradycyjne rozwiązania
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Pełne porównanie właściwości, trwałości i zastosowań różnych systemów podłogowych.
              Dowiedz się, które rozwiązanie najlepiej sprawdzi się w Twojej przestrzeni.
            </p>
          </div>

          {/* Epoxy vs Polyurethane Comparison */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Epoksyd vs Poliuretan – szczegółowe porównanie
            </h3>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="font-bold text-lg">Cecha</div>
                  <div className="font-bold text-lg flex items-center justify-center">
                    <span className="bg-blue-500 px-3 py-1 rounded-full mr-2">🧪</span>
                    Epoksyd
                  </div>
                  <div className="font-bold text-lg flex items-center justify-center">
                    <span className="bg-green-500 px-3 py-1 rounded-full mr-2">🌊</span>
                    Poliuretan
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-blue-50 transition-colors">
                  <div className="font-semibold text-gray-900">Twardość i odporność mechaniczna</div>
                  <div className="text-gray-700">Bardzo twarde, odporne na ścieranie i uderzenia</div>
                  <div className="text-gray-700">Elastyczne, odporne na odkształcenia</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-green-50 transition-colors">
                  <div className="font-semibold text-gray-900">Odporność chemiczna</div>
                  <div className="text-green-800 font-medium">Wysoka na większość chemikaliów</div>
                  <div className="text-gray-700">Dobra, mniej odporne na rozpuszczalniki</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-purple-50 transition-colors">
                  <div className="font-semibold text-gray-900">Odporność na UV</div>
                  <div className="text-red-600">Niska, może żółknąć</div>
                  <div className="text-green-800 font-medium">Wysoka, zachowuje kolor</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-yellow-50 transition-colors">
                  <div className="font-semibold text-gray-900">Elastyczność</div>
                  <div className="text-gray-700">Niska</div>
                  <div className="text-green-800 font-medium">Wysoka, odporność na pęknięcia</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-indigo-50 transition-colors">
                  <div className="font-semibold text-gray-900">Trwałość</div>
                  <div className="text-gray-700">10–20 lat</div>
                  <div className="text-gray-700">10–15 lat na zewnątrz</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-pink-50 transition-colors">
                  <div className="font-semibold text-gray-900">Zastosowanie</div>
                  <div className="text-gray-700">Garaże, magazyny, hale produkcyjne</div>
                  <div className="text-gray-700">Tarasy, balkony, domy</div>
                </div>
              </div>
            </div>

            {/* Mobile Accordion */}
            <div className="lg:hidden space-y-4">
              <details className="bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800" open>
                <summary className="p-6 font-bold text-lg text-gray-900 cursor-pointer hover:bg-blue-50 transition-colors">
                  <span className="mr-3">🧪</span> Epoksyd - właściwości i zastosowanie
                </summary>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div><strong>Twardość:</strong> Bardzo twarde, odporne na ścieranie</div>
                    <div><strong>Odporność chemiczna:</strong> Wysoka</div>
                    <div><strong>UV:</strong> Niska, może żółknąć</div>
                    <div><strong>Zastosowanie:</strong> Hale przemysłowe, magazyny</div>
                  </div>
                </div>
              </details>

              <details className="bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800" open>
                <summary className="p-6 font-bold text-lg text-gray-900 cursor-pointer hover:bg-green-50 transition-colors">
                  <span className="mr-3">🌊</span> Poliuretan - właściwości i zastosowanie
                </summary>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    <div><strong>Twardość:</strong> Elastyczne, odporne na odkształcenia</div>
                    <div><strong>Odporność chemiczna:</strong> Dobra</div>
                    <div><strong>UV:</strong> Wysoka, zachowuje kolor</div>
                    <div><strong>Zastosowanie:</strong> Tarasy, balkony, zewnętrzne</div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Traditional Floorings Comparison */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Porównanie z tradycyjnymi systemami podłogowymi
            </h3>

            {/* Desktop Comparison Cards */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Resin Floors */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                      <span className="text-2xl">🧪</span>
                    </div>
                    <h4 className="text-xl font-bold text-blue-900">Posadzki żywiczne</h4>
                    <p className="text-sm text-gray-600">Epoksyd/PU</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Trwałość:</span>
                      <span className="text-green-600 font-medium">10–20 lat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność na ścieranie:</span>
                      <span className="text-green-600 font-medium">Wysoka</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność chemiczna:</span>
                      <span className="text-green-600 font-medium">Wysoka</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Łatwość utrzymania:</span>
                      <span className="text-green-600 font-medium">Bardzo łatwe</span>
                    </div>
                  </div>
                </div>

                {/* Laminate Panels */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-orange-500">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <h4 className="text-xl font-bold text-orange-900">Panele laminowane</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Trwałość:</span>
                      <span className="text-yellow-600">5–15 lat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność na ścieranie:</span>
                      <span className="text-yellow-600">Średnia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność chemiczna:</span>
                      <span className="text-red-600">Niska</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Łatwość utrzymania:</span>
                      <span className="text-yellow-600">Łatwe</span>
                    </div>
                  </div>
                </div>

                {/* Ceramic Tiles */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-gray-500">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                      <span className="text-2xl">🧱</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Płytki ceramiczne</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Trwałość:</span>
                      <span className="text-green-600 font-medium">15–30 lat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność na ścieranie:</span>
                      <span className="text-green-600 font-medium">Wysoka</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność chemiczna:</span>
                      <span className="text-green-600 font-medium">Wysoka</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Łatwość utrzymania:</span>
                      <span className="text-yellow-600">Średnie</span>
                    </div>
                  </div>
                </div>

                {/* Carpet/Vinyl */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                      <span className="text-2xl">🧶</span>
                    </div>
                    <h4 className="text-xl font-bold text-green-900">Wykładziny</h4>
                    <p className="text-sm text-gray-600">Dywan/PCV</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Trwałość:</span>
                      <span className="text-red-600">5–10 lat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność na ścieranie:</span>
                      <span className="text-red-600">Niska</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Odporność chemiczna:</span>
                      <span className="text-red-600">Niska</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Łatwość utrzymania:</span>
                      <span className="text-red-600">Trudne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Accordion for Traditional */}
            <div className="md:hidden space-y-4">
              <details className="bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800" open>
                <summary className="p-6 font-bold text-lg text-gray-900 cursor-pointer hover:bg-blue-50 transition-colors">
                  <span className="mr-3">🧪</span> Posadzki żywiczne - vs tradycyjne
                </summary>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Trwałość:</span>
                      <span className="text-green-600 font-bold">10–20 lat</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Odporność chemiczna:</span>
                      <span className="text-green-600 font-bold">Wysoka</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Łatwość utrzymania:</span>
                      <span className="text-green-600 font-bold">Bardzo łatwe</span>
                    </div>
                  </div>
                </div>
              </details>

              <details className="bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800" open>
                <summary className="p-6 font-bold text-lg text-gray-900 cursor-pointer hover:bg-orange-50 transition-colors">
                  <span className="mr-3">🏠</span> Panele laminowane - właściwości
                </summary>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Trwałość:</span>
                      <span className="text-yellow-600">5–15 lat</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Odporność chemiczna:</span>
                      <span className="text-red-600">Niska</span>
                    </div>
                  </div>
                </div>
              </details>

              <details className="bg-white rounded-xl shadow-lg border border-gray-200 text-gray-800" open>
                <summary className="p-6 font-bold text-lg text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="mr-3">🧱</span> Płytki ceramiczne - właściwości
                </summary>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Trwałość:</span>
                      <span className="text-green-600 font-bold">15–30 lat</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Odporność chemiczna:</span>
                      <span className="text-green-600 font-bold">Wysoka</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Conclusions Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Wnioski z literatury i praktyki branżowej
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-3">🏭</div>
                <h4 className="font-bold text-blue-900 mb-2">Epoksyd – przemysł</h4>
                <p className="text-sm text-gray-700">
                  Najlepszy do intensywnie użytkowanych przestrzeni wewnętrznych, gdzie liczy się twardość i odporność chemiczna.
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl mb-3">🏠</div>
                <h4 className="font-bold text-green-900 mb-2">Poliuretan – zewnętrze</h4>
                <p className="text-sm text-gray-700">
                  Idealny do przestrzeni zewnętrznych oraz miejsc wymagających elastyczności i odporności na UV.
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-3">⚖️</div>
                <h4 className="font-bold text-purple-900 mb-2">Wybór zależy od potrzeb</h4>
                <p className="text-sm text-gray-700">
                  Panele – ekonomiczne, płytki – trwałe, wykładziny – komfortowe, ale żywiczne łączą wszystkie zalety.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Która posadzka pasuje do Ciebie?</h3>
            <p className="text-xl mb-6 opacity-90">
              Porozmawiaj z naszymi ekspertami i dobierz idealne rozwiązanie
            </p>
            <a
              href="/valuation"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Zamów wycenę posadzki żywicznej
              <span className="ml-2">📋</span>
            </a>
          </div>
        </div>
      </section>

      {/* Decorative Systems - Comprehensive */}
      <section id="decorative" className="py-12 bg-gradient-to-br from-white via-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Systemy dekoracyjne posadzek żywicznych
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Różnorodność wykończeń pozwala stworzyć unikalną przestrzeń dostosowaną do Twojego stylu i potrzeb.
              Każdy system łączy estetykę z funkcjonalnością żywicy epoksydowej lub poliuretanowej.
            </p>
          </div>

          {/* Decorative Systems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Gładkie */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-blue-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">✨</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Gładkie</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Minimalistyczne, bezspoinowe wykończenie. <strong className="text-blue-800">Idealne do nowoczesnych wnętrz</strong> –
                  biur, salonów, recepcji. Czysta elegancja i łatwe utrzymanie czystości.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Nowoczesne biura</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Łatwe czyszczenie</span>
                </div>
              </div>
            </div>

            {/* Z płatkami */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-orange-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">🎨</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl mr-4 group-hover:bg-orange-200 transition-colors">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-orange-900">Z płatkami</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-orange-800">Dekoracyjne płatki zwiększają odporność na zarysowania</strong> i nadają powierzchni
                  wyjątkowego charakteru. Doskonałe do garaży, kuchni przemysłowych i przestrzeni komercyjnych.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Garaże</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Kuchnie przemysłowe</span>
                </div>
              </div>
            </div>

            {/* Efekt marmuru */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-purple-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">🏛️</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900">Efekt marmuru</h3>
                </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong className="text-purple-800">Wielobarwny design inspirowany naturalnym kamieniem.</strong>
                    Luksusowy wygląd do salonów, recepcji czy showroomów, łączący estetykę z trwałością żywicy.
                  </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Salony</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Showroomy</span>
                </div>
              </div>
            </div>

            {/* Strukturalne */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-green-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">🛡️</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Strukturalne</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Powierzchnia z <strong className="text-green-800">wyczuwalną strukturą, zwiększająca bezpieczeństwo.</strong>
                  Idealne w przestrzeniach przemysłowych, magazynach, kuchniach lub na zewnątrz.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Antypoślizgowe</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Bezpieczeństwo</span>
                </div>
              </div>
            </div>

            {/* Transparentne */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-cyan-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">🔍</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-cyan-100 rounded-xl mr-4 group-hover:bg-cyan-200 transition-colors">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-900">Transparentne</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-cyan-800">Przeźroczysta żywica pozwala zobaczyć zatopione dekoracje</strong> –
                  kruszywo, grafiki, logotypy. Stosowane w designerskich wnętrzach, recepcjach, tarasach.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Designerskie</span>
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Z grafiką</span>
                </div>
              </div>
            </div>

            {/* Antystatyczne */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-yellow-500">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-5xl">⚡</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl mr-4 group-hover:bg-yellow-200 transition-colors">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-900">Antystatyczne</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong className="text-yellow-800">Specjalne posadzki przewodzące ładunki elektrostatyczne,</strong>
                  chroniące wrażliwe urządzenia elektroniczne. Idealne do laboratoriów, serwerowni, hal produkcyjnych.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Laboratoria</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Serwerownie</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Dlaczego systemy dekoracyjne?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-bold text-blue-900 mb-2">Dopasowanie do stylu</h4>
                <p className="text-sm text-gray-700">
                  Każdy system można dostosować do indywidualnych preferencji i charakteru wnętrza
                </p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-3">🔬</div>
                <h4 className="font-bold text-green-900 mb-2">Trwałość i funkcjonalność</h4>
                <p className="text-sm text-gray-700">
                  Łączy walory estetyczne z praktycznymi właściwościami żywicy epoksydowej i poliuretanowej
                </p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-3">🚀</div>
                <h4 className="font-bold text-purple-900 mb-2">Szerokie zastosowanie</h4>
                <p className="text-sm text-gray-700">
                  Od domów prywatnych po przestrzenie przemysłowe i komercyjne
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Który system dekoracyjny Cię interesuje?</h3>
            <p className="text-xl mb-6 opacity-90">
              Nasi eksperci pomogą wybrać idealne wykończenie dla Twojej przestrzeni
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Wybierz system dekoracyjny
                <span className="ml-2">🎨</span>
              </a>
              <a
                href="/realizations"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all"
              >
                Zobacz realizacje
                <span className="ml-2">🏠</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Pricing Section */}
      <section id="pricing" className="py-12 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-6">
              <span className="text-4xl">💰</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Ceny posadzek żywicznych
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Szczegółowy cennik posadzek epoksydowych i poliuretanowych.
              Ceny orientacyjne za m², zależne od specyfikacji projektu i warunków wykonania.
            </p>
          </div>

          {/* Epoxy Pricing */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-blue-900 mb-4">
                🧪 Posadzki epoksydowe
              </h3>
              <p className="text-lg text-gray-600">
                Trwałe i odporne na uszkodzenia mechaniczne oraz chemiczne
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Epoxy Standard */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-blue-500">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <span className="text-3xl">🧪</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-blue-900">Standard</h4>
                    <p className="text-sm text-gray-600">Ekonomiczne rozwiązanie</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    od {pricingData?.material_costs?.resin_types?.epoxy_standard?.cost_per_sqm || 150} PLN/m²
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Warianty cienkowarstwowe epoksydowe, często w wersji bez dekoracji.
                    Idealne dla standardowych zastosowań wymagających podstawowej ochrony.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Podstawowa ochrona</span>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Szybka aplikacja</span>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Wysoka twardość</span>
                  </div>
                </div>
              </div>

              {/* Epoxy Premium */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-indigo-500">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-indigo-900">Premium</h4>
                    <p className="text-sm text-gray-600">Dekoracyjne i specjalistyczne</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">od {pricingData?.material_costs?.resin_types?.epoxy_premium?.cost_per_sqm || 200} PLN/m²</div>
                  <p className="text-gray-700 leading-relaxed">
                    W zależności od wybranego systemu, grubości powłoki oraz dodatkowych efektów dekoracyjnych,
                    takich jak płatki, efekty marmuru czy metallic.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Efekty dekoracyjne</span>
                  </div>
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Grubsze powłoki</span>
                  </div>
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Wyższa odporność</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Polyurethane Pricing */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-green-900 mb-4">
                🌊 Posadzki poliuretanowe
              </h3>
              <p className="text-lg text-gray-600">
                Elastyczne i odporne na UV, idealne dla zastosowań zewnętrznych
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* PU Standard */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-green-500">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <span className="text-3xl">🌊</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-green-900">Standard</h4>
                    <p className="text-sm text-gray-600">Podstawowe powłoki</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">od {pricingData?.material_costs?.resin_types?.pu_standard?.cost_per_sqm || 180} PLN/m²</div>
                  <p className="text-gray-700 leading-relaxed">
                    Podstawowe powłoki poliuretanowe o dobrych właściwościach mechanicznych.
                    Odpowiednie dla standardowych zastosowań wewnętrznych i zewnętrznych.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Elastyczność</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Odporność na UV</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Łatwa aplikacja</span>
                  </div>
                </div>
              </div>

              {/* PU Premium */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-emerald-500">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl mr-4">
                    <span className="text-3xl">💎</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-emerald-900">Premium</h4>
                    <p className="text-sm text-gray-600">Specjalistyczne właściwości</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">od {pricingData?.material_costs?.resin_types?.pu_premium?.cost_per_sqm || 320} PLN/m²</div>
                  <p className="text-gray-700 leading-relaxed">
                    W zależności od specyfikacji technicznych, takich jak odporność na UV,
                    elastyczność czy dodatkowe właściwości antypoślizgowe.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Maksymalna odporność UV</span>
                  </div>
                  <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Właściwości antypoślizgowe</span>
                  </div>
                  <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-green-800 mr-2">✓</span>
                    <span className="text-sm font-bold text-gray-900">Najwyższa elastyczność</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Factors */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Co wpływa na ostateczną cenę?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl mb-3">📏</div>
                <h4 className="font-bold text-blue-900 mb-2">Wielkość powierzchni</h4>
                <p className="text-sm text-gray-700">
                  Większe powierzchnie mogą mieć korzystniejsze ceny za m²
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-3">🔧</div>
                <h4 className="font-bold text-green-900 mb-2">Przygotowanie podłoża</h4>
                <p className="text-sm text-gray-700">
                  Stan istniejącej posadzki wpływa na koszt przygotowania
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-3">🎨</div>
                <h4 className="font-bold text-purple-900 mb-2">Efekty dekoracyjne</h4>
                <p className="text-sm text-gray-700">
                  Dodatkowe płatki, marmur czy metallic zwiększają cenę
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-3">⚙️</div>
                <h4 className="font-bold text-orange-900 mb-2">Właściwości specjalne</h4>
                <p className="text-sm text-gray-700">
                  Antypoślizgowe, antystatyczne czy chemoodporne
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Chcesz poznać dokładną cenę?</h3>
            <p className="text-xl mb-6 opacity-90">
              Otrzymaj bezpłatną wycenę dostosowaną do Twojego projektu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Bezpłatna wycena
                <span className="ml-2">📋</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-all"
              >
                Konsultacja telefoniczna
                <span className="ml-2">📞</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work - Comprehensive Process */}
      <section id="process" className="py-12 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
              <span className="text-4xl">🔄</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Jak pracujemy – Twój projekt w 5 krokach
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
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
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

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Rozpocznij swój projekt już dziś</h3>
            <p className="text-xl mb-6 opacity-90">
              Skontaktuj się z nami i poznaj szczegółowy plan realizacji Twojej posadzki
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Rozpocznij projekt
                <span className="ml-2">🚀</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                Umów konsultację
                <span className="ml-2">📞</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Reviews & Realizations */}
      <section id="reviews" className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Opinie klientów
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 text-2xl mr-2">
                        {'★★★★★'.split('').map((star, i) => (
                          <span key={i}>{star}</span>
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {pageData.stats.averageRating > 0 ? pageData.stats.averageRating.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-gray-600 ml-2">/ 5.0</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-bold text-lg">{pageData.stats.totalReviews}</span> opinii
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Dodaj opinię
                  <span className="ml-2">⭐</span>
                </button>
              </div>

              {/* Reviews List - Dynamic from Database */}
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Ładowanie opinii...</span>
                  </div>
                ) : pageData.reviews.length > 0 ? (
                  pageData.reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 text-lg mr-3">
                            {'★★★★★'.split('').map((star, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                {star}
                              </span>
                            ))}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{review.name}</span>
                            <span className="text-gray-600 text-sm ml-2">{review.service} • {new Date(review.date).toLocaleDateString('pl-PL')}</span>
                          </div>
                        </div>
                        
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        "{review.comment}"
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <button
                          disabled={!!helpfulClicked[review.id]}
                          onClick={async () => {
                            if (helpfulClicked[review.id]) return
                            setHelpfulClicked(prev => ({ ...prev, [review.id]: true }))
                            // optimistic UI update
                            setPageData(prev => ({
                              ...prev,
                              reviews: prev.reviews.map(r => r.id === review.id ? { ...r, helpful: (r.helpful || 0) + 1 } : r)
                            }))
                            try {
                              await fetch(`/api/reviews?id=${encodeURIComponent(review.id)}&action=helpful`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' }
                              })
                            } catch {}
                          }}
                          className={`flex items-center transition-colors text-sm ${helpfulClicked[review.id] ? 'text-green-600 cursor-default' : 'text-gray-500 hover:text-blue-600'}`}
                          aria-pressed={!!helpfulClicked[review.id]}
                        >
                          👍 Pomocna ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-300">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⭐</div>
                      <p className="text-gray-600">Jeszcze nie ma opinii. Bądź pierwszy!</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center mt-8">
                <a
                  href="/reviews"
                  className="inline-flex items-center px-8 py-3 border-2 border-blue-800 text-blue-800 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Zobacz wszystkie opinie
                  <span className="ml-2">⭐</span>
                </a>
              </div>
            </div>

            {/* Realizations Section */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Nasze realizacje
              </h2>

              {/* Realization Stats */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-900 mb-1">{pageData.realizations.length}+</div>
                    <div className="text-sm text-gray-600">Zrealizowanych projektów</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-900 mb-1">15+</div>
                    <div className="text-sm text-gray-600">Lat doświadczenia</div>
                  </div>
                </div>
              </div>

              {/* Gallery Grid - Dynamic from Database */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {loading ? (
                  <div className="col-span-2 flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Ładowanie realizacji...</span>
                  </div>
                ) : pageData.realizations.length > 0 ? (
                  pageData.realizations.slice(0, 4).map((realization) => (
                    <div key={realization.id} className="bg-white rounded-lg overflow-hidden shadow-sm group cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-blue-300 to-blue-500 relative">
                        {realization.image && (
                          <img
                            src={realization.image}
                            alt={realization.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">🔍</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-600 font-medium">{realization.title}</p>
                        <p className="text-xs text-gray-500">
                          {'★'.repeat(Math.floor(realization.rating))}{'☆'.repeat(5 - Math.floor(realization.rating))} ({realization.reviewCount} opinii)
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{realization.location}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">🏠</div>
                    <p className="text-gray-600">Brak realizacji do wyświetlenia</p>
                    <a
                      href="/admin/realizations"
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Dodaj pierwszą realizację
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/realizations"
                className="inline-flex items-center px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all transform hover:scale-105 shadow-lg"
              >
                Zobacz więcej realizacji →
                <span className="ml-2">🏠</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Latest Articles */}
      <section id="blog" className="py-12 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Blog i aktualności
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Przeczytaj nasze artykuły, nowości branżowe i porady dotyczące posadzek żywicznych.
              Znajdziesz tu realizacje, trendy, porównania i wiele innych ciekawych treści.
            </p>
          </div>

          {/* Featured Posts */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              ⭐ Polecane artykuły
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Featured Post 1 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ Polecany
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
                    📖 5 min czytania
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2">🔧</span>
                    <span className="text-sm text-gray-600">Porady techniczne</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-indigo-600 transition-colors">
                    Jak wybrać odpowiednią posadzkę żywiczna do garażu?
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Kompletny przewodnik po wyborze posadzki żywicznej do garażu. Poznaj różnice między systemami epoksydowymi i poliuretanowymi oraz czynniki, które należy wziąć pod uwagę przy wyborze.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-sm">👨‍💼</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Expert</div>
                        <div className="text-xs text-gray-500">15 stycznia 2024</div>
                      </div>
                    </div>
                    <a
                      href="/blog/jak-wybrac-posadzke-zywiczna-do-garazu"
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      Czytaj więcej →
                    </a>
                  </div>
                </div>
              </div>

              {/* Featured Post 2 */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 relative">
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ Polecany
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
                    📖 3 min czytania
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mr-2">📰</span>
                    <span className="text-sm text-gray-600">Nowości</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                    Trendy w posadzkach żywicznych 2024
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Poznaj najnowsze trendy w posadzkach żywicznych na 2024 rok. Efekty dekoracyjne, kolorystyka i technologie, które będą dominować w nadchodzącym sezonie.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">👩‍💼</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Designer</div>
                        <div className="text-xs text-gray-500">12 stycznia 2024</div>
                      </div>
                    </div>
                    <a
                      href="/blog/trendy-posadzki-zywiczne-2024"
                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                    >
                      Czytaj więcej →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts Grid */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Najnowsze artykuły
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Post 1 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 relative">
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    📖 4 min
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">🧽</span>
                    <span className="text-xs text-gray-600">Konserwacja</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                    Konserwacja posadzek żywicznych - kompletny przewodnik
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Jak prawidłowo konserwować posadzki żywiczne? Porady dotyczące codziennej pielęgnacji, czyszczenia i okresowej konserwacji.
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>8 stycznia 2024</span>
                    <a href="/blog/konserwacja-posadzek-zywicznych-przewodnik" className="text-orange-600 hover:text-orange-800">
                      Czytaj →
                    </a>
                  </div>
                </div>
              </div>

              {/* Post 2 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-cyan-100 relative">
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    📖 6 min
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-2">⚖️</span>
                    <span className="text-xs text-gray-600">Porównania</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    Epoksyd vs Poliuretan - który wybrać?
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Szczegółowe porównanie dwóch najpopularniejszych systemów posadzek żywicznych. Poznaj różnice i zastosowania.
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>5 stycznia 2024</span>
                    <a href="/blog/epoksyd-vs-poliuretan" className="text-blue-600 hover:text-blue-800">
                      Czytaj →
                    </a>
                  </div>
                </div>
              </div>

              {/* Post 3 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 relative">
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    📖 4 min
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">🏗️</span>
                    <span className="text-xs text-gray-600">Realizacje</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                    Case study: Posadzka w hali produkcyjnej 500m²
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Zobacz jak zrealizowaliśmy projekt posadzki epoksydowej w hali produkcyjnej. Wyzwania i rozwiązania.
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>2 stycznia 2024</span>
                    <a href="/blog/case-study-hala-produkcyjna" className="text-green-600 hover:text-green-800">
                      Czytaj →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-8">
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
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-4xl font-bold mb-4 text-gray-900">Szukasz konkretnych informacji?</h3>
            <p className="text-xl text-gray-700 mb-8 font-medium max-w-2xl mx-auto">
              Przejrzyj wszystkie nasze artykuły lub skontaktuj się z nami po poradę eksperta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Zobacz wszystkie artykuły
                <span className="ml-2">📚</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 text-lg font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
              >
                Zapytaj eksperta
                <span className="ml-2">💬</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section id="faq" className="py-12 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
              <span className="text-4xl">❓</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Najczęściej zadawane pytania
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Odpowiedzi na najważniejsze pytania dotyczące posadzek żywicznych.
              Jeśli nie znalazłeś odpowiedzi, skontaktuj się z nami!
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {/* Question 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">1</span>
                    Czy posadzka żywiczna jest śliska?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Nie – możemy zastosować wykończenie antypoślizgowe, które zapewnia bezpieczeństwo użytkowania.
                    W zależności od potrzeb dobieramy odpowiednią strukturę powierzchni.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-green-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">2</span>
                    Jak długo służy posadzka żywiczna?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-green-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    W zależności od systemu i intensywności użytkowania, posadzki żywiczne służą od 10 do 25 lat.
                    Systemy premium mogą wytrzymać nawet do 25 lat przy odpowiedniej pielęgnacji.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-purple-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">3</span>
                    Czy można stosować na zewnątrz?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-purple-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Tak – systemy poliuretanowe są odporne na UV i warunki atmosferyczne, idealne na tarasy i balkony.
                    Epoksydy nie są zalecane na zewnątrz ze względu na wrażliwość na promieniowanie UV.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-orange-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-orange-100 text-orange-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">4</span>
                    Ile czasu trwa wykonanie?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-orange-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Od 2 do 5 dni w zależności od wielkości powierzchni i zastosowanej technologii.
                    Czas schnięcia między warstwami to zazwyczaj 24 godziny.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 5 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-cyan-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-cyan-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-cyan-100 text-cyan-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">5</span>
                    Czy uszkodzone posadzki można naprawić?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-cyan-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Tak – możliwe są naprawy miejscowe lub renowacja całej powierzchni w zależności od stopnia uszkodzenia.
                    Koszt naprawy jest znacznie niższy niż wykonanie nowej posadzki.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 6 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-pink-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-pink-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-pink-100 text-pink-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">6</span>
                    Jaka jest różnica między epoksydem a poliuretanem?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-pink-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 7 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-indigo-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">7</span>
                    Czy posadzki żywiczne są odporne na chemikalia?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-indigo-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 8 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-teal-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-teal-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">8</span>
                    Jak przygotować podłoże pod posadzkę żywiczna?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-teal-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 9 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-emerald-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-emerald-100 text-emerald-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">9</span>
                    Czy posadzki żywiczne są ekologiczne?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-emerald-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </details>
            </div>

            {/* Question 10 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-violet-500">
              <details className="group">
                <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-violet-800 transition-colors list-none flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="bg-violet-100 text-violet-800 w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold">10</span>
                    Jak dbać o posadzkę żywiczna?
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-violet-600 transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </details>
            </div>
          </div>



          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Nie znalazłeś odpowiedzi?</h3>
            <p className="text-xl mb-6 opacity-90">
              Nasi eksperci chętnie odpowiedzą na wszystkie Twoje pytania
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Zadaj pytanie
                <span className="ml-2">💬</span>
              </a>
              <a
                href="/guide"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                Przeczytaj poradnik
                <span className="ml-2">📖</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us? - Comprehensive */}
      <section id="why-us" className="py-12 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-yellow-500 rounded-full mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-5xl font-bold mb-6">
              Dlaczego warto wybrać naszą firmę?
            </h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Profesjonalizm, doświadczenie i pasja do tworzenia wyjątkowych posadzek żywicznych.
              Sprawdź, dlaczego klienci nam ufają od lat.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Experience with Prestigious Projects */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-blue-400 border-opacity-30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-500 rounded-xl mr-4">
                  <span className="text-3xl">📅</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300">Doświadczenie przy prestiżowych projektach</h3>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                <strong className="text-white">Zespół zdobywał doświadczenie w firmach</strong> wykonujących posadzki żywiczne
                na projektach dla renomowanych marek, takich jak:
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-yellow-300">Rolex</div>
                  <div className="text-sm text-blue-200">Luksusowe salony</div>
                </div>
                <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-yellow-300">Patek Philippe</div>
                  <div className="text-sm text-blue-200">Prestiżowe butiki</div>
                </div>
                <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-yellow-300">BMS</div>
                  <div className="text-sm text-blue-200">Projekty przemysłowe</div>
                </div>
                <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-yellow-300">EMP</div>
                  <div className="text-sm text-blue-200">Realizacje komercyjne</div>
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                Dzięki temu <strong className="text-white">doskonale znamy specyfikę pracy z żywicami przemysłowymi</strong>
                i znaczenie perfekcyjnego przygotowania podłoża.
              </p>
            </div>

            {/* Proven Materials */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-green-400 border-opacity-30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-500 rounded-xl mr-4">
                  <span className="text-3xl">🏭</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-300">Sprawdzone materiały od liderów branży</h3>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                Do realizacji projektów <strong className="text-white">używamy wyłącznie produktów najwyższej jakości</strong>,
                takich jak:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center p-3 bg-green-800 bg-opacity-50 rounded-lg">
                  <span className="text-green-300 mr-3">✓</span>
                  <div>
                    <div className="font-bold text-white">Sika</div>
                    <div className="text-sm text-blue-200">Szwajcarska jakość i niezawodność</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-800 bg-opacity-50 rounded-lg">
                  <span className="text-green-300 mr-3">✓</span>
                  <div>
                    <div className="font-bold text-white">Mapei</div>
                    <div className="text-sm text-blue-200">Innowacyjne rozwiązania włoskie</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-800 bg-opacity-50 rounded-lg">
                  <span className="text-green-300 mr-3">✓</span>
                  <div>
                    <div className="font-bold text-white">Flowcrete</div>
                    <div className="text-sm text-blue-200">Brytyjska precyzja wykonania</div>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                To <strong className="text-white">gwarancja trwałości i profesjonalnego wykonania</strong> posadzek.
              </p>
            </div>

            {/* Professional Analysis */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-purple-400 border-opacity-30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-500 rounded-xl mr-4">
                  <span className="text-3xl">🔬</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-300">Profesjonalne badania podłoża</h3>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                <strong className="text-white">Przed rozpoczęciem prac dokładnie analizujemy podłoże:</strong>
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center p-3 bg-purple-800 bg-opacity-50 rounded-lg">
                  <span className="text-purple-300 mr-3">📏</span>
                  <div>
                    <div className="font-bold text-white">Wilgotność</div>
                    <div className="text-sm text-blue-200">Precyzyjny pomiar CM method</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-800 bg-opacity-50 rounded-lg">
                  <span className="text-purple-300 mr-3">🌡️</span>
                  <div>
                    <div className="font-bold text-white">Temperatura</div>
                    <div className="text-sm text-blue-200">Kontrola warunków aplikacji</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-800 bg-opacity-50 rounded-lg">
                  <span className="text-purple-300 mr-3">⚡</span>
                  <div>
                    <div className="font-bold text-white">Przyczepność</div>
                    <div className="text-sm text-blue-200">Test pull-off i kruchość powierzchni</div>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                Takie podejście <strong className="text-white">zapewnia trwałość i bezpieczeństwo</strong> każdej posadzki.
              </p>
            </div>

            {/* Certifications */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-orange-400 border-opacity-30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-500 rounded-xl mr-4">
                  <span className="text-3xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-300">Certyfikaty i ciągły rozwój</h3>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed mb-4">
                <strong className="text-white">Zespół regularnie uczestniczy w szkoleniach branżowych</strong>
                i posiada certyfikaty potwierdzające umiejętności.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center p-3 bg-orange-800 bg-opacity-50 rounded-lg">
                  <span className="text-orange-300 mr-3">🏆</span>
                  <div>
                    <div className="font-bold text-white">Certyfikaty branżowe</div>
                    <div className="text-sm text-blue-200">Potwierdzone umiejętności</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-800 bg-opacity-50 rounded-lg">
                  <span className="text-orange-300 mr-3">📚</span>
                  <div>
                    <div className="font-bold text-white">Szkolenia specjalistyczne</div>
                    <div className="text-sm text-blue-200">Ciągłe doskonalenie</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-800 bg-opacity-50 rounded-lg">
                  <span className="text-orange-300 mr-3">🏗️</span>
                  <div>
                    <div className="font-bold text-white">Doświadczenie prestiżowe</div>
                    <div className="text-sm text-blue-200">Małe i duże inwestycje</div>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                Doświadczenie zdobyte przy <strong className="text-white">prestiżowych projektach pozwala realizować</strong>
                zarówno małe, jak i duże inwestycje na najwyższym poziomie.
              </p>
            </div>
          </div>

          {/* Guarantee and Support */}
          <div className="mb-16">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-yellow-400 border-opacity-30">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-yellow-300 mb-4">
                  🛡️ Gwarancja jakości i wsparcie
                </h3>
                <p className="text-xl text-blue-100">
                  Oferujemy <strong className="text-white">pełną gwarancję wykonania i użytych materiałów</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Platforma klienta</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">📋</span>
                      <div>
                        <div className="font-bold text-white">Status gwarancji</div>
                        <div className="text-sm text-blue-200">Sprawdź warunki i terminy</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">👨‍💼</span>
                      <div>
                        <div className="font-bold text-white">Opiekun projektu</div>
                        <div className="text-sm text-blue-200">Bezpośredni kontakt</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">📸</span>
                      <div>
                        <div className="font-bold text-white">Efekt „przed i po”</div>
                        <div className="text-sm text-blue-200">Galeria realizacji</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Dodatkowe korzyści</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">📄</span>
                      <div>
                        <div className="font-bold text-white">Dokumenty online</div>
                        <div className="text-sm text-blue-200">Umowy i faktury</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">💰</span>
                      <div>
                        <div className="font-bold text-white">Rabaty</div>
                        <div className="text-sm text-blue-200">Dla stałych klientów</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                      <span className="text-yellow-300 mr-3">🔧</span>
                      <div>
                        <div className="font-bold text-white">Serwis pogwarancyjny</div>
                        <div className="text-sm text-blue-200">Wsparcie techniczne</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Technologies */}
          <div className="mb-16">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-cyan-400 border-opacity-30">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-cyan-300 mb-4">
                  💡 Nowoczesne technologie i międzynarodowe standardy
                </h3>
                <p className="text-xl text-blue-100">
                  Stosujemy <strong className="text-white">najnowsze systemy żywic i standardy budowlane</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-cyan-800 bg-opacity-50 rounded-xl">
                  <div className="text-3xl mb-3">🔬</div>
                  <h4 className="font-bold text-white mb-2">Innowacyjne żywice</h4>
                  <p className="text-sm text-blue-200">
                    Najnowsze formulacje epoksydowe i poliuretanowe
                  </p>
                </div>
                <div className="text-center p-4 bg-cyan-800 bg-opacity-50 rounded-xl">
                  <div className="text-3xl mb-3">⚙️</div>
                  <h4 className="font-bold text-white mb-2">Standardy ISO</h4>
                  <p className="text-sm text-blue-200">
                    Międzynarodowe normy jakości i bezpieczeństwa
                  </p>
                </div>
                <div className="text-center p-4 bg-cyan-800 bg-opacity-50 rounded-xl">
                  <div className="text-3xl mb-3">🏠</div>
                  <h4 className="font-bold text-white mb-2">Wszechstronne zastosowanie</h4>
                  <p className="text-sm text-blue-200">
                    Od kuchni po hale przemysłowe
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-lg text-blue-100">
                  Nawet w <strong className="text-white">niewielkich projektach, takich jak kuchnie czy salony,
                  zapewniamy trwałość, estetykę i bezpieczeństwo</strong> na najwyższym poziomie.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8">
            <h3 className="text-3xl font-bold mb-4">Dołącz do grona zadowolonych klientów</h3>
            <p className="text-xl mb-6 opacity-90">
              Skontaktuj się z nami i przekonaj się, dlaczego warto nam zaufać
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-red-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Skontaktuj się z nami
                <span className="ml-2">📞</span>
              </a>
              <a
                href="/realizations"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all"
              >
                Zobacz nasze realizacje
                <span className="ml-2">🏆</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
              <span className="text-4xl">📞</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Kontakt – porozmawiajmy o Twoim projekcie
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Nasi eksperci chętnie odpowiedzą na wszystkie pytania i pomogą wybrać idealne rozwiązanie dla Twojej przestrzeni.
              Skontaktuj się z nami już dziś!
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Phone Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-blue-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                  <span className="text-4xl">📞</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Zadzwoń do nas</h3>
                <p className="text-gray-700 mb-6">
                  Porozmawiaj bezpośrednio z naszymi specjalistami. Chętnie odpowiemy na wszystkie pytania dotyczące posadzek żywicznych.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+48123456789"
                    className="block text-2xl font-bold text-blue-800 hover:text-blue-600 transition-colors"
                  >
                    +48 123 456 789
                  </a>
                  <p className="text-sm text-gray-600">
                    Poniedziałek - Piątek: 8:00 - 18:00
                  </p>
                  <p className="text-sm text-gray-600">
                    Sobota: 9:00 - 15:00
                  </p>
                </div>
              </div>
            </div>

            {/* Email Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-green-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <span className="text-4xl">✉️</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-4">Napisz do nas</h3>
                <p className="text-gray-700 mb-6">
                  Wyślij wiadomość e-mail z opisem swojego projektu. Odpowiemy w ciągu 24 godzin z propozycją rozwiązania.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:info@decosol.pl"
                    className="block text-xl font-bold text-green-800 hover:text-green-600 transition-colors"
                  >
                    info@decosol.pl
                  </a>
                  <p className="text-sm text-gray-600">
                    Odpowiedź w ciągu 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Free Consultation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-purple-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4">Darmowa konsultacja</h3>
                <p className="text-gray-700 mb-6">
                  Umów się na bezpłatną konsultację w dogodnym terminie. Przyjedziemy na miejsce i doradzimy najlepsze rozwiązanie.
                </p>
                <div className="space-y-3">
                  <div className="text-lg font-bold text-purple-800">
                    Konsultacja na miejscu
                  </div>
                  <p className="text-sm text-gray-600">
                    Warszawa i okolice
                  </p>
                  <a
                    href="/contact"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Umów konsultację
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Wyślij wiadomość
            </h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jan Kowalski"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres e-mail *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jan@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer telefonu
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+48 123 456 789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ projektu
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900">
                  <option>Garaż</option>
                  <option>Taras/balkon</option>
                  <option>Salon/sypialnia</option>
                  <option>Hala przemysłowa</option>
                  <option>Biuro</option>
                  <option>Inne</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wiadomość *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opisz swój projekt, wymiary, oczekiwania..."
                  required
                />
              </div>
              {/* Consents */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Wyrażam zgodę na kontakt telefoniczny w celu realizacji zapytania.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Wyrażam zgodę na otrzymywanie informacji handlowych i materiałów marketingowych (opcjonalnie).
                  </span>
                </label>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Wyślij wiadomość
                  <span className="ml-2">📤</span>
                </button>
              </div>
            </form>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Masz pytania? Skontaktuj się z nami!</h3>
            <p className="text-xl mb-6 opacity-90">
              Nasi eksperci czekają, aby pomóc Ci wybrać idealną posadzkę żywiczna
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+48123456789"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Zadzwoń teraz
                <span className="ml-2">📞</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                Szczegóły kontaktu
                <span className="ml-2">📍</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Free Quotation */}
      <section className="py-12 bg-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Dowiedz się ile kosztuje Twoja posadzka
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Wycena jest całkowicie darmowa i zajmie Ci tylko kilka minut.
            Otrzymasz szczegółową kalkulację dostosowaną do Twoich potrzeb.
          </p>
          <a
            href="/valuation"
            className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Darmowa wycena online →
            <span className="ml-2">📋</span>
          </a>
        </div>
      </section>

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleReviewSubmit}
      />
    </MainLayout>
  )
}
