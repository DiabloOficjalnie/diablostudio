'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import NewsletterModal from './NewsletterModal'
import CookieConsentBanner from './CookieConsentBanner'
import { executeRecaptcha } from '@/lib/recaptcha-client'

interface MainLayoutProps {
  children: React.ReactNode
}

type FooterNewsletterStatus = { type: 'success' | 'error'; message: string }

export default function MainLayout({ children }: MainLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollNav, setShowScrollNav] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [newsletterFirstName, setNewsletterFirstName] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<FooterNewsletterStatus | null>(null)
  const [newsletterPrivacy, setNewsletterPrivacy] = useState(false)
  const [newsletterMarketing, setNewsletterMarketing] = useState(false)
  const pathname = usePathname()
  const { user, isLoaded } = useUser()

  const navigation = [
    { name: 'Strona główna', href: '/' },
    { name: 'Darmowa wycena', href: '/valuation' },
    { name: 'Paleta kolorów', href: '/colors' },
    { name: 'Realizacje', href: '/realizations' },
    { name: 'Blog', href: '/blog' },
    { name: 'Edukacja', href: '/edukacja' },
    { name: 'Opinie', href: '/reviews' },
    { name: 'Kontakt', href: '/contact' }
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => setShowMobileMenu((v) => !v)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollTop(scrollTop > 300)
      setShowScrollNav(scrollTop > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getCurrentSection = () => {
    if (pathname !== '/') return null

    const sections = [
      { id: 'hero', name: 'Strona główna', icon: '🏠' },
      { id: 'why-resin', name: 'Dlaczego żywiczne?', icon: '🏗️' },
      { id: 'comparison', name: 'Porównanie', icon: '⚖️' },
      { id: 'decorative', name: 'Systemy dekoracyjne', icon: '🎨' },
      { id: 'pricing', name: 'Cennik', icon: '💰' },
      { id: 'process', name: 'Jak pracujemy', icon: '🔄' },
      { id: 'reviews', name: 'Opinie', icon: '⭐' },
      { id: 'faq', name: 'FAQ', icon: '❓' },
      { id: 'why-us', name: 'Dlaczego my?', icon: '🏆' },
      { id: 'contact', name: 'Kontakt', icon: '📞' }
    ]

    const scrollPosition = window.scrollY + 200

    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i].id)
      if (element) {
        const { offsetTop, offsetHeight } = element
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          return sections[i]
        }
      }
    }
    return sections[0]
  }

  const getNavigationOptions = (currentSection: any) => {
    if (!currentSection) return []
    const allSections = [
      { id: 'hero', name: 'Strona główna', icon: '🏠' },
      { id: 'why-resin', name: 'Dlaczego żywiczne?', icon: '🏗️' },
      { id: 'comparison', name: 'Porównanie', icon: '⚖️' },
      { id: 'decorative', name: 'Systemy dekoracyjne', icon: '🎨' },
      { id: 'pricing', name: 'Cennik', icon: '💰' },
      { id: 'process', name: 'Jak pracujemy', icon: '🔄' },
      { id: 'reviews', name: 'Opinie', icon: '⭐' },
      { id: 'faq', name: 'FAQ', icon: '❓' },
      { id: 'why-us', name: 'Dlaczego my?', icon: '🏆' },
      { id: 'contact', name: 'Kontakt', icon: '📞' }
    ]
    const currentIndex = allSections.findIndex((s) => s.id === currentSection.id)
    const options: any[] = [{ id: 'hero', name: 'Strona główna', icon: '🏠', type: 'main' }]
    if (currentIndex > 0) options.push({ ...allSections[currentIndex - 1], type: 'prev' })
    if (currentIndex < allSections.length - 1) options.push({ ...allSections[currentIndex + 1], type: 'next' })
    return options
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-800 hover:text-blue-900 transition-colors">
                DecoSol
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.href) ? 'text-blue-800 border-b-2 border-blue-800 pb-1' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-300" />
              {isLoaded ? (
                user ? (
                  <Link
                    href="/client/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-md"
                    title="Panel klienta"
                  >
                    <span className="mr-2">📂</span>
                    Panel klienta
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-md"
                    title="Zaloguj się"
                  >
                    <span className="mr-2">👤</span>
                    Zaloguj się
                  </Link>
                )
              ) : null}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Otwórz menu"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleMobileMenu} />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button onClick={toggleMobileMenu} className="p-2 text-gray-600 hover:text-gray-900" aria-label="Zamknij menu">
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={`block py-2 px-3 text-sm font-medium rounded transition-colors ${
                      isActive(item.href) ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="border-t border-gray-200 my-4" />

                {/* Login / Panel klienta (mobile) */}
                <div className="space-y-2">
                  {isLoaded ? (
                    user ? (
                      <Link
                        href="/client/dashboard"
                        onClick={toggleMobileMenu}
                        className="block w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg text-center transition-all shadow-md"
                      >
                        <span className="mr-2">📂</span>
                        Panel klienta
                      </Link>
                    ) : (
                      <a
                        href="/login"
                        onClick={toggleMobileMenu}
                        className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg text-center transition-all shadow-md"
                      >
                        <span className="mr-2">👤</span>
                        Zaloguj się
                      </a>
                    )
                  ) : null}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Mobile Navigation Arrows removed on mobile per request */}

      {/* Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Przewiń na górę"
          title="Do góry"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ↑
        </button>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Company Info */}
            <div className="md:col-span-1 text-left">
              <h3 className="text-xl font-bold mb-2">DecoSol</h3>
              <p className="text-gray-400 text-sm max-w-xs mb-0 hidden md:block">
                Profesjonalne posadzki żywiczne – epoksydowe i poliuretanowe. Tworzymy trwałe i estetyczne rozwiązania dla domu, biura i przemysłu.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-1 text-center">
              <h4 className="text-base font-semibold mb-2">Nawigacja</h4>
              <div className="grid grid-cols-2 gap-3">
                <ul className="space-y-1">
                  <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Strona główna</Link></li>
                  <li><a href="/valuation" className="text-gray-300 hover:text-white transition-colors">Darmowa wycena</a></li>
                  <li><a href="/colors" className="text-gray-300 hover:text-white transition-colors">Paleta kolorów</a></li>
                  <li><a href="/realizations" className="text-gray-300 hover:text-white transition-colors">Realizacje</a></li>
                  <li><a href="/edukacja" className="text-gray-300 hover:text-white transition-colors">Edukacja</a></li>
                </ul>
                <ul className="space-y-1">
                  <li><a href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="/reviews" className="text-gray-300 hover:text-white transition-colors">Opinie</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Kontakt</a></li>
                  <li><a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Polityka prywatności</a></li>
                  <li><a href="/cookies" className="text-gray-300 hover:text-white transition-colors">Polityka cookies</a></li>
                  <li><a href="/terms" className="text-gray-300 hover:text-white transition-colors">Regulamin</a></li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-1 text-right">
              <h4 className="text-base font-semibold mb-2">Kontakt</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-center justify-end"><span className="text-xl mr-3">📞</span><span>+48 123 456 789</span></div>
                <div className="flex items-center justify-end"><span className="text-xl mr-3">✉️</span><span>info@diablostudio.pl</span></div>
                <div className="flex items-center justify-end"><span className="text-xl mr-3">📍</span><span>Warszawa, Polska</span></div>
              </div>
            </div>
          </div>

          {/* Newsletter removed from footer by request */}

          {/* Bottom bar */}
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 DecoSol. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      <NewsletterModal delayMs={15000} snoozeDays={7} />
      <CookieConsentBanner />
      {/* Login Modal removed - unified login flow to /login on all devices */}
    </div>
  )
}
