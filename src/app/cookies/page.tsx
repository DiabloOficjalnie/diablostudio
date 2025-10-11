import MainLayout from '../components/MainLayout'

export const metadata = {
  title: 'Polityka cookies | DecoSol',
  description:
    'Polityka cookies serwisu DecoSol – informacje o rodzajach plików cookies, celach ich wykorzystania oraz sposobach zarządzania zgodami.',
}

export default function CookiesPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Polityka cookies</h1>
        <p className="text-sm text-gray-500 mb-8">Ostatnia aktualizacja: 11.10.2025</p>

        <div className="rich-content bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2>1. Czym są pliki cookies?</h2>
          <p>
            Pliki cookies to niewielkie informacje tekstowe zapisywane na Twoim urządzeniu (komputerze, smartfonie itp.),
            które mogą być odczytywane przez nasz system lub systemy podmiotów trzecich.
          </p>

          <h2>2. Jakie pliki cookies wykorzystujemy?</h2>
          <ul>
            <li>
              <strong>Niezbędne</strong> – wymagane do prawidłowego działania Serwisu (zapamiętywanie sesji,
              bezpieczeństwo, obsługa formularzy). Zawsze aktywne.
            </li>
            <li>
              <strong>Preferencje</strong> – zapamiętywanie Twoich ustawień (np. wybrany język, wygląd).
              Wykorzystywane wyłącznie po wyrażeniu zgody.
            </li>
            <li>
              <strong>Analityczne</strong> – pomagają zrozumieć, jak korzystasz z Serwisu, aby go ulepszać (statystyki).
              Wykorzystywane wyłącznie po wyrażeniu zgody.
            </li>
            <li>
              <strong>Marketingowe</strong> – personalizacja treści i mierzenie skuteczności działań marketingowych.
              Wykorzystywane wyłącznie po wyrażeniu zgody.
            </li>
          </ul>

          <h2>3. Podstawa prawna</h2>
          <p>
            W przypadku cookies niezbędnych podstawą przetwarzania jest niezbędność do świadczenia usługi drogą
            elektroniczną. Dla pozostałych kategorii podstawą jest Twoja zgoda (art. 173 Prawa telekomunikacyjnego i art. 6 ust. 1 lit. a RODO).
          </p>

          <h2>4. Czas przechowywania</h2>
          <p>
            Cookies sesyjne są usuwane po zamknięciu przeglądarki. Cookies stałe wygasają po wskazanym czasie
            lub do momentu ich usunięcia przez użytkownika. Preferencje zgód zapisujemy maksymalnie na 6 miesięcy.
          </p>

          <h2>5. Zarządzanie zgodami</h2>
          <p>
            W każdej chwili możesz zmienić swoje preferencje dotyczące cookies za pomocą banera zgód dostępnego na dole strony
            lub w ustawieniach przeglądarki. Pamiętaj, że wyłączenie niektórych cookies może ograniczyć funkcjonalność Serwisu.
          </p>

          <h2>6. Podmioty zewnętrzne</h2>
          <p>
            W ramach Serwisu mogą być wykorzystywane narzędzia zewnętrzne (np. system newslettera, narzędzia analityczne),
            które stosują własne pliki cookies. Szczegóły znajdziesz w dokumentacji dostawców tych usług.
          </p>

          <h2>7. Zmiany Polityki cookies</h2>
          <p>
            Zastrzegamy sobie prawo do aktualizacji Polityki cookies. Nowa wersja będzie publikowana w Serwisie wraz z datą aktualizacji.
          </p>

          <p className="mt-8">
            Więcej informacji o przetwarzaniu danych znajdziesz w{' '}
            <a href="/privacy">Polityce prywatności</a>.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
