'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { executeRecaptcha } from '@/lib/recaptcha-client'

type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

interface NewsletterModalProps {
  delayMs?: number
  snoozeDays?: number
  enableOnPaths?: RegExp // show only when pathname matches (default: all public pages)
}

const SNOOZE_KEY = 'newsletter_snooze_until'
const SUBSCRIBED_KEY = 'newsletter_subscribed'

function getUTM() {
  if (typeof window === 'undefined') return {}
  try {
    const url = new URL(window.location.href)
    const params = url.searchParams
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    }
  } catch {
    return {}
  }
}

function nowMs() {
  return Date.now()
}

function daysToMs(days: number) {
  return days * 24 * 60 * 60 * 1000
}

export default function NewsletterModal({
  delayMs = 15000,
  snoozeDays = 7,
  enableOnPaths,
}: NewsletterModalProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  const enabled = useMemo(() => {
    // Default: show on all public pages except /admin and /client areas
    const defaultRegex = /^(?!\/(admin|client))/ // anything not starting with /admin or /client
    const rx = enableOnPaths ?? defaultRegex
    return rx.test(pathname || '/')
  }, [pathname, enableOnPaths])

  // Decide whether we are snoozed or already subscribed
  const shouldShow = useMemo(() => {
    if (!enabled) return false
    if (typeof window === 'undefined') return false
    try {
      const snoozeUntil = localStorage.getItem(SNOOZE_KEY)
      const subscribed = localStorage.getItem(SUBSCRIBED_KEY)
      if (subscribed === 'true') return false
      if (snoozeUntil) {
        const snoozeTs = Number(snoozeUntil)
        if (!Number.isNaN(snoozeTs) && snoozeTs > nowMs()) {
          return false
        }
      }
      return true
    } catch {
      return true
    }
  }, [enabled])

  // Timer to open the modal after delay
  useEffect(() => {
    if (!shouldShow) return
    const t = setTimeout(() => setOpen(true), delayMs)
    return () => clearTimeout(t)
  }, [shouldShow, delayMs])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose('snooze')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleClose = (mode: 'snooze' | 'forever' = 'snooze') => {
    try {
      if (mode === 'forever') {
        localStorage.setItem(SUBSCRIBED_KEY, 'true') // effectively never show again
      } else {
        const until = nowMs() + daysToMs(snoozeDays)
        localStorage.setItem(SNOOZE_KEY, String(until))
      }
    } catch {}
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus({ type: 'loading' })
    try {
      const token = await executeRecaptcha('newsletter_popup')
      const utm = getUTM()
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          source: 'popup',
          recaptchaToken: token,
          ...utm,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        setStatus({ type: 'error', message: data.error || 'Nie udało się zapisać. Spróbuj ponownie.' })
        return
      }
      setStatus({ type: 'success', message: data.message || 'Dziękujemy za zapis!' })
      try {
        localStorage.setItem(SUBSCRIBED_KEY, 'true')
      } catch {}
      // auto-close after a short delay
      setTimeout(() => setOpen(false), 2000)
    } catch {
      setStatus({ type: 'error', message: 'Wystąpił błąd sieci. Spróbuj ponownie.' })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => handleClose('snooze')} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              📧 Zapisz się do newslettera
            </h3>
            <button
              onClick={() => handleClose('snooze')}
              aria-label="Zamknij"
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Najnowsze porady, realizacje i promocje prosto na Twój e-mail.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="np. Jan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-600 bg-white text-gray-900 mb-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. jan.kowalski@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-600 bg-white text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={status.type === 'loading' || !email}
              className="w-full py-3 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {status.type === 'loading' ? 'Zapisywanie...' : 'Zapisz mnie'}
            </button>

            {status.type === 'success' && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                {status.message}
              </div>
            )}
            {status.type === 'error' && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                {status.message}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <button
                type="button"
                onClick={() => handleClose('snooze')}
                className="underline hover:text-gray-700"
              >
                Przypomnij za {snoozeDays} dni
              </button>
              <button
                type="button"
                onClick={() => handleClose('forever')}
                className="underline hover:text-gray-700"
              >
                Nie pokazuj ponownie
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
