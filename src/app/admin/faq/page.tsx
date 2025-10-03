'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  status: 'active' | 'inactive' | 'draft'
  author: string
  created_at: string
  updated_at: string
  views?: number
  helpful_votes?: number
  not_helpful_votes?: number
  tags?: string[]
}

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    try {
      setLoading(true)

      // Load FAQs from API
      const response = await fetch('/api/admin/faq')
      if (response.ok) {
        const data = await response.json()
        if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(data.faqs)
        } else {
          // Fallback to mock data if API returns invalid data
          setFaqs(generateMockFAQs())
        }
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.error('Error loading FAQs:', error)
      // Fallback to mock data
      setFaqs(generateMockFAQs())
    } finally {
      setLoading(false)
    }
  }

  const generateMockFAQs = (): FAQItem[] => [
    {
      id: '1',
      question: 'Jak przygotować podłoże przed aplikacją posadzki żywicznej?',
      answer: 'Przed aplikacją posadzki żywicznej należy dokładnie oczyścić powierzchnię, usunąć wszelkie zanieczyszczenia, tłuszcz i luźne elementy. Podłoże powinno być suche, stabilne i wolne od pęknięć. W przypadku betonu, wilgotność nie powinna przekraczać 4%.',
      category: 'Przygotowanie',
      status: 'active',
      author: 'Admin',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:20:00Z',
      views: 342,
      helpful_votes: 28,
      not_helpful_votes: 3,
      tags: ['przygotowanie', 'podłoże', 'instrukcja']
    },
    {
      id: '2',
      question: 'Ile czasu schnie posadzka żywiczna?',
      answer: 'Czas schnięcia posadzki żywicznej zależy od rodzaju żywicy, temperatury i wilgotności powietrza. Zazwyczaj posadzka jest sucha po 24 godzinach, ale pełne utwardzenie następuje po 7 dniach. W tym czasie należy unikać obciążania powierzchni.',
      category: 'Czas realizacji',
      status: 'active',
      author: 'Maria Nowak',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T11:45:00Z',
      views: 567,
      helpful_votes: 45,
      not_helpful_votes: 2,
      tags: ['schnięcie', 'czas', 'pielęgnacja']
    },
    {
      id: '3',
      question: 'Czy posadzki żywiczne są odporne na chemikalia?',
      answer: 'Tak, posadzki żywiczne są wysoce odporne na działanie większości chemikaliów, olejów, kwasów i rozpuszczalników. Jednakże odporność zależy od rodzaju zastosowanej żywicy i grubości warstwy.',
      category: 'Właściwości',
      status: 'active',
      author: 'Piotr Wiśniewski',
      created_at: '2024-01-05T16:20:00Z',
      updated_at: '2024-01-05T16:20:00Z',
      views: 234,
      helpful_votes: 18,
      not_helpful_votes: 1,
      tags: ['odporność', 'chemikalia', 'właściwości']
    },
    {
      id: '4',
      question: 'Jak dbać o posadzkę żywiczną na co dzień?',
      answer: 'Codzienna pielęgnacja posadzki żywicznej jest bardzo prosta. Wystarczy regularne zamiatanie lub odkurzanie oraz mycie neutralnymi środkami czystości. Należy unikać agresywnych detergentów i ostrych narzędzi.',
      category: 'Konserwacja',
      status: 'draft',
      author: 'Anna Jasińska',
      created_at: '2024-01-12T13:10:00Z',
      updated_at: '2024-01-19T10:30:00Z',
      views: 0,
      helpful_votes: 0,
      not_helpful_votes: 0,
      tags: ['pielęgnacja', 'konserwacja', 'codzienna']
    },
    {
      id: '5',
      question: 'Czy posadzki żywiczne nadają się do garażu?',
      answer: 'Absolutnie tak! Posadzki żywiczne są idealne do garaży ze względu na swoją wytrzymałość, odporność na ścieranie i łatwość w utrzymaniu czystości. Są odporne na oleje, benzynę i inne substancje.',
      category: 'Zastosowania',
      status: 'active',
      author: 'Admin',
      created_at: '2023-12-28T08:45:00Z',
      updated_at: '2024-01-15T16:15:00Z',
      views: 456,
      helpful_votes: 32,
      not_helpful_votes: 4,
      tags: ['garaż', 'zastosowanie', 'odporność']
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (faq.category && (faq.category || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || faq.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
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
      case 'active': return 'Aktywne'
      case 'inactive': return 'Nieaktywne'
      case 'draft': return 'Szkic'
      default: return status
    }
  }

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const handleStatusChange = async (faqId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Update FAQ status in database
      const response = await fetch(`/api/admin/faq?action=update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: faqId,
          status: newStatus
        }),
      })

      if (response.ok) {
        // Update local state
        setFaqs(prev => prev.map(faq =>
          faq.id === faqId ? { ...faq, status: newStatus } : faq
        ))
      } else {
        console.error('Failed to update FAQ status')
      }
    } catch (error) {
      console.error('Error updating FAQ status:', error)
    }
  }

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to pytanie FAQ?')) return

    try {
      // Delete FAQ from database
      const response = await fetch(`/api/admin/faq?id=${faqId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setFaqs(prev => prev.filter(faq => faq.id !== faqId))
      } else {
        console.error('Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie FAQ...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie FAQ</h1>
              <p className="text-gray-600">Twórz i zarządzaj często zadawanymi pytaniami</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie pytania</p>
                <p className="text-3xl font-bold text-gray-900">{faqs.length}</p>
                <p className="text-sm text-green-600 mt-1">+{faqs.filter(f => new Date(f.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne pytania</p>
                <p className="text-3xl font-bold text-gray-900">{faqs.filter(f => f.status === 'active').length}</p>
                <p className="text-sm text-green-600 mt-1">Widoczne dla użytkowników</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Szkice</p>
                <p className="text-3xl font-bold text-gray-900">{faqs.filter(f => f.status === 'draft').length}</p>
                <p className="text-sm text-green-600 mt-1">W trakcie edycji</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Łączne wyświetleń</p>
                <p className="text-3xl font-bold text-gray-900">{faqs.reduce((sum, f) => sum + (f.views || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie pytania</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
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
                  placeholder="Szukaj pytań i odpowiedzi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Wszystkie kategorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="active">Aktywne</option>
                <option value="inactive">Nieaktywne</option>
                <option value="draft">Szkice</option>
              </select>

              <button
                onClick={loadFAQs}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Lista pytań FAQ ({filteredFAQs.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Pytanie
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Wyświetleń
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Przydatność
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Ostatnia edycja
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFAQs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{faq.question}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{faq.answer}</div>
                        {faq.tags && faq.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {faq.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {faq.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{faq.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(faq.status)}`}>
                        {getStatusText(faq.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {faq.views?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-green-600">👍 {faq.helpful_votes || 0}</span>
                        <span className="text-red-600">👎 {faq.not_helpful_votes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {formatDate(faq.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq)
                            setShowPreviewModal(true)
                          }}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Podgląd
                        </button>
                        <button
                          onClick={() => setSelectedFAQ(faq)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak pytań FAQ</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Nie znaleziono pytań spełniających kryteria wyszukiwania'
                  : 'Dodaj pierwsze pytanie do bazy FAQ'
                }
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj pierwsze pytanie
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredFAQs.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="text-sm text-gray-600">
              Pokazano {filteredFAQs.length} z {faqs.length} pytań
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                ← Poprzednia
              </button>
              <button className="px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* FAQ Preview Modal */}
        {showPreviewModal && selectedFAQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Podgląd pytania FAQ</h2>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false)
                      setSelectedFAQ(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Question */}
                  <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Pytanie</h3>
                    <p className="text-lg text-orange-800">{selectedFAQ.question}</p>
                  </div>

                  {/* Answer */}
                  <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Odpowiedź</h3>
                    <p className="text-blue-800 leading-relaxed">{selectedFAQ.answer}</p>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informacje</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Kategoria</p>
                        <p className="font-semibold text-gray-900">{selectedFAQ.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Autor</p>
                        <p className="font-semibold text-gray-900">{selectedFAQ.author}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFAQ.status)}`}>
                          {getStatusText(selectedFAQ.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Wyświetleń</p>
                        <p className="font-semibold text-gray-900">{selectedFAQ.views?.toLocaleString() || '0'}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedFAQ.tags && selectedFAQ.tags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Tagi</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedFAQ.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowPreviewModal(false)
                        setSelectedFAQ(null)
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Zamknij
                    </button>
                    <button
                      onClick={() => {
                        setShowPreviewModal(false)
                        // Keep selectedFAQ for editing
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Edytuj pytanie
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold text-blue-900">Importuj pytania</div>
              <div className="text-sm text-blue-700 mt-1">Zaimportuj pytania z pliku</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-green-900">Statystyki</div>
              <div className="text-sm text-green-700 mt-1">Zobacz analitykę FAQ</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">🔗</div>
              <div className="font-bold text-purple-900">Kategorie</div>
              <div className="text-sm text-purple-700 mt-1">Zarządzaj kategoriami</div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
