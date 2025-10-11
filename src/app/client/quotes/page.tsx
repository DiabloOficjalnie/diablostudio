'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import generateQuotePDF from '@/lib/pdfGenerator'

interface ClientQuote {
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
  created_at: string
  status: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
  consultation_date?: string
  consultation_notes?: string
}

export default function ClientQuotesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<ClientQuote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<ClientQuote | null>(null)
  const [showQuotePreviewModal, setShowQuotePreviewModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
  }>>([])

  const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [consultationForm, setConsultationForm] = useState({
    preferredDate: '',
    preferredTime: '',
    message: '',
    serviceType: '',
    inquiryType: '',
    selectedQuoteId: ''
  })

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(n || 0))

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now()
    }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      router.replace('/login')
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/client/quotes', { cache: 'no-store' })
        if (!res.ok) {
          setQuotes([])
        } else {
          const data = await res.json().catch(() => ({}))
          setQuotes(Array.isArray(data?.quotes) ? data.quotes : [])
        }
      } catch (e) {
        console.error('load quotes error', e)
        setQuotes([])
      } finally {
        setLoading(false)
      }
    })()
  }, [isLoaded, user])

  function handlePreviewQuote(q: ClientQuote) {
    setSelectedQuote(q)
    setShowQuotePreviewModal(true)
  }

  async function handleDownloadPDF(q: ClientQuote) {
    try {
      await generateQuotePDF({
        area: q.area,
        floorSystem: q.floor_system,
        substrateCondition: q.substrate_condition,
        location: q.location,
        decorativeSystem: q.decorative_system,
        priceRange: { min: q.price_min, max: q.price_max },
        totalMin: q.total_min,
        totalMax: q.total_max
      } as any)
      addNotification('success', 'PDF wygenerowany', 'Pomyślnie wygenerowano plik PDF z wyceną.')
    } catch (err) {
      console.error('PDF error', err)
      addNotification('error', 'Błąd PDF', 'Nie udało się wygenerować pliku PDF.')
    }
  }

  async function handleDeleteQuote(q: ClientQuote) {
    try {
      if (!confirm('Czy na pewno chcesz usunąć tę wycenę?')) return
      const res = await fetch(`/api/client/quotes/${q.id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Delete failed')
      }
      setQuotes(prev => prev.filter(x => x.id !== q.id))
      addNotification('success', 'Usunięto wycenę', 'Wycena została usunięta.')
    } catch (e) {
      console.error('delete quote error', e)
      addNotification('error', 'Błąd usuwania', 'Nie udało się usunąć wyceny.')
    }
  }

  function handleRequestConsultation(q: ClientQuote) {
    setSelectedQuote(q)
    setConsultationForm(prev => ({
      ...prev,
      selectedQuoteId: q.id,
      message: prev.message || `Prośba o konsultację do wyceny #${q.id}`
    }))
    setShowConsultationModal(true)
  }

  async function loadBookedSlots(date: string) {
    if (!date) {
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
      return
    }
    try {
      const res = await fetch(`/api/client/consultations?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      const booked = (Array.isArray((data as any)?.booked_slots) ? (data as any).booked_slots : []) as string[]
      const unique = Array.from(new Set(booked)) as string[]
      setBookedSlots(unique as string[])
      setAvailableSlots(DEFAULT_SLOTS.filter((s: string) => !(unique as string[]).includes(s)))
    } catch (e) {
      console.error('loadBookedSlots error:', e)
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
    }
  }

  async function handleConsultationSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    try {
      const payload = {
        quote_id: consultationForm.selectedQuoteId || selectedQuote?.id || null,
        preferred_date: consultationForm.preferredDate,
        preferred_time: consultationForm.preferredTime,
        message: consultationForm.message || '',
        service_type: consultationForm.serviceType || 'standard',
        inquiry_type: consultationForm.inquiryType || 'quote_followup'
      }

      if (!payload.preferred_date || !payload.preferred_time) {
        addNotification('warning', 'Brak danych', 'Wybierz datę i godzinę konsultacji.')
        return
      }

      const res = await fetch('/api/client/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Consultation create failed')
      }

      setShowConsultationModal(false)
      setConsultationForm({
        preferredDate: '',
        preferredTime: '',
        message: '',
        serviceType: '',
        inquiryType: '',
        selectedQuoteId: ''
      })
      addNotification('success', 'Wysłano prośbę', 'Twoja prośba o konsultację została przyjęta.')
    } catch (err) {
      console.error('handleConsultationSubmit error:', err)
      addNotification('error', 'Błąd konsultacji', 'Nie udało się wysłać prośby o konsultację.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Twoje wyceny</h1>
          <p className="text-sm text-gray-600">Lista wszystkich zapisanych kalkulacji</p>
        </div>
        <a href="/valuation" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
          + Nowa wycena
        </a>
      </div>

      {/* Notifications (toasts area) */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              n.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
              n.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
              n.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <div className="font-semibold">{n.title}</div>
            <div className="text-xs">{n.message}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-100 rounded" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-6">
            <div className="text-gray-600 text-sm">
              Brak zapisanych wycen. Użyj kalkulatora, aby dodać pierwszą wycenę.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {quotes.map((q) => (
              <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      #{q.id.slice(0, 6).toUpperCase()} • {q.area} m² • {q.floor_system}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {q.location} • {q.decorative_system} • {q.substrate_condition}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(q.created_at).toLocaleString('pl-PL')}
                    </div>
                    <div className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full border
                      ">
                      <span className={
                        q.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full' :
                        q.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full' :
                        q.status === 'consultation_requested' ? 'bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full' :
                        'bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full'
                      }>
                        {q.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{q.price_min} - {q.price_max} PLN/m²</div>
                    <div className="text-sm text-gray-700">Razem: {Math.round(q.total_min)} - {Math.round(q.total_max)} PLN</div>

                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                      <button onClick={() => handlePreviewQuote(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100">
                        Podgląd
                      </button>
                      <button onClick={() => handleDownloadPDF(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">
                        PDF
                      </button>
                      <button onClick={() => handleRequestConsultation(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        Konsultacja
                      </button>
                      <button onClick={() => handleDeleteQuote(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-300 text-red-700 hover:bg-red-50">
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQuotePreviewModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Podgląd wyceny</h3>
            </div>
            <div className="p-6 space-y-2 text-sm">
              <div><span className="text-gray-500">Powierzchnia:</span> <span className="font-semibold">{selectedQuote.area} m²</span></div>
              <div><span className="text-gray-500">System:</span> <span className="font-semibold">{selectedQuote.floor_system}</span></div>
              <div><span className="text-gray-500">Dekoracja:</span> <span className="font-semibold">{selectedQuote.decorative_system}</span></div>
              <div><span className="text-gray-500">Podłoże:</span> <span className="font-semibold">{selectedQuote.substrate_condition}</span></div>
              <div><span className="text-gray-500">Zakres cen:</span> <span className="font-semibold">{formatPLN(selectedQuote.total_min)} – {formatPLN(selectedQuote.total_max)}</span></div>
            </div>
            <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
              <button onClick={() => handleDownloadPDF(selectedQuote)} className="px-4 py-2 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-semibold">Pobierz PDF</button>
              <button onClick={() => handleRequestConsultation(selectedQuote)} className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold">Poproś o konsultację</button>
              <button onClick={() => setShowQuotePreviewModal(false)} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold">Zamknij</button>
            </div>
          </div>
        </div>
      )}

      {showConsultationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <form onSubmit={handleConsultationSubmit}>
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Prośba o konsultację</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
                  <input
                    type="date"
                    value={consultationForm.preferredDate}
                    onChange={(e) => {
                      setConsultationForm({ ...consultationForm, preferredDate: e.target.value })
                      loadBookedSlots(e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godzina*</label>
                  <select
                    value={consultationForm.preferredTime}
                    onChange={(e) => setConsultationForm({ ...consultationForm, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Wybierz godzinę</option>
                    {availableSlots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {bookedSlots.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">Zajęte: {bookedSlots.join(', ')}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
                  <textarea
                    rows={3}
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dodatkowe informacje..."
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowConsultationModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold"
                >
                  Wyślij prośbę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
