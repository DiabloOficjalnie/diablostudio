'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type ClientEvent = {
  id: string
  type: string
  details?: any
  created_at: string
}

export default function ClientNotificationsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ClientEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/events', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Nie udało się pobrać zdarzeń.')
      }
      setEvents(Array.isArray(data.events) ? data.events : [])
    } catch (e: any) {
      console.error('Load events error:', e)
      setError(e?.message || 'Wystąpił błąd podczas pobierania zdarzeń.')
      setEvents([])
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
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Powiadomienia</h1>
          <p className="text-sm text-gray-600">Zdarzenia i komunikaty związane z Twoim kontem</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="px-3 py-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-semibold"
          >
            Odśwież
          </button>
          <a
            href="/client/dashboard"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
          >
            Panel
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="p-6">
            <div className="text-gray-600 text-sm">Brak zdarzeń do wyświetlenia.</div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {events.map((e) => (
              <li key={e.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        {e.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(e.created_at).toLocaleString('pl-PL')}
                      </span>
                    </div>
                    {e.details && (
                      <pre className="mt-2 text-[11px] text-gray-700 whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 rounded p-2">
                        {(() => {
                          try {
                            return JSON.stringify(e.details, null, 2)
                          } catch {
                            return String(e.details)
                          }
                        })()}
                      </pre>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
