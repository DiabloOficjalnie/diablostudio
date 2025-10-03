'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  created_at: string
  last_contact?: string
  total_valuations?: number
  total_spent?: number
  status: 'active' | 'inactive' | 'vip'
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'vip'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)

      // Load clients from API
      const response = await fetch('/api/admin/clients')
      if (response.ok) {
        const data = await response.json()
        if (data.clients && Array.isArray(data.clients)) {
          setClients(data.clients)
        } else {
          // Fallback to mock data if API returns invalid data
          setClients(generateMockClients())
        }
      } else {
        throw new Error('Failed to load from API')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      // Fallback to mock data
      setClients(generateMockClients())
    } finally {
      setLoading(false)
    }
  }

  const generateMockClients = (): Client[] => [
    {
      id: '1',
      name: 'Jan Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 123 456 789',
      company: 'Kowalski Construction',
      created_at: '2024-01-15T10:30:00Z',
      last_contact: '2024-01-20T14:20:00Z',
      total_valuations: 3,
      total_spent: 45000,
      status: 'vip'
    },
    {
      id: '2',
      name: 'Maria Nowak',
      email: 'maria.nowak@example.com',
      phone: '+48 987 654 321',
      created_at: '2024-01-10T09:15:00Z',
      last_contact: '2024-01-18T11:45:00Z',
      total_valuations: 1,
      total_spent: 15000,
      status: 'active'
    },
    {
      id: '3',
      name: 'Piotr Wiśniewski',
      email: 'piotr.wisniewski@example.com',
      company: 'Wiśniewski Development',
      created_at: '2024-01-05T16:20:00Z',
      total_valuations: 2,
      total_spent: 28000,
      status: 'active'
    },
    {
      id: '4',
      name: 'Anna Jasińska',
      email: 'anna.jasinska@example.com',
      phone: '+48 555 123 456',
      created_at: '2023-12-28T13:10:00Z',
      last_contact: '2024-01-15T10:30:00Z',
      total_valuations: 1,
      total_spent: 8500,
      status: 'inactive'
    }
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && (client.company || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie klientów...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie klientami</h1>
              <p className="text-gray-600">Przeglądaj i zarządzaj bazą klientów DiabloStudio</p>
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
                ➕ Dodaj klienta
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszyscy klienci</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-sm text-green-600 mt-1">+{clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywni klienci</p>
                <p className="text-3xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-green-600 mt-1">Regularnie współpracują</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Klienci VIP</p>
                <p className="text-3xl font-bold text-gray-900">{clients.filter(c => c.status === 'vip').length}</p>
                <p className="text-sm text-green-600 mt-1">Najważniejsi partnerzy</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Średnia wartość</p>
                <p className="text-3xl font-bold text-gray-900">
                  {clients.length > 0 ? formatCurrency(clients.reduce((sum, c) => sum + (c.total_spent || 0), 0) / clients.length) : formatCurrency(0)}
                </p>
                <p className="text-sm text-green-600 mt-1">Na klienta</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
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
                  placeholder="Szukaj klientów po nazwie, email lub firmie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="active">Aktywni</option>
                <option value="inactive">Nieaktywni</option>
                <option value="vip">VIP</option>
              </select>

              <button
                onClick={loadClients}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Lista klientów ({filteredClients.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Wyceny
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Wartość
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Ostatni kontakt
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-bold shadow-md ${
                          client.status === 'vip' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                          client.status === 'active' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                          'bg-gradient-to-br from-gray-500 to-slate-600'
                        }`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{client.name}</div>
                          {client.company && (
                            <div className="text-sm text-gray-500">{client.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      {client.phone && (
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status === 'vip' ? 'VIP' :
                         client.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {client.total_valuations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {formatCurrency(client.total_spent || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {client.last_contact ? formatDate(client.last_contact) : formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => {/* TODO: View client details */}}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Szczegóły
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak klientów</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nie znaleziono klientów spełniających kryteria wyszukiwania'
                  : 'Dodaj pierwszego klienta do bazy danych'
                }
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj pierwszego klienta
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredClients.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="text-sm text-gray-600">
              Pokazano {filteredClients.length} z {clients.length} klientów
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                ← Poprzednia
              </button>
              <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Następna →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
