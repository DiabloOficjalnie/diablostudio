'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'moderator' | 'editor' | 'user'
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
  last_login?: string
  permissions?: string[]
  profile?: {
    first_name?: string
    last_name?: string
    phone?: string
    avatar_url?: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'editor' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)

      // Load users from Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error('Error loading users:', authError)
        // Fallback to mock data if auth fails
        setUsers(generateMockUsers())
      } else {
        // Transform auth users to our interface
        const transformedUsers: User[] = (authUsers.users || []).map(user => ({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name,
          role: user.user_metadata?.role || 'user',
          status: user.email_confirmed_at ? 'active' : 'inactive',
          created_at: user.created_at,
          last_login: user.last_sign_in_at || undefined,
          profile: {
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            phone: user.user_metadata?.phone,
            avatar_url: user.user_metadata?.avatar_url
          }
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Error in loadUsers:', error)
      setUsers(generateMockUsers())
    } finally {
      setLoading(false)
    }
  }

  const generateMockUsers = (): User[] => [
    {
      id: '1',
      email: 'admin@diablostudio.pl',
      name: 'Administrator',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-01-20T10:30:00Z',
      profile: {
        first_name: 'Admin',
        last_name: 'DiabloStudio',
        phone: '+48 123 456 789'
      }
    },
    {
      id: '2',
      email: 'moderator@diablostudio.pl',
      name: 'Moderator Systemu',
      role: 'moderator',
      status: 'active',
      created_at: '2024-01-05T09:00:00Z',
      last_login: '2024-01-19T15:45:00Z',
      profile: {
        first_name: 'Moderator',
        last_name: 'User',
        phone: '+48 987 654 321'
      }
    },
    {
      id: '3',
      email: 'editor@diablostudio.pl',
      name: 'Edytor Treści',
      role: 'editor',
      status: 'active',
      created_at: '2024-01-10T14:20:00Z',
      last_login: '2024-01-18T11:20:00Z',
      profile: {
        first_name: 'Editor',
        last_name: 'Content',
        phone: '+48 555 123 456'
      }
    },
    {
      id: '4',
      email: 'user@diablostudio.pl',
      name: 'Zwykły Użytkownik',
      role: 'user',
      status: 'inactive',
      created_at: '2024-01-15T16:30:00Z',
      profile: {
        first_name: 'User',
        last_name: 'Test',
        phone: '+48 444 789 012'
      }
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.profile?.first_name && user.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.profile?.last_name && user.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-orange-100 text-orange-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'moderator': return 'Moderator'
      case 'editor': return 'Edytor'
      case 'user': return 'Użytkownik'
      default: return role
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny'
      case 'inactive': return 'Nieaktywny'
      case 'blocked': return 'Zablokowany'
      default: return status
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie użytkowników...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie użytkownikami</h1>
              <p className="text-gray-600">Zarządzaj kontami użytkowników i uprawnieniami systemu</p>
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
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj użytkownika
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszyscy użytkownicy</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-green-600 mt-1">+{users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} w tym miesiącu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywni użytkownicy</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm text-green-600 mt-1">Potwierdzone konta</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administratorzy</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-green-600 mt-1">Pełne uprawnienia</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderatorzy</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'moderator').length}</p>
                <p className="text-sm text-green-600 mt-1">Zarządzanie treściami</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
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
                  placeholder="Szukaj użytkowników po email, imieniu lub nazwisku..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <span className="text-lg">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">Wszystkie role</option>
                <option value="admin">Administrator</option>
                <option value="moderator">Moderator</option>
                <option value="editor">Edytor</option>
                <option value="user">Użytkownik</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="active">Aktywny</option>
                <option value="inactive">Nieaktywny</option>
                <option value="blocked">Zablokowany</option>
              </select>

              <button
                onClick={loadUsers}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Lista użytkowników ({filteredUsers.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Użytkownik
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rola
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Data utworzenia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Ostatnie logowanie
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-bold shadow-md ${
                          user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                          user.role === 'moderator' ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                          user.role === 'editor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          'bg-gradient-to-br from-gray-500 to-slate-600'
                        }`}>
                          {(user.profile?.first_name?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {user.name || `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 'Brak nazwy'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.profile?.phone && (
                            <div className="text-sm text-gray-500">{user.profile.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {user.last_login ? formatDate(user.last_login) : 'Nigdy'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Szczegóły
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setEditing(true)
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => {/* TODO: Delete user */}}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Brak użytkowników</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Nie znaleziono użytkowników spełniających kryteria wyszukiwania'
                  : 'Brak użytkowników w systemie'
                }
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Dodaj użytkownika
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
            <div className="text-sm text-gray-600">
              Pokazano {filteredUsers.length} z {users.length} użytkowników
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                ← Poprzednia
              </button>
              <button className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                Następna →
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Create User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Dodaj nowego użytkownika</h2>
                      <p className="text-gray-600 mt-1">Utwórz nowe konto użytkownika w systemie</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>

                <form className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">👤</span>
                      Podstawowe informacje
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Adres email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="uzytkownik@example.com"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Hasło <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          placeholder="Minimum 8 znaków"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Imię <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Jan"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Nazwisko <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Kowalski"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Numer telefonu
                        </label>
                        <input
                          type="tel"
                          placeholder="+48 123 456 789"
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role and Permissions */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                    <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">🔐</span>
                      Rola i uprawnienia
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-3">
                          Rola użytkownika <span className="text-red-500">*</span>
                        </label>
                        <select className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl bg-white text-gray-900 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-blue-400 transition-all duration-200 shadow-sm">
                          <option value="user" className="text-gray-900">👤 Użytkownik</option>
                          <option value="editor" className="text-gray-900">✏️ Edytor</option>
                          <option value="moderator" className="text-gray-900">🛡️ Moderator</option>
                          <option value="admin" className="text-gray-900">👑 Administrator</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-10">
                        <input
                          type="checkbox"
                          id="sendInvite"
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="sendInvite" className="ml-3 block text-sm font-medium text-blue-800">
                          Wyślij email z zaproszeniem
                        </label>
                      </div>
                    </div>

                    {/* Role Descriptions */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">👤 Użytkownik</h4>
                        <p className="text-sm text-blue-800">Podstawowy dostęp do systemu</p>
                      </div>
                      <div className="bg-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-2">✏️ Edytor</h4>
                        <p className="text-sm text-indigo-800">Zarządzanie treściami i produktami</p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">🛡️ Moderator</h4>
                        <p className="text-sm text-purple-800">Moderacja treści i użytkowników</p>
                      </div>
                      <div className="bg-red-100 rounded-lg p-4 border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">👑 Administrator</h4>
                        <p className="text-sm text-red-800">Pełny dostęp do wszystkich funkcji</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-8 border-t-2 border-gray-200">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Anuluj
                      </button>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> Gotowy do utworzenia użytkownika
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      ➕ Utwórz użytkownika
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editing && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edytuj użytkownika</h2>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">👤</span>
                      Podstawowe informacje
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adres email *
                        </label>
                        <input
                          type="email"
                          defaultValue={selectedUser.email}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imię *
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedUser.profile?.first_name || ''}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nazwisko *
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedUser.profile?.last_name || ''}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numer telefonu
                        </label>
                        <input
                          type="tel"
                          defaultValue={selectedUser.profile?.phone || ''}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role and Status */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <span className="mr-2">🔐</span>
                      Rola i status
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Rola użytkownika *
                        </label>
                        <select
                          defaultValue={selectedUser.role}
                          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-blue-400 transition-colors"
                        >
                          <option value="user">Użytkownik</option>
                          <option value="editor">Edytor</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Status konta *
                        </label>
                        <select
                          defaultValue={selectedUser.status}
                          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-blue-400 transition-colors"
                        >
                          <option value="active">Aktywny</option>
                          <option value="inactive">Nieaktywny</option>
                          <option value="blocked">Zablokowany</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Aktualizuj użytkownika
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Szczegóły użytkownika</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Avatar and Basic Info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md ${
                        selectedUser.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                        selectedUser.role === 'moderator' ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                        selectedUser.role === 'editor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        'bg-gradient-to-br from-gray-500 to-slate-600'
                      }`}>
                        {(selectedUser.profile?.first_name?.[0] || selectedUser.name?.[0] || selectedUser.email[0]).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedUser.name || `${selectedUser.profile?.first_name || ''} ${selectedUser.profile?.last_name || ''}`.trim() || 'Brak nazwy'}
                        </h3>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                            {getRoleText(selectedUser.role)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                            {getStatusText(selectedUser.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <span className="mr-2">📞</span>
                      Informacje kontaktowe
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Email</p>
                        <p className="font-semibold text-blue-900">{selectedUser.email}</p>
                      </div>
                      {selectedUser.profile?.phone && (
                        <div>
                          <p className="text-sm text-blue-700">Telefon</p>
                          <p className="font-semibold text-blue-900">{selectedUser.profile.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-blue-700">Imię</p>
                        <p className="font-semibold text-blue-900">{selectedUser.profile?.first_name || 'Nie podano'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Nazwisko</p>
                        <p className="font-semibold text-blue-900">{selectedUser.profile?.last_name || 'Nie podano'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <span className="mr-2">📋</span>
                      Informacje o koncie
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700">Data utworzenia</p>
                        <p className="font-semibold text-green-900">{formatDate(selectedUser.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Ostatnie logowanie</p>
                        <p className="font-semibold text-green-900">{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nigdy'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">ID użytkownika</p>
                        <p className="font-mono text-sm text-green-900">{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Zamknij
                    </button>
                    <button
                      onClick={() => {/* TODO: Edit user */}}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Edytuj użytkownika
                    </button>
                    <button
                      onClick={() => {/* TODO: Reset password */}}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      Resetuj hasło
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
