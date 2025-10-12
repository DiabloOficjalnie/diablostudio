'use client'

import React, { useEffect, useState } from 'react'
import { Input, Select, Textarea } from '@/app/components/FormField'

type Props = {
  quoteId: string
  onClose: () => void
  onSubmitted?: () => void
  defaultDate?: string
  className?: string
}

const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']

export default function ConsultationRequestForm({ quoteId, onClose, onSubmitted, defaultDate, className }: Props) {
  const [preferredDate, setPreferredDate] = useState(defaultDate || '')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (preferredDate) {
      void loadBookedSlots(preferredDate)
    } else {
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredDate])

  async function loadBookedSlots(date: string) {
    try {
      const res = await fetch(`/api/client/consultations?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      const booked = (Array.isArray((data as any)?.booked_slots) ? (data as any).booked_slots : []) as string[]
      const unique = Array.from(new Set(booked)) as string[]
      setBookedSlots(unique)
      setAvailableSlots(DEFAULT_SLOTS.filter(s => !unique.includes(s)))
    } catch {
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!preferredDate || !preferredTime) {
      setError('Wybierz datę i godzinę konsultacji.')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        quote_id: quoteId,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: message || '',
        service_type: 'standard',
        inquiry_type: 'quote_followup'
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
      setSuccess(true)
      if (onSubmitted) onSubmitted()
      // Close after short delay
      setTimeout(() => onClose(), 800)
    } catch (err: any) {
      setError(err?.message || 'Nie udało się wysłać prośby o konsultację.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className || ''}>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
            <Input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Godzina*</label>
            <Select
              value={preferredTime}
              onChange={(e) => setPreferredTime((e.target as HTMLSelectElement).value)}
              required
            >
              <option value="">Wybierz godzinę</option>
              {availableSlots.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            {bookedSlots.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">Zajęte: {bookedSlots.join(', ')}</div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
            placeholder="Dodatkowe informacje..."
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">Wysłano prośbę o konsultację.</div>}
      </div>
      <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold"
          disabled={submitting}
        >
          Anuluj
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-md text-sm font-semibold ${submitting ? 'bg-emerald-300 text-white cursor-not-allowed' : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
          disabled={submitting}
        >
          {submitting ? 'Wysyłanie…' : 'Wyślij prośbę'}
        </button>
      </div>
    </form>
  )
}
