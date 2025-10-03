'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface CustomerQuote {
  id: string
  area: number
  floor_system: string
  substrate_condition: string
  location: string
  decorative_system: string
  price_min: number
  price_max: number
  total_min: number
  total_max: number
  contact_preferences?: any
  consents?: any
  created_at: string
  customers: {
    id: string
    name: string
    email: string
    phone?: string
    created_at: string
  }
}

interface QuoteStats {
  total: number
  thisMonth: number
  avgArea: number
  avgPrice: number
  totalSurfaceArea: number
  totalEstimatedValue: number
}

export default function CustomerQuotesPage() {
  const [quotes, setQuotes] = useState<CustomerQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<QuoteStats>({ total: 0, thisMonth: 0, avgArea: 0, avgPrice: 0, totalSurfaceArea: 0, totalEstimatedValue: 0 })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadQuotes()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [quotes])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customer-quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data)
      } else {
        console.error('Failed to load customer quotes')
        setQuotes([])
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
      setQuotes([])
    }
    setLoading(false)
  }

  const calculateStats = () => {
    const total = quotes.length
    const thisMonth = quotes.filter(quote => {
      const quoteDate = new Date(quote.created_at)
      const now = new Date()
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear()
    }).length

    // Calculate averages correctly from all quotes
    const avgArea = total > 0 ? quotes.reduce((sum, quote) => sum + quote.area, 0) / total : 0
    const avgPrice = total > 0 ? quotes.reduce((sum, quote) => sum + ((quote.price_min + quote.price_max) / 2), 0) / total : 0

    // Calculate total surface area
    const totalSurfaceArea = quotes.reduce((sum, quote) => sum + quote.area, 0)

    // Calculate total estimated value (average price per sqm * total area)
    const totalEstimatedValue = total > 0 ? quotes.reduce((sum, quote) => {
      const avgPricePerSqm = (quote.price_min + quote.price_max) / 2
      return sum + (avgPricePerSqm * quote.area)
    }, 0) : 0

    setStats({
      total,
      thisMonth,
      avgArea: Math.round(avgArea * 10) / 10, // Round to 1 decimal
      avgPrice: Math.round(avgPrice),
      totalSurfaceArea: Math.round(totalSurfaceArea),
      totalEstimatedValue: Math.round(totalEstimatedValue)
    })
  }

  const filteredQuotes = quotes.filter(quote => {
    if (filter === 'all') return true
    if (filter === 'thisMonth') {
      const quoteDate = new Date(quote.created_at)
      const now = new Date()
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear()
    }
    return true
  }).filter(quote => {
    if (!searchTerm) return true
    return quote.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           quote.customers.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getFloorSystemName = (system: string) => {
    const systems: { [key: string]: string } = {
      'EPOXY_STANDARD': 'Epoksyd Standard',
      'EPOXY_PREMIUM': 'Epoksyd Premium',
      'PU_STANDARD': 'Poliuretan Standard',
      'PU_PREMIUM': 'Poliuretan Premium'
    }
    return systems[system] || system
  }

  const getSubstrateName = (substrate: string) => {
    const substrates: { [key: string]: string } = {
      'CONCRETE_GOOD': 'Beton - dobry stan',
      'CONCRETE_DEFECTS': 'Beton - wady',
      'TILES': 'Płytki',
      'OLD_RESIN': 'Stara żywica',
      'OTHER': 'Inne'
    }
    return substrates[substrate] || substrate
  }

  const getLocationName = (location: string) => {
    const locations: { [key: string]: string } = {
      'INDOOR': 'Wewnątrz',
      'OUTDOOR': 'Na zewnątrz'
    }
    return locations[location] || location
  }

  const getDecorativeName = (decorative: string) => {
    const decoratives: { [key: string]: string } = {
      'SMOOTH': 'Gładki',
      'FLAKES': 'Płatki',
      'MARBLE': 'Marmur',
      'TEXTURED': 'Teksturowany',
      'TRANSPARENT': 'Transparentny'
    }
    return decoratives[decorative] || decorative
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie wycen klientów...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wyceny klientów</h1>
            <p className="text-gray-600 mt-1">Zarządzanie wycenami klientów z kalkulatora</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/detailed-quotations"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">📋</span>
              Wyceny szczegółowe
            </a>
            <button
              onClick={loadQuotes}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">🔄</span>
              Odśwież
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Łącznie wycen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">W tym miesiącu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📏</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Średnia powierzchnia</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgArea.toFixed(1)}m²</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Średnia cena/m²</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Szukaj po imieniu lub email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setFilter('thisMonth')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'thisMonth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ten miesiąc
              </button>
            </div>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm || filter !== 'all' ? 'Brak pasujących wycen' : 'Brak wycen klientów'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || filter !== 'all'
                  ? 'Nie znaleziono wycen pasujących do kryteriów wyszukiwania.'
                  : 'Jeszcze nie ma żadnych wycen klientów. Wyceny będą się pojawiać po użyciu kalkulatora na stronie głównej.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Szczegóły projektu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {quote.customers.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {quote.customers.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {quote.customers.email}
                            </div>
                            {quote.customers.phone && (
                              <div className="text-sm text-gray-500">
                                📞 {quote.customers.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">Powierzchnia: {quote.area}m²</div>
                          <div className="text-gray-600">System: {getFloorSystemName(quote.floor_system)}</div>
                          <div className="text-gray-600">Podłoże: {getSubstrateName(quote.substrate_condition)}</div>
                          <div className="text-gray-600">Lokalizacja: {getLocationName(quote.location)}</div>
                          <div className="text-gray-600">Dekoracja: {getDecorativeName(quote.decorative_system)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {formatCurrency(quote.price_min)} - {formatCurrency(quote.price_max)}/m²
                          </div>
                          <div className="text-gray-600">
                            Razem: {formatCurrency(quote.total_min)} - {formatCurrency(quote.total_max)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quote.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // TODO: Add contact functionality
                              console.log('Contact customer:', quote.customers.email)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Skontaktuj się z klientem"
                          >
                            📧
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Add PDF generation
                              console.log('Generate PDF for quote:', quote.id)
                            }}
                            className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                            title="Generuj PDF"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Add delete functionality
                              console.log('Delete quote:', quote.id)
                            }}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Usuń wycenę"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredQuotes.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Podsumowanie (filtrowane)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredQuotes.length}</div>
                <div className="text-sm text-gray-600">Wycen w widoku</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredQuotes.reduce((sum, quote) => sum + quote.area, 0).toFixed(1)}m²
                </div>
                <div className="text-sm text-gray-600">Łączna powierzchnia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    filteredQuotes.reduce((sum, quote) => sum + ((quote.price_min + quote.price_max) / 2), 0) / filteredQuotes.length
                  )}
                </div>
                <div className="text-sm text-gray-600">Średnia cena/m²</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
