'use client'

import { useEffect, useState } from 'react'

type ConsentCategories = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const COOKIE_NAME = 'cookie_consent_v1'
const COOKIE_MAX_AGE_DAYS = 180 // 6 months

function setCookie(name: string, value: string, days: number) {
  try {
    const maxAge = days * 24 * 60 * 60
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`
  } catch {}
}

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  } catch {
    return null
  }
}

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    const existing = getCookie(COOKIE_NAME)
    if (!existing) {
      setOpen(true)
    } else {
      try {
        const parsed = JSON.parse(existing) as { categories: ConsentCategories; timestamp: number; version: number }
        if (parsed?.categories) {
          setCategories({ ...parsed.categories, necessary: true })
        }
      } catch {
        // invalid cookie -> re-consent
        setOpen(true)
      }
    }
  }, [])

  useEffect(() => {
    // expose simple helper for other scripts if needed
    if (typeof window !== 'undefined') {
      ;(window as any).__cookieConsent = {
        get: () => {
          try {
            const existing = getCookie(COOKIE_NAME)
            return existing ? JSON.parse(existing) : null
          } catch {
            return null
          }
        },
      }
    }
  }, [])

  const saveConsent = (next: ConsentCategories) => {
    const payload = JSON.stringify({
      categories: next,
      timestamp: Date.now(),
      version: 1,
    })
    setCookie(COOKIE_NAME, payload, COOKIE_MAX_AGE_DAYS)
  }

  const handleAcceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true, preferences: true }
    setCategories(next)
    saveConsent(next)
    setOpen(false)
  }

  const handleSaveSelected = () => {
    const next = { ...categories, necessary: true }
    saveConsent(next)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Używamy plików cookies</h3>
                <p className="text-sm text-gray-700">
                  Korzystamy z niezbędnych plików cookies, aby strona działała prawidłowo. Za Twoją zgodą użyjemy
                  także cookies analitycznych, marketingowych i preferencji. Szczegóły znajdziesz w&nbsp;
                  <a href="/privacy" className="text-blue-700 underline hover:text-blue-900">Polityce prywatności</a>
                  &nbsp;i&nbsp;
                  <a href="/cookies" className="text-blue-700 underline hover:text-blue-900">Polityce cookies</a>.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg">
                    <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Niezbędne</div>
                      <div className="text-xs text-gray-600">Wymagane do działania strony. Zawsze aktywne.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600"
                      checked={categories.analytics}
                      onChange={(e) => setCategories((c) => ({ ...c, analytics: e.target.checked }))}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Analityczne</div>
                      <div className="text-xs text-gray-600">Pomagają nam ulepszać działanie serwisu.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600"
                      checked={categories.marketing}
                      onChange={(e) => setCategories((c) => ({ ...c, marketing: e.target.checked }))}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Marketingowe</div>
                      <div className="text-xs text-gray-600">Personalizacja i komunikacja marketingowa.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600"
                      checked={categories.preferences}
                      onChange={(e) => setCategories((c) => ({ ...c, preferences: e.target.checked }))}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Preferencje</div>
                      <div className="text-xs text-gray-600">Zapamiętują Twoje ustawienia i wybory.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 shrink-0 w-full sm:w-64 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full btn-primary py-3 font-semibold"
                >
                  Akceptuję wszystkie
                </button>
                <button
                  type="button"
                  onClick={handleSaveSelected}
                  className="w-full btn-secondary py-3 font-semibold"
                >
                  Zapisz wybrane
                </button>
                <a href="/terms" className="text-center text-xs text-gray-600 hover:text-gray-900 underline">
                  Regulamin serwisu
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
