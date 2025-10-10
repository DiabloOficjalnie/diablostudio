// Edukacyjne treści dla klientów (nie-DIY)
// Źródła bazowe zatwierdzone: FeRFA, HSE, EU-OSHA, ISO 45001 (ramy BHP), Karty techniczne producentów (TDS).
// Uwaga: konkretne czasy schnięcia/utwardzania, limity wilgotności/temperatury i dopuszczone środki pielęgnacji zawsze weryfikujemy w TDS producenta dla zastosowanego systemu.

export type Citation = {
  label: string
  url?: string
  source: 'FeRFA' | 'HSE' | 'EU-OSHA' | 'ISO' | 'TDS'
}

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
  sources?: Citation[]
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
  // 1) Journey (proces współpracy)
  {
    id: 'journey',
    title: 'Twoja droga: od wyceny do odbioru',
    description:
      'Co wydarzy się po kalkulacji, jak wygląda wizyta techniczna, oferta i rezerwacja terminu – krok po kroku.',
    estimatedTime: '10–12 min',
    category: 'journey',
    lessons: [
      {
        id: 'after-valuation',
        title: 'Po wycenie: co dalej?',
        summary: 'Co robimy po Twojej kalkulacji i kiedy się odzywamy.',
        body:
          'Po kalkulacji wysyłamy podsumowanie i proponujemy możliwe terminy rozmowy lub wizyty technicznej. Na tym etapie uściślamy zakres, potwierdzamy wstępny harmonogram i ustalamy kolejne kroki. Dla przyspieszenia warto przesłać 2–3 zdjęcia miejsca montażu i listę pytań.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Jaki jest kolejny krok po kalkulacji?',
            options: [
              'Zakup materiałów przez klienta',
              'Samodzielny montaż',
              'Rozmowa/wizyta techniczna',
              'Brak dalszych kroków',
            ],
            correctAnswer: 2,
            explanation:
              'Po kalkulacji umawiamy rozmowę lub wizytę techniczną, aby doprecyzować zakres i harmonogram.',
          },
        ],
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (dobór systemu a warunki obiektu)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
        ],
      },
      {
        id: 'site-visit',
        title: 'Wizyta techniczna',
        summary: 'Na co zwrócimy uwagę i czego potrzebujemy na miejscu.',
        body:
          'Podczas wizyty sprawdzimy dostęp, wilgotność i stan podłoża. To moment na doprecyzowanie detali oraz potwierdzenie wyceny. Zapewnij dostęp do miejsca, oświetlenie i możliwość wykonania pomiarów. Jeśli to konsultacja zdalna, przygotuj zdjęcia oraz krótkie nagranie wideo (opcjonalnie).',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Celem wizyty technicznej jest:',
            options: [
              'Podpisanie umowy na miejscu',
              'Wstępne malowanie',
              'Weryfikacja warunków i pomiarów',
              'Płatność zaliczki',
            ],
            correctAnswer: 2,
            explanation:
              'Wizyta służy ocenie warunków i potwierdzeniu zakresu — dopiero potem finalizujemy formalności.',
          },
        ],
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (ocena podłoża, warunków pracy, dobór systemu)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
        ],
      },
      {
        id: 'offer-and-date',
        title: 'Oferta i termin',
        summary: 'Jak wygląda finalna oferta i rezerwacja terminu.',
        body:
          'Po wizycie otrzymasz ofertę z etapami, materiałami i proponowanym terminem. Po akceptacji rezerwujemy termin realizacji (czasem wymagana zaliczka). Zawsze potwierdzamy to e‑mailem/SMS-em. Na kilka dni przed realizacją przypominamy o przygotowaniu przestrzeni.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Po akceptacji oferty:',
            options: [
              'Przywozimy materiały od razu',
              'Rezerwujemy termin realizacji',
              'Kończymy projekt',
              'Wysyłamy instrukcję DIY',
            ],
            correctAnswer: 1,
            explanation:
              'Po akceptacji rezerwujemy termin i przygotowujemy harmonogram realizacji.',
          },
        ],
      },
      {
        id: 'communication-and-changes',
        title: 'Komunikacja i zmiany w trakcie procesu',
        summary: 'Jak zgłaszać zmiany i otrzymywać aktualizacje.',
        body:
          'W trakcie procesu możesz potrzebować zmian (termin, zakres). Ustalamy je z wyprzedzeniem, aby nie wpływały na jakość i harmonogram. Bieżące informacje przekazujemy kanałem uzgodnionym na starcie (telefon/e‑mail).',
        readTimeMin: 2,
      },
    ],
  },

  // 2) Preparation (przygotowanie przestrzeni)
  {
    id: 'preparation',
    title: 'Przygotowanie domu/przestrzeni',
    description:
      'Drobne rzeczy po Twojej stronie, które naprawdę robią różnicę: dostęp, opróżnienie, bezpieczeństwo i komfort.',
    estimatedTime: '12–15 min',
    category: 'preparation',
    lessons: [
      {
        id: 'access-and-clear',
        title: 'Dostęp i opróżnienie',
        summary: 'Jak ułatwić start prac i uniknąć opóźnień.',
        body:
          'Ułatw dojazd i wniesienie sprzętu. Usuń meble z pomieszczeń lub zabezpiecz te, które muszą pozostać. Zostaw wolny przejazd, wskaż gniazda prądu, zabezpiecz rzeczy wrażliwe na pył. To skraca czas i zmniejsza ryzyko uszkodzeń.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Co zrobić z meblami przed startem prac?',
            options: [
              'Nic, zostają jak są',
              'Usunąć lub dobrze zabezpieczyć',
              'Przesunąć o 5 cm',
              'Zawinąć w folię bąbelkową i zostawić',
            ],
            correctAnswer: 1,
            explanation:
              'Usunięcie lub właściwe zabezpieczenie mebli przyspiesza pracę i zwiększa bezpieczeństwo.',
          },
        ],
      },
      {
        id: 'ventilation-and-safety',
        title: 'Wentylacja i bezpieczeństwo domowników',
        summary: 'Komfort i bezpieczeństwo podczas realizacji.',
        body:
          'Zapewnij wietrzenie i ogranicz dostęp dzieci/zwierząt do strefy prac. My dbamy o bezpieczeństwo i porządek, ale kontrola dostępu to klucz. Uprzedź domowników o strefach wyłączonych z ruchu i przewidywanym hałasie.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy zwierzęta mogą przebywać w strefie prac?',
            options: ['Tak', 'Nie', 'Tylko koty', 'Tylko psy'],
            correctAnswer: 1,
            explanation:
              'Dla bezpieczeństwa i komfortu strefa prac powinna być zamknięta dla dzieci i zwierząt.',
          },
        ],
        sources: [
          {
            label:
              'HSE – Epoxy resins: health and safety (ogólne zalecenia dot. wentylacji/ekspozycji)',
            url: 'https://www.hse.gov.uk/chemicals/epoxy.htm',
            source: 'HSE',
          },
          {
            label: 'EU-OSHA – Dangerous substances (informacje ogólne i prewencja)',
            url: 'https://osha.europa.eu/en/themes/dangerous-substances',
            source: 'EU-OSHA',
          },
        ],
      },
      {
        id: 'dust-and-protection',
        title: 'Kurz i ochrona strefy prac',
        summary: 'Jak ograniczyć pył i chronić sąsiednie strefy.',
        body:
          'Prace przygotowawcze mogą generować pył. Zasłoń przejścia, zabezpiecz otwory i kratki wentylacyjne (jeśli wskazane), używaj mat ochronnych w strefach przejściowych. Sprzęt sprzątający mamy na miejscu — ale prewencja ogranicza uciążliwości.',
        readTimeMin: 2,
        sources: [
          {
            label:
              'EU-OSHA – Ograniczanie narażenia na substancje (higiena i housekeeping)',
            url: 'https://osha.europa.eu/en/themes/dangerous-substances',
            source: 'EU-OSHA',
          },
        ],
      },
      {
        id: 'moisture-testing',
        title: 'Dlaczego mierzymy wilgotność podłoża',
        summary:
          'Wilgotność wpływa na przyczepność i trwałość — jak to wykorzystujemy w praktyce.',
        body:
          'Posadzki żywiczne wymagają podłoża w odpowiednim stanie wilgotności. Przed pracami wykonujemy pomiary (np. metodą CM lub sondą elektryczną) i oceniamy ryzyko zawilgocenia od spodu. Na tej podstawie dobieramy system lub dodatkowe warstwy/barierę paroizolacyjną. Konkretne limity i metody akceptacji określa karta TDS zastosowanego systemu oraz wytyczne producenta.',
        readTimeMin: 3,
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (ocena podłoża i warunków aplikacji)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label:
              'Karta techniczna producenta (TDS) – dopuszczalna wilgotność/warunki aplikacji',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'utilities-and-neighbours',
        title: 'Media, parkowanie i sąsiedzi',
        summary:
          'Prąd, dostęp do wody, parkowanie i krótkie powiadomienie sąsiadów.',
        body:
          'Zapewnienie zasilania i dostępu do wody przyspiesza prace i ogranicza przerwy technologiczne. Jeśli w budynku są wspólne części, warto uprzedzić sąsiadów o możliwym hałasie w określonych godzinach. Wskazanie miejsca parkowania lub rozładunku eliminuje zbędne postoje.',
        readTimeMin: 2,
      },
    ],
  },

  // 3) Installation (dzień realizacji)
  {
    id: 'installation-day',
    title: 'Dzień realizacji: czego się spodziewać',
    description:
      'Przebieg dnia, możliwe przerwy technologiczne, komfort i zasady poruszania.',
    estimatedTime: '10–12 min',
    category: 'installation',
    lessons: [
      {
        id: 'timeline',
        title: 'Harmonogram dnia',
        summary: 'Etapy, przerwy technologiczne, orientacyjne czasy.',
        body:
          'Dzień zaczynamy od przygotowania podłoża. Następnie aplikujemy warstwy systemu; między warstwami mogą wystąpić przerwy technologiczne zależne od temperatury i wilgotności. Na koniec sprzątamy i zabezpieczamy strefę.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy przerwy technologiczne są możliwe?',
            options: ['Nie', 'Tak', 'Tylko zimą', 'Tylko przy poliuretanie'],
            correctAnswer: 1,
            explanation:
              'Przerwy technologiczne wynikają z warunków i specyfiki materiału — to normalny element procesu.',
          },
        ],
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (uwarunkowania technologiczne a dobór/warunki aplikacji)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
        ],
      },
      {
        id: 'comfort',
        title: 'Komfort i zasady w trakcie prac',
        summary: 'Hałas, zapach, dostęp — co jest normalne i dlaczego.',
        body:
          'Możliwy jest hałas i delikatny zapach; stale wietrzymy. Prosimy nie wchodzić na świeże warstwy i nie przestawiać zabezpieczeń. Zapewnienie prądu i wolnych ciągów komunikacyjnych przyspiesza realizację.',
        readTimeMin: 3,
        quiz: [
          {
            question: 'Czy można wejść na świeżo nałożoną warstwę?',
            options: ['Tak', 'Nie', 'W skarpetkach', 'Po 10 minutach'],
            correctAnswer: 1,
            explanation:
              'Świeże warstwy wymagają czasu — wejście może trwale uszkodzić powierzchnię.',
          },
        ],
        sources: [
          {
            label:
              'HSE – Epoxy resins (wskazania dot. ekspozycji/wentylacji dla komfortu i bezpieczeństwa)',
            url: 'https://www.hse.gov.uk/chemicals/epoxy.htm',
            source: 'HSE',
          },
        ],
      },
      {
        id: 'environment-conditions',
        title: 'Warunki środowiskowe',
        summary: 'Temperatura i wilgotność — dlaczego mają znaczenie.',
        body:
          'Warunki otoczenia wpływają na wiązanie i parametry powłoki. Podamy Ci wymagania dla zastosowanego systemu. Uwaga: finalne parametry zawsze wg TDS producenta (np. minimalna temperatura aplikacji, dopuszczalna wilgotność podłoża).',
        readTimeMin: 2,
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (warunki otoczenia a aplikacja)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label:
              'TDS producenta (warunki aplikacji i limity wilgotności/temperatury)',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'on-site-safety',
        title: 'Bezpieczeństwo i strefy prac na obiekcie',
        summary:
          'Wygrodzenia, oznaczenia i ograniczenie dostępu dla bezpieczeństwa wszystkich.',
        body:
          'Na czas prac wyznaczamy strefy robocze i tymczasowe ciągi komunikacyjne. Oznaczenia i wygrodzenia chronią domowników i nasz zespół. Prosimy o stosowanie się do zaleceń i tymczasowych tras. To standard zgodny z dobrymi praktykami BHP i podejściem systemowym do bezpieczeństwa pracy.',
        readTimeMin: 2,
        sources: [
          {
            label:
              'ISO 45001:2018 – Occupational health and safety management systems (ramy systemowego podejścia do BHP)',
            url: 'https://www.iso.org/standard/63787.html',
            source: 'ISO',
          },
          {
            label:
              'HSE – Epoxy resins (ogólne informacje nt. ekspozycji i bezpiecznych praktyk)',
            url: 'https://www.hse.gov.uk/chemicals/epoxy.htm',
            source: 'HSE',
          },
        ],
      },
      {
        id: 'health-exposure-good-practice',
        title: 'Ekspozycje zdrowotne, alergie i dobre praktyki',
        summary: 'Minimalizacja ekspozycji, typowe objawy uczuleń, bezpieczne zachowania podczas prac.',
        body:
          'Żywice i utwardzacze mogą działać drażniąco i uczulająco (np. epoksydy są silnymi uczulaczami skóry). Dlatego utrzymujemy dobrą wentylację, wyznaczamy strefy robocze i ograniczamy dostęp osób postronnych. Typowe wczesne objawy nadwrażliwości to zaczerwienienie skóry, świąd, wysypka; przy ekspozycji wziewnej — kaszel, świszczący oddech, duszność. Jeśli zauważysz takie symptomy, zgłoś je naszej ekipie i — w razie potrzeby — skontaktuj się z lekarzem. Nie usuwaj samodzielnie rozlewów chemii; stosujemy do tego procedury zgodne z kartami charakterystyki. Wrażliwe osoby (alergicy, astmatycy) powinny unikać przebywania w strefie prac aż do pełnego wietrzenia. Konkretne informacje o zagrożeniach i środkach ostrożności wynikają z kart TDS/SDS producenta dla użytego systemu.',
        readTimeMin: 4,
        quiz: [
          {
            question: 'Czy epoksydy i utwardzacze mogą działać uczulająco?',
            options: ['Nie, to mit', 'Tak, mogą wywołać zapalenie skóry i objawy astmatyczne', 'Tylko przy kontakcie z wodą', 'Tylko w niskiej temperaturze'],
            correctAnswer: 1,
            explanation: 'HSE wskazuje, że składniki systemów epoksydowych są silnymi uczulaczami skóry; możliwe są też objawy ze strony układu oddechowego.',
          },
          {
            question: 'Co zrobić, jeśli pojawią się objawy podrażnienia lub duszności podczas prac?',
            options: ['Zignorować, samo przejdzie', 'Wejść bliżej, by szybciej się przyzwyczaić', 'Opuszczać strefę prac i zgłosić objawy ekipie; w razie potrzeby skontaktować się z lekarzem', 'Spróbować silnego rozpuszczalnika na skórę'],
            correctAnswer: 2,
            explanation: 'Ograniczenie ekspozycji, zgłoszenie objawów i konsultacja medyczna to właściwe działania zgodnie z zaleceniami HSE/EU‑OSHA.',
          },
          {
            question: 'Czy Klient powinien samodzielnie usuwać rozlaną chemię w strefie prac?',
            options: ['Tak, natychmiast', 'Nie — zajmuje się tym przeszkolona ekipa zgodnie z procedurami i kartami charakterystyki', 'Tylko jeśli to mała ilość', 'Tak, ale wyłącznie papierem'],
            correctAnswer: 1,
            explanation: 'Rozlewy substancji chemicznych usuwa przeszkolony personel według procedur i zaleceń w TDS/SDS.',
          },
        ],
        sources: [
          {
            label: 'HSE – Epoxy resins: health and safety (sensybilizacja skóry i zagrożenia)',
            url: 'https://www.hse.gov.uk/chemicals/epoxy.htm',
            source: 'HSE',
          },
          {
            label: 'EU-OSHA – Dangerous substances (ogólne zasady prewencji i ograniczania narażenia)',
            url: 'https://osha.europa.eu/en/themes/dangerous-substances',
            source: 'EU-OSHA',
          },
          {
            label: 'Karta techniczna/charakterystyki (TDS/SDS) producenta – szczegółowe środki ostrożności',
            source: 'TDS',
          },
        ],
      },
    ],
  },

  // 4) Aftercare (po realizacji, pielęgnacja, gwarancja)
  {
    id: 'aftercare',
    title: 'Po realizacji: użytkowanie, pielęgnacja i gwarancja',
    description:
      'Kiedy można wejść, jak sprzątać i czego unikać, aby posadzka służyła latami.',
    estimatedTime: '14–18 min',
    category: 'aftercare',
    lessons: [
      {
        id: 'cure-and-first-steps',
        title: 'Czas schnięcia i pierwsze użytkowanie',
        summary:
          'Bezpieczne czasy — wejście, lekkie użytkowanie, pełne obciążenie.',
        body:
          'Wstępne wejście zwykle po około 24 h, lekkie użytkowanie po 48–72 h, pełne właściwości mechaniczne po około 7 dniach (zależnie od systemu i warunków). Dokładne czasy potwierdzamy z TDS zastosowanego systemu.',
        readTimeMin: 2,
        quiz: [
          {
            question: 'Pełne właściwości mechaniczne zwykle osiągane są po:',
            options: ['1 dniu', '3 dniach', '7 dniach', '14 dniach'],
            correctAnswer: 2,
            explanation:
              'Typowo żywice osiągają pełne parametry w okolicach 7 dni; zawsze weryfikujemy TDS dla konkretnego systemu.',
          },
        ],
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (uwarunkowania technologiczne a dojrzewanie powłok)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – czasy dojrzewania',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'initial-cleaning',
        title: 'Pierwsze sprzątanie i wczesna pielęgnacja',
        summary:
          'Jak sprzątać w pierwszym tygodniu i czego unikać, aby nie uszkodzić powłoki.',
        body:
          'W pierwszych dniach po aplikacji unikaj intensywnego szorowania i urządzeń parowych. Stosuj łagodne środki czyszczące o neutralnym pH i miękkie pady/mopy. Zabrudzenia usuwaj na bieżąco, a piasek i drobny żwir eliminuj wycieraczkami i regularnym odkurzaniem. Dokładne zalecenia mogą się różnić w zależności od systemu — sprawdzamy TDS.',
        readTimeMin: 3,
        sources: [
          {
            label: 'FeRFA – Guide to Cleaning Resin Flooring (ogólne zasady czyszczenia)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-cleaning-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label:
              'EU-OSHA – Ograniczanie narażenia/housekeeping (higiena eksploatacyjna)',
            url: 'https://osha.europa.eu/en/themes/dangerous-substances',
            source: 'EU-OSHA',
          },
        ],
      },
      {
        id: 'routine-care-products',
        title: 'Rutynowa pielęgnacja i dobór środków',
        summary:
          'pH-neutralne detergenty, właściwe stężenia, odpowiednia mechanika czyszczenia.',
        body:
          'Do rutynowej pielęgnacji stosujemy środki pH‑neutralne zgodnie z zaleceniami producenta chemii i posadzki. Unikamy agresywnych rozpuszczalników i środków silnie zasadowych/kwasowych bez potwierdzenia w TDS. W obszarach o dużym natężeniu ruchu zalecane są programy czyszczenia mechanicznego z dobranymi padami/szczotkami o odpowiedniej twardości.',
        readTimeMin: 3,
        sources: [
          {
            label:
              'FeRFA – Guide to Cleaning Resin Flooring (dobór chemii i metod czyszczenia)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-cleaning-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – środki i dopuszczalne pH',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'stains-and-repairs',
        title: 'Plamy, rysy i naprawy punktowe',
        summary:
          'Jak reagować na trudne zabrudzenia i drobne uszkodzenia, by nie pogorszyć stanu.',
        body:
          'Plamy usuwamy możliwie szybko zgodnie z zaleceniami producenta — zaczynamy od najmniej inwazyjnych metod. Drobne rysy i uszkodzenia można naprawić punktowo kompatybilnymi materiałami systemowymi. W przypadku głębszych uszkodzeń zalecamy konsultację — dobór technologii i kompatybilności zapewnia trwały efekt.',
        readTimeMin: 3,
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection/Cleaning (praktyki eksploatacji i konserwacji)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label:
              'Karta techniczna producenta (TDS) – materiały naprawcze/kompatybilność',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'furniture-and-loads',
        title: 'Meble, koła i obciążenia punktowe',
        summary:
          'Ochrona powierzchni: podkładki, miękkie koła i maty w strefach narażonych.',
        body:
          'Stosuj podkładki filcowe pod meble oraz miękkie (niebarwiące) koła do krzeseł i wózków. W strefach wejściowych i punktach zawracania używaj mat ochronnych. Unikaj przeciągania ciężkich przedmiotów po powierzchni — przenoś je z użyciem ochrony. W przypadku planowanych dużych obciążeń warto zweryfikować dopuszczalność w TDS i w ofercie.',
        readTimeMin: 2,
        sources: [
          {
            label:
              'FeRFA – Guide to the Selection of Synthetic Resin Flooring (eksploatacja, obciążenia i użytkowanie)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
        ],
      },
      {
        id: 'warranty-and-records',
        title: 'Gwarancja, przeglądy i dokumentacja pielęgnacji',
        summary:
          'Co zwykle obejmuje gwarancja i jak utrzymać jej ważność w praktyce.',
        body:
          'Warunki gwarancji określamy w umowie/ofercie. Zwykle wymagane jest stosowanie rekomendowanej pielęgnacji i niedokonywanie nieautoryzowanych przeróbek. Warto prowadzić prosty rejestr utrzymania (daty czyszczeń, zastosowana chemia), co pomaga w diagnostyce i weryfikacji warunków gwarancji. W razie problemu kontaktuj się z nami — ocenimy i zaproponujemy właściwe działanie.',
        readTimeMin: 3,
        sources: [
          {
            label: 'ISO 45001:2018 – Systemowe podejście do bezpieczeństwa i nadzoru',
            url: 'https://www.iso.org/standard/63787.html',
            source: 'ISO',
          },
          {
            label:
              'Karta techniczna producenta (TDS) – zalecenia eksploatacyjne i ograniczenia',
            source: 'TDS',
          },
        ],
        quiz: [
          {
            question:
              'Co pomoże utrzymać ważność gwarancji i ułatwi diagnostykę w przyszłości?',
            options: [
              'Brak mycia przez pierwszy rok',
              'Rejestr przeglądów i stosowanych środków',
              'Stosowanie najsilniejszych rozpuszczalników',
              'Mycie parowe codziennie',
            ],
            correctAnswer: 1,
            explanation:
              'Prowadzenie prostego rejestru utrzymania oraz stosowanie zaleceń producenta i wykonawcy wspierają utrzymanie gwarancji.',
          },
        ],
      },
      {
        id: 'cleaning-program',
        title: 'Program czyszczenia i harmonogram prac pielęgnacyjnych',
        summary:
          'Jak zaplanować codzienną, tygodniową i okresową pielęgnację, aby zachować estetykę i parametry.',
        body:
          'Codziennie: usuwaj piasek i luźne zabrudzenia (odkurzanie, zamiatanie), miejscowo przecieraj rozlane substancje. Tygodniowo: mycie na mokro neutralnym środkiem pH z miękkim padem/mopem, zgodnie z zaleceniami producenta chemii. Okresowo: w strefach intensywnych rozważ czyszczenie mechaniczne z właściwie dobraną szczotką/padem oraz kontrolę stanu powłoki. Unikaj agresywnych rozpuszczalników bez potwierdzenia w TDS.',
        readTimeMin: 3,
        sources: [
          {
            label: 'FeRFA – Guide to Cleaning Resin Flooring (metody i częstotliwości czyszczenia)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-cleaning-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – dopuszczone środki, pH i częstotliwości',
            source: 'TDS',
          },
        ],
      },
    ],
  },

  // 5) System selection & bezpieczeństwo użytkowania (nowe treści)
  {
    id: 'system-selection',
    title: 'Dobór systemu żywicznego do potrzeb',
    description:
      'Przegląd popularnych typów systemów (epoksyd, poliuretan, szybkie PMMA) i ich typowych zastosowań.',
    estimatedTime: '12–15 min',
    category: 'preparation',
    lessons: [
      {
        id: 'resin-systems-overview',
        title: 'Epoksyd, poliuretan i PMMA – czym się różnią?',
        summary:
          'Najczęściej stosowane systemy, ich właściwości oraz typowe obszary użycia.',
        body:
          'Epoksyd (EP): bardzo twardy i odporny mechanicznie, wysoka odporność chemiczna, zwykle niższa odporność na UV – preferowany wewnątrz (hale, garaże, magazyny). Poliuretan (PU): bardziej elastyczny, lepsza odporność na UV i drgania – częsty wybór na zewnątrz (tarasy, balkony) i w miejscach z pracą podłoża. PMMA (metakrylat): systemy szybkoschnące (krótkie przestoje), stosowane w obiektach wymagających szybkiego oddania do użytku. Finalny dobór systemu zawsze potwierdzamy pod konkretne warunki obiektu i w oparciu o TDS.',
        readTimeMin: 4,
        sources: [
          {
            label: 'FeRFA – Guide to the Selection of Synthetic Resin Flooring (przegląd typów systemów i zastosowań)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – parametry i ograniczenia systemu',
            source: 'TDS',
          },
        ],
        quiz: [
          {
            question: 'Który system zwykle lepiej znosi UV na zewnątrz?',
            options: ['Epoksyd (EP)', 'Poliuretan (PU)', 'Wszystkie jednakowo', 'Tylko PMMA'],
            correctAnswer: 1,
            explanation: 'PU zwykle charakteryzuje się lepszą odpornością na UV niż EP; zawsze weryfikujemy TDS.',
          },
        ],
      },
      {
        id: 'slip-resistance-and-safety',
        title: 'Antypoślizg i bezpieczeństwo użytkowania',
        summary:
          'Jak tekstura, czystość i dobór systemu wpływają na ryzyko poślizgnięć.',
        body:
          'O właściwościach antypoślizgowych decyduje m.in. struktura wykończenia i czystość powierzchni. W strefach mokrych i wejściowych zaleca się wykończenia o wyższej przyczepności oraz odpowiednie maty. Regularne utrzymanie czystości ogranicza film zanieczyszczeń, który zwiększa ryzyko poślizgów. Wybór właściwego wykończenia omawiamy na etapie doboru systemu i potwierdzamy rekomendacjami producenta.',
        readTimeMin: 3,
        sources: [
          {
            label: 'HSE – Slips and trips (zasady ograniczania poślizgnięć, znaczenie czystości i doboru powierzchni)',
            url: 'https://www.hse.gov.uk/slips/index.htm',
            source: 'HSE',
          },
          {
            label: 'FeRFA – Guide to Cleaning Resin Flooring (utrzymanie a właściwości przeciwpoślizgowe)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-cleaning-resin-flooring/',
            source: 'FeRFA',
          },
        ],
        quiz: [
          {
            question: 'Co istotnie zmniejsza ryzyko poślizgnięć na żywicy?',
            options: ['Bardzo gładkie wykończenie', 'Brak czyszczenia', 'Regularne utrzymanie i właściwa tekstura', 'Stosowanie wyłącznie wosków'],
            correctAnswer: 2,
            explanation: 'HSE podkreśla znaczenie czystości oraz właściwości powierzchni; dobieramy teksturę do warunków.',
          },
        ],
      },
      {
        id: 'environmental-and-voc',
        title: 'Zapachy, VOC i wentylacja podczas oraz po pracach',
        summary:
          'Jak planujemy wentylację i powrót do użytkowania, aby komfortowo przejść okres po aplikacji.',
        body:
          'Podczas prac i wczesnego dojrzewania możliwe są zapachy; minimalizujemy je przez organizację prac i wietrzenie. Emisje lotnych związków organicznych (VOC) oraz czasy powrotu do użytkowania zależą od systemu i warunków – zawsze sprawdzamy TDS/SDS. Osoby wrażliwe (alergie, astma) powinny ograniczyć przebywanie w strefie do zakończenia wietrzenia i osiągnięcia bezpiecznych warunków.',
        readTimeMin: 3,
        sources: [
          {
            label: 'EU-OSHA – Dangerous substances (ogólne zasady prewencji/ekspozycji)',
            url: 'https://osha.europa.eu/en/themes/dangerous-substances',
            source: 'EU-OSHA',
          },
          {
            label: 'Karta techniczna/charakterystyki (TDS/SDS) – VOC, wentylacja i ponowne wejście',
            source: 'TDS',
          },
        ],
      },
    ],
  },

  // 6) Podłoże i kompatybilność (nowe treści)
  {
    id: 'substrate-compatibility',
    title: 'Podłoże i kompatybilność systemu',
    description:
      'Co w praktyce oznacza „dobre podłoże”: rodzaj, wilgotność, dylatacje i detale przy ścianach, odpływach, progach.',
    estimatedTime: '10–14 min',
    category: 'preparation',
    lessons: [
      {
        id: 'substrate-types',
        title: 'Beton, jastrych anhydrytowy, płytki – co jest możliwe?',
        summary:
          'Typ podłoża wpływa na przygotowanie i ewentualne warstwy pośrednie.',
        body:
          'Beton: standard w posadzkach żywicznych; oceniamy wytrzymałość, wilgotność i równość. Jastrych anhydrytowy: wymaga kontroli wilgotności i właściwego przygotowania (m.in. usunięcie mleczka gipsowego). Płytki: możliwe po ocenie przyczepności i stabilności oraz odpowiednim matowieniu/warstwach pośrednich. Szczegóły technologiczne zawsze zgodnie z TDS producenta systemu.',
        readTimeMin: 3,
        sources: [
          {
            label: 'FeRFA – Guide to the Selection of Synthetic Resin Flooring (ocena podłoży i przygotowanie)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – przygotowanie konkretnego podłoża',
            source: 'TDS',
          },
        ],
      },
      {
        id: 'moisture-limits-and-tests',
        title: 'Wilgotność podłoża: limity i metody akceptacji',
        summary:
          'Dlaczego wynik pomiaru decyduje o technologii i terminie.',
        body:
          'Zbyt wysoka wilgotność zwiększa ryzyko odspojenia lub osmozy. Do wstępnej oceny używa się sond elektrycznych; pomiar referencyjny często CM. Akceptowalne poziomy wilgotności i wymagane metody potwierdza TDS wybranego systemu. W razie ryzyka wilgoci podciąganej rozważamy dodatkowe bariery/paroisolacje zgodnie z zaleceniami producenta.',
        readTimeMin: 3,
        sources: [
          {
            label: 'FeRFA – Guide to the Selection of Synthetic Resin Flooring (wilgotność i ryzyka eksploatacyjne)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – dopuszczalne wartości i procedury',
            source: 'TDS',
          },
        ],
        quiz: [
          {
            question: 'Co robimy, gdy wilgotność podłoża przekracza zalecenia?',
            options: ['Ignorujemy i aplikujemy', 'Zmieniamy termin/technologię lub dodajemy bariery zgodnie z TDS', 'Zwiększamy grubość warstwy', 'Myjemy podłoże wodą'],
            correctAnswer: 1,
            explanation: 'Decyzje podejmujemy wg TDS i oceny technicznej; możliwa zmiana technologii lub dodatkowe warstwy.',
          },
        ],
      },
      {
        id: 'joints-and-details',
        title: 'Dylatacje i detale (progi, cokoły, odpływy)',
        summary:
          'Jak planujemy detale, aby estetyka i funkcjonalność szły w parze.',
        body:
          'Dylatacje konstrukcyjne zwykle przenosimy w warstwach wykończeniowych zgodnie z projektem i TDS. Przy progach, ościeżnicach i odpływach uzgadniamy sposób wykończenia (np. profile, cokoły z żywicy). Detale omawiamy przed realizacją, by uniknąć niespodzianek i zapewnić trwałość oraz spójny wygląd.',
        readTimeMin: 2,
        sources: [
          {
            label: 'FeRFA – Guide to the Selection of Synthetic Resin Flooring (projekt detali i połączeń)',
            url: 'https://www.ferfa.org.uk/guidance/ferfa-guide-to-the-selection-of-synthetic-resin-flooring/',
            source: 'FeRFA',
          },
          {
            label: 'Karta techniczna producenta (TDS) – zalecenia wykonawcze dla detali',
            source: 'TDS',
          },
        ],
      },
    ],
  },
]
