'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import NewsletterModal from './NewsletterModal'
import { executeRecaptcha } from '@/lib/recaptcha-client'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollNav, setShowScrollNav] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [newsletterFirstName, setNewsletterFirstName] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">DecoSol</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Profesjonalne posadzki żywiczne – epoksydowe i poliuretanowe. Tworzymy trwałe i estetyczne rozwiązania dla domu, biura i przemysłu.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Nawigacja</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Strona główna</Link></li>
                <li><a href="/valuation" className="text-gray-300 hover:text-white transition-colors">Darmowa wycena</a></li>
                <li><a href="/colors" className="text-gray-300 hover:text-white transition-colors">Paleta kolorów</a></li>
                <li><a href="/realizations" className="text-gray-300 hover:text-white transition-colors">Realizacje</a></li>
                <li><a href="/edukacja" className="text-gray-300 hover:text-white transition-colors">Edukacja</a></li>
                <li><a href="/reviews" className="text-gray-300 hover:text-white transition-colors">Opinie</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center"><span className="text-xl mr-3">📞</span><span>+48 123 456 789</span></div>
                <div className="flex items-center"><span className="text-xl mr-3">✉️</span><span>info@diablostudio.pl</span></div>
                <div className="flex items-center"><span className="text-xl mr-3">📍</span><span>Warszawa, Polska</span></div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const params = new URLSearchParams(window.location.search)
                  const utm_source = params.get('utm_source') || undefined
                  const utm_medium = params.get('utm_medium') || undefined
                  const utm_campaign = params.get('utm_campaign') || undefined

                  const token = await executeRecaptcha('newsletter_footer')
                  const res = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: newsletterEmail,
                      first_name: newsletterFirstName,
                      source: 'footer',
                      recaptchaToken: token,
                      utm_source,
                      utm_medium,
                      utm_campaign,
                    })
                  })
                  const data = await res.json()
                  setNewsletterStatus(data.message || 'Dziękujemy za zapis!')
                  setNewsletterFirstName('')
                  setNewsletterEmail('')
                } catch {
                  setNewsletterStatus('Wystąpił błąd. Spróbuj ponownie.')
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <input
                type="text"
                value={newsletterFirstName}
                onChange={(e) => setNewsletterFirstName(e.target.value)}
                placeholder="Twoje imię"
                className="w-full sm:w-auto flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Imię do newslettera"
              />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Twój e-mail"
                className="w-full sm:w-auto flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Adres e-mail do newslettera"
              />
              <button
                type="submit"
                disabled={!newsletterEmail}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Zapisz się
              </button>
            </form>
            {newsletterStatus && <p className="mt-2 text-sm text-gray-400">{newsletterStatus}</p>}
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 DecoSol. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      <NewsletterModal delayMs={15000} snoozeDays={7} />
      {/* Login Modal removed - unified login flow to /login on all devices */}
    </div>
  )
}
