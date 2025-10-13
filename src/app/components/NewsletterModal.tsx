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
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

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
    if (!email || !privacyConsent || !marketingConsent) {
      setStatus({ type: 'error', message: 'Wymagana akceptacja Polityki prywatności/Regulaminu oraz zgoda marketingowa (newsletter).' })
      return
    }
    setStatus({ type: 'loading' })
    try {
      const token = await executeRecaptcha('newsletter_popup')
      const utm = getUTM()

      // Persist selected consents in cookie (6 months)
      try {
        document.cookie = `user_consents_v1=${encodeURIComponent(JSON.stringify({
          newsletter_popup: { privacy: privacyConsent, marketing: marketingConsent },
          ts: Date.now(), v: 1
        }))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`
      } catch {}

      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          source: 'popup',
          recaptchaToken: token,
          marketing_consent: marketingConsent === true,
          privacy_consent: privacyConsent === true,
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
      // Pomyślnie zapisano — pozostawiamy widoczny ekran potwierdzenia.
      // Użytkownik może zamknąć okno ręcznie przyciskiem poniżej.
    } catch {
      setStatus({ type: 'error', message: 'Wystąpił błąd sieci. Spróbuj ponownie.' })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="newsletter-title">
      <div className="absolute inset-0 bg-black/60" onClick={() => handleClose('snooze')} />
      <div className="relative bg-white rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 md:p-7">
          <div className="flex items-center justify-between">
            <h3 id="newsletter-title" className="text-lg sm:text-xl md:text-2xl font-bold">
              📧 Dołącz do newslettera
              <span className="ml-2 inline-flex items-center text-[10px] sm:text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">🎁 Poradnik PDF gratis</span>
            </h3>
            <button
              onClick={() => handleClose('snooze')}
              aria-label="Zamknij"
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-indigo-100 mt-2 text-xs sm:text-sm md:text-base">
            Porady ekspertów, realizacje i promocje 1–2 razy w miesiącu. Zero spamu.
          </p>
        </div>

        <div className="p-5 sm:p-6 md:p-8">
          {status.type === 'success' ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl sm:text-3xl">✓</div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Dziękujemy za zapis!</h4>
              <p className="text-gray-600">Będziesz otrzymywać od nas:</p>
              <ul className="text-left text-gray-700 space-y-1 max-w-sm mx-auto text-sm sm:text-base">
                <li>• praktyczne porady i inspiracje dotyczące posadzek</li>
                <li>• realizacje i case studies krok po kroku</li>
                <li>• okazjonalne promocje i oferty specjalne (1–2 wiadomości/miesiąc)</li>
              </ul>
              <button
                type="button"
                onClick={() => handleClose('forever')}
                className="w-full py-3 md:py-3.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Super, czekam na wiadomości
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imię
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="np. Jan"
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
              </div>

              {/* Selling points */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  1–2 wiadomości/miesiąc
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  Zero spamu
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  Porady i promocje
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    required
                  />
                  <span>
                    Akceptuję <a href="/privacy" className="underline">Politykę prywatności</a> i <a href="/terms" className="underline">Regulamin</a>.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    required
                  />
                  <span>Wyrażam zgodę na otrzymywanie informacji handlowych (newsletter) drogą elektroniczną.</span>
                </label>
                <button
                  type="submit"
                  disabled={status.type === 'loading' || !email || !privacyConsent || !marketingConsent}
                  className="btn-primary w-full py-3 md:py-3.5 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status.type === 'loading' ? 'Zapisywanie...' : 'Zapisz mnie'}
                </button>
              </div>

              {status.type === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {status.message}
                </div>
              )}

              <div className="mt-2 text-[11px] sm:text-xs text-gray-500 flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><span className="text-green-600">🔒</span> Bezpieczne szyfrowanie</span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1"><span className="text-green-600">↩︎</span> Wypis w 1 klik</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Brak spamu</span>
              </div>
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
          )}
        </div>
      </div>
    </div>
  )
}
