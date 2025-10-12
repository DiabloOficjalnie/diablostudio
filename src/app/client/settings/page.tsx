'use client'

import React, { useEffect, useState } from 'react'
import { useUser, UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/app/components/FormField'

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
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Ustawienia</h1>
              <p className="mt-2 text-indigo-100 max-w-2xl">
                Zarządzaj preferencjami newslettera i marketingu oraz profilem i zabezpieczeniami konta.
              </p>
            </div>
            <a
              href="#profile"
              className="self-start px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-semibold border border-indigo-200"
            >
              Profil i 2FA
            </a>
          </div>
        </div>
      </div>

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
              <div className="space-y-4 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={newsletterSettings.generalNewsletter}
                      onChange={(e) => setNewsletterSettings(prev => ({ ...prev, generalNewsletter: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Ogólny newsletter</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Aktualności, poradniki, inspiracje i najważniejsze informacje.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={newsletterSettings.productUpdates}
                      onChange={(e) => setNewsletterSettings(prev => ({ ...prev, productUpdates: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Aktualizacje produktów</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Zmiany w ofercie, nowe systemy, modyfikacje oraz informacje o dostępności.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={newsletterSettings.promotionalOffers}
                      onChange={(e) => setNewsletterSettings(prev => ({ ...prev, promotionalOffers: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Oferty promocyjne</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Okazje cenowe, rabaty i limitowane akcje promocyjne.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={newsletterSettings.technicalNews}
                      onChange={(e) => setNewsletterSettings(prev => ({ ...prev, technicalNews: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Nowości techniczne</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Rekomendacje producentów, wytyczne TDS i porady techniczne.
                  </span>
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
              <div className="space-y-4 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={marketingSettings.analyticsConsent}
                      onChange={(e) => setMarketingSettings(prev => ({ ...prev, analyticsConsent: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Zgoda na analitykę</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Pozwala nam mierzyć użycie panelu i ulepszać doświadczenie użytkownika.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={marketingSettings.marketingEmails}
                      onChange={(e) => setMarketingSettings(prev => ({ ...prev, marketingEmails: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Maile marketingowe</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Otrzymuj informacje o wydarzeniach, nowościach i kampaniach.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={marketingSettings.personalizedAds}
                      onChange={(e) => setMarketingSettings(prev => ({ ...prev, personalizedAds: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Spersonalizowane reklamy</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Pozwala dopasowywać treści marketingowe do Twoich potrzeb.
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={marketingSettings.dataSharing}
                      onChange={(e) => setMarketingSettings(prev => ({ ...prev, dataSharing: (e.target as HTMLInputElement).checked }))}
                    />
                    <span className="font-medium text-gray-900">Udostępnianie danych partnerom</span>
                  </span>
                  <span className="text-xs text-gray-600 pl-6">
                    Zgoda na przetwarzanie danych przez zaufanych dostawców w celu realizacji usług.
                  </span>
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
