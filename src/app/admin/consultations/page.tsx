'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface Consultation {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  project_type: string
  project_description: string
  budget_range?: string
  preferred_contact_time?: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
  scheduled_date?: string
  estimated_value?: number
  source?: string
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadConsultations()
  }, [activeTab])

  const loadConsultations = async () => {
    try {
      setLoading(true)

      const statusParam = activeTab === 'all' ? '' : `?status=${activeTab}`

      const response = await fetch(`/api/admin/consultations${statusParam}`)

      if (response.ok) {
        const data = await response.json()
        setConsultations(data.consultations || [])
      } else {
        console.error('Error loading consultations:', response.statusText)
        setConsultations([])
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nowa'
      case 'in_progress': return 'W trakcie'
      case 'completed': return 'Ukończona'
      case 'cancelled': return 'Anulowana'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Pilne'
      case 'high': return 'Wysokie'
      case 'medium': return 'Średnie'
      case 'low': return 'Niskie'
      default: return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie konsultacji...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📞 Konsultacje</h1>
              <p className="text-gray-600">Zarządzaj konsultacjami klientów i projektami</p>
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj konsultację
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie konsultacje</p>
                <p className="text-3xl font-bold text-gray-900">{consultations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nowe</p>
                <p className="text-3xl font-bold text-gray-900">{consultations.filter(c => c.status === 'new').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🆕</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">W trakcie</p>
                <p className="text-3xl font-bold text-gray-900">{consultations.filter(c => c.status === 'in_progress').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ukończone</p>
                <p className="text-3xl font-bold text-gray-900">{consultations.filter(c => c.status === 'completed').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'all', label: 'Wszystkie', icon: '📋' },
                { id: 'new', label: 'Nowe', icon: '🆕' },
                { id: 'in_progress', label: 'W trakcie', icon: '🔄' },
                { id: 'completed', label: 'Ukończone', icon: '✅' },
                { id: 'cancelled', label: 'Anulowane', icon: '❌' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
            {/* Consultations List */}
            <div className="space-y-4">
              {consultations.length > 0 ? (
                consultations.map((consultation) => (
                  <div key={consultation.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{consultation.client_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                            {getStatusText(consultation.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(consultation.priority)}`}>
                            {getPriorityText(consultation.priority)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">📧 Email</p>
                            <p className="font-medium text-gray-900">{consultation.client_email}</p>
                          </div>
                          {consultation.client_phone && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">📱 Telefon</p>
                              <p className="font-medium text-gray-900">{consultation.client_phone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">🏗️ Typ projektu</p>
                            <p className="font-medium text-gray-900">{consultation.project_type}</p>
                          </div>
                          {consultation.estimated_value && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">💰 Wartość</p>
                              <p className="font-medium text-gray-900">{formatCurrency(consultation.estimated_value)}</p>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">📝 Opis projektu</p>
                          <p className="text-gray-900 bg-white p-3 rounded-lg border">{consultation.project_description}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 Utworzono: {formatDate(consultation.created_at)}</span>
                          {consultation.scheduled_date && (
                            <span>⏰ Zaplanowano: {formatDate(consultation.scheduled_date)}</span>
                          )}
                          {consultation.assigned_to && (
                            <span>👤 Przydzielono: {consultation.assigned_to}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                          Edytuj
                        </button>
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                          Kontakt
                        </button>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📞</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak konsultacji</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all'
                      ? 'Nie znaleziono żadnych konsultacji w systemie'
                      : `Nie znaleziono konsultacji ze statusem "${getStatusText(activeTab)}"`
                    }
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    ➕ Dodaj pierwszą konsultację
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Szybkie akcje</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-blue-900">Raport</div>
                <div className="text-sm text-blue-700">Generuj raport</div>
              </div>
            </button>

            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-bold text-green-900">Email</div>
                <div className="text-sm text-green-700">Wyślij masowo</div>
              </div>
            </button>

            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold text-purple-900">Eksport</div>
                <div className="text-sm text-purple-700">CSV/Excel</div>
              </div>
            </button>

            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-bold text-orange-900">Synchronizacja</div>
                <div className="text-sm text-orange-700">CRM sync</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
