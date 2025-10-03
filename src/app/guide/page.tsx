'use client'

import { useState } from 'react'
import MainLayout from '../components/MainLayout'
import Quiz from '../components/Quiz'

export default function GuidePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Przewodnik po posadzkach żywicznych
              <span className="block text-blue-300">Epoksydowe i Poliuretanowe</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Dowiedz się, czym różnią się systemy, jakie efekty możesz uzyskać i jak sprawdzić swoje podłoże.
              Wiedza od ekspertów w jednym miejscu.
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Czym są posadzki żywiczne?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                Posadzki żywiczne to nowoczesne rozwiązanie łączące <strong className="text-blue-800">żywice epoksydowe</strong> lub
                <strong className="text-green-800"> poliuretanowe</strong> z dodatkami mineralnymi.
                Tworzą bezspoinową, trwałą i estetyczną powierzchnię, która sprawdza się zarówno w przestrzeniach
                przemysłowych, jak i mieszkalnych.
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                <strong className="text-blue-800">Epoksyd</strong> to twardy, ekonomiczny system idealny do garaży i hal,
                natomiast <strong className="text-green-800">poliuretan</strong> jest elastyczny i odporny na UV,
                perfect dla tarasów i biur.
              </p>
            </div>
          </div>
        </section>

        {/* Epoxy vs Polyurethane Comparison */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Epoksyd vs Poliuretan – Szczegółowe porównanie
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Poznaj różnice między dwoma głównymi systemami posadzek żywicznych
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="font-bold text-lg">Typ żywicy</div>
                  <div className="font-bold text-lg flex items-center justify-center">
                    <span className="bg-blue-500 px-3 py-1 rounded-full mr-2">🧪</span>
                    Standard
                  </div>
                  <div className="font-bold text-lg flex items-center justify-center">
                    <span className="bg-green-500 px-3 py-1 rounded-full mr-2">🌊</span>
                    Premium
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-blue-50 transition-colors">
                  <div className="font-bold text-lg text-blue-900">Epoksyd</div>
                  <div className="text-gray-700">
                    <div className="font-semibold mb-2">Twardy, ekonomiczny</div>
                    <div className="text-sm">Odporny na ścieranie i chemikalia</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold mb-2">Wyższa odporność</div>
                    <div className="text-sm">Grubsze powłoki, do przemysłu ciężkiego</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6 text-center hover:bg-green-50 transition-colors">
                  <div className="font-bold text-lg text-green-900">Poliuretan</div>
                  <div className="text-gray-700">
                    <div className="font-semibold mb-2">Elastyczny, UV-odporny</div>
                    <div className="text-sm">Przyjemny w dotyku</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-semibold mb-2">Maksymalna trwałość</div>
                    <div className="text-sm">Odporność na pogodę i intensywne użytkowanie</div>
                  </div>
                </div>
              </div>

              {/* Applications Row */}
              <div className="bg-gray-50 p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="font-bold text-lg text-gray-900">Zastosowanie</div>
                  <div className="text-gray-700">
                    <div className="space-y-2">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Garaże</div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Magazyny</div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Hale produkcyjne</div>
                    </div>
                  </div>
                  <div className="text-gray-700">
                    <div className="space-y-2">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Tarasy</div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Balkony</div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Przestrzenie publiczne</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-6 mb-12">
              {/* Epoxy Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🧪</span>
                  <h3 className="text-2xl font-bold text-blue-900">Epoksyd</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-900">Standard</div>
                    <div className="text-sm text-gray-600">Twardy, ekonomiczny</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="font-bold text-indigo-900">Premium</div>
                    <div className="text-sm text-gray-600">Wyższa odporność</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Zastosowanie:</strong> Garaże, magazyny, hale produkcyjne
                </div>
              </div>

              {/* Polyurethane Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🌊</span>
                  <h3 className="text-2xl font-bold text-green-900">Poliuretan</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-900">Standard</div>
                    <div className="text-sm text-gray-600">Elastyczny, UV-odporny</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="font-bold text-emerald-900">Premium</div>
                    <div className="text-sm text-gray-600">Maksymalna trwałość</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Zastosowanie:</strong> Tarasy, balkony, przestrzenie publiczne
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Systems */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Systemy dekoracyjne posadzek żywicznych
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Różnorodność wykończeń pozwala stworzyć unikalną przestrzeń dostosowaną do Twojego stylu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Smooth */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Gładkie</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Minimalistyczne, bezspoinowe wykończenie. Idealne do nowoczesnych wnętrz – biur, salonów, recepcji.
                </p>
                <div className="text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Nowoczesne biura</span>
                </div>
              </div>

              {/* With flakes */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-orange-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-900 mb-2">Z płatkami</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Dekoracyjne płatki zwiększają odporność na zarysowania i nadają powierzchni wyjątkowego charakteru.
                </p>
                <div className="text-center">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Garaże i kuchnie</span>
                </div>
              </div>

              {/* Marble effect */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-purple-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2">Efekt marmuru</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Wielobarwny design inspirowany naturalnym kamieniem. Luksusowy wygląd do salonów i showroomów.
                </p>
                <div className="text-center">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Luksusowe wnętrza</span>
                </div>
              </div>

              {/* Structural */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Strukturalne</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Powierzchnia z wyczuwalną strukturą, zwiększająca bezpieczeństwo w przestrzeniach przemysłowych.
                </p>
                <div className="text-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Antypoślizgowe</span>
                </div>
              </div>

              {/* Transparent */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-cyan-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-900 mb-2">Transparentne</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Przeźroczysta żywica pozwala zobaczyć zatopione dekoracje – kruszywo, grafiki, logotypy.
                </p>
                <div className="text-center">
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">Designerskie</span>
                </div>
              </div>

              {/* Antistatic */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-yellow-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">Antystatyczne</h3>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Specjalne posadzki przewodzące ładunki elektrostatyczne, chroniące wrażliwe urządzenia elektroniczne.
                </p>
                <div className="text-center">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Laboratoria</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Substrate Testing Guide */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Jak sprawdzić podłoże – Krok po kroku
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Na podstawie wytycznych FeRFA, Sika, Flowcrete – profesjonalne badanie podłoża
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Pomiar wilgotności</h3>
                </div>
                <p className="text-gray-700 mb-4 text-base">
                  Metoda CM (karbidowa) lub elektroniczna. Dopuszczalne wartości:
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-900 font-semibold">Epoksyd:</span>
                    <span className="font-bold text-blue-800 text-lg">≤ 4%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-900 font-semibold">Poliuretan:</span>
                    <span className="font-bold text-green-800 text-lg">≤ 5%</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Test przyczepności</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Test pull-off z użyciem urządzenia. Minimalne wartości:
                </p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-2">≥ 1,5 MPa</div>
                  <div className="text-sm text-gray-600">dla systemów żywicznych</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 text-purple-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">Twardość podłoża</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Badanie młotkiem Schmidta. Minimalne wymagania:
                </p>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-800 mb-2">C20/25</div>
                  <div className="text-sm text-gray-600">minimalna klasa betonu</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 text-orange-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    4
                  </div>
                  <h3 className="text-xl font-bold text-orange-900">Równość powierzchni</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Pomiar łatą 2m. Maksymalne dopuszczalne odchylenie:
                </p>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-800 mb-2">2 mm</div>
                  <div className="text-sm text-gray-600">na całej długości</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-cyan-500">
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-100 text-cyan-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    5
                  </div>
                  <h3 className="text-xl font-bold text-cyan-900">Czystość podłoża</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Profesjonalne przygotowanie powierzchni przed aplikacją:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center p-3 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg">
                    <span className="text-blue-600 mr-3">🧹</span>
                    <span className="text-gray-900"><strong>Odtłuszczenie</strong> - usunięcie olejów i tłuszczów</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-100 border-l-4 border-green-500 rounded-r-lg">
                    <span className="text-green-600 mr-3">💨</span>
                    <span className="text-gray-900"><strong>Odpylenie</strong> - usunięcie kurzu i zanieczyszczeń</span>
                  </div>
                  <div className="flex items-center p-3 bg-purple-100 border-l-4 border-purple-500 rounded-r-lg">
                    <span className="text-purple-600 mr-3">🔧</span>
                    <span className="text-gray-900"><strong>Mechaniczne przygotowanie</strong> - szlifowanie, frezowanie</span>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-pink-500">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 text-pink-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    6
                  </div>
                  <h3 className="text-xl font-bold text-pink-900">Warunki aplikacji</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Optymalne parametry środowiska pracy podczas aplikacji:
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-orange-600 mr-3">🌡️</span>
                      <span className="text-gray-900 font-semibold">Temperatura:</span>
                    </div>
                    <span className="font-bold text-orange-800 text-lg">+10–25°C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">💧</span>
                      <span className="text-gray-900 font-semibold">Wilgotność:</span>
                    </div>
                    <span className="font-bold text-blue-800 text-lg">75%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-100 border-l-4 border-green-500 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-3">🍃</span>
                      <span className="text-gray-900 font-semibold">Wentylacja:</span>
                    </div>
                    <span className="font-bold text-green-800 text-lg">Zapewniona</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sprawdź swoją wycenę
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Dowiedz się ile kosztuje Twoja posadzka – skorzystaj z darmowej wyceny dostosowanej do Twoich potrzeb.
            </p>
            <a
              href="/valuation"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 text-xl font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Darmowa wycena online
              <span className="ml-2">📋</span>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Najczęściej zadawane pytania
              </h2>
              <p className="text-xl text-gray-600">
                Odpowiedzi na najważniejsze pytania dotyczące posadzek żywicznych
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FAQ 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Czy epoksyd nadaje się na zewnątrz?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-red-600">Nie</strong> – epoksyd nie jest zalecany na zewnątrz ze względu na wrażliwość na promieniowanie UV.
                      Do zastosowań zewnętrznych lepiej wybrać <strong className="text-green-600">poliuretan</strong>, który jest odporny na UV i warunki atmosferyczne.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Ile lat wytrzymuje posadzka żywiczna?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      W zależności od systemu i intensywności użytkowania, posadzki żywiczne służą od <strong className="text-green-600">10 do 25 lat</strong>.
                      Systemy premium mogą wytrzymać nawet do 25 lat przy odpowiedniej pielęgnacji.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Czy można położyć na stare płytki?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-green-600">Tak</strong>, po odpowiednim przygotowaniu podłoża i zagruntowaniu.
                      Konieczna jest ocena przyczepności płytek i ewentualne usunięcie luźnych elementów.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Jakie są koszty posadzki żywicznej?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      Ceny wahają się od <strong className="text-blue-600">100–500 PLN/m²</strong> w zależności od systemu,
                      grubości powłoki i efektów dekoracyjnych. Szczegółową wycenę otrzymasz po wizji lokalnej.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Czy posadzka żywiczna jest śliska?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      Standardowe posadzki żywiczne są lekko śliskie. <strong className="text-green-600">Możemy zastosować system antypoślizgowy</strong>
                      dla zwiększenia bezpieczeństwa w miejscach o dużym natężeniu ruchu.
                    </p>
                  </div>
                </details>
              </div>

              {/* FAQ 6 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <details className="group">
                  <summary className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-800 transition-colors list-none flex items-center justify-between">
                    <span>Jak dbać o posadzkę żywiczna?</span>
                    <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-transform duration-200 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      Posadzki żywiczne są <strong className="text-green-600">łatwe w pielęgnacji</strong>.
                      Wystarczy regularne mycie neutralnymi środkami czystości <strong className="text-red-600">bez rozpuszczalników</strong>.
                      Unikaj agresywnych detergentów i mechanicznych uszkodzeń.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Test swojej wiedzy
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sprawdź ile zapamiętałeś z naszego przewodnika po posadzkach żywicznych
              </p>
            </div>
            <Quiz />
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
