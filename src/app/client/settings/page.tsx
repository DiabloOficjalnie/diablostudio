'use client'

import React, { useEffect, useState } from 'react'
import { useUser, UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type NewsletterSettings = {
  generalNewsletter: boolean
  productUpdates: boolean
  promotionalOffers: boolean
  technicalNews: boolean
}

type MarketingSettings = {
  analyticsConsent: boolean
  marketingEmails: boolean
  personalizedAds: boolean
  dataSharing: boolean
}

export default function ClientSettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)

  const [newsletterSettings, setNewsletterSettings] = useState<NewsletterSettings>({
    generalNewsletter: true,
    productUpdates: true,
    promotionalOffers: false,
    technicalNews: false,
  })
  const [marketingSettings, setMarketingSettings] = useState<MarketingSettings>({
    analyticsConsent: true,
    marketingEmails: false,
    personalizedAds: false,
    dataSharing: false,
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
      return
    }
    ;(async () => {
      setIsSettingsLoading(true)
      try {
        const res = await fetch('/api/client/settings', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (res.ok && (data as any)?.success) {
          if ((data as any)?.settings?.newsletter) setNewsletterSettings((data as any).settings.newsletter)
          if ((data as any)?.settings?.marketing) setMarketingSettings((data as any).settings.marketing)
          if (typeof (data as any)?.settings?.two_factor_enabled === 'boolean') {
            setIsTwoFactorEnabled(Boolean((data as any).settings.two_factor_enabled))
          }
        }
      } catch (e) {
        console.error('loadSettings error', e)
      } finally {
        setIsSettingsLoading(false)
      }
    })()
  }, [isLoaded, user, router])

  useEffect(() => {
    if (!isLoaded) return
    if (!user) return
    ;(async () => {
      try {
        const res = await fetch('/api/client/statistics', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (res.ok && (data as any)?.success) {
          setStatistics((data as any).statistics || null)
        }
      } catch (e) {
        console.error('loadStatistics error', e)
      }
    })()
  }, [isLoaded, user])

  async function saveSettingsToAPI() {
    try {
      setIsSavingSettings(true)
      const res = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletter: newsletterSettings,
          marketing: marketingSettings,
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || (body as any)?.success === false) {
        throw new Error((body as any)?.error || 'Save failed')
      }
      alert('Ustawienia zapisane.')
    } catch (e) {
      console.error('saveSettingsToAPI error:', e)
      alert('Nie udało się zapisać ustawień.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Statystyki konta */}
      {statistics && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Zakończone projekty</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.completed_projects ?? 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Łączna powierzchnia</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.total_square_meters ?? 0} m²</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Oszczędności (szac.)</div>
            <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(statistics?.total_savings ?? 0))}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Aktualny rabat</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.current_discount ?? 0}%</div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ustawienia konta</h1>
            <p className="text-sm text-gray-500">
              {isSettingsLoading ? 'Ładowanie ustawień...' : 'Zarządzaj newsletterem, marketingiem oraz profilem i 2FA'}
            </p>
            {!isSettingsLoading && (
              <div className="mt-2 text-xs">
                <span className={`inline-block px-2 py-0.5 rounded-full border ${
                  isTwoFactorEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  2FA: {isTwoFactorEnabled ? 'Włączone' : 'Wyłączone'}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <a
              href="#profile"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
            >
              Profil i 2FA
            </a>
            <button
              onClick={saveSettingsToAPI}
              disabled={isSavingSettings || isSettingsLoading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-semibold"
            >
              {isSavingSettings ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Newsletter */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Newsletter</h3>
            {isSettingsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newsletterSettings.generalNewsletter}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, generalNewsletter: e.target.checked }))}
                  />
                  Ogólny newsletter
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newsletterSettings.productUpdates}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, productUpdates: e.target.checked }))}
                  />
                  Aktualizacje produktów
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newsletterSettings.promotionalOffers}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, promotionalOffers: e.target.checked }))}
                  />
                  Oferty promocyjne
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newsletterSettings.technicalNews}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, technicalNews: e.target.checked }))}
                  />
                  Nowości techniczne
                </label>
              </div>
            )}
          </div>

          {/* Marketing */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Marketing</h3>
            {isSettingsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.analyticsConsent}
                    onChange={(e) => setMarketingSettings(prev => ({ ...prev, analyticsConsent: e.target.checked }))}
                  />
                  Zgoda na analitykę
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.marketingEmails}
                    onChange={(e) => setMarketingSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                  />
                  Maile marketingowe
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.personalizedAds}
                    onChange={(e) => setMarketingSettings(prev => ({ ...prev, personalizedAds: e.target.checked }))}
                  />
                  Spersonalizowane reklamy
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.dataSharing}
                    onChange={(e) => setMarketingSettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                  />
                  Zgoda na udostępnianie danych partnerom
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profil i bezpieczeństwo (Clerk) - wbudowany bez modala */}
      <section id="profile" className="mt-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profil i bezpieczeństwo (Clerk)</h2>
              <p className="text-sm text-gray-500">Zarządzaj danymi profilu, logowaniem i 2FA bezpośrednio na stronie.</p>
            </div>
          </div>
          <div className="p-2">
            <UserProfile />
          </div>
        </div>
      </section>
    </div>
  )
}
