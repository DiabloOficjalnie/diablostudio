'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import generateQuotePDF from '@/lib/pdfGenerator'
import ConsultationRequestForm from '@/app/components/ConsultationRequestForm'
import Button from '@/app/components/Button'

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
  contact_preferences?: any | null
  consents?: any | null
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

  // Pomocnicze mapowania i formatowanie nazw dla klienta
  const statusLabel = (s: ClientQuote['status']) => {
    switch (s) {
      case 'saved': return 'Zapisano'
      case 'consultation_requested': return 'Konsultacja zgłoszona'
      case 'in_progress': return 'W trakcie'
      case 'completed': return 'Zakończona'
      default: return s
    }
  }

  const humanize = (v?: string) => {
    if (!v) return ''
    return v
      .toString()
      .replace(/[_\-]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Mapowania kodów na polskie nazwy (fallback do humanize)
  const DICT_FLOOR: Record<string, string> = {
    epoxy: 'Epoksydowy',
    polyurethane: 'Poliuretanowy',
    microcement: 'Mikrocement',
    industrial: 'Przemysłowy',
    decorative: 'Dekoracyjny'
  }
  const DICT_DECOR: Record<string, string> = {
    flakes: 'Płatki dekoracyjne',
    quartz: 'Kwarc',
    matte: 'Mat',
    gloss: 'Połysk',
    satin: 'Satyna'
  }
  const DICT_SUBSTRATE: Record<string, string> = {
    concrete: 'Beton',
    anhydrite: 'Anhydryt',
    tiles: 'Płytki',
    screed: 'Wylewka',
    wood: 'Drewno'
  }
  const DICT_LOCATION: Record<string, string> = {
    garage: 'Garaż',
    living_room: 'Salon',
    kitchen: 'Kuchnia',
    terrace: 'Taras',
    bathroom: 'Łazienka',
    hall: 'Korytarz'
  }

  const normalizeKey = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

  // Dodatkowe ogólne mapowania tokenów (stosowane przy złożonych nazwach typu "indoor smooth")
  const UNIVERSAL_TOKENS: Record<string, string> = {
    indoor: 'Wewnątrz',
    outdoor: 'Na zewnątrz',
    smooth: 'Gładkie',
    antislip: 'Antypoślizgowe',
    anti_slip: 'Antypoślizgowe',
    textured: 'Teksturowane',
    rough: 'Chropowate',
    matte: 'Mat',
    matt: 'Mat',
    gloss: 'Połysk',
    satin: 'Satyna'
  }

  const toPL = (group: 'floor' | 'decor' | 'substrate' | 'location', value?: string) => {
    if (!value) return ''
    const dict =
      group === 'floor' ? DICT_FLOOR :
      group === 'decor' ? DICT_DECOR :
      group === 'substrate' ? DICT_SUBSTRATE :
      DICT_LOCATION

    const fullKey = normalizeKey(value)

    // 1) Próba dokładnego dopasowania
    if (dict[fullKey]) return dict[fullKey]

    // 2) Mapowanie złożonych nazw po tokenach (np. "indoor_smooth" → "Wewnątrz • Gładkie")
    const parts = fullKey.split('_').filter(Boolean)
    if (parts.length > 1) {
      const mapped = parts.map(p => dict[p] || UNIVERSAL_TOKENS[p] || humanize(p))
      return mapped.join(' • ')
    }

    // 3) Fallback – próba mapowania pojedynczego tokena w słowniku uniwersalnym
    if (UNIVERSAL_TOKENS[fullKey]) return UNIVERSAL_TOKENS[fullKey]

    // 4) Ostatecznie humanizacja
    return humanize(value)
  }

  const KEY_LABELS: Record<string, string> = {
    preferred_contact_method: 'Preferowany kontakt',
    preferred_contact_time: 'Preferowany czas kontaktu',
    email: 'E‑mail',
    phone: 'Telefon',
    newsletter: 'Newsletter',
    rodo: 'Zgoda RODO',
    terms: 'Regulamin',
    marketing: 'Zgody marketingowe'
  }
  const formatKey = (k: string) => KEY_LABELS[k] || humanize(k)

  const renderKeyValueList = (obj: any) => {
    try {
      if (!obj) return null
      const entries = Object.entries(obj)
      if (entries.length === 0) return null
      return (
        <ul className="mt-1 space-y-1 text-sm">
          {entries.map(([k, v]) => (
            <li key={String(k)} className="flex gap-2">
              <span className="text-gray-500 min-w-40">{formatKey(String(k))}:</span>
              <span className="font-semibold">{typeof v === 'boolean' ? (v ? 'Tak' : 'Nie') : String(v)}</span>
            </li>
          ))}
        </ul>
      )
    } catch {
      return null
    }
  }

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
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Wyceny</h1>
              <p className="mt-2 text-indigo-100">Lista wszystkich zapisanych kalkulacji</p>
            </div>
            <Button variant="secondary" href="/valuation" size="md">
              + Nowa wycena
            </Button>
          </div>
        </div>
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
                      #{q.id.slice(0, 6).toUpperCase()} • {q.area} m² • {toPL('floor', q.floor_system)}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {toPL('location', q.location)} • {toPL('decor', q.decorative_system)} • {toPL('substrate', q.substrate_condition)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(q.created_at).toLocaleString('pl-PL')}
                    </div>
                    <div className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full border">
                      <span className={
                        q.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full' :
                        q.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full' :
                        q.status === 'consultation_requested' ? 'bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full' :
                        'bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full'
                      }>
                        {statusLabel(q.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatPLN(q.price_min)} – {formatPLN(q.price_max)} / m²</div>
                    <div className="text-sm text-gray-700">Razem: {formatPLN(q.total_min)} – {formatPLN(q.total_max)}</div>

                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRequestConsultation(q)}
                      >
                        Umów konsultację
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePreviewQuote(q)}
                      >
                        Podgląd
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(q)}
                      >
                        Pobierz PDF
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteQuote(q)}
                      >
                        Usuń
                      </Button>
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
            <div className="p-6 space-y-3 text-sm max-h-[70vh] overflow-auto">
              <div><span className="text-gray-500">Powierzchnia:</span> <span className="font-semibold">{selectedQuote.area} m²</span></div>
              <div><span className="text-gray-500">System:</span> <span className="font-semibold">{toPL('floor', selectedQuote.floor_system)}</span></div>
              <div><span className="text-gray-500">Dekoracja:</span> <span className="font-semibold">{toPL('decor', selectedQuote.decorative_system)}</span></div>
              <div><span className="text-gray-500">Podłoże:</span> <span className="font-semibold">{toPL('substrate', selectedQuote.substrate_condition)}</span></div>
              <div><span className="text-gray-500">Lokalizacja:</span> <span className="font-semibold">{toPL('location', selectedQuote.location)}</span></div>
              <div><span className="text-gray-500">Cena za m²:</span> <span className="font-semibold">{formatPLN(selectedQuote.price_min)} – {formatPLN(selectedQuote.price_max)} / m²</span></div>
              <div><span className="text-gray-500">Razem:</span> <span className="font-semibold">{formatPLN(selectedQuote.total_min)} – {formatPLN(selectedQuote.total_max)}</span></div>
              {selectedQuote.consultation_date && (
                <div><span className="text-gray-500">Termin konsultacji:</span> <span className="font-semibold">{new Date(selectedQuote.consultation_date).toLocaleString('pl-PL')}</span></div>
              )}
              {selectedQuote.consultation_notes && (
                <div><span className="text-gray-500">Notatki konsultacji:</span> <span className="font-semibold">{selectedQuote.consultation_notes}</span></div>
              )}
              <div className="pt-2">
                <div className="text-gray-500">Preferencje kontaktu:</div>
                {renderKeyValueList(selectedQuote.contact_preferences) || (
                  <div className="text-gray-400 text-sm">Brak</div>
                )}
              </div>
              <div className="pt-1">
                <div className="text-gray-500">Zgody:</div>
                {renderKeyValueList(selectedQuote.consents) || (
                  <div className="text-gray-400 text-sm">Brak</div>
                )}
              </div>
              <div><span className="text-gray-500">Status:</span> <span className="font-semibold">{statusLabel(selectedQuote.status)}</span></div>
              <div><span className="text-gray-500">Utworzono:</span> <span className="font-semibold">{new Date(selectedQuote.created_at).toLocaleString('pl-PL')}</span></div>
            </div>
            <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(selectedQuote)}>Pobierz PDF</Button>
              <Button variant="secondary" size="sm" onClick={() => handleRequestConsultation(selectedQuote)}>Poproś o konsultację</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowQuotePreviewModal(false)}>Zamknij</Button>
            </div>
          </div>
        </div>
      )}

      {showConsultationModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Prośba o konsultację</h3>
            </div>
            <ConsultationRequestForm
              quoteId={selectedQuote.id}
              onClose={() => setShowConsultationModal(false)}
              onSubmitted={() => {
                addNotification('success', 'Wysłano prośbę', 'Twoja prośba o konsultację została przyjęta.')
              }}
              className="pt-0"
            />
          </div>
        </div>
      )}

    </div>
  )
}
