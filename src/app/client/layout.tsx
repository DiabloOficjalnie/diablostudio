'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'

interface NavigationSection {
  id: string
  title: string
  icon: string
  items: NavigationItem[]
}

interface NavigationItem {
  id: string
  title: string
  path: string
  icon: string
  badge?: number
  description?: string
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  // Sidebar behavior/states aligned to AdminLayout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const isDebugAllowed = process.env.NODE_ENV !== 'production'

  // Dynamic badges (quotes count for now)
  const [quotesCount, setQuotesCount] = useState<number>(0)
  const [consultationsCount, setConsultationsCount] = useState<number>(0)

  // Persist UI preferences (collapsed/debug) in localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const savedCollapsed = localStorage.getItem('client_sidebar_collapsed')
      const savedDebug = localStorage.getItem('client_debug_panel')
      if (savedCollapsed !== null) setSidebarCollapsed(savedCollapsed === 'true')
      if (savedDebug !== null) setShowDebug(savedDebug === 'true')
    } catch {}
  }, [])

  useEffect(() => {
    // Load client quotes count for badge
    const loadQuotes = async () => {
      try {
        const res = await fetch('/api/client/quotes', { cache: 'no-store' })
        const data = await res.json()
        if (data?.success && Array.isArray(data.quotes)) {
          setQuotesCount(data.quotes.length)
        } else {
          setQuotesCount(0)
        }
      } catch {
        setQuotesCount(0)
      }
    }
    loadQuotes()
  }, [])

  useEffect(() => {
    // Load client quotes count for badge
    const loadQuotes = async () => {
      try {
        const res = await fetch('/api/client/quotes', { cache: 'no-store' })
        const data = await res.json()
        if (data?.success && Array.isArray(data.quotes)) {
          setQuotesCount(data.quotes.length)
        } else {
          setQuotesCount(0)
        }
      } catch {
        setQuotesCount(0)
      }
    }
    loadQuotes()
  }, [])

  // Load consultations count for badge
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const res = await fetch('/api/client/consultations', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok && data?.success && Array.isArray(data.consultations)) {
          setConsultationsCount(data.consultations.length)
        } else {
          setConsultationsCount(0)
        }
      } catch {
        setConsultationsCount(0)
      }
    }
    loadConsultations()
  }, [])

  // Navigation grouped in sections to mirror AdminLayout structure
  const navigationSections: NavigationSection[] = [
    {
      id: 'overview',
      title: 'Przegląd',
      icon: '📊',
      items: [
        {
          id: 'dashboard',
          title: 'Pulpit',
          path: '/client/dashboard',
          icon: '📊',
          description: 'Główny panel klienta'
        }
      ]
    },
    {
      id: 'activity',
      title: 'Twoje sprawy',
      icon: '🧰',
      items: [
        {
          id: 'quotes',
          title: 'Wyceny',
          path: '/client/quotes',
          icon: '📋',
          badge: quotesCount,
          description: 'Wyceny i oferty'
        },
        {
          id: 'consultations',
          title: 'Konsultacje',
          path: '/client/consultations',
          icon: '📞',
          badge: consultationsCount,
          description: 'Żądania konsultacji'
        },
        {
          id: 'documents',
          title: 'Dokumenty',
          path: '/client/documents',
          icon: '📄',
          description: 'Twoje pliki i dokumenty'
        }
      ]
    },
    {
      id: 'program',
      title: 'Program',
      icon: '🎯',
      items: [
        {
          id: 'referrals',
          title: 'Program poleceń',
          path: '/client/referrals',
          icon: '🏷️',
          description: 'Polecaj i zyskuj'
        },
        {
          id: 'education',
          title: 'Edukacja',
          path: '/client/education',
          icon: '🎓',
          description: 'Baza wiedzy i poradniki'
        }
      ]
    },
    {
      id: 'account',
      title: 'Konto',
      icon: '⚙️',
      items: [
        {
          id: 'notifications',
          title: 'Powiadomienia',
          path: '/client/notifications',
          icon: '🔔',
          description: 'Wiadomości i alerty'
        },
        {
          id: 'settings',
          title: 'Ustawienia',
          path: '/client/settings',
          icon: '⚙️',
          description: 'Dane i preferencje'
        }
      ]
    }
  ]

  const isActive = (path: string) => {
    if (path === '/client/dashboard') {
      return (
        pathname === '/client' ||
        pathname === '/client/' ||
        pathname.startsWith('/client/dashboard')
      )
    }
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="bg-white p-2 rounded-lg shadow-lg border hover:bg-gray-50 transition-colors"
          aria-label="Przełącz nawigację"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Sidebar Navigation (mirrors AdminLayout style) */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-24' : 'w-72'
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700 min-h-screen transition-all duration-300 ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">DecoSol</h1>
                  <p className="text-xs text-slate-400">Panel Klienta</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const next = !sidebarCollapsed
                setSidebarCollapsed(next)
                try {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('client_sidebar_collapsed', String(next))
                  }
                } catch {}
              }}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Zwiń/rozwiń panel boczny"
            >
              <span className="text-sm">◀</span>
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} flex-1 min-w-0`}>
                <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {isLoaded && user?.firstName
                    ? `${(user.firstName[0] || 'U').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`
                    : 'U'}
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {isLoaded && user ? `${user.firstName || 'Użytkownik'} ${user.lastName || ''}` : 'Użytkownik'}
                    </p>
                    <p className="text-xs text-blue-400 truncate">
                      {isLoaded && user?.primaryEmailAddress?.emailAddress
                        ? user.primaryEmailAddress.emailAddress
                        : 'Konto'}
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && <div className="text-xl flex-shrink-0 ml-2">🧑‍💼</div>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className={sidebarCollapsed ? 'hidden' : ''}>Zalogowany</span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 overflow-y-auto flex-1">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.id} className="space-y-2">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-slate-400 text-sm">{section.icon}</span>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {section.title}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.path)
                        setShowMobileMenu(false)
                      }}
                      className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 group relative ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                      }`}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <>
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                isActive(item.path)
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Back to homepage */}
            <div className="pt-4 border-t border-slate-700 mt-6">
              <button
                onClick={() => {
                  router.push('/')
                  setShowMobileMenu(false)
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1 group"
              >
                <span className="text-xl">🏠</span>
                {!sidebarCollapsed && <span>Wróć na stronę główną</span>}
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-slate-700 mt-6">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 text-red-300 hover:text-white hover:bg-red-600 hover:translate-x-1 group"
              >
                <span className="text-xl">🚪</span>
                {!sidebarCollapsed && <span>Wyloguj się</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Debug Panel Toggle Button */}
      <button
        onClick={() => {
          const next = !showDebug
          setShowDebug(next)
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('client_debug_panel', String(next))
            }
          } catch {}
        }}
        className={`fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${!isDebugAllowed ? 'hidden' : ''}`}
        title="Debug Info"
      >
        <span className="text-sm">🔧</span>
      </button>

      {/* Debug Panel */}
      {isDebugAllowed && showDebug && (
        <div className="fixed bottom-20 right-4 z-40 bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Basic Stats */}
          <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-medium text-blue-900">Wyceny</div>
              <div className="text-blue-700">{quotesCount}</div>
            </div>
            <div className="bg-indigo-50 p-2 rounded">
              <div className="font-medium text-indigo-900">Ścieżka</div>
              <div className="text-indigo-700 break-all">{pathname}</div>
            </div>
          </div>

          {/* User */}
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Użytkownik</div>
            <div className="text-xs bg-gray-50 p-2 rounded">
              <div>Email: {isLoaded && user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress : '—'}</div>
              <div>Imię: {isLoaded && user?.firstName ? user.firstName : '—'}</div>
              <div>Nazwisko: {isLoaded && user?.lastName ? user.lastName : '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {/* Breadcrumb Navigation aligned with AdminLayout */}
        <div className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 px-6 lg:px-8 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/client/dashboard')}
                  className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <span className="text-lg">🏠</span>
                  <span className="font-medium">Klient</span>
                </button>
                {pathname !== '/client' && pathname !== '/client/' && pathname !== '/client/dashboard' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span>/</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 font-semibold text-lg">
                        {(() => {
                          const pathSegments = pathname.split('/')
                          const lastSegment = pathSegments.pop()
                          return lastSegment
                            ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
                            : 'Pulpit'
                        })()}
                      </span>
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {pathname.split('/').length - 1} poziomów
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.refresh()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Odśwież"
                >
                  <span className="text-lg">🔄</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
