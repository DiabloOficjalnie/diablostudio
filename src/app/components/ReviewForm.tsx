'use client'

import { useState } from 'react'

interface ReviewFormData {
  firstName: string
  lastName: string
  email: string
  projectDate: string
  projectType: string
  squareMeters: string
  rating: number
  reviewText: string
  consent: boolean
}

interface ReviewFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  projectDate?: string
  projectType?: string
  squareMeters?: string
  rating?: string
  reviewText?: string
  consent?: string
}

interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: ReviewFormData) => void
}

export default function ReviewForm({ isOpen, onClose, onSubmit }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    firstName: '',
    lastName: '',
    email: '',
    projectDate: '',
    projectType: '',
    squareMeters: '',
    rating: 0,
    reviewText: '',
    consent: false
  })

  const [errors, setErrors] = useState<ReviewFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resinTypes = [
    'Epoksyd Standard',
    'Epoksyd Premium',
    'Poliuretan Standard',
    'Poliuretan Premium'
  ]

  const executionSystems = [
    'Gładkie',
    'Z płatkami (flakes)',
    'Efekt marmuru',
    'Strukturalne (antypoślizgowe)',
    'Transparentne',
    'Antystatyczne',
    'Metallic',
    'Inne'
  ]

  const handleInputChange = (field: keyof ReviewFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ReviewFormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Imię jest wymagane'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane'
    if (!formData.email.trim()) newErrors.email = 'Email jest wymagany'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email'
    }
    if (!formData.projectDate) newErrors.projectDate = 'Data realizacji jest wymagana'
    if (!formData.projectType) newErrors.projectType = 'Rodzaj żywicy jest wymagany'
    if (!formData.squareMeters.trim()) newErrors.squareMeters = 'Powierzchnia jest wymagana'
    else if (isNaN(Number(formData.squareMeters)) || Number(formData.squareMeters) <= 0) {
      newErrors.squareMeters = 'Podaj prawidłową powierzchnię'
    }
    if (formData.rating === 0) newErrors.rating = 'Ocena jest wymagana'
    if (!formData.reviewText.trim()) newErrors.reviewText = 'Treść opinii jest wymagana'
    if (!formData.consent) newErrors.consent = 'Zgoda jest wymagana'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        projectDate: '',
        projectType: '',
        squareMeters: '',
        rating: 0,
        reviewText: '',
        consent: false
      })
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="text-3xl transition-colors focus:outline-none"
          >
            <span className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
              ⭐
            </span>
          </button>
        ))}
        <span className="ml-3 text-gray-600">
          {rating > 0 ? `${rating}/5 gwiazdek` : 'Wybierz ocenę'}
        </span>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dodaj swoją opinię</h2>
              <p className="text-blue-100 mt-1">Podziel się doświadczeniami z innymi klientami</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dane osobowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Imię *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jan"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nazwisko *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kowalski"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jan.kowalski@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-black mb-4">Informacje o projekcie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-black mb-2">
                  Data realizacji *
                </label>
                <input
                  type="date"
                  value={formData.projectDate}
                  onChange={(e) => handleInputChange('projectDate', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium placeholder-gray-700 ${
                    errors.projectDate ? 'border-red-600' : 'border-gray-400'
                  }`}
                />
                {errors.projectDate && <p className="text-red-700 text-base mt-1 font-bold">{errors.projectDate}</p>}
              </div>
              <div>
                <label className="block text-base font-bold text-black mb-2">
                  Powierzchnia (m²) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.squareMeters}
                  onChange={(e) => handleInputChange('squareMeters', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium placeholder-gray-700 ${
                    errors.squareMeters ? 'border-red-600' : 'border-gray-400'
                  }`}
                  placeholder="50.5"
                />
                {errors.squareMeters && <p className="text-red-700 text-base mt-1 font-bold">{errors.squareMeters}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold text-black mb-2">
                  Rodzaj zastosowanej żywicy *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium ${
                    errors.projectType ? 'border-red-600' : 'border-gray-400'
                  }`}
                >
                  <option value="">Wybierz rodzaj żywicy</option>
                  {resinTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.projectType && <p className="text-red-700 text-base mt-1 font-bold">{errors.projectType}</p>}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ocena</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Jak oceniasz naszą pracę? *
              </label>
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => handleInputChange('rating', rating)}
              />
              {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Twoja opinia</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Opisz swoje doświadczenia *
              </label>
              <textarea
                rows={5}
                value={formData.reviewText}
                onChange={(e) => handleInputChange('reviewText', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reviewText ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Opisz jakość wykonania, kontakt z biurem, terminowość, efekt końcowy..."
              />
              {errors.reviewText && <p className="text-red-500 text-sm mt-1">{errors.reviewText}</p>}
            </div>
          </div>

          {/* Consent */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => handleInputChange('consent', e.target.checked)}
                className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                  errors.consent ? 'border-red-500' : ''
                }`}
              />
              <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                Wyrażam zgodę na przetwarzanie danych osobowych w celu weryfikacji i publikacji opinii.
                Rozumiem, że opinia zostanie zweryfikowana przed publikacją przez administratora. *
              </label>
            </div>
            {errors.consent && <p className="text-red-500 text-sm mt-2">{errors.consent}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Wysyłanie...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Wyślij opinię
                  <span className="ml-2">📤</span>
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <p>
              ⏰ Opinie są weryfikowane w ciągu 24-48 godzin<br />
              📧 Otrzymasz powiadomienie email po publikacji opinii<br />
              🛡️ Wszystkie dane są chronione zgodnie z RODO
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
