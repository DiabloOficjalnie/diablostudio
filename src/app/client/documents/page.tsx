'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type ClientDocument = {
  id: string
  title: string
  url: string
  type?: string | null
  created_at: string
}

export default function ClientDocumentsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<ClientDocument[]>([])
  const [preview, setPreview] = useState<ClientDocument | null>(null)

  const loadDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/documents', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Nie udało się pobrać dokumentów.')
      }
      setDocs(Array.isArray(data.documents) ? data.documents : [])
    } catch (e: any) {
      console.error('Documents load error:', e)
      setError(e?.message || 'Wystąpił błąd podczas pobierania dokumentów.')
      setDocs([])
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
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  const isImage = (doc: ClientDocument) => {
    const t = (doc.type || '').toLowerCase()
    return t.includes('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(doc.url)
  }

  const isPDF = (doc: ClientDocument) => {
    const t = (doc.type || '').toLowerCase()
    return t.includes('pdf') || /\.pdf$/i.test(doc.url)
  }

  const openPreview = (doc: ClientDocument) => setPreview(doc)
  const closePreview = () => setPreview(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumenty</h1>
          <p className="text-sm text-gray-600">Pliki udostępnione dla Twojego konta</p>
        </div>
        <a
          href="/client/dashboard"
          className="px-4 py-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-semibold"
        >
          Panel
        </a>
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
        ) : docs.length === 0 ? (
          <div className="p-6">
            <div className="text-gray-600 text-sm">Brak dokumentów do wyświetlenia.</div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((d) => (
              <div key={d.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{d.title}</div>
                      <div className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString('pl-PL')}</div>
                      {d.type && <div className="text-[11px] text-gray-500 mt-1">Typ: {d.type}</div>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openPreview(d)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Podgląd
                      </button>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-center"
                      >
                        Pobierz
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-bold text-gray-900 truncate pr-6">{preview.title}</div>
              <div className="flex items-center gap-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Otwórz w nowej karcie
                </a>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                  aria-label="Zamknij"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto">
              {isImage(preview) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.title} className="w-full h-auto rounded-lg border" />
              ) : isPDF(preview) ? (
                <iframe
                  title={preview.title}
                  src={preview.url}
                  className="w-full h-[70vh] rounded-lg border"
                />
              ) : (
                <div className="p-6 text-sm text-gray-700">
                  Podgląd tego typu pliku nie jest obsługiwany. Użyj przycisku „Otwórz w nowej karcie”.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
