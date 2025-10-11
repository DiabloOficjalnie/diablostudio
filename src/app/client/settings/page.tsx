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
  const [showUserProfileModal, setShowUserProfileModal] = useState(false)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)

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
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold"
            >
              Profil i 2FA
            </button>
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

      {showUserProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Profil i bezpieczeństwo (Clerk)</h3>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="p-2">
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
