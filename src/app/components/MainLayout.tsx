'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollNav, setShowScrollNav] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Strona główna', href: '/' },
    { name: 'Darmowa wycena', href: '/valuation' },
    { name: 'Paleta kolorów', href: '/colors' },
    { name: 'Realizacje', href: '/realizations' },
    { name: 'Blog', href: '/blog' },
    { name: 'Przewodnik', href: '/guide' },
    { name: 'Opinie', href: '/reviews' },
    { name: 'Kontakt', href: '/contact' }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollTop(scrollTop > 300)
      setShowScrollNav(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dynamic navigation based on current section
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

    return sections[0] // Default to first section
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

    const currentIndex = allSections.findIndex(section => section.id === currentSection.id)

    // Always show main page
    const options = [
      { id: 'hero', name: 'Strona główna', icon: '🏠', type: 'main' }
    ]

    // Add previous section if available
    if (currentIndex > 0) {
      options.push({ ...allSections[currentIndex - 1], type: 'prev' })
    }

    // Add next section if available
    if (currentIndex < allSections.length - 1) {
      options.push({ ...allSections[currentIndex + 1], type: 'next' })
    }

    return options
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-800 hover:text-blue-900 transition-colors">
                DiabloStudio
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-blue-800 border-b-2 border-blue-800 pb-1'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Separator */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Single Login Button */}
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-md"
                title="Zaloguj się lub zarejestruj"
              >
                <span className="mr-2">👤</span>
                Zaloguj
              </Link>
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
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  aria-label="Zamknij menu"
                >
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
                      isActive(item.href)
                        ? 'text-blue-800 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Separator in Mobile Menu */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Account Section in Mobile Menu - Compact */}
                <div className="space-y-2">
                  <Link
                    href="/client/register"
                    onClick={toggleMobileMenu}
                    className="block w-full p-3 bg-green-600 hover:bg-green-700 text-white text-center font-bold rounded-lg transition-all shadow-md"
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-base mr-2">✨</span>
                      <span className="text-sm">Rejestracja</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      setShowLoginModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center justify-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-md"
                  >
                    <span className="mr-2">👤</span>
                    Login
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Mobile Navigation Arrows */}
      {showScrollNav && pathname === '/' && (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:hidden">
          {getNavigationOptions(getCurrentSection()).map((option) => (
            <button
              key={option.id}
              onClick={() => {
                if (option.id === 'hero') {
                  scrollToTop()
                } else {
                  const element = document.getElementById(option.id)
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={`w-12 h-12 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center ${
                option.type === 'main'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : option.type === 'prev'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              title={option.name}
            >
              {option.type === 'prev' && <span className="text-lg">⬆️</span>}
              {option.type === 'next' && <span className="text-lg">⬇️</span>}
              {option.type === 'main' && <span className="text-sm">🏠</span>}
            </button>
          ))}
        </div>
      )}

      {/* Scroll to Top Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center group"
            title="Przewiń na górę strony"
          >
            <span className="text-xl group-hover:animate-bounce">⬆️</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">DiabloStudio</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Profesjonalne posadzki żywiczne – epoksydowe i poliuretanowe.
                Tworzymy trwałe i estetyczne rozwiązania dla domu, biura i przemysłu.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Nawigacja</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">
                    Strona główna
                  </a>
                </li>
                <li>
                  <a href="/valuation" className="text-gray-300 hover:text-white transition-colors">
                    Darmowa wycena
                  </a>
                </li>
                <li>
                  <a href="/colors" className="text-gray-300 hover:text-white transition-colors">
                    Paleta kolorów
                  </a>
                </li>
                <li>
                  <a href="/realizations" className="text-gray-300 hover:text-white transition-colors">
                    Realizacje
                  </a>
                </li>
                <li>
                  <a href="/guide" className="text-gray-300 hover:text-white transition-colors">
                    Przewodnik
                  </a>
                </li>
                <li>
                  <a href="/reviews" className="text-gray-300 hover:text-white transition-colors">
                    Opinie
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <span className="text-xl mr-3">📞</span>
                  <span>+48 123 456 789</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">✉️</span>
                  <span>info@diablostudio.pl</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">📍</span>
                  <span>Warszawa, Polska</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 DiabloStudio. Wszystkie prawa zastrzeżone.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Wybierz typ konta</h2>
              <p className="text-gray-600">Zaloguj się jako administrator lub klient</p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Administrator Login */}
              <Link
                href="/admin/login"
                onClick={() => setShowLoginModal(false)}
                className="block w-full p-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-3">👨‍💼</span>
                  <span className="text-xl">Administrator</span>
                </div>
                <p className="text-sm opacity-90">Panel zarządzania, realizacje, wyceny</p>
              </Link>

              {/* Client Login */}
              <Link
                href="/login"
                onClick={() => setShowLoginModal(false)}
                className="block w-full p-4 bg-green-600 hover:bg-green-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-3">👤</span>
                  <span className="text-xl">Klient</span>
                </div>
                <p className="text-sm opacity-90">Moje projekty, historia zamówień</p>
              </Link>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
