'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type AffiliateData = {
  referral_code: string
  referrals_count: number
  discount_percentage: number
  points: number
  created_at: string
}

export default function ClientReferralsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [copied, setCopied] = useState(false)
  const [cookieSaved, setCookieSaved] = useState(false)
  const [cookieCleared, setCookieCleared] = useState(false)
  const [cookieValue, setCookieValue] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      router.replace('/login')
      return
    }
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/client/affiliate', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setAffiliate(null)
        } else {
          setAffiliate((data?.affiliate as AffiliateData) || null)
        }
      } catch (e: any) {
        console.error('Affiliate load error:', e)
        setAffiliate(null)
        setError(e?.message || 'Nie udało się pobrać danych programu poleceń.')
      } finally {
        setLoading(false)
        refreshCookieValue()
      }
    })()
  }, [isLoaded, user, router])

  function refreshCookieValue() {
    if (typeof document === 'undefined') return
    const match = document.cookie.split('; ').find((row) => row.startsWith('referral_code='))
    setCookieValue(match ? decodeURIComponent(match.split('=')[1]) : null)
  }

  const referralCode = useMemo(() => {
    if (affiliate?.referral_code && String(affiliate.referral_code).trim()) {
      return String(affiliate.referral_code).trim()
    }
    return (user?.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 16)
  }, [affiliate?.referral_code, user?.id])

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    if (!referralCode) return origin
    return `${origin}/?ref=${encodeURIComponent(referralCode)}`
  }, [referralCode])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Clipboard error', e)
      alert('Nie udało się skopiować linku.')
    }
  }

  function saveReferralCookie() {
    try {
      if (!referralCode) return
      const oneYear = 60 * 60 * 24 * 365
      document.cookie = `referral_code=${encodeURIComponent(referralCode)}; Max-Age=${oneYear}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
      setCookieSaved(true)
      setCookieCleared(false)
      refreshCookieValue()
      setTimeout(() => setCookieSaved(false), 2000)
    } catch (e) {
      console.error('saveReferralCookie error', e)
      alert('Nie udało się zapisać cookie.')
    }
  }

  function clearReferralCookie() {
    try {
      document.cookie = `referral_code=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
      setCookieCleared(true)
      setCookieSaved(false)
      refreshCookieValue()
      setTimeout(() => setCookieCleared(false), 2000)
    } catch (e) {
      console.error('clearReferralCookie error', e)
      alert('Nie udało się usunąć cookie.')
    }
  }

  if (!isLoaded) return null
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Program poleceń</h1>
              <p className="mt-2 text-indigo-100 max-w-2xl">
                Udostępnij link znajomym. Wejścia z parametrem ?ref= zapisujemy w cookies, a korzyści przypisujemy do Twojego konta.
              </p>
            </div>
            <a
              href="/client/dashboard"
              className="self-start px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-semibold border border-indigo-200"
            >
              Panel
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral link card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 text-lg">Twój link polecający</h3>
            <p className="text-sm text-gray-600 mt-1">
              Udostępnij ten link, aby polecenia były przypisane do Twojego konta.
            </p>

            {loading ? (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ) : error ? (
              <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      readOnly
                      value={referralLink}
                      className="flex-1 px-3 py-2 border border-indigo-200 rounded-md text-sm text-gray-800"
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold"
                    >
                      {copied ? 'Skopiowano' : 'Kopiuj link'}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={saveReferralCookie}
                      className="px-3 py-1.5 text-sm font-semibold rounded-md border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Zapisz cookie testowe
                    </button>
                    <button
                      onClick={clearReferralCookie}
                      className="px-3 py-1.5 text-sm font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Usuń cookie
                    </button>
                    {cookieValue && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-green-300 bg-green-50 text-green-700">
                        Cookie: {cookieValue}
                      </span>
                    )}
                    {cookieSaved && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-green-300 bg-green-50 text-green-700">
                        Zapisano cookie
                      </span>
                    )}
                    {cookieCleared && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-amber-300 bg-amber-50 text-amber-700">
                        Usunięto cookie
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Liczba poleceń</div>
                    <div className="text-2xl font-bold text-gray-900">{affiliate?.referrals_count ?? 0}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Zniżka</div>
                    <div className="text-2xl font-bold text-gray-900">{affiliate?.discount_percentage ?? 0}%</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Punkty</div>
                    <div className="text-2xl font-bold text-gray-900">{affiliate?.points ?? 0}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 text-lg">Jak to działa?</h3>
            <ol className="list-decimal ml-5 mt-2 text-sm text-gray-700 space-y-1">
              <li>Skopiuj swój link polecający.</li>
              <li>Udostępnij go znajomym lub w mediach społecznościowych.</li>
              <li>Wejścia z parametrem ?ref= są zapisywane w cookie przez nasz serwis.</li>
              <li>Korzyści (np. punkty, zniżka) są przypisywane do Twojego konta po weryfikacji.</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              Uwaga: zapis cookie testowego służy tylko do weryfikacji działania po stronie przeglądarki. W produkcji
              wykorzystywany jest parametr ?ref= i zapis w middleware.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
