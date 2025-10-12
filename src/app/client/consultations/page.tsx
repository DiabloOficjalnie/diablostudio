'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FormField, Input, Select, Textarea, Radio, Checkbox } from '@/app/components/FormField'
import Button from '@/app/components/Button'

type Consultation = {
  id: string
  quote_id: string | null
  preferred_date: string
  preferred_time: string
  message: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  service_type?: string
  inquiry_type?: string
  admin_notes?: string | null
}

const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']

export default function ClientConsultationsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  // Data
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [error, setError] = useState<string | null>(null)

  // UX state
  const [activeTab, setActiveTab] = useState<'all' | Consultation['status']>('all')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  // Create form
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<{
    preferredDate: string
    preferredTime: string
    serviceType: 'standard' | 'tech_visit' | 'offer_review'
    inquiryType: 'client_request' | 'quote_followup'
    contactMethod: 'phone' | 'email'
    contactValue: string
    notes: string
    selectedQuoteId: string
  }>({
    preferredDate: '',
    preferredTime: '',
    serviceType: 'standard',
    inquiryType: 'client_request',
    contactMethod: 'phone',
    contactValue: '',
    notes: '',
    selectedQuoteId: ''
  })

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string, type: 'success' | 'error' | 'info', text: string }>>([])

  // Quotes for linking (optional)
  const [quotes, setQuotes] = useState<Array<{ id: string; area?: number; floor_system?: string; created_at: string }>>([])
  const quotesById = useMemo(() => {
    const map: Record<string, any> = {}
    for (const q of quotes) {
      if (q?.id) map[q.id] = q
    }
    return map
  }, [quotes])

  const loadQuotes = async () => {
    try {
      const res = await fetch('/api/client/quotes', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray((data as any)?.quotes)) {
        setQuotes((data as any).quotes as any)
      } else {
        setQuotes([])
      }
    } catch {
      setQuotes([])
    }
  }

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = String(Date.now())
    setToasts(prev => [...prev, { id, type, text }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const loadConsultations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/consultations', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Nie udało się pobrać konsultacji.')
      setConsultations(Array.isArray(data.consultations) ? data.consultations : [])
    } catch (e: any) {
      console.error('Consultations load error', e)
      setError(e?.message || 'Wystąpił błąd podczas pobierania konsultacji.')
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      router.replace('/login')
      return
    }
    loadConsultations()
    loadQuotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  async function loadBooked(date: string) {
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
      setBookedSlots(unique)
      setAvailableSlots(DEFAULT_SLOTS.filter(s => !unique.includes(s)))
    } catch (e) {
      console.error('Slots load error', e)
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.preferredDate || !form.preferredTime) {
      addToast('error', 'Wybierz datę i godzinę konsultacji.')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        quote_id: form.selectedQuoteId || null,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        message: buildMessage(),
        service_type: form.serviceType || 'standard',
        inquiry_type: form.inquiryType || 'client_request'
      }
      const res = await fetch('/api/client/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) throw new Error(body?.error || 'Nie udało się wysłać prośby o konsultację.')
      setShowCreateModal(false)
      setForm({
        preferredDate: '',
        preferredTime: '',
        serviceType: 'standard',
        inquiryType: 'client_request',
        contactMethod: 'phone',
        contactValue: '',
        notes: '',
        selectedQuoteId: ''
      })
      await loadConsultations()
      addToast('success', 'Wysłano prośbę o konsultację.')
    } catch (e: any) {
      addToast('error', e?.message || 'Wystąpił błąd podczas wysyłania prośby.')
    } finally {
      setSubmitting(false)
    }
  }

  function buildMessage() {
    const parts: string[] = []
    if (form.notes && form.notes.trim()) parts.push(form.notes.trim())
    if (form.contactValue && form.contactValue.trim()) {
      const method = form.contactMethod === 'phone' ? 'telefon' : 'e-mail'
      parts.push('Preferowany kontakt: ' + method + ' — ' + form.contactValue.trim())
    }
    return parts.join(' | ')
  }

  async function cancelConsultation(id: string) {
    try {
      const res = await fetch('/api/client/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel' })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) throw new Error(body?.error || 'Nie udało się anulować konsultacji.')
      addToast('success', 'Konsultacja anulowana.')
      await loadConsultations()
    } catch (e: any) {
      addToast('error', e?.message || 'Wystąpił błąd podczas anulowania.')
    } finally {
      setSelectedConsultation(null)
    }
  }

  const filteredConsultations = useMemo(() => {
    let list = [...consultations]
    if (activeTab !== 'all') {
      list = list.filter(c => c.status === activeTab)
    }
    if (dateFilter) {
      list = list.filter(c => (c.preferred_date || '').startsWith(dateFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(c =>
        (c.message || '').toLowerCase().includes(q) ||
        (c.preferred_time || '').toLowerCase().includes(q) ||
        (c.preferred_date || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [consultations, activeTab, search, dateFilter])

  const statusBadge = (status: Consultation['status']) => {
    const base = 'inline-block text-xs px-2 py-1 rounded-full border'
    switch (status) {
      case 'confirmed':
        return `${base} bg-green-50 text-green-700 border-green-200`
      case 'pending':
        return `${base} bg-amber-50 text-amber-700 border-amber-200`
      case 'completed':
        return `${base} bg-blue-50 text-blue-700 border-blue-200`
      case 'cancelled':
      default:
        return `${base} bg-gray-50 text-gray-700 border-gray-200`
    }
  }

  // Mapowanie statusów i humanizacja nazw dla klienta
  const statusLabel = (s: Consultation['status']) => {
    switch (s) {
      case 'pending': return 'Oczekujące'
      case 'confirmed': return 'Potwierdzone'
      case 'completed': return 'Zakończone'
      case 'cancelled': return 'Anulowane'
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

  // Ogólne tokeny dla złożonych wartości (np. "indoor smooth", "good")
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
    glossy: 'Połysk',
    high_gloss: 'Wysoki połysk',
    semi_gloss: 'Półpołysk',
    low_gloss: 'Niski połysk',
    satin: 'Satyna',
    good: 'Dobry',
    average: 'Średni',
    medium: 'Średni',
    poor: 'Słaby',
    bad: 'Zły',
    standard: 'Standard',
    premium: 'Premium',
    coarse: 'Gruboziarniste',
    fine: 'Drobnoziarniste',
    fine_texture: 'Drobna tekstura',
    coarse_texture: 'Gruba tekstura'
  }

  const toPL = (group: 'floor' | 'decor' | 'substrate' | 'location', value?: string) => {
    if (!value) return ''
    const dict =
      group === 'floor' ? DICT_FLOOR :
      group === 'decor' ? DICT_DECOR :
      group === 'substrate' ? DICT_SUBSTRATE :
      DICT_LOCATION

    const fullKey = normalizeKey(value)

    // 1) Dokładne dopasowanie
    if (dict[fullKey]) return dict[fullKey]

    // 2) Wartości złożone – mapowanie tokenów (np. "indoor_smooth")
    const parts = fullKey.split('_').filter(Boolean)
    if (parts.length > 1) {
      const mapped = parts.map(p => dict[p] || UNIVERSAL_TOKENS[p] || humanize(p))
      return mapped.join(' • ')
    }

    // 3) Pojedynczy token w słowniku uniwersalnym
    if (UNIVERSAL_TOKENS[fullKey]) return UNIVERSAL_TOKENS[fullKey]

    // 4) Fallback
    return humanize(value)
  }

  // Mapowania etykiet dla konsultacji
  const serviceLabel = (v?: string) => {
    switch (v) {
      case 'standard': return 'Standard'
      case 'tech_visit': return 'Wizyta techniczna'
      case 'offer_review': return 'Omówienie oferty'
      default: return humanize(v || '')
    }
  }
  const inquiryLabel = (v?: string) => {
    switch (v) {
      case 'client_request': return 'Zapytanie klienta'
      case 'quote_followup': return 'Kontynuacja po wycenie'
      default: return humanize(v || '')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              t.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : t.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Konsultacje</h1>
              <p className="mt-2 text-indigo-100 max-w-2xl">
                Umów rozmowę z ekspertem. Wybierz dogodny termin i przekaż dodatkowe informacje.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
              + Nowa konsultacja
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tab === 'all'
                ? 'Wszystkie'
                : tab === 'pending'
                ? 'Oczekujące'
                : tab === 'confirmed'
                ? 'Potwierdzone'
                : tab === 'completed'
                ? 'Zakończone'
                : 'Anulowane'}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <FormField>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filtruj po dacie"
            />
          </FormField>
          <FormField className="sm:w-72">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj po wiadomości, dacie lub godzinie..."
              aria-label="Szukaj"
            />
          </FormField>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-100 rounded" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="p-10 text-center text-gray-600">
            Brak konsultacji spełniających kryteria. Zmień filtry lub dodaj nowe zgłoszenie.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredConsultations.map((c) => (
              <li key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(c.status)}>{statusLabel(c.status)}</span>
                      <span className="text-xs text-gray-500">
                        Utworzono: {new Date(c.created_at).toLocaleString('pl-PL')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      <span className="font-semibold">Termin: </span>
                      {c.preferred_date || '-'} {c.preferred_time ? `• ${c.preferred_time}` : ''}
                    </div>
                    {c.message && (
                      <div className="mt-1 text-sm text-gray-600 line-clamp-2">{c.message}</div>
                    )}
                    {c.quote_id && quotesById[c.quote_id] && (
                      <div className="mt-1 text-xs text-gray-500">
                        Powiązana wycena: #{quotesById[c.quote_id].id.slice(0,6).toUpperCase()} • {quotesById[c.quote_id].area ?? '-'} m² • {toPL('floor', quotesById[c.quote_id].floor_system)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsultation(c)}
                    >
                      Szczegóły
                    </Button>
                    {(c.status === 'pending' || c.status === 'confirmed') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => cancelConsultation(c.id)}
                      >
                        Anuluj
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Details modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl text-gray-900">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Szczegóły konsultacji</h3>
              <p className="text-sm text-gray-600 mt-1">Podsumowanie zgłoszenia i powiązanych informacji.</p>
            </div>
            <div className="p-6 space-y-3 text-sm max-h-[70vh] overflow-auto break-words text-gray-900">
              <div>
                <div className="text-gray-500">Status:</div>
                <div className="font-semibold whitespace-pre-wrap break-words">{statusLabel(selectedConsultation.status)}</div>
              </div>
              <div>
                <div className="text-gray-500">Utworzono:</div>
                <div className="font-semibold whitespace-pre-wrap break-words">{new Date(selectedConsultation.created_at).toLocaleString('pl-PL')}</div>
              </div>
              <div>
                <div className="text-gray-500">Termin:</div>
                <div className="font-semibold whitespace-pre-wrap break-words">{selectedConsultation.preferred_date || '-'} {selectedConsultation.preferred_time ? `• ${selectedConsultation.preferred_time}` : ''}</div>
              </div>
              {selectedConsultation.service_type && (
                <div>
                  <div className="text-gray-500">Typ usługi:</div>
                  <div className="font-semibold whitespace-pre-wrap break-words">{serviceLabel(selectedConsultation.service_type)}</div>
                </div>
              )}
              {selectedConsultation.inquiry_type && (
                <div>
                  <div className="text-gray-500">Typ zapytania:</div>
                  <div className="font-semibold whitespace-pre-wrap break-words">{inquiryLabel(selectedConsultation.inquiry_type)}</div>
                </div>
              )}
              {selectedConsultation.message && (
                <div>
                  <div className="text-gray-500">Wiadomość:</div>
                  <div className="font-semibold whitespace-pre-wrap break-words">{selectedConsultation.message}</div>
                </div>
              )}
              {selectedConsultation.admin_notes && (
                <div>
                  <div className="text-gray-500">Notatka administratora:</div>
                  <div className="font-semibold whitespace-pre-wrap break-words">{selectedConsultation.admin_notes}</div>
                </div>
              )}
              {selectedConsultation.quote_id && quotesById[selectedConsultation.quote_id] && (
                <div>
                  <div className="text-gray-500">Powiązana wycena:</div>
                  <div className="font-semibold whitespace-pre-wrap break-words">#{quotesById[selectedConsultation.quote_id].id.slice(0,6).toUpperCase()} • {quotesById[selectedConsultation.quote_id].area ?? '-'} m² • {toPL('floor', quotesById[selectedConsultation.quote_id].floor_system)}</div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
              {(selectedConsultation.status === 'pending' || selectedConsultation.status === 'confirmed') && (
                <Button variant="danger" onClick={() => cancelConsultation(selectedConsultation.id)}>
                  Anuluj konsultację
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedConsultation(null)}>
                Zamknij
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl text-gray-900">
            <form onSubmit={handleCreate}>
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Nowa konsultacja</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Wybierz datę i godzinę, uzupełnij preferowany kontakt oraz uwagi.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Data*" required>
                    <Input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => {
                        setForm({ ...form, preferredDate: e.target.value })
                        loadBooked(e.target.value)
                      }}
                      required
                    />
                  </FormField>
                  <FormField label="Godzina*" required>
                    <Select
                      value={form.preferredTime}
                      onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                      required
                    >
                      <option value="">Wybierz godzinę</option>
                      {availableSlots.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                    {bookedSlots.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">Zajęte: {bookedSlots.join(', ')}</p>
                    )}
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Sposób kontaktu">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Radio
                          name="contactMethod"
                          checked={form.contactMethod === 'phone'}
                          onChange={() => setForm({ ...form, contactMethod: 'phone' })}
                        />
                        Telefon
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Radio
                          name="contactMethod"
                          checked={form.contactMethod === 'email'}
                          onChange={() => setForm({ ...form, contactMethod: 'email' })}
                        />
                        E‑mail
                      </label>
                    </div>
                  </FormField>
                  <FormField label="Dane kontaktowe">
                    <Input
                      type={form.contactMethod === 'phone' ? 'tel' : 'email'}
                      value={form.contactValue}
                      onChange={(e) => setForm({ ...form, contactValue: e.target.value })}
                      placeholder={form.contactMethod === 'phone' ? '+48 123 456 789' : 'jan@example.com'}
                    />
                    {form.contactMethod === 'email' && (user?.primaryEmailAddress?.emailAddress) && (
                      <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                        <Checkbox
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contactValue: (e.target as HTMLInputElement).checked
                                ? (user?.primaryEmailAddress?.emailAddress || '')
                                : form.contactValue
                            })
                          }
                        />
                        Użyj adresu konta: <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                      </label>
                    )}
                  </FormField>
                </div>

                {/* Link to existing quote (optional) */}
                <FormField label="Powiąż z wyceną (opcjonalnie)">
                  <Select
                    value={form.selectedQuoteId}
                    onChange={(e) => setForm({ ...form, selectedQuoteId: e.target.value })}
                  >
                    <option value="">Brak</option>
                    {quotes.map((q) => (
                      <option key={q.id} value={q.id}>
                        #{q.id.slice(0,6).toUpperCase()} • {q.area ?? '-'} m² • {humanize(q.floor_system ?? 'system')} • {new Date(q.created_at).toLocaleDateString('pl-PL')}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Typ usługi">
                    <Select
                      value={form.serviceType}
                      onChange={(e) => setForm({ ...form, serviceType: e.target.value as typeof form.serviceType })}
                    >
                      <option value="standard">Standard</option>
                      <option value="tech_visit">Wizyta techniczna</option>
                      <option value="offer_review">Omówienie oferty</option>
                    </Select>
                  </FormField>
                  <FormField label="Typ zapytania">
                    <Select
                      value={form.inquiryType}
                      onChange={(e) => setForm({ ...form, inquiryType: e.target.value as typeof form.inquiryType })}
                    >
                      <option value="client_request">Zapytanie klienta</option>
                      <option value="quote_followup">Kontynuacja po wycenie</option>
                    </Select>
                  </FormField>
                </div>

                <FormField label="Uwagi dla eksperta">
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Opcjonalnie: krótki opis projektu, preferencje..."
                  />
                </FormField>
              </div>
              <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Wysyłanie...' : 'Wyślij prośbę'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
