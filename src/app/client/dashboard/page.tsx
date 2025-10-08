'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@/lib/supabase'

// Error Boundary Component
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} resetError={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}

// Default Error Fallback Component
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Wystąpił błąd</h2>
        <p className="text-gray-600 mb-6">
          Przepraszamy, wystąpił nieoczekiwany błąd podczas ładowania panelu klienta.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Spróbuj ponownie
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Wróć do logowania
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">Szczegóły błędu (tylko dla deweloperów)</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

interface ClientQuote {
  id: string
  area: number
  floor_system: string
  substrate_condition: string
  location: string
  decorative_system: string
  price_min: number
  price_max: number
  total_min: number
  total_max: number
  created_at: string
  status: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
  consultation_date?: string
  consultation_notes?: string
}

interface ConsultationRequest {
  id: string
  quote_id: string
  preferred_date: string
  preferred_time: string
  message: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

export default function ClientDashboard() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [quotes, setQuotes] = useState<ClientQuote[]>([])
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showValuationForm, setShowValuationForm] = useState(false)

  // Valuation form state
  const [valuationForm, setValuationForm] = useState({
    rooms: [{ id: 1, area: '', name: 'Pomieszczenie 1' }],
    floorSystem: '',
    substrateCondition: '',
    location: '',
    decorativeSystem: ''
  })
  const [showValuationModal, setShowValuationModal] = useState(false)
  const [valuationPriceRange, setValuationPriceRange] = useState<{min: number, max: number} | null>(null)
  const [isCalculatingValuation, setIsCalculatingValuation] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<ClientQuote | null>(null)
  const [consultationForm, setConsultationForm] = useState({
    preferredDate: '',
    preferredTime: '',
    message: '',
    serviceType: '',
    inquiryType: '',
    selectedQuoteId: ''
  })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)
  const [twoFactorForm, setTwoFactorForm] = useState({
    phone: '',
    verificationCode: '',
    step: 'phone' as 'phone' | 'verify'
  })
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [isLoadingTwoFactor, setIsLoadingTwoFactor] = useState(false)

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  })

  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false)

  // Newsletter and Marketing settings
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false)
  const [newsletterSettings, setNewsletterSettings] = useState({
    generalNewsletter: true,
    productUpdates: true,
    promotionalOffers: false,
    technicalNews: false
  })
  const [marketingSettings, setMarketingSettings] = useState({
    analyticsConsent: true,
    marketingEmails: false,
    personalizedAds: false,
    dataSharing: false
  })

  // Guides and Instructions system
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [guideProgress, setGuideProgress] = useState<{[key: string]: number}>({})
  const [completedGuides, setCompletedGuides] = useState<string[]>([])
  const [completedInstructions, setCompletedInstructions] = useState<string[]>([])

  // Quiz system state
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: {[questionIndex: number]: number}}>({})
  const [quizResults, setQuizResults] = useState<{[key: string]: {[questionIndex: number]: boolean}}>({})
  const [showQuizResults, setShowQuizResults] = useState<{[key: string]: boolean}>({})
  const [userGuideProgress, setUserGuideProgress] = useState<{[key: string]: {step: number, completed: boolean, quizResults: any}}>({})

  // Notification system - pozycjonowane przy przycisku quiz
  const [quizNotifications, setQuizNotifications] = useState<{[key: string]: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
  }>}>({})

  // Global notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
  }>>([])

  // Add notification function - global notifications
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now()
    }
    setNotifications(prev => [...prev, notification])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Add quiz notification function - pozycjonowane przy przycisku quiz
  const addQuizNotification = (stepId: string, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now()
    }

    setQuizNotifications(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), notification]
    }))

    // Auto remove after 5 seconds
    setTimeout(() => {
      setQuizNotifications(prev => ({
        ...prev,
        [stepId]: (prev[stepId] || []).filter(n => n.id !== notification.id)
      }))
    }, 5000)
  }

  // Load user progress from database
  const loadUserProgress = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_guide_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading user progress:', error)
        return
      }

      if (data && data.length > 0) {
        const progressMap: {[key: string]: {step: number, completed: boolean, quizResults: any}} = {}
        data.forEach((progress: any) => {
          progressMap[progress.guide_id] = {
            step: progress.current_step,
            completed: progress.completed,
            quizResults: progress.quiz_results || {}
          }
        })
        setUserGuideProgress(progressMap)

        // Update local state based on loaded progress
        const newGuideProgress: {[key: string]: number} = {}
        const newCompletedGuides: string[] = []
        const newCompletedInstructions: string[] = []

        Object.entries(progressMap).forEach(([guideId, progress]) => {
          newGuideProgress[guideId] = progress.step

          const guide = [...guides, ...instructions].find(g => g.id === guideId)
          if (guide) {
            if (progress.completed) {
              if (guide.category === 'safety' || guide.category === 'tools') {
                newCompletedInstructions.push(guideId)
              } else {
                newCompletedGuides.push(guideId)
              }
            }
          }
        })

        setGuideProgress(newGuideProgress)
        setCompletedGuides(newCompletedGuides)
        setCompletedInstructions(newCompletedInstructions)
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  // Save user progress to database
  const saveUserProgress = async (guideId: string, step: number, completed: boolean = false, quizResults: any = {}) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_guide_progress')
        .upsert({
          user_id: user.id,
          guide_id: guideId,
          current_step: step,
          completed: completed,
          quiz_results: quizResults,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving user progress:', error)
        return
      }
    } catch (error) {
      console.error('Error saving user progress:', error)
    }
  }

  // Available guides and instructions
  const guides = [
    {
      id: 'floor-preparation',
      title: 'Przygotowanie podłoża pod posadzkę',
      description: 'Kompletny przewodnik po przygotowaniu powierzchni',
      steps: [
        {
          id: 'surface-assessment',
          title: 'Ocena powierzchni',
          content: 'Dowiedz się jak prawidłowo ocenić stan podłoża przed aplikacją żywicy.',
          additionalInfo: 'Przed przystąpieniem do oceny powierzchni, upewnij się że masz odpowiednie oświetlenie. Najlepiej pracować w jasnym świetle dziennym lub pod lampami LED o barwie zbliżonej do dziennej.',
          videoUrl: 'https://example.com/video/surface-assessment',
          literature: [
            'Podręcznik "Przygotowanie powierzchni betonowych" - rozdział 3',
            'Norma PN-EN 13813 "Wymagania dla podkładów podłogowych"'
          ],
          quiz: [
            { question: 'Jaka wilgotność maksymalna jest dopuszczalna dla betonu przed aplikacją żywicy?', options: ['2%', '4%', '6%', '8%'], correct: 1 },
            { question: 'Jakie narzędzie jest najlepsze do pomiaru wilgotności podłoża?', options: ['Wilgotnościomierz elektroniczny', 'Młotek', 'Miarka', 'Poziomica'], correct: 0 }
          ]
        },
        {
          id: 'cleaning-methods',
          title: 'Metody czyszczenia',
          content: 'Poznaj skuteczne metody czyszczenia różnych typów powierzchni.',
          additionalInfo: 'Do czyszczenia powierzchni betonowych nigdy nie używaj kwasów solnych. Mogą one reagować z betonem i osłabiać jego strukturę.',
          videoUrl: 'https://example.com/video/cleaning-methods',
          literature: [
            'Instrukcja czyszczenia powierzchni mineralnych - wydanie 2023',
            'Katalog środków czyszczących dla branży budowlanej'
          ],
          quiz: [
            { question: 'Który środek jest zabroniony przy czyszczeniu betonu?', options: ['Kwas solny', 'Środek alkaliczny', 'Woda pod ciśnieniem', 'Odkurzacz'], correct: 0 },
            { question: 'Jaka temperatura minimalna powinna być zachowana podczas czyszczenia?', options: ['5°C', '10°C', '15°C', '20°C'], correct: 1 }
          ]
        },
        {
          id: 'repair-techniques',
          title: 'Techniki naprawcze',
          content: 'Naucz się naprawiać ubytki i nierówności w podłożu.',
          additionalInfo: 'Naprawy należy wykonywać minimum 24 godziny przed aplikacją żywicy. W przypadku głębokich ubytków czas schnięcia może się wydłużyć do 48 godzin.',
          videoUrl: 'https://example.com/video/repair-techniques',
          literature: [
            'Techniki naprawcze w budownictwie - tom II',
            'Materiały naprawcze dla posadzek przemysłowych'
          ],
          quiz: [
            { question: 'Ile czasu minimum należy odczekać po naprawie przed aplikacją żywicy?', options: ['12h', '24h', '36h', '48h'], correct: 1 },
            { question: 'Jaka powinna być minimalna temperatura podłoża podczas naprawy?', options: ['5°C', '8°C', '12°C', '15°C'], correct: 2 }
          ]
        },
        {
          id: 'primer-application',
          title: 'Aplikacja primera',
          content: 'Krok po kroku aplikacja warstwy gruntującej.',
          additionalInfo: 'Primer należy aplikować w temperaturze 15-25°C i wilgotności powietrza poniżej 75%. Warunki te są kluczowe dla prawidłowego wiązania.',
          videoUrl: 'https://example.com/video/primer-application',
          literature: [
            'Karty techniczne primerów epoksydowych',
            'Warunki aplikacji gruntów - wytyczne producenta'
          ],
          quiz: [
            { question: 'Jaka temperatura jest optymalna dla aplikacji primera?', options: ['10-20°C', '15-25°C', '20-30°C', '25-35°C'], correct: 1 },
            { question: 'Jaka wilgotność maksymalna powietrza jest dopuszczalna?', options: ['60%', '70%', '75%', '80%'], correct: 2 }
          ]
        },
        {
          id: 'final-inspection',
          title: 'Kontrola końcowa',
          content: 'Sprawdzenie gotowości powierzchni do aplikacji żywicy.',
          additionalInfo: 'Kontrola powinna być wykonana minimum 2 godziny przed aplikacją żywicy. W tym czasie można jeszcze dokonać korekt jeśli zajdzie taka potrzeba.',
          videoUrl: 'https://example.com/video/final-inspection',
          literature: [
            'Procedury kontroli jakości w wykonawstwie posadzek',
            'Lista kontrolna przygotowania podłoża - wersja 2024'
          ],
          quiz: [
            { question: 'Ile czasu przed aplikacją żywicy należy wykonać kontrolę końcową?', options: ['30 min', '1h', '2h', '4h'], correct: 2 },
            { question: 'Jakie narzędzie jest niezbędne do sprawdzenia przyczepności?', options: ['Młotek', 'Test siatki nacięć', 'Miarka', 'Poziomica'], correct: 1 }
          ]
        }
      ],
      category: 'preparation',
      estimatedTime: '45 min'
    },
    {
      id: 'epoxy-application',
      title: 'Aplikacja żywicy epoksydowej',
      description: 'Profesjonalny kurs aplikacji posadzek epoksydowych',
      steps: [
        {
          id: 'material-preparation',
          title: 'Przygotowanie materiałów',
          content: 'Jak prawidłowo przygotować żywicę i utwardzacz.',
          additionalInfo: 'Materiały należy wyjąć z magazynu minimum 24 godziny przed użyciem, aby osiągnęły temperaturę otoczenia. Pozwala to na prawidłowe wymieszanie komponentów.',
          videoUrl: 'https://example.com/video/material-preparation',
          literature: [
            'Karty charakterystyki żywicy epoksydowej',
            'Procedura przygotowania materiałów - instrukcja producenta'
          ],
          quiz: [
            { question: 'Ile godzin przed użyciem należy wyjąć materiały z magazynu?', options: ['12h', '24h', '36h', '48h'], correct: 1 },
            { question: 'Jaka temperatura jest optymalna dla przechowywania żywicy?', options: ['5-10°C', '10-15°C', '15-20°C', '20-25°C'], correct: 3 }
          ]
        },
        {
          id: 'mixing-process',
          title: 'Proces mieszania',
          content: 'Techniki prawidłowego mieszania komponentów.',
          additionalInfo: 'Mieszanie należy wykonywać przez minimum 3 minuty przy użyciu mieszadła mechanicznego. Ręczne mieszanie nie zapewnia odpowiedniej homogeniczności.',
          videoUrl: 'https://example.com/video/mixing-process',
          literature: [
            'Techniki mieszania żywic dwuskładnikowych',
            'Wpływ mieszania na właściwości mechaniczne posadzek'
          ],
          quiz: [
            { question: 'Jak długo minimum należy mieszać komponenty?', options: ['1 min', '2 min', '3 min', '5 min'], correct: 2 },
            { question: 'Jakie mieszadło jest zalecane?', options: ['Ręczne', 'Mechaniczne', 'Magnetyczne', 'Pneumatyczne'], correct: 1 }
          ]
        },
        {
          id: 'application-tools',
          title: 'Narzędzia do aplikacji',
          content: 'Wybór i przygotowanie narzędzi do pracy.',
          additionalInfo: 'Narzędzia powinny być czyste i suche. Obecność wilgoci może negatywnie wpłynąć na proces wiązania żywicy.',
          videoUrl: 'https://example.com/video/application-tools',
          literature: [
            'Dobór narzędzi do aplikacji posadzek żywicznych',
            'Konserwacja narzędzi malarskich i posadzkarskich'
          ],
          quiz: [
            { question: 'W jakim stanie powinny być narzędzia przed użyciem?', options: ['Czyste i suche', 'Czyste i wilgotne', 'Brudne i suche', 'Brudne i wilgotne'], correct: 0 },
            { question: 'Które narzędzie jest podstawowe do aplikacji żywicy?', options: ['Pędzel', 'Wałek', 'Rakla', 'Pistolet natryskowy'], correct: 2 }
          ]
        },
        {
          id: 'layering-technique',
          title: 'Technika warstwowa',
          content: 'Aplikacja żywicy w warstwach - krok po kroku.',
          additionalInfo: 'Między warstwami należy zachować odstęp czasowy 16-24 godzin w zależności od temperatury otoczenia i wilgotności powietrza.',
          videoUrl: 'https://example.com/video/layering-technique',
          literature: [
            'Technologia warstwowa w posadzkach żywicznych',
            'Wpływ warunków atmosferycznych na czas między warstwami'
          ],
          quiz: [
            { question: 'Jaki odstęp czasowy należy zachować między warstwami?', options: ['8-12h', '12-16h', '16-24h', '24-48h'], correct: 2 },
            { question: 'Co wpływa na czas schnięcia między warstwami?', options: ['Tylko temperatura', 'Tylko wilgotność', 'Temperatura i wilgotność', 'Tylko grubość warstwy'], correct: 2 }
          ]
        },
        {
          id: 'finishing-touches',
          title: 'Wykończenie',
          content: 'Ostatnie szlify i kontrola jakości.',
          additionalInfo: 'Kontrola jakości powinna być wykonana po 7 dniach od aplikacji ostatniej warstwy, gdy posadzka osiągnie pełne właściwości mechaniczne.',
          videoUrl: 'https://example.com/video/finishing-touches',
          literature: [
            'Kontrola jakości posadzek żywicznych - procedury odbiorowe',
            'Badania właściwości mechanicznych posadzek'
          ],
          quiz: [
            { question: 'Po ilu dniach od aplikacji można wykonać kontrolę jakości?', options: ['1 dzień', '3 dni', '7 dni', '14 dni'], correct: 2 },
            { question: 'Jakie właściwości osiąga posadzka po 7 dniach?', options: ['Tylko chemiczne', 'Tylko mechaniczne', 'Pełne właściwości mechaniczne', 'Tylko estetyczne'], correct: 2 }
          ]
        }
      ],
      category: 'application',
      estimatedTime: '60 min'
    },
    {
      id: 'maintenance-guide',
      title: 'Konserwacja i pielęgnacja',
      description: 'Jak dbać o posadzki żywiczne',
      steps: [
        {
          id: 'daily-cleaning',
          title: 'Czyszczenie codzienne',
          content: 'Rutynowe czyszczenie posadzek żywicznych.',
          additionalInfo: 'Do czyszczenia codziennego używaj tylko neutralnych środków o pH 7. Środki kwaśne lub alkaliczne mogą uszkodzić powierzchnię posadzki.',
          videoUrl: 'https://example.com/video/daily-cleaning',
          literature: [
            'Środki czyszczące dla posadzek żywicznych',
            'Procedury utrzymania czystości w obiektach przemysłowych'
          ],
          quiz: [
            { question: 'Jakie pH powinny mieć środki do czyszczenia codziennego?', options: ['pH 3-5', 'pH 5-7', 'pH 7', 'pH 8-10'], correct: 2 },
            { question: 'Jak często należy wykonywać czyszczenie codzienne?', options: ['Raz dziennie', 'Dwa razy dziennie', 'Raz w tygodniu', 'Raz w miesiącu'], correct: 0 }
          ]
        },
        {
          id: 'stain-removal',
          title: 'Usuwanie plam',
          content: 'Skuteczne metody usuwania różnych typów zabrudzeń.',
          additionalInfo: 'Plamy należy usuwać natychmiast po ich powstaniu. Starsze plamy mogą wymagać specjalistycznych środków i dłuższego czasu działania.',
          videoUrl: 'https://example.com/video/stain-removal',
          literature: [
            'Usuwanie plam z posadzek żywicznych - poradnik',
            'Katalog środków do usuwania specjalistycznych zabrudzeń'
          ],
          quiz: [
            { question: 'Kiedy należy usuwać plamy z posadzki?', options: ['Po 24h', 'Natychmiast', 'Po tygodniu', 'Po miesiącu'], correct: 1 },
            { question: 'Które plamy są najtrudniejsze do usunięcia?', options: ['Świeże', '24-godzinne', 'Tygodniowe', 'Miesięczne'], correct: 3 }
          ]
        },
        {
          id: 'protective-measures',
          title: 'Środki ochronne',
          content: 'Jak chronić posadzkę przed uszkodzeniami.',
          additionalInfo: 'W miejscach intensywnego ruchu należy stosować maty ochronne lub wykładziny. Zmniejszają one zużycie mechaniczne posadzki o 60-80%.',
          videoUrl: 'https://example.com/video/protective-measures',
          literature: [
            'Ochrona mechaniczna posadzek żywicznych',
            'Materiały ochronne dla posadzek przemysłowych'
          ],
          quiz: [
            { question: 'O ile procent maty ochronne zmniejszają zużycie posadzki?', options: ['20-40%', '40-60%', '60-80%', '80-100%'], correct: 2 },
            { question: 'Gdzie należy stosować maty ochronne?', options: ['Tylko w biurach', 'Tylko w halach', 'W miejscach intensywnego ruchu', 'Tylko przy wejściach'], correct: 2 }
          ]
        },
        {
          id: 'maintenance-schedule',
          title: 'Harmonogram konserwacji',
          content: 'Plan regularnej konserwacji posadzek.',
          additionalInfo: 'Konserwację należy wykonywać zgodnie z harmonogramem dostosowanym do intensywności użytkowania obiektu. W obiektach przemysłowych konserwacja powinna być częstsza.',
          videoUrl: 'https://example.com/video/maintenance-schedule',
          literature: [
            'Harmonogramy konserwacji posadzek żywicznych',
            'Dostosowanie konserwacji do warunków эксплуатации'
          ],
          quiz: [
            { question: 'Jak często należy wykonywać konserwację w obiektach przemysłowych?', options: ['Raz w miesiącu', 'Raz na kwartał', 'Raz na pół roku', 'Raz w roku'], correct: 1 },
            { question: 'Co należy uwzględnić przy tworzeniu harmonogramu?', options: ['Tylko powierzchnię', 'Tylko wiek posadzki', 'Intensywność użytkowania', 'Tylko budżet'], correct: 2 }
          ]
        },
        {
          id: 'problem-solving',
          title: 'Rozwiązywanie problemów',
          content: 'Jak radzić sobie z常见问题.',
          additionalInfo: 'Większość problemów z posadzkami żywicznych wynika z błędów popełnionych na etapie przygotowania podłoża lub aplikacji. Profilaktyka jest kluczowa.',
          videoUrl: 'https://example.com/video/problem-solving',
          literature: [
            'Rozwiązywanie problemów z posadzkami żywicznych',
            'Najczęstsze błędy wykonawcze i metody ich naprawy'
          ],
          quiz: [
            { question: 'Z czego wynika większość problemów z posadzkami żywicznych?', options: ['Z błędów aplikacji', 'Z błędów przygotowania podłoża', 'Z obu powyższych', 'Z wad materiału'], correct: 2 },
            { question: 'Co jest kluczowe w zapobieganiu problemom?', options: ['Naprawa', 'Profilaktyka', 'Ubezpieczenie', 'Dokumentacja'], correct: 1 }
          ]
        }
      ],
      category: 'maintenance',
      estimatedTime: '30 min'
    }
  ]

  const instructions = [
    {
      id: 'safety-instructions',
      title: 'Instrukcje bezpieczeństwa BHP',
      description: 'Bezpieczeństwo pracy z żywicami epoksydowymi',
      steps: [
        {
          id: 'protective-equipment',
          title: 'Środki ochrony osobistej',
          content: 'Jak prawidłowo używać środków ochrony indywidualnej.',
          additionalInfo: 'Środki ochrony indywidualnej należy sprawdzać przed każdym użyciem. Uszkodzone rękawice lub okulary należy natychmiast wymienić.',
          videoUrl: 'https://example.com/video/protective-equipment',
          literature: [
            'Norma BHP przy pracy z żywicami epoksydowymi',
            'Dobór środków ochrony indywidualnej - wytyczne'
          ],
          quiz: [
            { question: 'Jak często należy sprawdzać środki ochrony indywidualnej?', options: ['Raz w tygodniu', 'Przed każdym użyciem', 'Raz w miesiącu', 'Raz na kwartał'], correct: 1 },
            { question: 'Które ŚOI są obowiązkowe przy pracy z żywicami?', options: ['Tylko rękawice', 'Tylko okulary', 'Rękawice i okulary', 'Tylko maska'], correct: 2 }
          ]
        },
        {
          id: 'ventilation-requirements',
          title: 'Wymagania wentylacyjne',
          content: 'Zapewnienie odpowiedniej wentylacji w miejscu pracy.',
          additionalInfo: 'Wentylacja powinna zapewnić minimum 10 wymian powietrza na godzinę w strefie pracy. W przypadku pracy z dużymi powierzchniami wymagana jest wentylacja mechaniczna.',
          videoUrl: 'https://example.com/video/ventilation-requirements',
          literature: [
            'Wymagania wentylacyjne dla stanowisk pracy',
            'Normy BHP przy pracy z substancjami chemicznymi'
          ],
          quiz: [
            { question: 'Ile wymian powietrza na godzinę powinna zapewnić wentylacja?', options: ['5', '10', '15', '20'], correct: 1 },
            { question: 'Kiedy wymagana jest wentylacja mechaniczna?', options: ['Przy małych powierzchniach', 'Przy dużych powierzchniach', 'Tylko w biurach', 'Tylko na zewnątrz'], correct: 1 }
          ]
        },
        {
          id: 'emergency-procedures',
          title: 'Procedury awaryjne',
          content: 'Jak postępować w przypadku wypadku lub rozlania.',
          additionalInfo: 'W przypadku rozlania żywicy należy natychmiast zatrzymać pracę i przystąpić do neutralizacji. Nigdy nie próbować zbierać rozlanej żywicy gołymi rękami.',
          videoUrl: 'https://example.com/video/emergency-procedures',
          literature: [
            'Procedury postępowania w sytuacjach awaryjnych',
            'Karty charakterystyki substancji niebezpiecznych'
          ],
          quiz: [
            { question: 'Co należy zrobić w przypadku rozlania żywicy?', options: ['Kontynuować pracę', 'Zatrzymać pracę i neutralizować', 'Wezwać straż pożarną', 'Opuścić pomieszczenie'], correct: 1 },
            { question: 'Czy można zbierać rozlaną żywicę gołymi rękami?', options: ['Tak', 'Nie', 'Tylko w rękawiczkach', 'Tylko w wyjątkowych przypadkach'], correct: 1 }
          ]
        },
        {
          id: 'storage-guidelines',
          title: 'Przechowywanie materiałów',
          content: 'Bezpieczne przechowywanie żywic i utwardzaczy.',
          additionalInfo: 'Materiały należy przechowywać w oryginalnych opakowaniach, w suchym i chłodnym miejscu. Temperatura przechowywania nie powinna przekraczać 25°C.',
          videoUrl: 'https://example.com/video/storage-guidelines',
          literature: [
            'Wytyczne przechowywania substancji chemicznych',
            'Karty charakterystyki materiałów - rozdział przechowywanie'
          ],
          quiz: [
            { question: 'Jaka temperatura maksymalna jest dopuszczalna przy przechowywaniu?', options: ['20°C', '25°C', '30°C', '35°C'], correct: 1 },
            { question: 'W jakich opakowaniach należy przechowywać materiały?', options: ['Dowolnych', 'Oryginalnych', 'Metalowych', 'Plastikowych'], correct: 1 }
          ]
        },
        {
          id: 'waste-disposal',
          title: 'Utylizacja odpadów',
          content: 'Ekologiczne i bezpieczne pozbywanie się odpadów.',
          additionalInfo: 'Odpady zawierające żywice epoksydowe są klasyfikowane jako odpady niebezpieczne i wymagają specjalistycznej utylizacji zgodnie z lokalnymi przepisami.',
          videoUrl: 'https://example.com/video/waste-disposal',
          literature: [
            'Utylizacja odpadów niebezpiecznych - przepisy',
            'Katalog odpadów w branży budowlanej'
          ],
          quiz: [
            { question: 'Jak klasyfikowane są odpady z żywic epoksydowych?', options: ['Odpady komunalne', 'Odpady niebezpieczne', 'Odpady obojętne', 'Odpady zielone'], correct: 1 },
            { question: 'Czy można wyrzucać odpady żywiczne do zwykłego śmietnika?', options: ['Tak', 'Nie', 'Tylko w małych ilościach', 'Tylko po wyschnięciu'], correct: 1 }
          ]
        }
      ],
      category: 'safety',
      estimatedTime: '25 min'
    },
    {
      id: 'tool-maintenance',
      title: 'Konserwacja narzędzi',
      description: 'Jak dbać o narzędzia do aplikacji żywicy',
      steps: [
        {
          id: 'cleaning-tools',
          title: 'Czyszczenie narzędzi',
          content: 'Skuteczne metody czyszczenia narzędzi po pracy.',
          additionalInfo: 'Narzędzia należy czyścić natychmiast po zakończeniu pracy. Zaschnięta żywica jest bardzo trudna do usunięcia i może uszkodzić narzędzia.',
          videoUrl: 'https://example.com/video/cleaning-tools',
          literature: [
            'Czyszczenie narzędzi malarskich i posadzkarskich',
            'Środki do usuwania żywicy z narzędzi'
          ],
          quiz: [
            { question: 'Kiedy należy czyścić narzędzia po pracy?', options: ['Następnego dnia', 'Po tygodniu', 'Natychmiast', 'Po miesiącu'], correct: 2 },
            { question: 'Czy zaschnięta żywica jest łatwa do usunięcia?', options: ['Tak', 'Nie', 'Tylko z niektórych narzędzi', 'Tylko specjalnymi środkami'], correct: 1 }
          ]
        },
        {
          id: 'storage-organization',
          title: 'Organizacja przechowywania',
          content: 'Jak prawidłowo przechowywać narzędzia.',
          additionalInfo: 'Narzędzia należy przechowywać w suchym miejscu, posegregowane według rodzaju i rozmiaru. Ułatwia to szybkie znalezienie potrzebnego narzędzia.',
          videoUrl: 'https://example.com/video/storage-organization',
          literature: [
            'Organizacja warsztatu posadzkarskiego',
            'Systemy przechowywania narzędzi specjalistycznych'
          ],
          quiz: [
            { question: 'W jakim miejscu należy przechowywać narzędzia?', options: ['Wilgotnym', 'Suchym', 'Zimnym', 'Ciepłym'], correct: 1 },
            { question: 'Jak należy segregować narzędzia?', options: ['Dowolnie', 'Według koloru', 'Według rodzaju i rozmiaru', 'Według ceny'], correct: 2 }
          ]
        },
        {
          id: 'maintenance-checklist',
          title: 'Lista kontrolna konserwacji',
          content: 'Regularne kontrole stanu narzędzi.',
          additionalInfo: 'Kontrole należy wykonywać przed i po każdej pracy. Pozwala to wykryć uszkodzenia na wczesnym etapie i zapobiec awariom podczas pracy.',
          videoUrl: 'https://example.com/video/maintenance-checklist',
          literature: [
            'Lista kontrolna narzędzi posadzkarskich',
            'Procedury przeglądów okresowych narzędzi'
          ],
          quiz: [
            { question: 'Jak często należy wykonywać kontrole narzędzi?', options: ['Raz w miesiącu', 'Przed i po każdej pracy', 'Raz na kwartał', 'Raz w roku'], correct: 1 },
            { question: 'Co pozwala wykryć regularne kontrole?', options: ['Tylko brud', 'Uszkodzenia na wczesnym etapie', 'Tylko zużycie', 'Tylko wady fabryczne'], correct: 1 }
          ]
        },
        {
          id: 'repair-methods',
          title: 'Metody napraw',
          content: 'Jak naprawić uszkodzone narzędzia.',
          additionalInfo: 'Drobne naprawy można wykonać samodzielnie, jednak poważne uszkodzenia wymagają interwencji specjalisty lub wymiany narzędzia.',
          videoUrl: 'https://example.com/video/repair-methods',
          literature: [
            'Naprawa narzędzi budowlanych - poradnik',
            'Kiedy naprawiać, a kiedy wymieniać narzędzia'
          ],
          quiz: [
            { question: 'Które naprawy można wykonać samodzielnie?', options: ['Wszystkie', 'Żadne', 'Tylko drobne', 'Tylko poważne'], correct: 2 },
            { question: 'Co należy zrobić z poważnie uszkodzonymi narzędziami?', options: ['Naprawić samodzielnie', 'Oddać do specjalisty', 'Wymienić', 'Obie odpowiedzi B i C'], correct: 3 }
          ]
        },
        {
          id: 'replacement-schedule',
          title: 'Harmonogram wymiany',
          content: 'Kiedy wymieniać zużyte narzędzia.',
          additionalInfo: 'Narzędzia należy wymieniać gdy ich zużycie przekracza 70%. Dalsze używanie może negatywnie wpływać na jakość wykonywanej pracy.',
          videoUrl: 'https://example.com/video/replacement-schedule',
          literature: [
            'Kryteria zużycia narzędzi - normy branżowe',
            'Wpływ zużytych narzędzi na jakość posadzek'
          ],
          quiz: [
            { question: 'Przy jakim zużyciu należy wymienić narzędzia?', options: ['50%', '60%', '70%', '80%'], correct: 2 },
            { question: 'Co może negatywnie wpływać na jakość pracy?', options: ['Nowe narzędzia', 'Zużyte narzędzia', 'Czyste narzędzia', 'Suche narzędzia'], correct: 1 }
          ]
        }
      ],
      category: 'tools',
      estimatedTime: '20 min'
    }
  ]

  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && profile) {
      loadQuotes()
      loadConsultationsFromAPI()
      loadUserProgress() // Load user progress from database
      // Check if 2FA is enabled for this user
      if (profile.two_factor_enabled) {
        setIsTwoFactorEnabled(true)
      }
    }
  }, [user, profile])

  // Load consultations using API endpoint with fallback
  const loadConsultationsFromAPI = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No session found')
        return
      }

      const response = await fetch('/api/client/consultations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform API data to match component expectations
          const consultations = data.consultations.map((c: any) => ({
            id: c.id,
            quote_id: c.quote_id,
            preferred_date: c.preferred_date,
            preferred_time: c.preferred_time,
            message: c.message,
            status: c.status,
            created_at: c.created_at
          }))
          setConsultations(consultations)
        }
      } else {
        console.error('Failed to fetch consultations from API:', response.status)
        // Fallback to direct database access if API fails
        loadConsultations()
      }
    } catch (error) {
      console.error('Error loading consultations from API:', error)
      // Fallback to direct database access if API fails
      loadConsultations()
    }
  }

  // Sprawdź dostępne terminy gdy data się zmieni
  useEffect(() => {
    if (consultationForm.preferredDate) {
      checkAvailableSlots(consultationForm.preferredDate)
    }
  }, [consultationForm.preferredDate])

  const checkAvailableSlots = async (date: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No session found')
        return
      }

      const response = await fetch(`/api/client/consultations?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBookedSlots(data.booked_slots || [])
        }
      } else {
        console.error('Failed to fetch available slots:', response.status)
        // Fallback to default slots if API fails
        setBookedSlots([])
      }
    } catch (error) {
      console.error('Error checking available slots:', error)
      // Fallback to default slots if API fails
      setBookedSlots([])
    }
  }

  const checkUser = async () => {
    // Use Clerk's useUser hook instead of direct Supabase auth
    if (!user?.id) {
      router.push('/login')
      return
    }

    // Check if user has a client profile
    const { data: profile } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      router.push('/login')
      return
    }

    setProfile(profile)
    setLoading(false)
  }

  // Auto-logout when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      supabase.auth.signOut()
    }

    const handleUnload = () => {
      // Additional cleanup if needed
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
    }
  }, [])

  const loadQuotes = async () => {
    if (!user || !user.id) return

    try {
      const { data, error } = await supabase
        .from('client_quotes')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading quotes:', error)
        return
      }

      setQuotes(data || [])
    } catch (error) {
      console.error('Error loading quotes:', error)
    }
  }

  const loadConsultations = async () => {
    if (!user?.id) {
      console.error('User not authenticated')
      return
    }

    try {
      // Load client consultations
      const { data: clientConsultations, error: clientError } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (clientError) {
        console.error('Error loading client consultations:', clientError)
      }

      // Load stationary quotes from admin panel (customer_quotes table)
      const { data: stationaryQuotes, error: stationaryError } = await supabase
        .from('customer_quotes')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (stationaryError) {
        console.error('Error loading stationary quotes:', stationaryError)
      }

      // Combine consultations with stationary quotes
      const allConsultations = [
        ...(clientConsultations || []).map(c => ({ ...c, type: 'client' })),
        ...(stationaryQuotes || []).map(q => ({
          id: `stationary-${q.id}`,
          quote_id: q.id,
          preferred_date: q.created_at,
          preferred_time: 'Brak danych',
          message: `Wycena stacjonarna dla ${q.customers?.name || 'Klienta'}`,
          status: 'stationary' as const,
          admin_notes: null,
          created_at: q.created_at,
          type: 'stationary',
          quote_data: q
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setConsultations(allConsultations)
    } catch (error) {
      console.error('Error loading consultations:', error)
    }
  }

  // Logout function
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // Request consultation for a quote
  const requestConsultation = (quote: ClientQuote) => {
    setSelectedQuote(quote)
    setConsultationForm({
      preferredDate: '',
      preferredTime: '',
      message: '',
      serviceType: '',
      inquiryType: '',
      selectedQuoteId: quote.id
    })
    setShowConsultationModal(true)
  }

  const submitConsultationRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consultationForm.preferredDate || !consultationForm.preferredTime || !consultationForm.inquiryType || !consultationForm.serviceType) {
      alert('Wypełnij wszystkie wymagane pola')
      return
    }

    setIsSubmittingConsultation(true)

    try {
      // Show loading animation
      const submitButton = e.target as HTMLFormElement
      const button = submitButton.querySelector('button[type="submit"]') as HTMLButtonElement
      const originalText = button.textContent
      button.textContent = '⏳ Wysyłanie...'
      button.disabled = true

      // Get session token for API call
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert('Sesja wygasła. Zaloguj się ponownie.')
        return
      }

      // Prepare request data
      const requestData = {
        quote_id: consultationForm.selectedQuoteId || '',
        preferred_date: consultationForm.preferredDate,
        preferred_time: consultationForm.preferredTime,
        message: consultationForm.message,
        service_type: consultationForm.serviceType,
        inquiry_type: consultationForm.inquiryType
      }

      // Use API endpoint instead of direct database access
      const response = await fetch('/api/client/consultations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        alert(result.error || 'Wystąpił błąd podczas tworzenia prośby o konsultację')
        return
      }

      // Show success animation
      button.textContent = '✅ Wysłano!'
      button.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-bold transition-all duration-200 shadow-lg border-2 border-green-600 hover:border-green-700'

      // Wait a moment to show success state
      setTimeout(() => {
        alert(result.message || 'Prośba o konsultację została wysłana! Skontaktujemy się z Tobą wkrótce.')
        setShowConsultationModal(false)
        setConsultationForm({
          preferredDate: '',
          preferredTime: '',
          message: '',
          serviceType: '',
          inquiryType: '',
          selectedQuoteId: ''
        })
        loadQuotes()
        loadConsultations()
      }, 1000)

    } catch (error) {
      console.error('Error submitting consultation request:', error)
      alert('Wystąpił błąd podczas wysyłania prośby o konsultację')
    } finally {
      setIsSubmittingConsultation(false)
    }
  }

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę wycenę?')) return

    try {
      const { error } = await supabase
        .from('client_quotes')
        .delete()
        .eq('id', quoteId)

      if (error) {
        console.error('Error deleting quote:', error)
        alert('Wystąpił błąd podczas usuwania wyceny')
        return
      }

      alert('Wycena została usunięta')
      loadQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('Wystąpił błąd podczas usuwania wyceny')
    }
  }

  // 2FA Functions
  const handleTwoFactorSetup = async () => {
    if (!twoFactorForm.phone) {
      alert('Wprowadź numer telefonu')
      return
    }

    setIsLoadingTwoFactor(true)
    try {
      // Send verification code to phone number
      const { error } = await supabase.auth.updateUser({
        phone: twoFactorForm.phone
      })

      if (error) {
        console.error('Error setting up 2FA:', error)
        alert('Wystąpił błąd podczas konfiguracji 2FA')
        return
      }

      setTwoFactorForm({ ...twoFactorForm, step: 'verify' })
      alert('Kod weryfikacyjny został wysłany na podany numer telefonu')
    } catch (error) {
      console.error('Error in 2FA setup:', error)
      alert('Wystąpił błąd podczas konfiguracji 2FA')
    } finally {
      setIsLoadingTwoFactor(false)
    }
  }

  const handleTwoFactorVerify = async () => {
    if (!twoFactorForm.verificationCode) {
      alert('Wprowadź kod weryfikacyjny')
      return
    }

    setIsLoadingTwoFactor(true)
    try {
      // Verify the code and enable 2FA
      const { data, error } = await supabase.auth.verifyOtp({
        phone: twoFactorForm.phone,
        token: twoFactorForm.verificationCode,
        type: 'sms'
      })

      if (error) {
        console.error('Error verifying 2FA code:', error)
        alert('Nieprawidłowy kod weryfikacyjny')
        return
      }

      // Save 2FA status in client profile
      if (!user?.id) {
        alert('Błąd użytkownika')
        return
      }

      const { error: updateError } = await supabase
        .from('client_profiles')
        .update({
          two_factor_enabled: true,
          phone_verified: twoFactorForm.phone
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating 2FA status:', updateError)
        alert('Wystąpił błąd podczas zapisywania ustawień 2FA')
        return
      }

      if (updateError) {
        console.error('Error updating 2FA status:', updateError)
        alert('Wystąpił błąd podczas zapisywania ustawień 2FA')
        return
      }

      setIsTwoFactorEnabled(true)
      setShowTwoFactorModal(false)
      setTwoFactorForm({ phone: '', verificationCode: '', step: 'phone' })
      alert('Uwierzytelnianie dwuskładnikowe zostało włączone!')
    } catch (error) {
      console.error('Error in 2FA verification:', error)
      alert('Wystąpił błąd podczas weryfikacji kodu')
    } finally {
      setIsLoadingTwoFactor(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    if (!confirm('Czy na pewno chcesz wyłączyć uwierzytelnianie dwuskładnikowe?')) return

    try {
      // Update client profile to disable 2FA
      if (!user?.id) {
        alert('Błąd użytkownika')
        return
      }

      const { error } = await supabase
        .from('client_profiles')
        .update({
          two_factor_enabled: false,
          phone_verified: null
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error disabling 2FA:', error)
        alert('Wystąpił błąd podczas wyłączania 2FA')
        return
      }

      setIsTwoFactorEnabled(false)
      alert('Uwierzytelnianie dwuskładnikowe zostało wyłączone')
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      alert('Wystąpił błąd podczas wyłączania 2FA')
    }
  }

  // Password change function
  const handlePasswordChange = () => {
    setShowPasswordModal(true)
  }

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordForm.currentPassword) {
      alert('Wprowadź obecne hasło')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Nowe hasła nie są identyczne')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Nowe hasło musi mieć co najmniej 8 znaków')
      return
    }

    setIsLoadingPassword(true)

    try {
      // First verify the current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        alert('Nie można zweryfikować użytkownika')
        return
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.primaryEmailAddress?.emailAddress || user.email,
        password: passwordForm.currentPassword
      })

      if (signInError) {
        alert('Obecne hasło jest nieprawidłowe')
        return
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) {
        console.error('Error changing password:', updateError)
        alert('Wystąpił błąd podczas zmiany hasła')
        return
      }

      alert('Hasło zostało zmienione pomyślnie')
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error in password change:', error)
      alert('Wystąpił błąd podczas zmiany hasła')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  // Email change function
  const handleEmailChange = () => {
    setShowEmailModal(true)
  }

  const submitEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailForm.newEmail.includes('@')) {
      alert('Wprowadź prawidłowy adres e-mail')
      return
    }

    setIsLoadingEmail(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      })

      if (error) {
        console.error('Error changing email:', error)
        alert('Wystąpił błąd podczas zmiany adresu e-mail')
        return
      }

      alert('Na nowy adres e-mail został wysłany link potwierdzający. Sprawdź swoją skrzynkę pocztową.')
      setShowEmailModal(false)
      setEmailForm({
        newEmail: '',
        password: ''
      })
    } catch (error) {
      console.error('Error in email change:', error)
      alert('Wystąpił błąd podczas zmiany adresu e-mail')
    } finally {
      setIsLoadingEmail(false)
    }
  }

  // Quiz handling functions
  const handleCheckQuiz = async (stepId: string) => {
    const currentGuide = [...guides, ...instructions].find(g => g.id === activeGuide)
    if (!currentGuide) return

    const step = currentGuide.steps.find(s => s.id === stepId)
    if (!step || !step.quiz) return

    const answers = quizAnswers[stepId] || {}

    // Check if all questions are answered
    const totalQuestions = step.quiz.length
    const answeredQuestions = Object.keys(answers).length

    if (answeredQuestions < totalQuestions) {
      addQuizNotification(stepId, 'warning', 'Niepełne odpowiedzi', `Odpowiedz na wszystkie pytania (${answeredQuestions}/${totalQuestions})`)
      return
    }

    // Calculate results
    let correctAnswers = 0
    const newResults: {[questionIndex: number]: boolean} = {}

    step.quiz.forEach((quizItem, quizIndex) => {
      const userAnswer = answers[quizIndex]
      const isCorrect = userAnswer === quizItem.correct
      newResults[quizIndex] = isCorrect
      if (isCorrect) correctAnswers++
    })

    const passed = correctAnswers >= Math.ceil(totalQuestions * 0.7) // 70% to pass

    // Update state
    setQuizResults({
      ...quizResults,
      [stepId]: newResults
    })
    setShowQuizResults({
      ...showQuizResults,
      [stepId]: true
    })

    // Save quiz results to database
    if (user) {
      await saveUserProgress(currentGuide.id, guideProgress[currentGuide.id] || 0, false, {
        [stepId]: {
          results: newResults,
          passed: passed,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          completedAt: new Date().toISOString()
        }
      })
    }

    // Show feedback using quiz notifications pozycjonowane przy przycisku
    if (passed) {
      addQuizNotification(stepId, 'success', 'Quiz zaliczony!', `Gratulacje! Zdałeś quiz (${correctAnswers}/${totalQuestions} poprawnych odpowiedzi). Możesz przejść do następnego kroku.`)

      // Auto-advance to next step after 2 seconds
      setTimeout(async () => {
        const newProgress = guideProgress[currentGuide.id] || 0
        const nextProgress = Math.min(newProgress + 1, currentGuide.steps.length)

        setGuideProgress({
          ...guideProgress,
          [currentGuide.id]: nextProgress
        })

        // Mark as completed if this was the last step
        if (nextProgress >= currentGuide.steps.length) {
          if (currentGuide.category === 'safety' || currentGuide.category === 'tools') {
            setCompletedInstructions([...completedInstructions, currentGuide.id])
          } else {
            setCompletedGuides([...completedGuides, currentGuide.id])
          }

          // Save completion to database
          if (user) {
            await saveUserProgress(currentGuide.id, nextProgress, true, {
              [stepId]: {
                results: newResults,
                passed: passed,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                completedAt: new Date().toISOString()
              }
            })
          }
        } else {
          // Save progress to database
          if (user) {
            await saveUserProgress(currentGuide.id, nextProgress, false, {
              [stepId]: {
                results: newResults,
                passed: passed,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                completedAt: new Date().toISOString()
              }
            })
          }
        }
      }, 2000)
    } else {
      addQuizNotification(stepId, 'error', 'Quiz niezaliczony', `Nie zdałeś quizu (${correctAnswers}/${totalQuestions} poprawnych odpowiedzi). Przeczytaj jeszcze raz materiał i spróbuj ponownie.`)
    }
  }

  // Download account data
  const handleDownloadData = async () => {
    try {
      // Get all client data
      const { data: profileData } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: quotesData } = await supabase
        .from('client_quotes')
        .select('*')
        .eq('client_id', user.id)

      const { data: consultationsData } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('client_id', user.id)

      const accountData = {
        profile: profileData,
        quotes: quotesData,
        consultations: consultationsData,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(accountData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dane-konta-${user.email}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('Dane konta zostały pobrane')
    } catch (error) {
      console.error('Error downloading data:', error)
      alert('Wystąpił błąd podczas pobierania danych')
    }
  }

  // Delete account function
  const handleDeleteAccount = async () => {
    const confirmText = prompt('Wpisz "USUŃ KONTO" aby potwierdzić usunięcie konta:')
    if (confirmText !== 'USUŃ KONTO') {
      alert('Nieprawidłowe potwierdzenie')
      return
    }

    if (!confirm('Czy na pewno chcesz trwale usunąć konto? Ta akcja jest nieodwracalna.')) {
      return
    }

    try {
      // Delete all client data
      await supabase.from('client_quotes').delete().eq('client_id', user.id)
      await supabase.from('consultation_requests').delete().eq('client_id', user.id)
      await supabase.from('client_profiles').delete().eq('id', user.id)

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')

      alert('Konto zostało usunięte')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Wystąpił błąd podczas usuwania konta')
    }
  }

  const getFloorSystemName = (system: string) => {
    const systems: { [key: string]: string } = {
      'EPOXY_STANDARD': 'Epoksyd Standard',
      'EPOXY_PREMIUM': 'Epoksyd Premium',
      'PU_STANDARD': 'Poliuretan Standard',
      'PU_PREMIUM': 'Poliuretan Premium'
    }
    return systems[system] || system
  }

  const getDecorativeName = (decorative: string) => {
    const decoratives: { [key: string]: string } = {
      'SMOOTH': 'Gładki',
      'FLAKES': 'Płatki',
      'MARBLE': 'Marmur',
      'TEXTURED': 'Teksturowany',
      'TRANSPARENT': 'Transparentny'
    }
    return decoratives[decorative] || decorative
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'saved': { color: 'bg-blue-100 text-blue-800', text: 'Zapisana' },
      'consultation_requested': { color: 'bg-yellow-100 text-yellow-800', text: 'Konsultacja zamówiona' },
      'in_progress': { color: 'bg-purple-100 text-purple-800', text: 'W realizacji' },
      'completed': { color: 'bg-green-100 text-green-800', text: 'Zakończona' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.saved

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-gray-50">


      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-lg border-r border-slate-700 min-h-screen">
          {/* Header Section in Sidebar */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-3">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DecoSol</h1>
                <p className="text-xs text-slate-400">Panel klienta</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Witaj,</p>
                  <p className="text-lg font-bold text-blue-400">{profile?.first_name}!</p>
                </div>
                <div className="text-2xl">👋</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setShowConsultationModal(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                📅 Umów konsultację
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📊</span>
                <span>Przegląd</span>
              </button>

              <button
                onClick={() => setActiveTab('quotes')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'quotes'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📋</span>
                <span>Moje wyceny ({quotes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('new-quote')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'new-quote'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">🧮</span>
                <span>Nowa wycena</span>
              </button>

              <button
                onClick={() => setActiveTab('consultations')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'consultations'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📞</span>
                <span>Konsultacje</span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'documents'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📄</span>
                <span>Dokumenty</span>
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'photos'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📷</span>
                <span>Galeria zdjęć</span>
              </button>

              <button
                onClick={() => setActiveTab('affiliate')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'affiliate'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">🎯</span>
                <span>Program afiliacyjny</span>
              </button>

              <button
                onClick={() => setActiveTab('guides')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'guides'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">📚</span>
                <span>Poradniki</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:translate-x-1'
                }`}
              >
                <span className="text-xl">⚙️</span>
                <span>Ustawienia konta</span>
              </button>

              {/* Logout Button */}
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-3 text-red-300 hover:text-white hover:bg-red-600 hover:translate-x-1"
                >
                  <span className="text-xl">🚪</span>
                  <span>Wyloguj się</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8">

              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Witaj ponownie, {profile?.first_name}!</h3>
                    <p className="text-blue-100 mb-4">Oto podsumowanie Twojej aktywności w naszym systemie</p>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{quotes.length}</div>
                        <div className="text-sm text-blue-200">Wycen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{consultations.length}</div>
                        <div className="text-sm text-blue-200">Konsultacji</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">⭐</div>
                        <div className="text-sm text-blue-200">Klient</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl mb-2">🏠</div>
                    <div className="text-sm text-blue-200">DiabloStudio</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktywne wyceny</p>
                      <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Konsultacje</p>
                      <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Oszczędności</p>
                      <p className="text-2xl font-bold text-gray-900">Brak danych</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktualny rabat</p>
                      <p className="text-2xl font-bold text-gray-900">0%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ostatnie wyceny</h3>
                  {quotes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-gray-600">Brak wycen</p>
                      <button
                        onClick={() => setActiveTab('new-quote')}
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Utwórz pierwszą wycenę →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quotes.slice(0, 3).map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{quote.area}m² - {getFloorSystemName(quote.floor_system)}</p>
                            <p className="text-sm text-gray-600">{formatDate(quote.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">{formatCurrency(quote.total_min)}</p>
                            {getStatusBadge(quote.status)}
                          </div>
                        </div>
                      ))}
                      {quotes.length > 3 && (
                        <button
                          onClick={() => setActiveTab('quotes')}
                          className="w-full text-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-sm font-bold mt-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200"
                        >
                          Zobacz wszystkie wyceny →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Consultations */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ostatnie konsultacje</h3>
                  {consultations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📞</div>
                      <p className="text-gray-600">Brak konsultacji</p>
                      <button
                        onClick={() => setShowConsultationModal(true)}
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Umów konsultację →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultations.slice(0, 3).map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Konsultacja</p>
                            <p className="text-sm text-gray-600">{formatDate(consultation.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {consultation.status === 'pending' ? 'Oczekująca' :
                               consultation.status === 'confirmed' ? 'Potwierdzona' :
                               consultation.status === 'completed' ? 'Zakończona' :
                               'Anulowana'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {consultations.length > 3 && (
                        <button
                          onClick={() => setActiveTab('consultations')}
                          className="w-full text-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-sm font-bold mt-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200"
                        >
                          Zobacz wszystkie konsultacje →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quotes Tab */}
          {activeTab === 'quotes' && (
            <div className="p-8">
              {quotes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-6">📋</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Brak zapisanych wycen
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Jeszcze nie masz żadnych zapisanych wycen. Przejdź do kalkulatora, aby utworzyć swoją pierwszą wycenę.
                  </p>
                  <button
                    onClick={() => setActiveTab('new-quote')}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-lg"
                  >
                    Utwórz wycenę
                    <span className="ml-2 text-lg">🧮</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Wycena z {formatDate(quote.created_at)}
                          </h3>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="flex space-x-2">
                          {quote.status === 'saved' && (
                            <button
                              onClick={() => requestConsultation(quote)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg"
                            >
                              Zamów konsultację
                            </button>
                          )}
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Powierzchnia</p>
                          <p className="font-semibold">{quote.area}m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">System podłogowy</p>
                          <p className="font-semibold">{getFloorSystemName(quote.floor_system)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Wykończenie</p>
                          <p className="font-semibold">{getDecorativeName(quote.decorative_system)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cena</p>
                          <p className="font-semibold">
                            {formatCurrency(quote.price_min)} - {formatCurrency(quote.price_max)}/m²
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Łączny koszt</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(quote.total_min)} - {formatCurrency(quote.total_max)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Quote Tab */}
          {activeTab === 'new-quote' && (
            <div className="p-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    🧮 Kalkulator wyceny
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Oblicz koszt swojej posadzki żywicznej w kilka prostych kroków.
                    Otrzymasz szczegółową wycenę dostosowaną do Twoich potrzeb.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  // Handle valuation calculation
                  const totalArea = valuationForm.rooms.reduce((total, room) => total + (parseFloat(room.area) || 0), 0)

                  if (totalArea > 0 && valuationForm.floorSystem && valuationForm.substrateCondition && valuationForm.location && valuationForm.decorativeSystem) {
                    // Calculate price based on form values
                    let basePrice = 0

                    switch (valuationForm.floorSystem) {
                      case 'EPOXY_STANDARD': basePrice = 160; break
                      case 'EPOXY_PREMIUM': basePrice = 200; break
                      case 'PU_STANDARD': basePrice = 180; break
                      case 'PU_PREMIUM': basePrice = 220; break
                    }

                    // Decorative modifiers
                    if (valuationForm.decorativeSystem === 'MARBLE') basePrice += 30
                    if (valuationForm.decorativeSystem === 'FLAKES') basePrice += 25
                    if (valuationForm.decorativeSystem === 'TRANSPARENT') basePrice += 40

                    // Substrate modifiers
                    if (valuationForm.substrateCondition === 'CONCRETE_DEFECTS') basePrice += 50
                    if (valuationForm.substrateCondition === 'TILES') basePrice += 30
                    if (valuationForm.substrateCondition === 'OLD_RESIN') basePrice += 40

                    // Location modifier
                    if (valuationForm.location === 'OUTDOOR') basePrice *= 1.1

                    const minPrice = Math.round(basePrice * 0.85)
                    const maxPrice = Math.round(basePrice * 1.15)

                    setValuationPriceRange({ min: minPrice, max: maxPrice })
                    setShowValuationModal(true)
                  }
                }} className="space-y-8">

                  {/* Area Section */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                      Powierzchnia (m²) *
                    </label>
                    <div className="space-y-3">
                      {valuationForm.rooms.map((room, index) => (
                        <div key={room.id} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                          <span className="font-medium text-gray-700 min-w-[120px]">{room.name}</span>
                          <input
                            type="number"
                            step="0.1"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                            value={room.area}
                            onChange={(e) => {
                              const updatedRooms = [...valuationForm.rooms]
                              updatedRooms[index] = { ...updatedRooms[index], area: e.target.value }
                              setValuationForm({ ...valuationForm, rooms: updatedRooms })
                            }}
                            placeholder="np. 25"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                          >
                            📏 Oblicz
                          </button>
                          {valuationForm.rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedRooms = valuationForm.rooms.filter((_, i) => i !== index)
                                setValuationForm({ ...valuationForm, rooms: updatedRooms })
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-center">
                        <span className="text-lg font-bold text-blue-800">
                          Łączna powierzchnia: {valuationForm.rooms.reduce((total, room) => total + (parseFloat(room.area) || 0), 0).toFixed(2)} m²
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newRoomNumber = valuationForm.rooms.length + 1
                        setValuationForm({
                          ...valuationForm,
                          rooms: [...valuationForm.rooms, { id: Date.now(), area: '', name: `Pomieszczenie ${newRoomNumber}` }]
                        })
                      }}
                      className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                    >
                      + Dodaj pomieszczenie
                    </button>
                  </div>

                  {/* Floor System Selection */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                      Rodzaj żywicy *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'EPOXY_STANDARD', name: 'Epoksyd Standard', price: '160', icon: '🏠' },
                        { id: 'EPOXY_PREMIUM', name: 'Epoksyd Premium', price: '200', icon: '⭐' },
                        { id: 'PU_STANDARD', name: 'Poliuretan Standard', price: '180', icon: '🏭' },
                        { id: 'PU_PREMIUM', name: 'Poliuretan Premium', price: '220', icon: '💎' }
                      ].map((system) => (
                        <label
                          key={system.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            valuationForm.floorSystem === system.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="floorSystem"
                            value={system.id}
                            checked={valuationForm.floorSystem === system.id}
                            onChange={(e) => {
                              if (valuationForm.floorSystem === e.target.value) {
                                setValuationForm({ ...valuationForm, floorSystem: '' })
                              } else {
                                setValuationForm({ ...valuationForm, floorSystem: e.target.value })
                              }
                            }}
                            className="sr-only"
                            required
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{system.icon}</span>
                              <div>
                                <h3 className="font-semibold text-gray-900">{system.name}</h3>
                                <p className="text-sm text-gray-600">od {system.price} PLN/m²</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Substrate Condition */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                      Stan podłoża *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'CONCRETE_GOOD', name: 'Beton w dobrym stanie', icon: '✅' },
                        { id: 'CONCRETE_DEFECTS', name: 'Beton z wadami', icon: '🔧' },
                        { id: 'TILES', name: 'Płytki ceramiczne', icon: '🏠' },
                        { id: 'OLD_RESIN', name: 'Stara żywica', icon: '🔄' }
                      ].map((substrate) => (
                        <label
                          key={substrate.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            valuationForm.substrateCondition === substrate.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="substrateCondition"
                            value={substrate.id}
                            checked={valuationForm.substrateCondition === substrate.id}
                            onChange={(e) => {
                              if (valuationForm.substrateCondition === e.target.value) {
                                setValuationForm({ ...valuationForm, substrateCondition: '' })
                              } else {
                                setValuationForm({ ...valuationForm, substrateCondition: e.target.value })
                              }
                            }}
                            className="sr-only"
                            required
                          />
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{substrate.icon}</span>
                            <span className="font-semibold text-gray-900">{substrate.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                      Lokalizacja *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          valuationForm.location === 'INDOOR'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="location"
                          value="INDOOR"
                          checked={valuationForm.location === 'INDOOR'}
                          onChange={(e) => {
                            if (valuationForm.location === e.target.value) {
                              setValuationForm({ ...valuationForm, location: '' })
                            } else {
                              setValuationForm({ ...valuationForm, location: e.target.value })
                            }
                          }}
                          className="sr-only"
                          required
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🏢</span>
                          <span className="font-semibold text-gray-900">Wewnątrz budynku</span>
                        </div>
                      </label>
                      <label
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          valuationForm.location === 'OUTDOOR'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="location"
                          value="OUTDOOR"
                          checked={valuationForm.location === 'OUTDOOR'}
                          onChange={(e) => {
                            if (valuationForm.location === e.target.value) {
                              setValuationForm({ ...valuationForm, location: '' })
                            } else {
                              setValuationForm({ ...valuationForm, location: e.target.value })
                            }
                          }}
                          className="sr-only"
                          required
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🌳</span>
                          <span className="font-semibold text-gray-900">Na zewnątrz budynku</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Decorative System */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-4">
                      System dekoracyjny *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'SMOOTH', name: 'Gładki', icon: '🏠' },
                        { id: 'FLAKES', name: 'Płatki', icon: '✨' },
                        { id: 'MARBLE', name: 'Marmur', icon: '🌀' },
                        { id: 'TEXTURED', name: 'Teksturowany', icon: '🌊' },
                        { id: 'TRANSPARENT', name: 'Transparentny', icon: '💎' }
                      ].map((decorative) => (
                        <label
                          key={decorative.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            valuationForm.decorativeSystem === decorative.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="decorativeSystem"
                            value={decorative.id}
                            checked={valuationForm.decorativeSystem === decorative.id}
                            onChange={(e) => {
                              if (valuationForm.decorativeSystem === e.target.value) {
                                setValuationForm({ ...valuationForm, decorativeSystem: '' })
                              } else {
                                setValuationForm({ ...valuationForm, decorativeSystem: e.target.value })
                              }
                            }}
                            className="sr-only"
                            required
                          />
                          <div className="text-center">
                            <div className="text-3xl mb-2">{decorative.icon}</div>
                            <h3 className="font-semibold text-gray-900">{decorative.name}</h3>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xl py-4 px-12 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      🚀 Oblicz wycenę
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Konsultacje</h2>
                  <p className="text-gray-600">Zarządzaj swoimi konsultacjami i umawiaj nowe</p>
                </div>
                <button
                  onClick={() => setShowConsultationModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  📅 Umów konsultację
                </button>
              </div>

              {consultations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-6">📞</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Brak konsultacji
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Jeszcze nie masz żadnych zamówionych konsultacji. Zamów konsultację dla jednej ze swoich wycen.
                  </p>
                  <button
                    onClick={() => setShowConsultationModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-lg"
                  >
                    Umów konsultację
                    <span className="ml-2 text-lg">📅</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Konsultacja z {formatDate(consultation.created_at)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {consultation.status === 'pending' ? 'Oczekująca' :
                             consultation.status === 'confirmed' ? 'Potwierdzona' :
                             consultation.status === 'completed' ? 'Zakończona' :
                             'Anulowana'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Preferowana data</p>
                          <p className="font-semibold">{formatDate(consultation.preferred_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Preferowana godzina</p>
                          <p className="font-semibold">{consultation.preferred_time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold">
                            {consultation.status === 'pending' ? 'Oczekuje na potwierdzenie' :
                             consultation.status === 'confirmed' ? 'Potwierdzona - czekaj na telefon' :
                             consultation.status === 'completed' ? 'Konsultacja zakończona' :
                             'Anulowana'}
                          </p>
                        </div>
                      </div>

                      {consultation.message && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Wiadomość</p>
                          <p className="text-gray-800">{consultation.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Moje dokumenty</h3>
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">📄</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Brak dokumentów
                  </h4>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    W tej sekcji będą dostępne Twoje dokumenty: umowy, gwarancje, faktury i protokoły odbioru.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      📋 Dokumenty będą dostępne po realizacji projektu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="p-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Galeria zdjęć</h3>
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">📷</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Brak zdjęć
                  </h4>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Tutaj będą dostępne zdjęcia przed i po realizacji Twoich projektów.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-green-800">
                      🏗️ Zdjęcia będą dostępne po rozpoczęciu realizacji projektu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Affiliate Tab */}
          {activeTab === 'affiliate' && (
            <div className="p-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Program afiliacyjny</h3>
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🎯</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Program afiliacyjny
                  </h4>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Zapraszaj znajomych i zdobywaj rabaty na nasze usługi. Za każde zrealizowane zlecenie otrzymasz 1% rabatu (max 10%).
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-purple-800">
                      🔗 Twój kod referencyjny będzie dostępny po pierwszym zrealizowanym projekcie
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guides Tab */}
          {activeTab === 'guides' && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 Poradniki i kursy</h2>
                  <p className="text-gray-600">Interaktywne kursy i szczegółowe instrukcje krok po kroku</p>
                </div>

                {/* Course Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Guides Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="text-2xl mr-3">🎓</span>
                      Kursy i poradniki
                    </h3>

                    <div className="space-y-4">
                      {guides.map((guide) => {
                        const progress = guideProgress[guide.id] || 0
                        const isCompleted = completedGuides.includes(guide.id)
                        const progressPercentage = isCompleted ? 100 : (progress / guide.steps.length) * 100

                        return (
                          <div key={guide.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{guide.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>⏱️ {guide.estimatedTime}</span>
                                  <span>📚 {guide.steps.length} lekcji</span>
                                  <span className={isCompleted ? 'text-green-600' : 'text-blue-600'}>
                                    {isCompleted ? '✅ Ukończony' : '⏳ W trakcie'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setActiveGuide(guide.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isCompleted
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isCompleted ? '🔄 Powtórz' : progress > 0 ? '▶️ Kontynuuj' : '▶️ Rozpocznij'}
                              </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Postęp: {Math.round(progressPercentage)}%</span>
                              <span>{progress}/{guide.steps.length} lekcji</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Instructions Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      Instrukcje i procedury
                    </h3>

                    <div className="space-y-4">
                      {instructions.map((instruction) => {
                        const progress = guideProgress[instruction.id] || 0
                        const isCompleted = completedInstructions.includes(instruction.id)
                        const progressPercentage = isCompleted ? 100 : (progress / instruction.steps.length) * 100

                        return (
                          <div key={instruction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{instruction.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{instruction.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>⏱️ {instruction.estimatedTime}</span>
                                  <span>📋 {instruction.steps.length} kroków</span>
                                  <span className={isCompleted ? 'text-green-600' : 'text-orange-600'}>
                                    {isCompleted ? '✅ Gotowe' : '⏳ Do wykonania'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setActiveGuide(instruction.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isCompleted
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                              >
                                {isCompleted ? '🔄 Przeczytaj ponownie' : progress > 0 ? '▶️ Kontynuuj' : '▶️ Przeczytaj'}
                              </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Postęp: {Math.round(progressPercentage)}%</span>
                              <span>{progress}/{instruction.steps.length} kroków</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Active Guide Viewer */}
                {activeGuide && (() => {
                  const currentGuide = [...guides, ...instructions].find(g => g.id === activeGuide)
                  if (!currentGuide) return null

                  const currentProgress = guideProgress[currentGuide.id] || 0
                  const isCompleted = currentGuide.category === 'preparation' || currentGuide.category === 'application' || currentGuide.category === 'maintenance'
                    ? completedGuides.includes(currentGuide.id)
                    : completedInstructions.includes(currentGuide.id)

                  return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto relative">
                        {/* Quiz Notifications - pozycjonowane przy przycisku quiz */}
                        {Object.entries(quizNotifications).map(([stepId, stepNotifications]) => (
                          stepNotifications.length > 0 && (
                            <div key={stepId} className="absolute top-4 right-4 z-50 space-y-2 max-w-sm">
                              {stepNotifications.map((notification: any) => (
                                <div
                                  key={notification.id}
                                  className={`p-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
                                    notification.type === 'success' ? 'bg-green-50 border-green-500' :
                                    notification.type === 'error' ? 'bg-red-50 border-red-500' :
                                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                    'bg-blue-50 border-blue-500'
                                  }`}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <span className={`text-sm ${
                                        notification.type === 'success' ? 'text-green-600' :
                                        notification.type === 'error' ? 'text-red-600' :
                                        notification.type === 'warning' ? 'text-yellow-600' :
                                        'text-blue-600'
                                      }`}>
                                        {notification.type === 'success' ? '✅' :
                                         notification.type === 'error' ? '❌' :
                                         notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                                      </span>
                                    </div>
                                    <div className="ml-2 flex-1">
                                      <h4 className={`text-sm font-semibold ${
                                        notification.type === 'success' ? 'text-green-900' :
                                        notification.type === 'error' ? 'text-red-900' :
                                        notification.type === 'warning' ? 'text-yellow-900' :
                                        'text-blue-900'
                                      }`}>
                                        {notification.title}
                                      </h4>
                                      <p className={`text-xs mt-1 ${
                                        notification.type === 'success' ? 'text-green-700' :
                                        notification.type === 'error' ? 'text-red-700' :
                                        notification.type === 'warning' ? 'text-yellow-700' :
                                        'text-blue-700'
                                      }`}>
                                        {notification.message}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setQuizNotifications(prev => ({
                                        ...prev,
                                        [stepId]: (prev[stepId] || []).filter((n: any) => n.id !== notification.id)
                                      }))}
                                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 text-sm"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        ))}

                        <div className="p-8">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentGuide.title}</h3>
                              <p className="text-gray-600">{currentGuide.description}</p>
                            </div>
                            <button
                              onClick={() => setActiveGuide(null)}
                              className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                              ×
                            </button>
                          </div>

                          {/* Course Progress */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Postęp kursu: {currentProgress}/{currentGuide.steps.length}
                              </span>
                              <span className="text-sm text-gray-500">
                                {Math.round((currentProgress / currentGuide.steps.length) * 100)}% ukończone
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${(currentProgress / currentGuide.steps.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Course Content */}
                          <div className="space-y-6">
                            {currentGuide.steps.map((step, index) => {
                              const stepNumber = index + 1
                              const isStepCompleted = stepNumber <= currentProgress
                              const isStepActive = stepNumber === currentProgress + 1

                              return (
                                <div
                                  key={step.id}
                                  className={`border rounded-lg p-6 transition-all ${
                                    isStepActive
                                      ? 'border-blue-500 bg-blue-50'
                                      : isStepCompleted
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      isStepCompleted
                                        ? 'bg-green-500 text-white'
                                        : isStepActive
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {isStepCompleted ? '✅' : stepNumber}
                                    </div>

                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                                      <p className="text-gray-700 mb-4">{step.content}</p>

                                      {/* Additional Information */}
                                      {step.additionalInfo && (
                                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                          <h5 className="text-sm font-semibold text-amber-900 mb-2 flex items-center">
                                            <span className="text-lg mr-2">💡</span>
                                            Informacje dodatkowe
                                          </h5>
                                          <p className="text-sm text-amber-800">{step.additionalInfo}</p>
                                        </div>
                                      )}

                                      {/* Video and Literature Links */}
                                      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {step.videoUrl && (
                                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <h5 className="text-sm font-semibold text-red-900 mb-2 flex items-center">
                                              <span className="text-lg mr-2">🎥</span>
                                              Materiał wideo
                                            </h5>
                                            <a
                                              href={step.videoUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                              <span className="mr-2">▶️</span>
                                              Obejrzyj film
                                            </a>
                                          </div>
                                        )}

                                        {step.literature && step.literature.length > 0 && (
                                          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <h5 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                                              <span className="text-lg mr-2">📚</span>
                                              Literatura
                                            </h5>
                                            <div className="space-y-2">
                                              {step.literature.map((lit, idx) => (
                                                <div key={idx} className="text-sm text-indigo-800">
                                                  • {lit}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Quiz Section */}
                                      {step.quiz && step.quiz.length > 0 && isStepActive && (
                                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg relative">
                                          <h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                                            <span className="text-lg mr-2">🧠</span>
                                            Test wiedzy - Sprawdź swoją wiedzę!
                                          </h5>
                                          <div className="space-y-4">
                                            {step.quiz.map((quizItem, quizIndex) => (
                                              <div key={quizIndex} className="bg-white rounded-lg p-4 border border-purple-200">
                                                <p className="font-medium text-gray-900 mb-3">
                                                  {quizIndex + 1}. {quizItem.question}
                                                </p>
                                                <div className="space-y-2">
                                                  {quizItem.options.map((option, optionIndex) => (
                                                    <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors">
                                                      <input
                                                        type="radio"
                                                        name={`quiz-${step.id}-${quizIndex}`}
                                                        value={optionIndex}
                                                        checked={quizAnswers[step.id]?.[quizIndex] === optionIndex}
                                                        onChange={(e) => {
                                                          const currentAnswers = quizAnswers[step.id] || {}
                                                          setQuizAnswers({
                                                            ...quizAnswers,
                                                            [step.id]: {
                                                              ...currentAnswers,
                                                              [quizIndex]: parseInt(e.target.value)
                                                            }
                                                          })
                                                        }}
                                                        className="text-purple-600 focus:ring-purple-500"
                                                      />
                                                      <span className="text-sm text-gray-700">{option}</span>
                                                    </label>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {/* Quiz Notifications - pozycjonowane przy przycisku quiz */}
                                          {quizNotifications[step.id] && quizNotifications[step.id].length > 0 && (
                                            <div className="absolute top-2 right-2 z-50 space-y-2 max-w-sm">
                                              {quizNotifications[step.id].map((notification: any) => (
                                                <div
                                                  key={notification.id}
                                                  className={`p-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
                                                    notification.type === 'success' ? 'bg-green-50 border-green-500' :
                                                    notification.type === 'error' ? 'bg-red-50 border-red-500' :
                                                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                                    'bg-blue-50 border-blue-500'
                                                  }`}
                                                >
                                                  <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                      <span className={`text-sm ${
                                                        notification.type === 'success' ? 'text-green-600' :
                                                        notification.type === 'error' ? 'text-red-600' :
                                                        notification.type === 'warning' ? 'text-yellow-600' :
                                                        'text-blue-600'
                                                      }`}>
                                                        {notification.type === 'success' ? '✅' :
                                                         notification.type === 'error' ? '❌' :
                                                         notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                                                      </span>
                                                    </div>
                                                    <div className="ml-2 flex-1">
                                                      <h4 className={`text-sm font-semibold ${
                                                        notification.type === 'success' ? 'text-green-900' :
                                                        notification.type === 'error' ? 'text-red-900' :
                                                        notification.type === 'warning' ? 'text-yellow-900' :
                                                        'text-blue-900'
                                                      }`}>
                                                        {notification.title}
                                                      </h4>
                                                      <p className={`text-xs mt-1 ${
                                                        notification.type === 'success' ? 'text-green-700' :
                                                        notification.type === 'error' ? 'text-red-700' :
                                                        notification.type === 'warning' ? 'text-yellow-700' :
                                                        'text-blue-700'
                                                      }`}>
                                                        {notification.message}
                                                      </p>
                                                    </div>
                                                    <button
                                                      onClick={() => setQuizNotifications(prev => ({
                                                        ...prev,
                                                        [step.id]: (prev[step.id] || []).filter((n: any) => n.id !== notification.id)
                                                      }))}
                                                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 text-sm"
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Quiz Actions */}
                                          <div className="mt-4 pt-4 border-t border-purple-200">
                                            <div className="flex justify-between items-center">
                                              <p className="text-sm text-purple-700">
                                                Odpowiedz na wszystkie pytania, aby przejść dalej
                                              </p>
                                              <button
                                                onClick={() => handleCheckQuiz(step.id)}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                              >
                                                Sprawdź odpowiedzi
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}



                                      {isStepActive && !step.quiz && (
                                        <div className="flex space-x-3">
                                          <button
                                            onClick={() => {
                                              const newProgress = guideProgress[currentGuide.id] || 0
                                              setGuideProgress({
                                                ...guideProgress,
                                                [currentGuide.id]: Math.min(newProgress + 1, currentGuide.steps.length)
                                              })

                                              // Mark as completed if this was the last step
                                              if (newProgress + 1 >= currentGuide.steps.length) {
                                                if (currentGuide.category === 'safety' || currentGuide.category === 'tools') {
                                                  setCompletedInstructions([...completedInstructions, currentGuide.id])
                                                } else {
                                                  setCompletedGuides([...completedGuides, currentGuide.id])
                                                }
                                              }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                          >
                                            {stepNumber === currentGuide.steps.length ? '✅ Zakończ kurs' : '✅ Rozumiem, następny krok'}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Course Actions */}
                          <div className="flex justify-between items-center mt-8 pt-6 border-t">
                            <div className="text-sm text-gray-600">
                              Kategoria: {currentGuide.category === 'preparation' ? 'Przygotowanie powierzchni' :
                                         currentGuide.category === 'application' ? 'Aplikacja materiałów' :
                                         currentGuide.category === 'maintenance' ? 'Konserwacja' :
                                         currentGuide.category === 'safety' ? 'Bezpieczeństwo BHP' : 'Narzędzia'}
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => setActiveGuide(null)}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                              >
                                Zamknij
                              </button>

                              {isCompleted && (
                                <button
                                  onClick={() => {
                                    // Reset progress for this guide
                                    const newProgress = { ...guideProgress }
                                    delete newProgress[currentGuide.id]

                                    // Remove from completed lists
                                    if (currentGuide.category === 'safety' || currentGuide.category === 'tools') {
                                      setCompletedInstructions(completedInstructions.filter(id => id !== currentGuide.id))
                                    } else {
                                      setCompletedGuides(completedGuides.filter(id => id !== currentGuide.id))
                                    }

                                    setActiveGuide(currentGuide.id) // Restart the guide
                                  }}
                                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                >
                                  🔄 Rozpocznij ponownie
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Ustawienia konta</h2>
                  <p className="text-gray-600">Zarządzaj swoimi danymi i ustawieniami bezpieczeństwa</p>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    Dane osobowe
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imię
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-medium text-gray-900">{profile?.first_name || 'Nie podano'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nazwisko
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-medium text-gray-900">{profile?.last_name || 'Nie podano'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adres e-mail
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-medium text-gray-900">{user?.email || 'Nie podano'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-medium text-gray-900">{profile?.phone || 'Nie podano'}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adres
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-medium text-gray-900">
                          {profile?.address ? `${profile.address}${profile.city ? ', ' + profile.city : ''}${profile.postal_code ? ', ' + profile.postal_code : ''}` : 'Nie podano'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">🔐</span>
                    Bezpieczeństwo
                  </h3>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Zmiana hasła</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Zmień swoje hasło dostępu do konta
                      </p>
                      <button
                        onClick={handlePasswordChange}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        🔑 Zmień hasło
                      </button>
                    </div>

                    {/* Change Email */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Zmiana adresu e-mail</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Zmień swój adres e-mail używany do logowania
                      </p>
                      <button
                        onClick={handleEmailChange}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ✉️ Zmień e-mail
                      </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Uwierzytelnianie dwuskładnikowe</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Dodaj dodatkową warstwę bezpieczeństwa do swojego konta
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Status: {isTwoFactorEnabled ? 'Włączone' : 'Wyłączone'}
                          </p>
                          {isTwoFactorEnabled && (
                            <p className="text-xs text-green-600 mt-1">
                              ✅ Zweryfikowany numer: {profile?.phone_verified || 'Nie podano'}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!isTwoFactorEnabled ? (
                            <button
                              onClick={() => setShowTwoFactorModal(true)}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              🔒 Włącz 2FA
                            </button>
                          ) : (
                            <button
                              onClick={handleDisableTwoFactor}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              🔓 Wyłącz 2FA
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consents and Agreements */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">📋</span>
                    Zgody i regulaminy
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600 text-xl mt-1">✅</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Regulamin serwisu</h4>
                        <p className="text-sm text-gray-600">Zaakceptowano dnia: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pl-PL') : 'Brak danych'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600 text-xl mt-1">✅</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Polityka prywatności</h4>
                        <p className="text-sm text-gray-600">Zaakceptowano dnia: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pl-PL') : 'Brak danych'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-600 text-xl mt-1">📧</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Newsletter</h4>
                        <p className="text-sm text-gray-600">Opcjonalne powiadomienia o nowych usługach i promocjach</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-xs text-gray-600">
                            Ogólny: {newsletterSettings.generalNewsletter ? '✅' : '❌'} |
                            Produkty: {newsletterSettings.productUpdates ? '✅' : '❌'} |
                            Promocje: {newsletterSettings.promotionalOffers ? '✅' : '❌'}
                          </span>
                          <button
                            onClick={() => setShowNewsletterModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Zmień ustawienia →
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-yellow-600 text-xl mt-1">📊</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Marketing i analityka</h4>
                        <p className="text-sm text-gray-600">Zgoda na przetwarzanie danych w celach marketingowych</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-xs text-gray-600">
                            Analityka: {marketingSettings.analyticsConsent ? '✅' : '❌'} |
                            Marketing: {marketingSettings.marketingEmails ? '✅' : '❌'} |
                            Reklamy: {marketingSettings.personalizedAds ? '✅' : '❌'}
                          </span>
                          <button
                            onClick={() => setShowMarketingModal(true)}
                            className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                          >
                            Zarządzaj zgodami →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    Akcje konta
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Pobierz dane konta</h4>
                        <p className="text-sm text-gray-600">Pobierz kopię wszystkich swoich danych osobowych</p>
                      </div>
                      <button
                        onClick={handleDownloadData}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        📥 Pobierz
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <h4 className="font-medium text-red-900">Usuń konto</h4>
                        <p className="text-sm text-red-700">Trwale usuń swoje konto i wszystkie dane</p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑️ Usuń konto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Advanced Consultation Modal */}
      {showConsultationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  📅 Umów konsultację
                </h3>
                <button
                  onClick={() => {
                    setShowConsultationModal(false)
                    setConsultationForm({
                      preferredDate: '',
                      preferredTime: '',
                      message: '',
                      serviceType: '',
                      inquiryType: '',
                      selectedQuoteId: ''
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitConsultationRequest} className="space-y-6">
                {/* Quote Selection */}
                {quotes.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Dołącz swoją wycenę (opcjonalne)</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Wybierz jedną ze swoich zapisanych wycen, aby konsultant miał więcej informacji o Twoim projekcie.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz wycenę do konsultacji
                      </label>
                      <select
                        value={consultationForm.selectedQuoteId}
                        onChange={(e) => setConsultationForm({...consultationForm, selectedQuoteId: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                      >
                        <option value="" className="text-gray-500 font-medium">Nie łączyć z wyceną (ogólna konsultacja)</option>
                        {quotes.filter(quote => quote.status === 'saved').map((quote) => (
                          <option key={quote.id} value={quote.id} className="text-gray-900 font-medium">
                            {quote.area}m² - {getFloorSystemName(quote.floor_system)} - {formatCurrency(quote.total_min)}
                          </option>
                        ))}
                      </select>
                      {quotes.filter(quote => quote.status === 'saved').length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Brak dostępnych wycen do konsultacji. Utwórz nową wycenę w zakładce "Moje wyceny".
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Rodzaj zapytania *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="quote_consultation"
                          checked={consultationForm.inquiryType === 'quote_consultation'}
                          onChange={(e) => setConsultationForm({...consultationForm, inquiryType: e.target.value})}
                          className="mr-2 text-gray-800"
                          required
                        />
                        <span className="text-sm font-medium text-gray-800">Konsultacja wyceny</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="technical_consultation"
                          checked={consultationForm.inquiryType === 'technical_consultation'}
                          onChange={(e) => setConsultationForm({...consultationForm, inquiryType: e.target.value})}
                          className="mr-2 text-gray-800"
                          required
                        />
                        <span className="text-sm font-medium text-gray-800">Konsultacja techniczna</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="general_inquiry"
                          checked={consultationForm.inquiryType === 'general_inquiry'}
                          onChange={(e) => setConsultationForm({...consultationForm, inquiryType: e.target.value})}
                          className="mr-2 text-gray-800"
                          required
                        />
                        <span className="text-sm font-medium text-gray-800">Ogólne zapytanie</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Usługa *
                    </label>
                    <select
                      value={consultationForm.serviceType}
                      onChange={(e) => setConsultationForm({...consultationForm, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                      required
                    >
                      <option value="" className="text-gray-500">Wybierz usługę</option>
                      <option value="epoxy_flooring" className="text-gray-900 font-medium">Posadzki epoksydowe</option>
                      <option value="polyurethane_flooring" className="text-gray-900 font-medium">Posadzki poliuretanowe</option>
                      <option value="concrete_polishing" className="text-gray-900 font-medium">Polerowanie betonu</option>
                      <option value="floor_repair" className="text-gray-900 font-medium">Naprawa posadzek</option>
                      <option value="consultation_only" className="text-gray-900 font-medium">Tylko konsultacja</option>
                      <option value="other" className="text-gray-900 font-medium">Inne</option>
                    </select>
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Wybierz termin</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Preferowana data *
                      </label>
                      <input
                        type="date"
                        value={consultationForm.preferredDate}
                        onChange={(e) => setConsultationForm({...consultationForm, preferredDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 hover:border-gray-400 transition-colors"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Konsultacje dostępne od poniedziałku do piątku
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Preferowana godzina *
                      </label>
                      <select
                        value={consultationForm.preferredTime}
                        onChange={(e) => setConsultationForm({...consultationForm, preferredTime: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium"
                        required
                      >
                        <option value="" className="text-gray-500">Wybierz godzinę</option>
                        <option value="09:00" disabled={bookedSlots.includes('09:00')} className={bookedSlots.includes('09:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          09:00 {bookedSlots.includes('09:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="10:00" disabled={bookedSlots.includes('10:00')} className={bookedSlots.includes('10:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          10:00 {bookedSlots.includes('10:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="11:00" disabled={bookedSlots.includes('11:00')} className={bookedSlots.includes('11:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          11:00 {bookedSlots.includes('11:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="12:00" disabled={bookedSlots.includes('12:00')} className={bookedSlots.includes('12:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          12:00 {bookedSlots.includes('12:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="13:00" disabled={bookedSlots.includes('13:00')} className={bookedSlots.includes('13:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          13:00 {bookedSlots.includes('13:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="14:00" disabled={bookedSlots.includes('14:00')} className={bookedSlots.includes('14:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          14:00 {bookedSlots.includes('14:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="15:00" disabled={bookedSlots.includes('15:00')} className={bookedSlots.includes('15:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          15:00 {bookedSlots.includes('15:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="16:00" disabled={bookedSlots.includes('16:00')} className={bookedSlots.includes('16:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          16:00 {bookedSlots.includes('16:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                        <option value="17:00" disabled={bookedSlots.includes('17:00')} className={bookedSlots.includes('17:00') ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          17:00 {bookedSlots.includes('17:00') ? '(zajęte)' : '(wolne)'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Calendar-like interface for better UX */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Dostępne terminy w tym tygodniu:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {['Pon', 'Wt', 'Śr', 'Czw', 'Pt'].map((day, index) => {
                        const date = new Date()
                        date.setDate(date.getDate() + index)
                        const dateString = date.toISOString().split('T')[0]
                        const isSelected = consultationForm.preferredDate === dateString

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setConsultationForm({...consultationForm, preferredDate: dateString})}
                            className={`p-3 text-sm rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-bold text-gray-900">{day}</div>
                            <div className="text-sm font-semibold text-gray-700">{date.getDate()}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szczegóły projektu / dodatkowe informacje
                  </label>
                  <textarea
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm({...consultationForm, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 resize-vertical"
                    placeholder="Opisz swój projekt, powierzchnię, lokalizację, termin realizacji lub inne ważne informacje..."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                {/* Contact Preferences */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Informacje kontaktowe</h5>
                  <p className="text-sm text-blue-700">
                    Po umówieniu konsultacji skontaktujemy się z Tobą w ciągu 24 godzin w celu potwierdzenia terminu.
                    Konsultacja może odbyć się telefonicznie lub przez wideokonferencję.
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-bold transition-all duration-200 shadow-lg border-2 border-blue-600 hover:border-blue-700"
                  >
                    📅 Umów konsultację
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConsultationModal(false)
                      setConsultationForm({
                        preferredDate: '',
                        preferredTime: '',
                        message: '',
                        serviceType: '',
                        inquiryType: '',
                        selectedQuoteId: ''
                      })
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-bold transition-all duration-200 shadow-lg border-2 border-gray-600 hover:border-gray-700"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  🔒 Uwierzytelnianie dwuskładnikowe
                </h3>
                <button
                  onClick={() => {
                    setShowTwoFactorModal(false)
                    setTwoFactorForm({ phone: '', verificationCode: '', step: 'phone' })
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {twoFactorForm.step === 'phone' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Numer telefonu *
                    </label>
                    <input
                      type="tel"
                      value={twoFactorForm.phone}
                      onChange={(e) => setTwoFactorForm({ ...twoFactorForm, phone: e.target.value })}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-600 bg-white text-gray-900 font-medium text-lg placeholder-gray-500 hover:border-purple-400 transition-colors"
                      required
                    />
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      Na ten numer zostanie wysłany kod weryfikacyjny
                    </p>
                  </div>

                  <button
                    onClick={handleTwoFactorSetup}
                    disabled={isLoadingTwoFactor || !twoFactorForm.phone}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    {isLoadingTwoFactor ? 'Wysyłanie...' : '📱 Wyślij kod weryfikacyjny'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Wprowadź kod weryfikacyjny
                    </h4>
                    <p className="text-sm text-gray-600">
                      Kod został wysłany na numer: <strong>{twoFactorForm.phone}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kod weryfikacyjny *
                    </label>
                    <input
                      type="text"
                      value={twoFactorForm.verificationCode}
                      onChange={(e) => setTwoFactorForm({ ...twoFactorForm, verificationCode: e.target.value })}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-600 text-center text-2xl font-mono"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Wprowadź 6-cyfrowy kod otrzymany SMS-em
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setTwoFactorForm({ ...twoFactorForm, step: 'phone' })}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                    >
                      ← Wstecz
                    </button>
                    <button
                      onClick={handleTwoFactorVerify}
                      disabled={isLoadingTwoFactor || !twoFactorForm.verificationCode}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                    >
                      {isLoadingTwoFactor ? 'Weryfikowanie...' : '✅ Włącz 2FA'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  🔑 Zmiana hasła
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitPasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nowe hasło *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Wprowadź nowe hasło"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium text-lg placeholder-gray-500 hover:border-blue-400 transition-colors"
                    required
                    minLength={8}
                  />
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    Hasło musi mieć co najmniej 8 znaków
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Potwierdź nowe hasło *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Potwierdź nowe hasło"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white text-gray-900 font-medium text-lg placeholder-gray-500 hover:border-blue-400 transition-colors"
                    required
                    minLength={8}
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Wskazówki bezpieczeństwa</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Użyj co najmniej 8 znaków</li>
                    <li>• Połącz wielkie i małe litery</li>
                    <li>• Dodaj cyfry i znaki specjalne</li>
                    <li>• Nie używaj prostych haseł jak "123456"</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    {isLoadingPassword ? '⏳ Zmiana...' : '🔑 Zmień hasło'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  ✉️ Zmiana adresu e-mail
                </h3>
                <button
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailForm({
                      newEmail: '',
                      password: ''
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitEmailChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nowy adres e-mail *
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    placeholder="nowy@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-600 bg-white text-gray-900 font-medium text-lg placeholder-gray-500 hover:border-green-400 transition-colors"
                    required
                  />
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    Wprowadź prawidłowy adres e-mail
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-green-900 mb-2">Informacja</h5>
                  <p className="text-sm text-green-700">
                    Po zmianie adresu e-mail zostanie wysłany link potwierdzający na nowy adres.
                    Będziesz musiał kliknąć w link, aby aktywować nowy adres e-mail.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Uwaga</h5>
                  <p className="text-sm text-yellow-700">
                    Obecny adres e-mail: <strong>{user?.email}</strong> będzie aktywny do czasu potwierdzenia nowego adresu.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailModal(false)
                      setEmailForm({
                        newEmail: '',
                        password: ''
                      })
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingEmail || !emailForm.newEmail}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    {isLoadingEmail ? '⏳ Wysyłanie...' : '✉️ Zmień e-mail'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Settings Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  📧 Ustawienia newslettera
                </h3>
                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Newsletter DiabloStudio</h5>
                  <p className="text-sm text-blue-700">
                    Wybierz, które informacje chcesz otrzymywać na swój adres e-mail.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Newsletter ogólny</h4>
                        <p className="text-sm text-gray-600">Aktualności i ważne informacje</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={newsletterSettings.generalNewsletter}
                      onChange={(e) => setNewsletterSettings({
                        ...newsletterSettings,
                        generalNewsletter: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🛠️</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Aktualizacje produktów</h4>
                        <p className="text-sm text-gray-600">Nowe systemy i technologie</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={newsletterSettings.productUpdates}
                      onChange={(e) => setNewsletterSettings({
                        ...newsletterSettings,
                        productUpdates: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">💰</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Oferty promocyjne</h4>
                        <p className="text-sm text-gray-600">Rabaty i oferty specjalne</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={newsletterSettings.promotionalOffers}
                      onChange={(e) => setNewsletterSettings({
                        ...newsletterSettings,
                        promotionalOffers: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🔧</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Wiadomości techniczne</h4>
                        <p className="text-sm text-gray-600">Porady i instrukcje pielęgnacji</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={newsletterSettings.technicalNews}
                      onChange={(e) => setNewsletterSettings({
                        ...newsletterSettings,
                        technicalNews: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Możesz zmienić te ustawienia w dowolnym momencie w panelu ustawień konta.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowNewsletterModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={() => {
                      // Here you would save the settings to the database
                      alert('Ustawienia newslettera zostały zapisane!')
                      setShowNewsletterModal(false)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    💾 Zapisz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Settings Modal */}
      {showMarketingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  📊 Zgody marketingowe
                </h3>
                <button
                  onClick={() => setShowMarketingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-yellow-900 mb-2">Przetwarzanie danych</h5>
                  <p className="text-sm text-yellow-700">
                    Wybierz, w jaki sposób możemy wykorzystywać Twoje dane w celach marketingowych.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📊</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Analityka i statystyki</h4>
                        <p className="text-sm text-gray-600">Analiza ruchu i zachowań użytkowników</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingSettings.analyticsConsent}
                      onChange={(e) => setMarketingSettings({
                        ...marketingSettings,
                        analyticsConsent: e.target.checked
                      })}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">E-maile marketingowe</h4>
                        <p className="text-sm text-gray-600">Newslettery i oferty specjalne</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingSettings.marketingEmails}
                      onChange={(e) => setMarketingSettings({
                        ...marketingSettings,
                        marketingEmails: e.target.checked
                      })}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎯</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Reklamy spersonalizowane</h4>
                        <p className="text-sm text-gray-600">Dopasowane oferty i rekomendacje</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingSettings.personalizedAds}
                      onChange={(e) => setMarketingSettings({
                        ...marketingSettings,
                        personalizedAds: e.target.checked
                      })}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🔗</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Udostępnianie danych</h4>
                        <p className="text-sm text-gray-600">Partnerom biznesowym (anonimowo)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingSettings.dataSharing}
                      onChange={(e) => setMarketingSettings({
                        ...marketingSettings,
                        dataSharing: e.target.checked
                      })}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                  </label>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Możesz zmienić te ustawienia w dowolnym momencie. Zmiany zostaną zastosowane natychmiast.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowMarketingModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={() => {
                      // Here you would save the settings to the database
                      alert('Ustawienia marketingowe zostały zapisane!')
                      setShowMarketingModal(false)
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    💾 Zapisz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardErrorBoundary>
  )
}
