'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nav = [
    { label: 'Pulpit', href: '/client/dashboard', icon: '📊' },
    { label: 'Wyceny', href: '/client/quotes', icon: '📋' },
    { label: 'Powiadomienia', href: '/client/notifications', icon: '🔔' },
    { label: 'Ustawienia', href: '/client/settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => {
    if (href === '/client/dashboard') return pathname === '/client' || pathname === '/client/' || pathname.startsWith('/client/dashboard')
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-600 hover:bg-gray-50"
                aria-label="Przełącz nawigację"
              >
                ☰
              </button>
              <Link href="/" className="text-xl font-extrabold text-blue-800 hover:text-blue-900">
                DecoSol
              </Link>
              <div className="hidden md:flex items-center ml-4 pl-4 border-l">
                <span className="text-sm font-semibold text-gray-800">Panel klienta</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isLoaded ? (
                user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.firstName || 'Użytkownik'} {user.lastName || ''}
                      </div>
                      <div className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold select-none">
                      {(user.firstName?.[0] || 'U') + (user.lastName?.[0] || '')}
                    </div>
                    <button
                      onClick={() => signOut(() => router.push('/login'))}
                      className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-800 text-white hover:bg-gray-900"
                    >
                      Wyloguj
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Zaloguj się
                  </Link>
                )
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 md:w-64 bg-white border-r shadow-sm md:shadow-none transform transition-transform duration-200 ease-out z-20 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <nav className="p-4 space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-800 border border-blue-200 bg-white hover:bg-blue-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50"
                >
                  <span>🏠</span>
                  <span>Wróć na stronę główną</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 w-full md:w-auto px-4 sm:px-6 lg:px-8 py-6 md:ml-0 ml-0 md:pl-0 md:pr-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
