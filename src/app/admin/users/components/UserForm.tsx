'use client'

import { useState, useEffect } from 'react'

interface UserFormData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  role: 'admin' | 'moderator' | 'editor' | 'user'
  status: 'active' | 'inactive' | 'blocked'
}

interface UserFormProps {
  user?: any
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  loading?: boolean
}

export default function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user',
    status: 'active'
  })

  const [errors, setErrors] = useState<Partial<UserFormData>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Don't populate password for editing
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone: user.profile?.phone || '',
        role: user.role || 'user',
        status: user.status || 'active'
      })
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email'
    }

    // Password validation (only for new users)
    if (!user && !formData.password) {
      newErrors.password = 'Hasło jest wymagane'
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć minimum 6 znaków'
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Imię jest wymagane'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nazwisko jest wymagane'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const roles = [
    { value: 'user', label: 'Użytkownik', description: 'Podstawowy dostęp do systemu' },
    { value: 'editor', label: 'Edytor', description: 'Zarządzanie treściami i mediami' },
    { value: 'moderator', label: 'Moderator', description: 'Moderacja treści i zarządzanie użytkownikami' },
    { value: 'admin', label: 'Administrator', description: 'Pełny dostęp do wszystkich funkcji' }
  ]

  const statuses = [
    { value: 'active', label: 'Aktywny', description: 'Konto aktywne i potwierdzone' },
    { value: 'inactive', label: 'Nieaktywny', description: 'Konto niepotwierdzone lub zawieszone' },
    { value: 'blocked', label: 'Zablokowany', description: 'Konto zablokowane z powodu naruszeń' }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}
          </h2>
          <p className="text-gray-600 mt-1">
            {user ? 'Zaktualizuj informacje o użytkowniku' : 'Utwórz nowe konto użytkownika w systemie'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Podstawowe informacje
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="uzytkownik@example.com"
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password (only for new users) */}
            {!user && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasło *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 znaków"
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Jan"
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwisko *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Kowalski"
                className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numer telefonu
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+48 123 456 789"
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
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Rola użytkownika *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-blue-400 transition-colors"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-blue-600 mt-1">
                {roles.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Status konta *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-blue-400 transition-colors"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-blue-600 mt-1">
                {statuses.find(s => s.value === formData.status)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            disabled={loading}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {user ? 'Aktualizowanie...' : 'Tworzenie...'}
              </div>
            ) : (
              user ? 'Aktualizuj użytkownika' : 'Utwórz użytkownika'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
