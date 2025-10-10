// Edukacyjne treści dla klientów (nie-DIY)
// Język i struktura: co klient powinien wiedzieć, czego się spodziewać, jak się przygotować

export type ClientQuizItem = {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export type ClientLesson = {
  id: string
  title: string
  summary: string
  body: string
  quiz?: ClientQuizItem[]
  readTimeMin?: number
}

export type ClientModule = {
  id: string
  title: string
  description: string
  estimatedTime: string
  category: 'journey' | 'preparation' | 'installation' | 'aftercare'
  lessons: ClientLesson[]
}

export const clientModules: ClientModule[] = [
  {
    id: 'journey',
    title: 'Twoja droga: od wyceny do odbioru',
    description: 'Co wydarzy się po kalkulacji, kiedy zadzwonimy i jak wygląda proces aż do odbioru.',
    estimatedTime: '8–10 min',
    category: 'journey',
    lessons: [
      {
        id: 'after-valuation',
        title: 'Po wycenie: co dalej?',
        summary: 'Co robimy po Twojej kalkulacji i kiedy się odzywamy.',
        body: 'Po kalkulacji wysyłamy podsumowanie i proponujemy możliwe terminy rozmowy lub wizyty technicznej. Na tym etapie uściślamy zakres, potwierdzamy wstępny harmonogram i ustalamy kolejne kroki. Dla przyspieszenia warto przesłać 2–3 zdjęcia miejsca montażu i listę pytań.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Jaki jest kolejny krok po kalkulacji?',
            options: ['Zakup materiałów przez klienta', 'Samodzielny montaż', 'Rozmowa/wizyta techniczna', 'Brak dalszych kroków'],
            correctAnswer: 2,
            explanation: 'Po kalkulacji umawiamy rozmowę lub wizytę techniczną, aby doprecyzować zakres i harmonogram.'
          }
        ]
      },
      {
        id: 'site-visit',
        title: 'Wizyta techniczna',
        summary: 'Na co zwrócimy uwagę i czego potrzebujemy na miejscu.',
        body: 'Podczas wizyty sprawdzimy dostęp, wilgotność i stan podłoża. To moment na doprecyzowanie detali oraz potwierdzenie wyceny. Zapewnij dostęp do miejsca, oświetlenie i możliwość wykonania pomiarów. Jeśli to konsultacja zdalna, przygotuj zdjęcia oraz krótkie nagranie wideo (opcjonalnie).',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Celem wizyty technicznej jest:',
            options: ['Podpisanie umowy na miejscu', 'Wstępne malowanie', 'Weryfikacja warunków i pomiarów', 'Płatność zaliczki'],
            correctAnswer: 2,
            explanation: 'Wizyta służy ocenie warunków i potwierdzeniu zakresu — dopiero potem finalizujemy formalności.'
          }
        ]
      },
      {
        id: 'offer-and-date',
        title: 'Oferta i termin',
        summary: 'Jak wygląda finalna oferta i rezerwacja terminu.',
        body: 'Po wizycie otrzymasz ofertę z etapami, materiałami i terminem. Po akceptacji rezerwujemy termin realizacji (czasem wymagana jest zaliczka). Zawsze potwierdzamy to e‑mailem/SMS-em. Na kilka dni przed realizacją przypominamy o przygotowaniu przestrzeni.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Po akceptacji oferty:',
            options: ['Przywozimy materiały od razu', 'Rezerwujemy termin realizacji', 'Kończymy projekt', 'Wysyłamy instrukcję DIY'],
            correctAnswer: 1,
            explanation: 'Po akceptacji rezerwujemy termin i przygotowujemy harmonogram realizacji.'
          }
        ]
      }
    ]
  },
  {
    id: 'preparation',
    title: 'Przygotowanie domu/przestrzeni',
    description: 'Drobne rzeczy po Twojej stronie, które naprawdę robią różnicę: dostęp, opróżnienie, bezpieczeństwo.',
    estimatedTime: '6–8 min',
    category: 'preparation',
    lessons: [
      {
        id: 'access-and-clear',
        title: 'Dostęp i opróżnienie',
        summary: 'Jak ułatwić start prac i uniknąć opóźnień.',
        body: 'Ułatw dojazd i wniesienie sprzętu. Usuń meble z pomieszczeń lub zabezpiecz te, które muszą pozostać. Zostaw wolny przejazd, wskaż gniazda prądu, zabezpiecz rzeczy wrażliwe na pył. To skraca czas i zmniejsza ryzyko uszkodzeń.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Co zrobić z meblami przed startem prac?',
            options: ['Nic, zostają jak są', 'Usunąć lub dobrze zabezpieczyć', 'Przesunąć o 5 cm', 'Zawinąć w folię bąbelkową i zostawić'],
            correctAnswer: 1,
            explanation: 'Usunięcie lub właściwe zabezpieczenie mebli przyspiesza pracę i zwiększa bezpieczeństwo.'
          }
        ]
      },
      {
        id: 'ventilation-and-safety',
        title: 'Wentylacja i bezpieczeństwo domowników',
        summary: 'Komfort i bezpieczeństwo podczas realizacji.',
        body: 'Zapewnij wietrzenie i ogranicz dostęp dzieci/zwierząt do strefy prac. My dbamy o bezpieczeństwo i porządek, ale kontrola dostępu to klucz. Uprzedź domowników o strefach wyłączonych z ruchu i przewidywanym hałasie.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy zwierzęta mogą przebywać w strefie prac?',
            options: ['Tak', 'Nie', 'Tylko koty', 'Tylko psy'],
            correctAnswer: 1,
            explanation: 'Dla bezpieczeństwa i komfortu strefa prac powinna być zamknięta dla dzieci i zwierząt.'
          }
        ]
      }
    ]
  },
  {
    id: 'installation-day',
    title: 'Dzień realizacji: czego się spodziewać',
    description: 'Przebieg dnia, możliwe przerwy technologiczne, komfort i zasady poruszania.',
    estimatedTime: '6–7 min',
    category: 'installation',
    lessons: [
      {
        id: 'timeline',
        title: 'Harmonogram dnia',
        summary: 'Etapy, przerwy technologiczne, orientacyjne czasy.',
        body: 'Dzień zaczynamy od przygotowania podłoża. Następnie aplikujemy warstwy systemu; między warstwami mogą wystąpić przerwy technologiczne zależne od temperatury i wilgotności. Na koniec sprzątamy i zabezpieczamy strefę.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy przerwy technologiczne są możliwe?',
            options: ['Nie', 'Tak', 'Tylko zimą', 'Tylko przy poliuretanie'],
            correctAnswer: 1,
            explanation: 'Przerwy technologiczne wynikają z warunków i specyfiki materiału — to normalny element procesu.'
          }
        ]
      },
      {
        id: 'comfort',
        title: 'Komfort i zasady w trakcie prac',
        summary: 'Hałas, zapach, dostęp — co jest normalne i dlaczego.',
        body: 'Możliwy jest hałas i delikatny zapach; stale wietrzymy. Prosimy nie wchodzić na świeże warstwy i nie przestawiać zabezpieczeń. Zapewnienie prądu i wolnych ciągów komunikacyjnych przyspiesza realizację.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy można wejść na świeżo nałożoną warstwę?',
            options: ['Tak', 'Nie', 'W skarpetkach', 'Po 10 minutach'],
            correctAnswer: 1,
            explanation: 'Świeże warstwy wymagają czasu — wejście może trwale uszkodzić powierzchnię.'
          }
        ]
      }
    ]
  },
  {
    id: 'aftercare',
    title: 'Po realizacji: użytkowanie, pielęgnacja i gwarancja',
    description: 'Kiedy można wejść, jak sprzątać i czego unikać, aby posadzka służyła latami.',
    estimatedTime: '7–9 min',
    category: 'aftercare',
    lessons: [
      {
        id: 'cure-and-first-steps',
        title: 'Czas schnięcia i pierwsze użytkowanie',
        summary: 'Bezpieczne czasy — wejście, lekkie użytkowanie, pełne obciążenie.',
        body: 'Wstępne wejście zwykle po 24h, lekkie użytkowanie po 48–72h, pełne właściwości mechaniczne po około 7 dniach (zależnie od systemu i warunków). Przekażemy Ci czytelny harmonogram po realizacji.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Pełne właściwości mechaniczne zwykle osiągane są po:',
            options: ['1 dniu', '3 dniach', '7 dniach', '14 dniach'],
            correctAnswer: 2,
            explanation: 'Typowo około 7 dni — przekażemy szczegóły dla zastosowanego systemu.'
          }
        ]
      },
      {
        id: 'cleaning-and-care',
        title: 'Prosta pielęgnacja',
        summary: 'Czego używać do czyszczenia i jak chronić powierzchnię.',
        body: 'Do codziennego mycia stosuj neutralne środki (pH ~ 7) i miękkie akcesoria. Unikaj agresywnej chemii i drapania. W miejscach intensywnego ruchu sprawdzają się maty ochronne; pod meblami używaj miękkich podkładek.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Jakie środki zalecamy do czyszczenia codziennego?',
            options: ['Kwaśne', 'Zasadowe', 'Neutralne (pH ~ 7)', 'Rozpuszczalniki'],
            correctAnswer: 2,
            explanation: 'Neutralne środki są bezpieczne dla większości powłok i wystarczające w codziennej pielęgnacji.'
          }
        ]
      },
      {
        id: 'warranty-and-support',
        title: 'Gwarancja i wsparcie',
        summary: 'Co obejmuje gwarancja i jak skorzystać z pomocy.',
        body: 'Po zakończeniu prac otrzymasz dokument gwarancyjny i wskazówki eksploatacyjne. W razie pytań lub nieprawidłowości skontaktuj się z nami — szybka reakcja pozwala ograniczyć skutki. Regularna pielęgnacja i stosowanie się do zaleceń gwarancyjnych wydłuża żywotność posadzki.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Co zrobić w razie wątpliwości po realizacji?',
            options: ['Czekać tydzień', 'Użyć silnego rozpuszczalnika', 'Skontaktować się z supportem', 'Nic nie robić'],
            correctAnswer: 2,
            explanation: 'Kontakt ze wsparciem pozwala szybko wyjaśnić sprawę i wdrożyć właściwe działania.'
          }
        ]
      }
    ]
  }
]
