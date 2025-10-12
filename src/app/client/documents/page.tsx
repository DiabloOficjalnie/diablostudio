'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type ClientDocument = {
  id: string
  title: string
  url: string
  type?: string | null
  created_at: string
}

type SortKey = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc'
type TypeFilter = 'all' | 'image' | 'pdf' | 'other'

export default function ClientDocumentsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<ClientDocument[]>([])
  const [preview, setPreview] = useState<ClientDocument | null>(null)

  // UX controls
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState<string>('') // YYYY-MM-DD
  const [sortBy, setSortBy] = useState<SortKey>('date_desc')

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; text: string }>>([])
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = String(Date.now())
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

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
        const res = await fetch('/api/client/documents', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.success) throw new Error(data?.error || 'Nie udało się pobrać dokumentów.')
        setDocs(Array.isArray(data.documents) ? data.documents : [])
      } catch (e: any) {
        console.error('Documents load error:', e)
        setDocs([])
        setError(e?.message || 'Wystąpił błąd podczas pobierania dokumentów.')
      } finally {
        setLoading(false)
      }
    })()
  }, [isLoaded, user, router])

  const isImage = (doc: ClientDocument) => {
    const t = (doc.type || '').toLowerCase()
    return t.includes('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(doc.url)
  }

  const isPDF = (doc: ClientDocument) => {
    const t = (doc.type || '').toLowerCase()
    return t.includes('pdf') || /\.pdf$/i.test(doc.url)
  }

  const docType = (doc: ClientDocument): TypeFilter => {
    if (isImage(doc)) return 'image'
    if (isPDF(doc)) return 'pdf'
    return 'other'
  }

  const filteredDocs = useMemo(() => {
    let list = [...docs]
    if (typeFilter !== 'all') list = list.filter((d) => docType(d) === typeFilter)
    if (dateFilter) list = list.filter((d) => (d.created_at || '').startsWith(dateFilter))
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter((d) => (d.title || '').toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q))
    }
    switch (sortBy) {
      case 'date_asc':
        list.sort((a, b) => a.created_at.localeCompare(b.created_at))
        break
      case 'title_asc':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      case 'title_desc':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
        break
      case 'date_desc':
      default:
        list.sort((a, b) => b.created_at.localeCompare(a.created_at))
        break
    }
    return list
  }, [docs, typeFilter, dateFilter, search, sortBy])

  const openPreview = (doc: ClientDocument) => setPreview(doc)
  const closePreview = () => setPreview(null)

  const iconFor = (doc: ClientDocument) =>
    isImage(doc) ? '🖼️' : isPDF(doc) ? '📄' : '📦'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              t.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : t.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Dokumenty</h1>
              <p className="mt-2 text-indigo-100 max-w-2xl">
                Wszystkie pliki udostępnione dla Twojego konta — faktury, protokoły, oferty i materiały dodatkowe.
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

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'image', 'pdf', 'other'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {t === 'all' ? 'Wszystkie' : t === 'image' ? 'Obrazy' : t === 'pdf' ? 'PDF' : 'Inne'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-full"
              aria-label="Filtruj po dacie"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj po tytule lub typie..."
              className="px-3 py-2 border rounded-lg text-sm w-full"
              aria-label="Szukaj"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-2 border rounded-lg text-sm w-full"
              aria-label="Sortowanie"
            >
              <option value="date_desc">Najnowsze</option>
              <option value="date_asc">Najstarsze</option>
              <option value="title_asc">Tytuł A–Z</option>
              <option value="title_desc">Tytuł Z–A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-24 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-10 text-center text-gray-600">Brak dokumentów spełniających kryteria.</div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((d) => (
              <div key={d.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-2xl">{iconFor(d)}</div>
                      <div className="font-semibold text-gray-900 truncate mt-1">{d.title}</div>
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

      {/* Preview modal */}
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
                <iframe title={preview.title} src={preview.url} className="w-full h-[70vh] rounded-lg border" />
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
