import MainLayout from '../components/MainLayout'

export const metadata = {
  title: 'Regulamin serwisu | DecoSol',
  description:
    'Regulamin serwisu DecoSol — zasady korzystania z serwisu, odpowiedzialność oraz postanowienia końcowe.',
}

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Regulamin serwisu</h1>
        <p className="text-sm text-gray-500 mb-8">Ostatnia aktualizacja: 11.10.2025</p>

        <div className="prose prose-blue max-w-none">
          <h2>1. Postanowienia ogólne</h2>
          <p>
            Niniejszy Regulamin określa zasady korzystania z serwisu internetowego DecoSol (dalej: „Serwis”).
            Korzystanie z Serwisu oznacza akceptację postanowień Regulaminu.
          </p>

          <h2>2. Zakres usług</h2>
          <p>
            Serwis umożliwia zapoznanie się z ofertą usług, korzystanie z formularza kontaktowego, zapisywanie się
            do newslettera oraz przegląd treści informacyjnych i edukacyjnych.
          </p>

          <h2>3. Zawarcie umowy i odpowiedzialność</h2>
          <ul>
            <li>Korzystanie z Serwisu ma charakter informacyjny i nie stanowi oferty w rozumieniu Kodeksu cywilnego.</li>
            <li>Administrator dokłada należytej staranności, aby treści w Serwisie były aktualne i rzetelne.</li>
            <li>Administrator nie ponosi odpowiedzialności za szkody wynikające z przerw w dostępności Serwisu,</li>
            <li>działania siły wyższej lub błędów powstałych w wyniku korzystania z Serwisu niezgodnie z prawem.</li>
          </ul>

          <h2>4. Prawa autorskie</h2>
          <p>
            Wszelkie treści opublikowane w Serwisie (teksty, zdjęcia, grafiki) podlegają ochronie prawnej.
            Zabrania się ich kopiowania lub rozpowszechniania bez zgody Administratora, chyba że wskazano inaczej.
          </p>

          <h2>5. Zasady korzystania</h2>
          <ul>
            <li>Użytkownik zobowiązuje się do korzystania z Serwisu w sposób zgodny z prawem i dobrymi obyczajami.</li>
            <li>Zakazane jest dostarczanie treści bezprawnych, naruszających dobra osób trzecich lub normy społeczne.</li>
          </ul>

          <h2>6. Dane osobowe i cookies</h2>
          <p>
            Zasady przetwarzania danych osobowych określa{' '}
            <a href="/privacy">Polityka prywatności</a>, a zasady wykorzystywania plików cookies –{' '}
            <a href="/cookies">Polityka cookies</a>.
          </p>

          <h2>7. Postanowienia końcowe</h2>
          <p>
            Administrator zastrzega sobie prawo do zmiany Regulaminu. Zmieniony Regulamin wchodzi w życie z dniem jego
            opublikowania w Serwisie, chyba że wskazano inaczej. W sprawach nieuregulowanych zastosowanie mają przepisy
            powszechnie obowiązującego prawa.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
