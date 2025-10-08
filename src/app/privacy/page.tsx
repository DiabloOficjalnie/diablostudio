'use client'

import MainLayout from '../components/MainLayout'

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Polityka prywatności</h1>
        <p className="text-gray-700 mb-4">
          Niniejsza Polityka Prywatności opisuje zasady przetwarzania danych osobowych przez DecoSol.
          Dbamy o bezpieczeństwo i prywatność naszych użytkowników oraz spełniamy obowiązki wynikające z RODO.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Administrator danych</h2>
        <p className="text-gray-700 mb-4">
          Administratorem danych osobowych jest DecoSol z siedzibą w Warszawie. Kontakt: info@diablostudio.pl.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Zakres i cel przetwarzania</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Realizacja usług (wyceny, konsultacje, realizacje projektów)</li>
          <li>Obsługa konta klienta i panelu klienta</li>
          <li>Wysyłka newslettera i komunikacja marketingowa (za zgodą)</li>
          <li>Obsługa zapytań z formularza kontaktowego</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Podstawy prawne</h2>
        <p className="text-gray-700 mb-4">
          Dane przetwarzamy na podstawie art. 6 ust. 1 lit. b (realizacja umowy), lit. c (obowiązki prawne),
          lit. f (uzasadniony interes) oraz lit. a (zgoda) RODO – w zależności od celu.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Okres przechowywania</h2>
        <p className="text-gray-700 mb-4">
          Dane przechowujemy przez czas niezbędny do realizacji celów, a następnie przez okres wymagany
          przepisami prawa lub do czasu wycofania zgody (dla celów marketingowych).
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Prawa użytkownika</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania</li>
          <li>Przenoszenie danych i sprzeciw wobec przetwarzania</li>
          <li>Wycofanie zgody w dowolnym momencie</li>
          <li>Skarga do Prezesa UODO</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Odbiorcy danych</h2>
        <p className="text-gray-700 mb-4">
          Dane mogą być przekazywane podmiotom wspierającym nas technicznie (hosting, e-mail, analityka),
          z zachowaniem odpowiednich zabezpieczeń i umów powierzenia.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Kontakt</h2>
        <p className="text-gray-700">
          W sprawach dotyczących ochrony danych prosimy o kontakt: info@diablostudio.pl.
        </p>
      </div>
    </MainLayout>
  )
}
