// Content constants for the floor quotation application
export const CONTENT = {
  // Main page
  MAIN_TITLE: 'Szybka wycena posadzki żywicznej',
  MAIN_SUBTITLE: 'Otrzymaj orientacyjną wycenę w kilka minut',

  // Form sections
  AREA_LABEL: 'Powierzchnia (m²) *',
  RESET_BUTTON: '🔄 Resetuj',
  ADD_ROOM_BUTTON: '+ Dodaj pomieszczenie',
  TOTAL_AREA: 'Łączna powierzchnia:',

  // Room management
  ROOM_NAME: 'Pomieszczenie',
  REMOVE_ROOM: '🗑️ Usuń',
  AREA_PLACEHOLDER: 'np. 25',
  CALCULATOR_BUTTON: '📏',

  // Floor systems
  FLOOR_SYSTEM_LABEL: 'Rodzaj żywicy *',
  FLOOR_SYSTEMS: {
    EPOXY_STANDARD: {
      NAME: 'Epoksyd Standard',
      ICON: '🛡️',
      DESCRIPTION: 'Trwała i ekonomiczna posadzka do wnętrz, odporna na ścieranie i chemikalia.',
      PRICE: 160
    },
    EPOXY_PREMIUM: {
      NAME: 'Epoksyd Premium',
      ICON: '⚡',
      DESCRIPTION: 'Wyższa odporność chemiczna i mechaniczna, idealna do przemysłu i obiektów o dużym obciążeniu.',
      PRICE: 200
    },
    PU_STANDARD: {
      NAME: 'Poliuretan Standard',
      ICON: '🏠',
      DESCRIPTION: 'Elastyczna, odporna na UV, dobra do mieszkań i lekkich zastosowań zewnętrznych.',
      PRICE: 180
    },
    PU_PREMIUM: {
      NAME: 'Poliuretan Premium',
      ICON: '👑',
      DESCRIPTION: 'Najwyższa trwałość, odporność na warunki atmosferyczne i intensywne użytkowanie, do przestrzeni publicznych i zewnętrznych.',
      PRICE: 220
    }
  },
  EPOXY_STANDARD: {
    name: 'Epoksyd Standard',
    subtitle: 'Najprostsze i najtańsze rozwiązanie',
    description: 'Trwała i ekonomiczna posadzka do wnętrz, odporna na ścieranie i chemikalia.'
  },
  EPOXY_PREMIUM: {
    name: 'Epoksyd Premium',
    subtitle: 'Wyjątkowa trwałość i odporność',
    description: 'Wyższa odporność chemiczna i mechaniczna, idealna do przemysłu i obiektów o dużym obciążeniu.'
  },
  PU_STANDARD: {
    name: 'Poliuretan Standard',
    subtitle: 'Elastyczny, odporny na UV',
    description: 'Elastyczna, odporna na UV, dobra do mieszkań i lekkich zastosowań zewnętrznych.'
  },
  PU_PREMIUM: {
    name: 'Poliuretan Premium',
    subtitle: 'Najwyższa trwałość i jakość',
    description: 'Najwyższa trwałość, odporność na warunki atmosferyczne i intensywne użytkowanie, do przestrzeni publicznych i zewnętrznych.'
  },

  // Substrate conditions
  SUBSTRATE_LABEL: 'Rodzaj podłoża *',
  SUBSTRATE_CONDITIONS: {
    CONCRETE_GOOD: {
      NAME: 'Beton w dobrym stanie',
      ICON: '✅',
      DESCRIPTION: 'Idealne podłoże do aplikacji posadzki żywicznej.'
    },
    CONCRETE_DEFECTS: {
      NAME: 'Beton z wadami',
      ICON: '⚠️',
      DESCRIPTION: 'Wymaga dodatkowej подготовки przed aplikacją posadzki.'
    },
    TILES: {
      NAME: 'Płytki ceramiczne',
      ICON: '🔲',
      DESCRIPTION: 'Wymagają odpowiedniego przygotowania powierzchni.'
    },
    OLD_RESIN: {
      NAME: 'Stara żywica / farba',
      ICON: '✨',
      DESCRIPTION: 'Wymaga usunięcia luźnych fragmentów przed aplikacją.'
    },
    OTHER: {
      NAME: 'Inne (asfalt, drewno, itp.)',
      ICON: '🔍',
      DESCRIPTION: 'Wymaga specjalistycznej konsultacji przed aplikacją.'
    }
  },
  CONCRETE_GOOD: {
    name: 'Beton w dobrym stanie',
    subtitle: 'Powierzchnia twarda, gładka, nie pyli',
    description: 'Idealne podłoże do aplikacji posadzki żywicznej.',
    tooltip: '✅ Twarda, gładka, nie pyli, bez pęknięć. Uderz młotkiem - nie kruszy się.'
  },
  CONCRETE_DEFECTS: {
    name: 'Beton z wadami',
    subtitle: 'Widać pęknięcia, dziury, ubytki',
    description: 'Wymaga dodatkowej подготовки przed aplikacją posadzki.',
    tooltip: '⚠️ Widać pęknięcia, dziury, ubytki. Pyli przy pocieraniu. Może wymagać naprawy.'
  },
  TILES: {
    name: 'Płytki ceramiczne',
    subtitle: 'Widać fugi między elementami',
    description: 'Wymagają odpowiedniego przygotowania powierzchni.',
    tooltip: '🔲 Widać fugi między elementami, twarda i gładka. Sprawdź przyklejenie opukiwaniem.'
  },
  OLD_RESIN: {
    name: 'Stara żywica / farba',
    subtitle: 'Powierzchnia błyszcząca, może się łuszczyć',
    description: 'Wymaga usunięcia luźnych fragmentów przed aplikacją.',
    tooltip: '✨ Powierzchnia błyszcząca, może się łuszczyć. Usunąć luźne fragmenty przed aplikacją.'
  },
  OTHER: {
    name: 'Inne (asfalt, drewno, itp.)',
    subtitle: 'Wymaga indywidualnej konsultacji',
    description: 'Wymaga specjalistycznej konsultacji przed aplikacją.',
    tooltip: '🔍 Czarna, miękka lub elastyczna (asfalt) / deski, widoczne słoje (drewno). Wymaga konsultacji.'
  },

  // Location
  LOCATION_LABEL: 'Lokalizacja *',
  LOCATIONS: {
    INDOOR: {
      NAME: 'Wnętrze',
      ICON: '🏠',
      DESCRIPTION: 'Posadzka układana wewnątrz budynku'
    },
    OUTDOOR: {
      NAME: 'Zewnątrz',
      ICON: '🌤️',
      DESCRIPTION: 'Posadzka narażona na warunki atmosferyczne'
    }
  },
  LOCATION_INDOOR: 'Wnętrze',
  LOCATION_OUTDOOR: 'Zewnątrz',
  LOCATION_TOOLTIP: 'Posadzka na zewnątrz wymaga odporności na warunki atmosferyczne i UV.',

  // Decorative systems
  DECORATIVE_LABEL: 'System dekoracyjny *',
  DECORATIVE_TOOLTIP: 'Wybierz efekt dekoracyjny, który najlepiej pasuje do Twojego projektu.',
  DECORATIVE_OPTIONS: {
    SMOOTH: {
      name: 'Gładka',
      description: 'Monolityczna powierzchnia'
    },
    FLAKES: {
      name: 'Cząsteczki',
      description: 'Dekoracyjne wiórki'
    },
    MARBLE: {
      name: 'Efekt Marmuru',
      description: 'Wielokolorowa mieszanka'
    },
    TEXTURED: {
      name: 'Teksturowana',
      description: 'Powierzchnia antypoślizgowa'
    },
    TRANSPARENT: {
      name: 'Przezroczysta',
      description: 'Z wbudowanym designem'
    }
  },

  // Buttons
  CALCULATE_BUTTON: 'Oblicz Wycenę',
  CONTACT_BUTTON: '📧 Otrzymaj Szczegółową Wycenę PDF',
  NEW_QUOTE_BUTTON: '🔄 Rozpocznij Nową Wycenę',
  DETAILS_BUTTON: '👁️ Pokaż szczegóły wyceny',
  DETAILS_LINK: 'Chcesz zobaczyć więcej szczegółów bez podawania danych?',

  // Messages
  SUCCESS_MESSAGE: '✅ Twoja wycena jest gotowa!',
  PRICE_TITLE: 'Orientacyjna Wycena',
  PRICE_DISCLAIMER: '* Cena orientacyjna, dokładna wycena po oględzinach obiektu',

  // Contact form
  CONTACT_TITLE: 'Dane Kontaktowe',
  CONTACT_NAME: 'Imię i nazwisko *',
  CONTACT_EMAIL: 'Email *',
  CONTACT_PHONE: 'Telefon',
  CONTACT_SUBMIT: 'Wyślij',
  CONTACT_CANCEL: 'Anuluj',

  // Area calculator
  CALCULATOR_TITLE: 'Kalkulator Powierzchni 📏',
  CALCULATOR_LENGTH: 'Długość (m)',
  CALCULATOR_WIDTH: 'Szerokość (m)',
  CALCULATOR_AREA: 'Powierzchnia:',
  CALCULATOR_CALCULATE: 'Oblicz',
  CALCULATOR_CANCEL: 'Anuluj',
  CALCULATOR_LENGTH_PLACEHOLDER: 'np. 10',
  CALCULATOR_WIDTH_PLACEHOLDER: 'np. 5',
  CALCULATOR_ERROR: 'Wprowadź poprawne wymiary',

  // Room limit modal
  ROOM_LIMIT_TITLE: 'Skontaktuj się z nami po bezpłatną wycenę! 📞',
  ROOM_LIMIT_DESCRIPTION: 'Skontaktuj się z nami po bezpłatną wycenę stworzoną przez jednego z naszych ekspertów, pozostaw swoje dane, oddzwonimy.',
  ROOM_LIMIT_SUBMIT: 'Wyślij - Oddzwonimy!',
  ROOM_LIMIT_CLOSE: 'Zamknij',

  // Notifications
  AREA_NOTIFICATION_TITLE: 'Przed szczegółami, musimy wiedzieć na jakiej powierzchni działamy...',
  AREA_NOTIFICATION_DESCRIPTION: 'Wprowadź powierzchnię powyżej, aby odblokować szczegóły systemów.',
  AREA_NOTIFICATION_BUTTON: 'Wpisz ↑',

  // Floor system modal
  FLOOR_SYSTEM_DETAILS: 'Szczegóły systemu',
  FLOOR_SYSTEM_CLOSE: 'Zamknij',
  FLOOR_SYSTEM_CATEGORIES: {
    WHERE: 'Gdzie się sprawdzi?',
    DAMAGE_RESISTANCE: 'Odporność na uszkodzenia',
    CHEMICAL_RESISTANCE: 'Odporność na środki chemiczne',
    UV_RESISTANCE: 'Kolor i światło (UV)',
    WORTH_KNOWING: 'Warto wiedzieć'
  },

  // Trust bar
  TRUST_BAR: {
    FREE_QUOTE: 'Bezpłatna wycena',
    RATING: 'Średnia ocena klientów 4.9/5',
    RESPONSE_TIME: 'Odpowiedź w 24h'
  },

  // Loading states
  LOADING: {
    CALCULATING: 'Obliczamy...',
    ANALYZING: 'Analizujemy parametry...',
    CHECKING: 'Sprawdzamy dostępność materiałów...',
    PRICING: 'Obliczamy optymalną cenę...',
    FINALIZING: 'Finalizujemy wycenę...'
  },

  // Animation
  ANIMATION: {
    TITLE: 'Właśnie przygotowujemy Twoją wycenę...',
    DESCRIPTION: 'Sprawdzamy wszystkie parametry i obliczamy najlepszą cenę'
  },

  // Floor system data
  FLOOR_SYSTEM_DATA: {
    EPOXY_STANDARD: {
      name: 'Epoksyd Standard',
      icon: '🛡️',
      gdzieSprawdzi: 'Garaże, magazyny, warsztaty',
      odpornoscUszkodzenia: '✅ Dobra',
      odpornoscChemikalia: '⚪ Podstawowa',
      kolorUV: '❌ Może żółknąć na słońcu',
      wartoWiedziec: 'Najtańsza opcja, solidna do wnętrz'
    },
    EPOXY_PREMIUM: {
      name: 'Epoksyd Premium',
      icon: '⚡',
      gdzieSprawdzi: 'Hale przemysłowe, laboratoria, miejsca z chemią',
      odpornoscUszkodzenia: '✅✅ Bardzo wysoka',
      odpornoscChemikalia: '✅ Wysoka',
      kolorUV: '⚪ Wymaga dodatkowej ochrony UV',
      wartoWiedziec: 'Trwalszy i mocniejszy, idealny do pracy w trudnych warunkach'
    },
    PU_STANDARD: {
      name: 'Poliuretan Standard',
      icon: '🏠',
      gdzieSprawdzi: 'Tarasy, balkony, miejsca z częściowym dostępem słońca',
      odpornoscUszkodzenia: '✅ Elastyczny, odporny na uderzenia',
      odpornoscChemikalia: '✅ Dobra',
      kolorUV: '✅ Odporny na żółknięcie',
      wartoWiedziec: 'Lepszy wybór, gdy liczy się odporność na warunki atmosferyczne'
    },
    PU_PREMIUM: {
      name: 'Poliuretan Premium',
      icon: '👑',
      gdzieSprawdzi: 'Parkingi, rampy, zewnętrzne powierzchnie narażone na pogodę',
      odpornoscUszkodzenia: '✅✅ Bardzo wysoka',
      odpornoscChemikalia: '✅✅ Bardzo wysoka',
      kolorUV: '✅✅ Najlepsza odporność na UV',
      wartoWiedziec: 'Najbardziej wytrzymała opcja, długo zachowuje kolor i wygląd'
    }
  },

  // Success messages
  SUCCESS: {
    QUOTE_READY: 'Dziękujemy! Skontaktujemy się z Państwem w ciągu 24 godzin z szczegółową wyceną PDF.',
    QUOTE_SAVED: 'Quote saved successfully'
  },

  // Error messages
  ERRORS: {
    DATABASE_UNAVAILABLE: 'Baza danych jest chwilowo niedostępna. Proszę poczekać chwilę i spróbować ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z nami bezpośrednio.',
    SAVE_ERROR: 'Wystąpił błąd podczas zapisywania danych:',
    CUSTOMER_ERROR: 'Błąd podczas zapisywania danych klienta',
    QUOTE_ERROR: 'Błąd podczas zapisywania wyceny'
  },

  // Calculation animation
  CALCULATION_ANIMATION: {
    TITLE: 'Obliczamy Twoją wycenę',
    DESCRIPTION: 'Zaawansowany system analizuje wszystkie parametry',
    STAGES: {
      ANALYZING: {
        ICON: '📊',
        TITLE: 'Analizujemy parametry',
        DESCRIPTION: 'Sprawdzamy wszystkie szczegóły Twojego projektu'
      },
      MATERIALS: {
        ICON: '🏗️',
        TITLE: 'Sprawdzamy materiały',
        DESCRIPTION: 'Dobiera optymalne rozwiązania dla Twojej posadzki'
      },
      PRICING: {
        ICON: '⚡',
        TITLE: 'Obliczamy koszty',
        DESCRIPTION: 'Uwzględniamy wszystkie czynniki wpływające na cenę'
      },
      FINALIZING: {
        ICON: '✨',
        TITLE: 'Finalizujemy wycenę',
        DESCRIPTION: 'Przygotowujemy dokładną ofertę cenową'
      }
    }
  },

  // Price modal
  PRICE_MODAL: {
    SUCCESS_MESSAGE: 'Twoja wycena jest gotowa!',
    PRICE_TITLE: 'Orientacyjna Wycena',
    TOTAL_COST: 'Całkowity koszt:',
    PRICE_DISCLAIMER: '* Cena orientacyjna, dokładna wycena po oględzinach obiektu',
    PDF_BUTTON: '📧 Otrzymaj Szczegółową Wycenę PDF',
    NEW_QUOTE_BUTTON: '🔄 Rozpocznij Nową Wycenę',
    TRUST_ELEMENTS: {
      FREE_QUOTE: 'Bezpłatna wycena',
      RATING: 'Średnia ocena klientów 4.9/5',
      RESPONSE_TIME: 'Odpowiedź w 24h'
    }
  },

  // Company information for PDF
  COMPANY: {
    NAME: 'Diablo Studio',
    TAGLINE: 'Profesjonalne posadzki żywiczne',
    ADDRESS: 'ul. Przykładowa 123, 00-000 Warszawa',
    PHONE: '+48 123 456 789',
    EMAIL: 'kontakt@diablostudio.pl',
    WEBSITE: 'www.diablostudio.pl',
    NIP: '123-456-78-90'
  },

  // Contact form
  CONTACT_FORM: {
    TITLE: 'Wyślij Wycenę do Eksperta',
    SUBTITLE: 'Nasz ekspert skontaktuje się z Tobą w ciągu 24 godzin',
    NAME_LABEL: 'Imię i nazwisko *',
    EMAIL_LABEL: 'Email *',
    PHONE_LABEL: 'Telefon *',
    PREFERRED_CONTACT: 'Preferowany sposób kontaktu:',
    CONTACT_OPTIONS: {
      PHONE: 'Telefon',
      EMAIL: 'Email',
      ANY: 'Obojętnie'
    },
    CONTACT_TIME: 'Preferowane godziny kontaktu:',
    TIME_OPTIONS: {
      MORNING: '8:00 - 12:00',
      AFTERNOON: '12:00 - 16:00',
      EVENING: '16:00 - 20:00'
    },
    CONTACT_DAYS: 'Preferowane dni kontaktu:',
    DAY_OPTIONS: {
      WEEKDAYS: 'Dni robocze (pon-pt)',
      WEEKEND: 'Weekend (sob-nd)',
      ANY: 'Obojętnie'
    },
    CONSENTS: {
      MARKETING: {
        LABEL: 'Zgadzam się na otrzymywanie informacji marketingowych i handlowych',
        DESCRIPTION: 'Będę otrzymywać informacje o nowych produktach i promocjach'
      },
      PHONE_CONTACT: {
        LABEL: 'Zgadzam się na kontakt telefoniczny',
        DESCRIPTION: 'Ekspert może skontaktować się ze mną telefonicznie'
      },
      EMAIL_CONTACT: {
        LABEL: 'Zgadzam się na kontakt e-mail',
        DESCRIPTION: 'Ekspert może skontaktować się ze mną e-mailem'
      },
      TERMS: {
        LABEL: 'Zapoznałem się i akceptuję regulamin *',
        DESCRIPTION: 'Regulamin świadczenia usług'
      },
      PRIVACY: {
        LABEL: 'Zapoznałem się i akceptuję politykę prywatności *',
        DESCRIPTION: 'Polityka przetwarzania danych osobowych'
      }
    },
    SUBMIT_BUTTON: 'Wyślij do Eksperta',
    SUCCESS_TITLE: 'Dziękujemy za zgłoszenie!',
    SUCCESS_MESSAGE: 'Nasz ekspert skontaktuje się z Tobą w ciągu 24 godzin z szczegółową wyceną PDF na podany adres email.',
    SUCCESS_BUTTON: 'Rozpocznij Nową Wycenę'
  }
} as const

// Helper function to get decorative option by ID
export const getDecorativeOption = (id: string) => {
  return CONTENT.DECORATIVE_OPTIONS[id as keyof typeof CONTENT.DECORATIVE_OPTIONS]
}

// Helper function to get floor system data
export const getFloorSystemData = (system: string) => {
  return CONTENT.FLOOR_SYSTEM_DATA[system as keyof typeof CONTENT.FLOOR_SYSTEM_DATA]
}
