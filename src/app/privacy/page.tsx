import MainLayout from '../components/MainLayout'

export const metadata = {
  title: 'Polityka prywatności | DecoSol',
  description:
    'Polityka prywatności serwisu DecoSol – informacje o przetwarzaniu danych osobowych, plikach cookies oraz prawach użytkownika.',
}

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Polityka prywatności</h1>
        <p className="text-sm text-gray-500 mb-8">Ostatnia aktualizacja: 11.10.2025</p>

        <div className="rich-content bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2>1. Informacje ogólne</h2>
          <p>
            Niniejsza Polityka prywatności określa zasady przetwarzania danych osobowych oraz wykorzystywania plików
            cookies w serwisie internetowym DecoSol (dalej: „Serwis”).
          </p>

          <h2>2. Administrator danych</h2>
          <p>
            Administratorem danych osobowych jest DecoSol (dalej: „Administrator”). W sprawach związanych z ochroną
            danych możesz skontaktować się pod adresem e-mail: info@decosol.pl.
          </p>

          <h2>3. Zakres i cel przetwarzania</h2>
          <ul>
            <li>formularz kontaktowy: obsługa zapytań i komunikacja (podstawa: art. 6 ust. 1 lit. b lub f RODO),</li>
            <li>newsletter: przesyłanie informacji handlowych (podstawa: art. 6 ust. 1 lit. a RODO – zgoda),</li>
            <li>analizy i statystyka: ulepszanie Serwisu (podstawa: art. 6 ust. 1 lit. a RODO – zgoda),</li>
            <li>pliki cookies: zapewnienie prawidłowego działania Serwisu oraz komfortu użytkowania.</li>
          </ul>

          <h2>4. Odbiorcy danych</h2>
          <p>
            Dane mogą być powierzane dostawcom usług IT (hosting, analityka, system newslettera) na podstawie umów
            powierzenia przetwarzania, z zachowaniem odpowiednich środków bezpieczeństwa.
          </p>

          <h2>5. Okres przechowywania</h2>
          <ul>
            <li>dane kontaktowe – przez okres potrzebny do obsługi zapytania i ewentualnych roszczeń,</li>
            <li>dane newslettera – do czasu wycofania zgody,</li>
            <li>cookies – zgodnie z ustawieniami przeglądarki i wyborem w banerze zgód.</li>
          </ul>

          <h2>6. Prawa użytkownika</h2>
          <p>
            Przysługuje Ci prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia
            danych oraz wniesienia sprzeciwu. Masz również prawo do wycofania zgody w dowolnym momencie bez wpływu na zgodność
            z prawem przetwarzania dokonanego przed jej wycofaniem. Przysługuje Ci prawo wniesienia skargi do Prezesa UODO.
          </p>

          <h2>7. Pliki cookies</h2>
          <p>
            Serwis wykorzystuje niezbędne pliki cookies w celu prawidłowego działania, a także – za Twoją zgodą – cookies
            analityczne, marketingowe i preferencji. Więcej informacji znajdziesz w{' '}
            <a href="/cookies">Polityce cookies</a>. Swoje preferencje możesz zmienić w dowolnym momencie korzystając z
            banera zgód.
          </p>

          <h2>8. Dobrowolność podania danych</h2>
          <p>
            Podanie danych jest dobrowolne, jednak niezbędne do realizacji określonych celów (np. odpowiedź na zapytanie
            z formularza, wysyłka newslettera).
          </p>

          <h2>9. Zmiany Polityki</h2>
          <p>
            Administrator zastrzega sobie prawo do aktualizacji Polityki prywatności. Nowa wersja będzie publikowana
            w Serwisie wraz z datą aktualizacji.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
