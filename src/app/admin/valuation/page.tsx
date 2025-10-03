'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface ValuationForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  area: string
  floorType: string
  urgency: 'normal' | 'urgent' | 'express'
  budget: string
  description: string
  preferredContact: 'email' | 'phone' | 'whatsapp'
}

export default function NewValuationPage() {
  const [formData, setFormData] = useState<ValuationForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    area: '',
    floorType: '',
    urgency: 'normal',
    budget: '',
    description: '',
    preferredContact: 'email'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ValuationForm>>({})
  const router = useRouter()

  const handleInputChange = (field: keyof ValuationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ValuationForm> = {}

    if (!formData.customerName.trim()) newErrors.customerName = 'Nazwa klienta jest wymagana'
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email jest wymagany'
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Telefon jest wymagany'
    if (!formData.area.trim()) newErrors.area = 'Powierzchnia jest wymagana'
    if (!formData.floorType.trim()) newErrors.floorType = 'Typ podłoża jest wymagany'
    if (!formData.description.trim()) newErrors.description = 'Opis projektu jest wymagany'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Nieprawidłowy format email'
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (formData.customerPhone && !phoneRegex.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Nieprawidłowy format telefonu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Here you would typically send the data to your API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Show success message and redirect
      alert('Wycena została pomyślnie utworzona!')
      router.push('/admin')

    } catch (error) {
      console.error('Error creating valuation:', error)
      alert('Wystąpił błąd podczas tworzenia wyceny. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Nowa wycena</h1>
              <p className="text-gray-600">Utwórz nową wycenę dla klienta</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            >
              ← Powrót do dashboard
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 flex items-center">
              <span className="mr-3">👤</span>
              Informacje o kliencie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jan Kowalski"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jan@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+48 123 456 789"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferowany kontakt
                </label>
                <select
                  value={formData.preferredContact}
                  onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="email">Email</option>
                  <option value="phone">Telefon</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 flex items-center">
              <span className="mr-3">🏗️</span>
              Szczegóły projektu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Powierzchnia (m²) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="100"
                  min="1"
                  step="0.1"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Typ podłoża *
                </label>
                <select
                  value={formData.floorType}
                  onChange={(e) => handleInputChange('floorType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.floorType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Wybierz typ podłoża</option>
                  <option value="concrete">Beton</option>
                  <option value="tiles">Płytki ceramiczne</option>
                  <option value="wood">Drewno</option>
                  <option value="metal">Metal</option>
                  <option value="other">Inne</option>
                </select>
                {errors.floorType && (
                  <p className="text-red-500 text-sm mt-1">{errors.floorType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilność
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="normal">Normalna</option>
                  <option value="urgent">Pilna</option>
                  <option value="express">Ekspresowa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budżet (PLN)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opis projektu *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Opisz szczegółowo projekt, w tym oczekiwane rezultaty, specjalne wymagania, terminy wykonania..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            >
              Anuluj
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {/* TODO: Save as draft */}}
                className="px-8 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold transition-colors"
              >
                Zapisz jako szkic
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tworzenie wyceny...
                  </div>
                ) : (
                  'Utwórz wycenę'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Wskazówki
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">• Dokładne informacje</h4>
              <p>Im więcej szczegółów podasz, tym dokładniejsza będzie wycena</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">• Kontakt z klientem</h4>
              <p>Sprawdź poprawność danych kontaktowych przed wysłaniem</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">• Terminy</h4>
              <p>Pilne projekty są realizowane w pierwszej kolejności</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">• Budżet</h4>
              <p>Orientacyjny budżet pomoże dostosować propozycję</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
