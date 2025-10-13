'use client'

import { useState } from 'react'
import MainLayout from '../components/MainLayout'
import { FormField, Input, Select, Textarea, Checkbox } from '@/app/components/FormField'
import { executeRecaptcha } from '@/lib/recaptcha-client'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    marketingConsent: false,
    phoneConsent: false,
  })

  const contactInfo = [
    {
      icon: '📍',
      title: 'Adres biura',
      content: 'ul. Przykładowa 123\n00-001 Warszawa\nPolska',
      action: 'Zobacz na mapie',
      color: 'blue'
    },
    {
      icon: '📞',
      title: 'Telefon kontaktowy',
      content: '+48 123 456 789\n+48 987 654 321',
      action: 'Zadzwoń teraz',
      color: 'green'
    },
    {
      icon: '📧',
      title: 'Adres e-mail',
      content: 'info@diablostudio.pl\nbiuro@diablostudio.pl',
      action: 'Napisz wiadomość',
      color: 'purple'
    },
    {
      icon: '🕒',
      title: 'Godziny pracy',
      content: 'Poniedziałek - Piątek: 8:00 - 18:00\nSobota: 9:00 - 15:00\nNiedziela: nieczynne',
      action: 'Umów spotkanie',
      color: 'orange'
    }
  ]

  const faqs = [
    {
      question: 'Jak szybko mogę otrzymać wycenę?',
      answer: 'Wstępną wycenę online otrzymasz natychmiast po wypełnieniu formularza. Szczegółową wycenę z wizją lokalną przygotowujemy w ciągu 24 godzin.',
      icon: '⚡'
    },
    {
      question: 'Czy oferujecie gwarancję na posadzki?',
      answer: 'Tak, wszystkie nasze posadzki objęte są 5-letnią gwarancją. Gwarancja obejmuje wady materiałowe i błędy wykonawcze.',
      icon: '🛡️'
    },
    {
      question: 'Jak przygotować pomieszczenie przed aplikacją?',
      answer: 'Pomieszczenie powinno być opróżnione z mebli i sprzętu. Podłoże musi być suche i czyste. Szczegółowe instrukcje przekażemy po podpisaniu umowy.',
      icon: '🔧'
    },
    {
      question: 'Czy posadzki nadają się do wszystkich pomieszczeń?',
      answer: 'Tak, dobieramy odpowiedni system posadzki do specyfiki każdego pomieszczenia - od garaży po biura i pomieszczenia mieszkalne.',
      icon: '🏠'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' })
  const [successInfo, setSuccessInfo] = useState<{ ticketId?: string; email?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Wysyłanie...' })
    try {
      const token = await executeRecaptcha('contact_form')
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          marketingConsent: formData.marketingConsent,
          phoneConsent: formData.phoneConsent,
          recaptchaToken: token
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || 'Nie udało się wysłać wiadomości.')
      }
      setStatus({ type: 'success', message: 'Dziękujemy! Twoja wiadomość została wysłana.' })
      setSuccessInfo({ ticketId: data?.id, email: formData.email })
      // Reset formularza
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        marketingConsent: false,
        phoneConsent: false,
      })
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Wystąpił błąd. Spróbuj ponownie.' })
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Kontakt
              <span className="block text-blue-300">Porozmawiajmy o Twoim projekcie</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Skontaktuj się z nami już dziś i dowiedz się więcej o naszych usługach.
              Nasi eksperci chętnie odpowiedzą na wszystkie pytania i pomogą zrealizować Twój projekt.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Napisz do nas</h2>
                  <p className="text-gray-600 text-lg">
                    Wyślij wiadomość, a nasi eksperci skontaktują się z Tobą w ciągu 24 godzin
                  </p>
                </div>

                {status.type === 'success' && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <div className="font-bold">Wiadomość została wysłana</div>
                        <div className="text-sm mt-1">
                          Dziękujemy za kontakt! Odpowiemy w ciągu 24 godzin (dni robocze).
                        </div>
                        {successInfo.email && (
                          <div className="text-sm mt-1">
                            Potwierdzenie wysłaliśmy na: <span className="font-semibold">{successInfo.email}</span>
                          </div>
                        )}
                        {successInfo.ticketId && (
                          <div className="text-sm mt-1">
                            ID zgłoszenia: <span className="font-mono font-semibold">#{String(successInfo.ticketId).slice(0,6).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href="/valuation"
                            className="px-3 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-semibold hover:bg-green-100"
                          >
                            Oblicz wycenę
                          </a>
                          <a
                            href="/client/quotes"
                            className="px-3 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-semibold hover:bg-green-100"
                          >
                            Moje wyceny
                          </a>
                          <a
                            href="/"
                            className="px-3 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-semibold hover:bg-green-100"
                          >
                            Wróć na stronę główną
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className={`space-y-6 ${status.type === 'success' ? 'hidden' : ''}`}>
                  {status.type !== 'idle' && (
                    <div className={`p-3 rounded-lg text-sm border ${status.type === 'loading'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : status.type === 'success'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {status.message}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Imię i nazwisko *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Twoje imię i nazwisko"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Dane przetwarzamy zgodnie z <a href="/privacy" className="underline">Polityką prywatności</a> oraz <a href="/terms" className="underline">Regulaminem</a>.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="twoj@email.com"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Dane przetwarzamy zgodnie z <a href="/privacy" className="underline">Polityką prywatności</a> oraz <a href="/terms" className="underline">Regulaminem</a>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+48 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Temat *
                    </label>
                    <Select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Wybierz temat</option>
                      <option value="wycena">Wycena posadzki</option>
                      <option value="konsultacja">Konsultacja techniczna</option>
                      <option value="produkt">Pytanie o produkt</option>
                      <option value="projekt">Realizacja projektu</option>
                      <option value="inne">Inne</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Wiadomość *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="resize-none"
                      placeholder="Opisz swój projekt lub zadaj pytanie..."
                      required
                    />
                  </div>

                  {/* Consents */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        className="mt-1 w-4 h-4"
                        checked={formData.phoneConsent}
                        onChange={(e) => setFormData({ ...formData, phoneConsent: (e.target as HTMLInputElement).checked })}
                      />
                      <span className="text-sm text-gray-700">
                        Wyrażam zgodę na kontakt telefoniczny w celu realizacji zapytania.
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox
                        className="mt-1 w-4 h-4"
                        checked={formData.marketingConsent}
                        onChange={(e) => setFormData({ ...formData, marketingConsent: (e.target as HTMLInputElement).checked })}
                      />
                      <span className="text-sm text-gray-700">
                        Wyrażam zgodę na otrzymywanie informacji handlowych i materiałów marketingowych (opcjonalnie).
                      </span>
                    </label>
                  </div>

                  <p className="text-xs text-gray-500">
                    Przesyłając formularz, akceptujesz
                    <a href="/privacy" className="underline ml-1">Politykę prywatności</a>
                    oraz warunki komunikacji marketingowej zgodnie z
                    <a href="/terms" className="underline ml-1">Regulaminem</a>.
                  </p>

                  <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-lg transition-all transform ${status.type === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'} shadow-lg font-semibold text-lg`}
                  >
                    {status.type === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość'} <span className="ml-2">📤</span>
                  </button>
                </form>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Dane kontaktowe</h2>
                  <p className="text-gray-600 text-lg">
                    Skontaktuj się z nami w dogodny dla Ciebie sposób
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                      <div className="flex items-start space-x-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                          info.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          info.color === 'green' ? 'bg-green-100 text-green-600' :
                          info.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        } text-2xl group-hover:scale-110 transition-transform`}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2">{info.title}</h3>
                          <p className="text-gray-600 whitespace-pre-line mb-4 leading-relaxed">{info.content}</p>
                          <button className={`inline-flex items-center font-semibold transition-colors ${
                            info.color === 'blue' ? 'text-blue-600 hover:text-blue-800' :
                            info.color === 'green' ? 'text-green-600 hover:text-green-800' :
                            info.color === 'purple' ? 'text-purple-600 hover:text-purple-800' :
                            'text-orange-600 hover:text-orange-800'
                          }`}>
                            {info.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Map */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="relative w-full h-64">
                    <iframe
                      src="https://www.google.com/maps?q=ul.+Przyk%C5%82adowa+123,+Warszawa&output=embed"
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      aria-label="Mapa - ul. Przykładowa 123, Warszawa"
                    ></iframe>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Biuro główne</h4>
                        <p className="text-sm text-gray-600">ul. Przykładowa 123, 00-001 Warszawa</p>
                      </div>
                      <a
                        href="https://maps.google.com/?q=ul.+Przyk%C5%82adowa+123,+Warszawa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Otwórz w mapach →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Enhanced */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
                <span className="text-4xl">❓</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Najczęściej zadawane pytania
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych usług
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full text-blue-600 text-xl group-hover:scale-110 transition-transform">
                      {faq.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional CTA */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6 text-lg">
                Nie znalazłeś odpowiedzi na swoje pytanie?
              </p>
              <a
                href="tel:+48123456789"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Zadzwoń do nas
                <span className="ml-2">📞</span>
              </a>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Gotowy do rozpoczęcia projektu?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Skontaktuj się z nami już dziś i otrzymaj profesjonalną wycenę Twojej posadzki
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+48123456789"
                className="inline-flex items-center px-8 py-4 bg-white text-red-600 text-xl font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                📞 +48 123 456 789
              </a>
              <a
                href="/valuation"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-xl font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all"
              >
                Oblicz wycenę online
                <span className="ml-2">📋</span>
              </a>
            </div>
          </div>
        </section>

        {/* Business Hours Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Jesteśmy do Twojej dyspozycji
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">📞</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Konsultacja telefoniczna</h3>
                <p className="text-gray-600 mb-4">Poniedziałek - Piątek</p>
                <p className="text-2xl font-bold text-blue-800">8:00 - 18:00</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Wizyty w biurze</h3>
                <p className="text-gray-600 mb-4">Poniedziałek - Sobota</p>
                <p className="text-2xl font-bold text-green-800">9:00 - 17:00</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Wycena online</h3>
                <p className="text-gray-600 mb-4">24/7</p>
                <p className="text-2xl font-bold text-purple-800">Natychmiast</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
