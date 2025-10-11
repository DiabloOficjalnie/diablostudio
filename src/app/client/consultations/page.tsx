'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type Consultation = {
  id: string
  quote_id: string | null
  preferred_date: string
  preferred_time: string
  message: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']

export default function ClientConsultationsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [error, setError] = useState<string | null>(null)

  // create modal
  const [showModal, setShowModal] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS)
  const [form, setForm] = useState({
    preferredDate: '',
    preferredTime: '',
    message: '',
    serviceType: '',
    inquiryType: '',
    selectedQuoteId: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadConsultations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/consultations', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Nie udało się pobrać konsultacji.')
      }
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
    if (!form.preferredDate || !form.preferredTime) return
    try {
      setSubmitting(true)
      const payload = {
        quote_id: form.selectedQuoteId || null,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        message: form.message || '',
        service_type: form.serviceType || 'standard',
        inquiry_type: form.inquiryType || 'client_request'
      }
      const res = await fetch('/api/client/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Nie udało się wysłać prośby o konsultację.')
      }
      setShowModal(false)
      setForm({ preferredDate: '', preferredTime: '', message: '', serviceType: '', inquiryType: '', selectedQuoteId: '' })
      await loadConsultations()
    } catch (e: any) {
      alert(e?.message || 'Wystąpił błąd podczas wysyłania prośby.')
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konsultacje</h1>
          <p className="text-sm text-gray-600">Zgłoszenia konsultacji oraz ich status</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
        >
          + Nowa konsultacja
        </button>
      </div>

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
        ) : consultations.length === 0 ? (
          <div className="p-6">
            <div className="text-gray-600 text-sm">Brak konsultacji. Dodaj nowe zgłoszenie.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {consultations.map((c) => (
              <div key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">Data: {c.preferred_date || '-'}</div>
                    <div className="text-sm text-gray-600 mt-0.5">Godzina: {c.preferred_time || '-'}</div>
                    {c.message && <div className="text-sm text-gray-600 mt-0.5">Wiadomość: {c.message}</div>}
                    <div className="text-xs text-gray-500 mt-0.5">Utworzono: {new Date(c.created_at).toLocaleString('pl-PL')}</div>
                  </div>
                  <div className="text-right">
                    <span className={statusBadge(c.status)}>{c.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <form onSubmit={handleCreate}>
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Nowa konsultacja</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => {
                      setForm({ ...form, preferredDate: e.target.value })
                      loadBooked(e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godzina*</label>
                  <select
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
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
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dodatkowe informacje..."
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? 'Wysyłanie...' : 'Wyślij prośbę'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
