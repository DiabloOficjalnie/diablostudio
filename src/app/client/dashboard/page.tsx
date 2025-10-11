'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useUser, useAuth, useClerk, UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Chart, registerables } from 'chart.js'
import generateQuotePDF from '@/lib/pdfGenerator'
Chart.register(...registerables)

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
  return <ClientDashboardContent />
}

function ClientDashboardContent() {
  const { user, isLoaded } = useUser()
  const supabase = createClientComponentClient()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [profile, setProfile] = useState<any>(null)
  const [quotes, setQuotes] = useState<ClientQuote[]>([])
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([])
  const [documents, setDocuments] = useState<Array<{ id: string; title: string; url: string; type?: string; created_at: string }>>([])
  const [photos, setPhotos] = useState<Array<{ id: string; title: string; url: string; thumbnail_url?: string; created_at: string }>>([])
  const [affiliate, setAffiliate] = useState<{ referral_code: string; referrals_count: number; discount_percentage: number; points: number; created_at: string } | null>(null)
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
  const [pricingData, setPricingData] = useState<any>(null)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<ClientQuote | null>(null)
  const [showQuotePreviewModal, setShowQuotePreviewModal] = useState(false)
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
  const [isSettingsLoading, setIsSettingsLoading] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [showUserProfileModal, setShowUserProfileModal] = useState(false)

  // Statystyki klienta
  const [statistics, setStatistics] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const statsChartRef = useRef<HTMLCanvasElement | null>(null)
  const statsChartInstance = useRef<any>(null)

  // Guides and Instructions system
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [guideProgress, setGuideProgress] = useState<{[key: string]: number}>({})
  const [completedGuides, setCompletedGuides] = useState<string[]>([])
  const [completedInstructions, setCompletedInstructions] = useState<string[]>([])

  // Quiz system state
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: {[questionIndex: number]: number}}>({})
  const [quizResults, setQuizResults] = useState<{[key: string]: {[questionIndex: number]: boolean}}>({})
  const [showQuizResults, setShowQuizResults] = useState<{[key: string]: boolean}>({})
  const [quizAttempts, setQuizAttempts] = useState<{[key: string]: number}>({})
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<{[key: string]: boolean}>({})
  const [userGuideProgress, setUserGuideProgress] = useState<{[key: string]: {step: number, completed: boolean, quizResults: any}}>({})
  
  // Edukacja: kategorie zgodne stylistycznie ze stroną główną
  const [activeCategory, setActiveCategory] = useState<'all' | 'journey' | 'preparation' | 'installation' | 'aftercare' | 'safety' | 'tools'>('all')
  const [educationSearch, setEducationSearch] = useState('')
  const [activeSection, setActiveSection] = useState<'overview' | 'education'>('overview')

  const CATEGORY_LABELS: Record<string, string> = {
    journey: 'Proces współpracy',
    preparation: 'Przygotowanie',
    installation: 'Realizacja',
    aftercare: 'Po realizacji',
    safety: 'Bezpieczeństwo',
    tools: 'Narzędzia'
  }
  
  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(n || 0))
  
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

  // Notification Center / Event log (server)
  const [clientEvents, setClientEvents] = useState<Array<{ id: string; type: string; details?: any; created_at: string }>>([])
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [isEventsLoading, setIsEventsLoading] = useState(false)

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

  // Event logging helpers
  async function logEvent(type: string, details?: any) {
    try {
      await fetch('/api/client/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, details })
      })
    } catch (e) {
      console.error('logEvent error:', e)
    }
  }

  async function loadEventsFromAPI() {
    setIsEventsLoading(true)
    try {
      const res = await fetch('/api/client/events', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && (data as any)?.success) {
        setClientEvents(Array.isArray((data as any).events) ? (data as any).events : [])
      }
    } catch (e) {
      console.error('loadEventsFromAPI error:', e)
    } finally {
      setIsEventsLoading(false)
    }
  }

  // Types for Guides/Instructions
  type QuizItem = { question: string; options: string[]; correct: number }
  type Step = {
    id: string
    title: string
    content: string
    additionalInfo?: string
    videoUrl?: string
    literature?: string[]
    quiz?: QuizItem[]
  }
  type GuideType = {
    id: string
    title: string
    description: string
    estimatedTime?: string
    category: 'preparation' | 'application' | 'maintenance' | 'safety' | 'tools'
    steps: Step[]
  }

  // Guides/instructions placeholders to satisfy references before assignment
  let guides: GuideType[] = []
  let instructions: GuideType[] = []

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

  // Customer-focused Education Modules (non-DIY, plain language)
  // Categories kept aligned with existing completion logic:
  // - 'preparation' | 'application' | 'maintenance' are treated as "guides"
  // - 'safety' | 'tools' are treated as "instructions"
  const customerGuides: GuideType[] = [
    {
      id: 'customer-journey',
      title: 'Twoja droga: od wyceny do odbioru',
      description: 'Krok po kroku: co wydarzy się po kalkulacji, jak wygląda wizyta techniczna, oferta i umówienie terminu.',
      estimatedTime: '8 min',
      category: 'preparation',
      steps: [
        {
          id: 'after-quote',
          title: 'Po wycenie: co dalej?',
          content: 'Wyślemy podsumowanie Twojej wyceny i zaproponujemy możliwe terminy rozmowy lub wizyty technicznej. Ustalimy zakres prac i wstępny harmonogram.',
          additionalInfo: 'Warto zanotować pytania i wysłać zdjęcia miejsca montażu — przyspieszy to przygotowanie oferty.',
          videoUrl: '',
          literature: ['Lista pytań do doradcy — PDF'],
          quiz: [
            { question: 'Jaki jest kolejny krok po kalkulacji online?', options: ['Samodzielny montaż', 'Wizyta/rozmowa techniczna', 'Zakup materiałów'], correct: 1 }
          ]
        },
        {
          id: 'site-visit',
          title: 'Wizyta techniczna',
          content: 'Podczas wizyty sprawdzimy podłoże, wilgotność i dostęp. To moment na doprecyzowanie szczegółów oraz potwierdzenie wyceny.',
          additionalInfo: 'Zadbaj o dostęp do miejsca, oświetlenie i możliwość wykonania pomiarów.',
          videoUrl: '',
          literature: ['Jak przygotować się do wizyty — PDF'],
          quiz: [
            { question: 'Co jest celem wizyty technicznej?', options: ['Podpisanie umowy', 'Wstępne malowanie', 'Weryfikacja warunków i pomiarów'], correct: 2 }
          ]
        },
        {
          id: 'offer-and-scheduling',
          title: 'Oferta i umówienie terminu',
          content: 'Po wizycie otrzymasz ofertę z wyszczególnieniem etapów, materiałów i terminu. Po akceptacji rezerwujemy termin realizacji.',
          additionalInfo: 'Możliwe są zaliczki/rezerwacje terminu — szczegóły w ofercie.',
          videoUrl: '',
          literature: ['Przykładowa oferta — PDF'],
          quiz: [
            { question: 'Co robimy po akceptacji oferty?', options: ['Rezerwacja terminu realizacji', 'Przywozimy materiały od razu', 'Kończymy projekt'], correct: 0 }
          ]
        }
      ]
    },
    {
      id: 'prepare-home',
      title: 'Przygotowanie domu/przestrzeni',
      description: 'Jak przygotować pomieszczenia: dostęp, meble, wentylacja, bezpieczeństwo domowników i zwierząt.',
      estimatedTime: '7 min',
      category: 'preparation',
      steps: [
        {
          id: 'access-and-clearance',
          title: 'Dostęp i opróżnienie',
          content: 'Ułatw dojazd i wnieśną logistykę. Usuń meble i przedmioty z pomieszczeń, zabezpiecz te, które muszą pozostać.',
          additionalInfo: 'Ustal miejsce parkowania i gniazda prądu. Zabezpiecz rzeczy wrażliwe na pył.',
          videoUrl: '',
          literature: ['Checklist: przygotowanie pomieszczeń — PDF'],
          quiz: [
            { question: 'Co należy zrobić z meblami przed pracami?', options: ['Pozostawić na miejscu', 'Usunąć lub zabezpieczyć', 'Oddać do serwisu'], correct: 1 }
          ]
        },
        {
          id: 'ventilation-and-safety',
          title: 'Wentylacja i bezpieczeństwo',
          content: 'Zapewnij wietrzenie i ogranicz dostęp dzieci/zwierząt do strefy prac. Stosujemy bezpieczne procedury, ale dostęp powinien być kontrolowany.',
          additionalInfo: 'Poinformuj domowników o planie dnia i strefach niedostępnych.',
          videoUrl: '',
          literature: ['Poradnik: bezpieczeństwo domowe podczas prac — PDF'],
          quiz: [
            { question: 'Czy zwierzęta mogą przebywać w strefie prac?', options: ['Tak', 'Nie', 'Tylko koty'], correct: 1 }
          ]
        }
      ]
    },
    {
      id: 'installation-day',
      title: 'Dzień realizacji: czego się spodziewać',
      description: 'Przebieg dnia: etapy, hałas, zapach, obecność ekipy, orientacyjne czasy.',
      estimatedTime: '6 min',
      category: 'application',
      steps: [
        {
          id: 'timeline',
          title: 'Harmonogram dnia',
          content: 'Wejście ekipy, przygotowanie podłoża, warstwy systemu i sprzątanie. Część etapów wymaga przerw technologicznych.',
          additionalInfo: 'Czas zależy od metrażu i warunków. Podamy orientacyjny plan przy ofercie.',
          videoUrl: '',
          literature: ['Schemat procesu — PDF'],
          quiz: [
            { question: 'Czy mogą wystąpić przerwy technologiczne?', options: ['Nie', 'Tak', 'Tylko zimą'], correct: 1 }
          ]
        },
        {
          id: 'comfort',
          title: 'Komfort i ograniczenia',
          content: 'Możliwy hałas i zapach (wentylujemy). Nie wchodź na świeże warstwy. Zapewnij wolny przejazd i prąd.',
          additionalInfo: 'W razie wątpliwości — zapytaj kierownika ekipy na miejscu.',
          videoUrl: '',
          literature: ['FAQ: dzień montażu — PDF'],
          quiz: [
            { question: 'Czy można chodzić po świeżo nałożonej warstwie?', options: ['Tak', 'Nie', 'W skarpetkach'], correct: 1 }
          ]
        }
      ]
    },
    {
      id: 'aftercare-cure',
      title: 'Po realizacji: czas schnięcia i użytkowanie',
      description: 'Kiedy można wejść, lekkie użytkowanie i pełne obciążenie.',
      estimatedTime: '5 min',
      category: 'application',
      steps: [
        {
          id: 'cure-times',
          title: 'Czasy schnięcia',
          content: 'Wejście po ~24h, lekkie użytkowanie 48–72h, pełne właściwości po ~7 dniach (w zależności od warunków).',
          additionalInfo: '',
          videoUrl: '',
          literature: [],
          quiz: [
            { question: 'Kiedy zwykle można wejść na posadzkę?', options: ['po 6h', 'po 24h', 'po 3 dniach'], correct: 1 }
          ]
        }
      ]
    },
    {
      id: 'aftercare-maintenance',
      title: 'Pielęgnacja i czyszczenie (po realizacji)',
      description: 'Rutynowa pielęgnacja, dobór środków pH‑neutralnych, reakcja na plamy oraz ochrona powierzchni. Parametry krytyczne zawsze wg TDS producenta.',
      estimatedTime: '8 min',
      category: 'maintenance',
      steps: [
        {
          id: 'initial-cleaning',
          title: 'Pierwsze sprzątanie',
          content: 'W pierwszym tygodniu po aplikacji unikaj urządzeń parowych i agresywnego szorowania. Używaj łagodnych detergentów pH‑neutralnych oraz miękkich mopów/padów. Zabrudzenia usuwaj na bieżąco; piasek i żwir ogranicz matami wejściowymi.',
          additionalInfo: 'Dokładne środki i czasy zawsze wg TDS producenta użytego systemu.',
          literature: [
            'FeRFA – Guide to Cleaning Resin Flooring: https://www.ferfa.org.uk/guidance/ferfa-guide-to-cleaning-resin-flooring/',
            'EU-OSHA – Dangerous substances: https://osha.europa.eu/en/themes/dangerous-substances',
            'TDS producenta (zalecenia i ograniczenia)'
          ],
          quiz: [
            { question: 'Jakie środki stosować w pierwszych dniach?', options: ['Silnie zasadowe', 'Parowe', 'pH‑neutralne', 'Rozpuszczalniki'], correct: 2 }
          ]
        }
      ]
    }
  ]

  instructions = [
    {
      id: 'safety-instructions',
      title: 'Instrukcje bezpieczeństwa BHP',
      description: 'Bezpieczeństwo pracy z żywicami epoksydowymi',
      steps: [
        {
          id: 'health-exposure-good-practice',
          title: 'Ekspozycje zdrowotne, alergie i dobre praktyki',
          content: 'Składniki systemów epoksydowych i niektóre utwardzacze mogą działać drażniąco oraz uczulająco. Utrzymuj dobrą wentylację, wyznacz strefy robocze i ogranicz dostęp osób postronnych. Wczesne objawy nadwrażliwości: zaczerwienienie skóry, świąd, wysypka; możliwe też kaszel i duszność. W razie objawów — wyjdź ze strefy, zgłoś ekipie i skontaktuj się z lekarzem. Rozlewów chemii nie usuwaj samodzielnie — stosujemy procedury z kart charakterystyki (SDS).',
          additionalInfo: 'Informacje szczegółowe zawsze w TDS/SDS producenta dla zastosowanego systemu.',
          literature: [
            'HSE – Epoxy resins: https://www.hse.gov.uk/chemicals/epoxy.htm',
            'EU-OSHA – Dangerous substances: https://osha.europa.eu/en/themes/dangerous-substances',
            'TDS/SDS producenta (środki ostrożności)'
          ],
          quiz: [
            { question: 'Czy epoksydy mogą uczulać?', options: ['Nie', 'Tak', 'Tylko zimą', 'Tylko na zewnątrz'], correct: 1 },
            { question: 'Kto powinien usuwać rozlaną chemię?', options: ['Klient', 'Przeszkolona ekipa wg SDS', 'Dowolna osoba z rękawicami', 'Nikt'], correct: 1 }
          ]
        }
      ],
      category: 'safety',
      estimatedTime: '25 min'
    }
  ]

  guides = customerGuides

  const allModules = useMemo(() => {
    const mapCategory = (cat: string) => (cat === 'application' ? 'installation' : cat === 'maintenance' ? 'aftercare' : cat)
    return [...guides, ...instructions].map((g: any) => ({ ...g, category: mapCategory(g.category as string) }))
  }, [guides, instructions])

  const filteredModules = useMemo(() => {
    let filtered = activeCategory === 'all' ? allModules : allModules.filter((m: any) => m.category === activeCategory)
    if (educationSearch.trim()) {
      filtered = filtered.filter((m: any) => 
        (m.title + ' ' + m.description).toLowerCase().includes(educationSearch.toLowerCase().trim())
      )
    }
    return filtered
  }, [activeCategory, allModules, educationSearch])

  const overallProgress = useMemo(() => {
    const total = allModules.reduce((acc: number, m: any) => acc + m.steps.length, 0)
    const done = allModules.reduce((acc: number, m: any) => acc + Math.min(guideProgress[m.id] || 0, m.steps.length), 0)
    return Math.round((done / Math.max(1, total)) * 100)
  }, [allModules, guideProgress])

  const getModuleProgress = (moduleId: string) => {
    const mod = allModules.find((m: any) => m.id === moduleId)
    if (!mod) return { count: 0, total: 0, percent: 0 }
    const total = mod.steps.length
    const count = Math.min(guideProgress[moduleId] || 0, total)
    const isCompleted = (mod.category === 'safety' || mod.category === 'tools') 
      ? completedInstructions.includes(moduleId)
      : completedGuides.includes(moduleId)
    const percent = isCompleted ? 100 : Math.round((count / Math.max(1, total)) * 100)
    return { count, total, percent }
  }

  const router = useRouter()

  async function checkUser() {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('client_profiles').insert({
          id: user.id,
          first_name: user.firstName || 'Unknown',
          last_name: user.lastName || 'User',
          email: user.primaryEmailAddress?.emailAddress || null,
          phone: user.phoneNumbers?.[0]?.phoneNumber || null,
          company: null
        })
      }

      const { data: loadedProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(loadedProfile || null)
      setLoading(false)
    } catch (e) {
      console.error('checkUser error:', e)
      setLoading(false)
    }
  }

  // Helper no-ops to satisfy build until full implementations are wired
  async function attachPendingQuoteToAccount() {
    try {
      if (typeof window === 'undefined') return
      const pending = sessionStorage.getItem('pendingQuote')
      if (!pending) return

      const parsed = JSON.parse(pending || '{}') as any
      if (!user?.id || !parsed) {
        sessionStorage.removeItem('pendingQuote')
        return
      }

      // Build payload compatible with /api/client-quotes
      const area = Number(parsed.area ?? 0)
      const priceMin = Number(parsed.priceRange?.min ?? parsed.priceMin ?? 0)
      const priceMax = Number(parsed.priceRange?.max ?? parsed.priceMax ?? 0)
      const totalMin = Math.round(priceMin * area)
      const totalMax = Math.round(priceMax * area)

      const clientQuoteData = {
        clientId: user.id,
        quoteData: {
          area,
          floorSystem: String(parsed.floorSystem || ''),
          substrateCondition: String(parsed.substrateCondition || ''),
          location: String(parsed.location || ''),
          decorativeSystem: String(parsed.decorativeSystem || ''),
          priceMin,
          priceMax,
          totalMin,
          totalMax
        },
        contactPreferences: null,
        consents: null
      }

      const res = await fetch('/api/client-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientQuoteData)
      })

      if (res.ok) {
        addNotification('success', 'Wycena zapisana', 'Zapisano oczekującą wycenę w Twoim koncie.')
      } else {
        const body = await res.json().catch(() => ({}))
        console.error('Failed to attach pending quote:', body?.error || res.statusText)
        addNotification('warning', 'Nie zapisano wyceny', 'Nie udało się zapisać oczekującej wyceny. Spróbuj ponownie w panelu.')
      }

      sessionStorage.removeItem('pendingQuote')
    } catch (e) {
      console.error('attachPendingQuoteToAccount error:', e)
      addNotification('error', 'Błąd zapisu wyceny', 'Wystąpił błąd podczas zapisywania wyceny w koncie.')
    }
  }

  async function loadQuotes() {
    try {
      const res = await fetch('/api/client/quotes', { cache: 'no-store' })
      if (!res.ok) {
        console.error('Failed to load quotes:', res.status, res.statusText)
        setQuotes([])
        return
      }
      const data = await res.json().catch(() => ({}))
      setQuotes(Array.isArray(data?.quotes) ? data.quotes : [])
    } catch (e) {
      console.error('loadQuotes error:', e)
      setQuotes([])
    }
  }

  async function loadConsultationsFromAPI() {
    try {
      const res = await fetch('/api/client/consultations', { cache: 'no-store' })
      if (!res.ok) {
        console.error('Failed to load consultations:', res.status, res.statusText)
        setConsultations([])
        return
      }
      const data = await res.json().catch(() => ({}))
      setConsultations(Array.isArray(data?.consultations) ? data.consultations : [])
    } catch (e) {
      console.error('loadConsultationsFromAPI error:', e)
      setConsultations([])
    }
  }

  async function loadDocumentsFromAPI() {
    try {
      const res = await fetch('/api/client/documents', { cache: 'no-store' })
      if (!res.ok) {
        console.error('Failed to load documents:', res.status, res.statusText)
        setDocuments([])
        return
      }
      const data = await res.json().catch(() => ({}))
      setDocuments(Array.isArray(data?.documents) ? data.documents : [])
    } catch (e) {
      console.error('loadDocumentsFromAPI error:', e)
      setDocuments([])
    }
  }

  async function loadPhotosFromAPI() {
    try {
      const res = await fetch('/api/client/photos', { cache: 'no-store' })
      if (!res.ok) {
        console.error('Failed to load photos:', res.status, res.statusText)
        setPhotos([])
        return
      }
      const data = await res.json().catch(() => ({}))
      setPhotos(Array.isArray(data?.photos) ? data.photos : [])
    } catch (e) {
      console.error('loadPhotosFromAPI error:', e)
      setPhotos([])
    }
  }

  async function loadAffiliateFromAPI() {
    try {
      const res = await fetch('/api/client/affiliate', { cache: 'no-store' })
      if (!res.ok) {
        console.error('Failed to load affiliate:', res.status, res.statusText)
        setAffiliate(null)
        return
      }
      const data = await res.json().catch(() => ({}))
      setAffiliate(data?.affiliate || null)
    } catch (e) {
      console.error('loadAffiliateFromAPI error:', e)
      setAffiliate(null)
    }
  }

  // Settings API
  async function loadSettingsFromAPI() {
    setIsSettingsLoading(true)
    try {
      const res = await fetch('/api/client/settings', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        setIsSettingsLoading(false)
        return
      }
      if (data?.settings?.newsletter) setNewsletterSettings(data.settings.newsletter)
      if (data?.settings?.marketing) setMarketingSettings(data.settings.marketing)
      if (typeof data?.settings?.two_factor_enabled === 'boolean') {
        setIsTwoFactorEnabled(Boolean(data.settings.two_factor_enabled))
      }
    } catch (e) {
      console.error('loadSettingsFromAPI error:', e)
    } finally {
      setIsSettingsLoading(false)
    }
  }

  async function saveSettingsToAPI() {
    try {
      setIsSavingSettings(true)
      const res = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletter: newsletterSettings,
          marketing: marketingSettings,
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || body?.success === false) {
        throw new Error(body?.error || 'Save failed')
      }
      addNotification('success', 'Ustawienia zapisane', 'Twoje preferencje zostały zapisane.')
      await logEvent('settings_saved', {
        newsletter: newsletterSettings,
        marketing: marketingSettings
      })
    } catch (e) {
      console.error('saveSettingsToAPI error:', e)
      addNotification('error', 'Błąd zapisu', 'Nie udało się zapisać ustawień.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Quote actions
  function handlePreviewQuote(q: ClientQuote) {
    setSelectedQuote(q)
    setShowQuotePreviewModal(true)
  }

  async function handleDownloadPDF(q: ClientQuote) {
    try {
      await generateQuotePDF({
        area: q.area,
        floorSystem: q.floor_system,
        substrateCondition: q.substrate_condition,
        location: q.location,
        decorativeSystem: q.decorative_system,
        priceRange: { min: q.price_min, max: q.price_max },
        totalMin: q.total_min,
        totalMax: q.total_max
      } as any)
      addNotification('success', 'PDF wygenerowany', 'Pomyślnie wygenerowano plik PDF z wyceną.')
      await logEvent('quote_pdf_generated', { quote_id: q.id })
    } catch (err) {
      console.error('PDF error', err)
      addNotification('error', 'Błąd PDF', 'Nie udało się wygenerować pliku PDF.')
    }
  }

  async function handleDeleteQuote(q: ClientQuote) {
    try {
      if (!confirm('Czy na pewno chcesz usunąć tę wycenę?')) return
      const res = await fetch(`/api/client/quotes/${q.id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Delete failed')
      }
      setQuotes(prev => prev.filter(x => x.id !== q.id))
      addNotification('success', 'Usunięto wycenę', 'Wycena została usunięta.')
      await logEvent('quote_deleted', { quote_id: q.id })
    } catch (e) {
      console.error('delete quote error', e)
      addNotification('error', 'Błąd usuwania', 'Nie udało się usunąć wyceny.')
    }
  }

  function handleRequestConsultation(q: ClientQuote) {
    setSelectedQuote(q)
    setConsultationForm(prev => ({
      ...prev,
      selectedQuoteId: q.id,
      message: prev.message || `Prośba o konsultację do wyceny #${q.id}`
    }))
    setShowConsultationModal(true)
  }

  const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']

  async function loadStatisticsFromAPI() {
    try {
      const res = await fetch('/api/client/statistics', { cache: 'no-store' })
      if (!res.ok) {
        setStatistics(null)
        setTrends(null)
        return
      }
      const data = await res.json().catch(() => ({} as any))
      if (data?.success) {
        setStatistics(data.statistics || null)
        setTrends(data.trends || null)
      } else {
        setStatistics(null)
        setTrends(null)
      }
    } catch (e) {
      console.error('loadStatisticsFromAPI error:', e)
      setStatistics(null)
      setTrends(null)
    }
  }

  // Load booked slots for chosen date
  async function loadBookedSlots(date: string) {
    if (!date) {
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
      return
    }
    try {
      const res = await fetch(`/api/client/consultations?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      const booked = (Array.isArray((data as any)?.booked_slots) ? (data as any).booked_slots : []) as string[]
      const unique = Array.from(new Set(booked)) as string[]
      setBookedSlots(unique as string[])
      setAvailableSlots(DEFAULT_SLOTS.filter((s: string) => !(unique as string[]).includes(s)))
    } catch (e) {
      console.error('loadBookedSlots error:', e)
      setBookedSlots([])
      setAvailableSlots(DEFAULT_SLOTS)
    }
  }

  // Submit client consultation request
  async function handleConsultationSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    try {
      const payload = {
        quote_id: consultationForm.selectedQuoteId || selectedQuote?.id || null,
        preferred_date: consultationForm.preferredDate,
        preferred_time: consultationForm.preferredTime,
        message: consultationForm.message || '',
        service_type: consultationForm.serviceType || 'standard',
        inquiry_type: consultationForm.inquiryType || 'quote_followup'
      }

      if (!payload.preferred_date || !payload.preferred_time) {
        addNotification('warning', 'Brak danych', 'Wybierz datę i godzinę konsultacji.')
        return
      }

      const res = await fetch('/api/client/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Consultation create failed')
      }

      setShowConsultationModal(false)
      setConsultationForm({
        preferredDate: '',
        preferredTime: '',
        message: '',
        serviceType: '',
        inquiryType: '',
        selectedQuoteId: ''
      })
      addNotification('success', 'Wysłano prośbę', 'Twoja prośba o konsultację została przyjęta.')
      await logEvent('consultation_requested', {
        quote_id: payload.quote_id,
        preferred_date: payload.preferred_date,
        preferred_time: payload.preferred_time
      })
      await loadConsultationsFromAPI()
    } catch (err) {
      console.error('handleConsultationSubmit error:', err)
      addNotification('error', 'Błąd konsultacji', 'Nie udało się wysłać prośby o konsultację.')
    }
  }
  
  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      router.replace('/login')
      return
    }
    checkUser()
  }, [isLoaded, user])

  useEffect(() => {
    if (user && profile) {
      // Attach pending homepage quote (saved in sessionStorage) to this account after login
      ;(async () => {
        try {
          await attachPendingQuoteToAccount()
        } catch (e) {
          console.error('Attach pending quote error:', e)
        }
      })()

      loadQuotes()
      loadConsultationsFromAPI()
      loadDocumentsFromAPI()
      loadPhotosFromAPI()
      loadAffiliateFromAPI()
      loadSettingsFromAPI()
      loadStatisticsFromAPI()
      loadEventsFromAPI()
      loadUserProgress() // Load user progress from database
      // Check if 2FA is enabled for this user
      if (profile.two_factor_enabled) {
        setIsTwoFactorEnabled(true)
      }
    }
  }, [user, profile])

  // Renderuj wykres trendów po załadowaniu danych
  useEffect(() => {
    if (!trends || !statsChartRef.current) return
    const ctx = statsChartRef.current.getContext('2d')
    if (!ctx) return

    if (statsChartInstance.current) {
      statsChartInstance.current.destroy()
      statsChartInstance.current = null
    }

    statsChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Powierzchnia (m²)', 'Oszczędności (PLN)', 'Projekty'],
        datasets: [
          {
            label: 'Poprzednie 30 dni',
            data: [
              Number(trends?.previous_period?.square_meters || 0),
              Number(trends?.previous_period?.savings || 0),
              Number(trends?.previous_period?.projects || 0)
            ],
            backgroundColor: 'rgba(148, 163, 184, 0.6)'
          },
          {
            label: 'Obecne 30 dni',
            data: [
              Number(trends?.current_period?.square_meters || 0),
              Number(trends?.current_period?.savings || 0),
              Number(trends?.current_period?.projects || 0)
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.75)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' as const }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    })

    return () => {
      if (statsChartInstance.current) {
        statsChartInstance.current.destroy()
        statsChartInstance.current = null
      }
    }
  }, [trends])

  // Edukacja – uproszczony, estetyczny i responsywny UI w panelu klienta
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${activeSection === 'overview' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
          >
            Przegląd
          </button>
          <button
            onClick={() => setActiveSection('education')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${activeSection === 'education' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
          >
            Edukacja
          </button>
        </div>
        <button
          onClick={() => { setShowNotificationCenter(true); loadEventsFromAPI(); }}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold border border-gray-200"
        >
          🔔 Powiadomienia
        </button>
      </div>
      {/* Hero */}
      {activeSection === 'education' && (
      <section id="education" className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Edukacja</h1>
              <p className="mt-3 text-blue-100 text-lg max-w-2xl">
                Krótkie, zrozumiałe materiały dla Klienta: co się wydarzy, jak się przygotować i jak dbać o posadzkę.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[260px]">
              <div className="text-sm text-blue-100 mb-2">Twój postęp</div>
              <div className="text-3xl font-bold">{overallProgress}%</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="mt-3 text-xs text-blue-100">Postęp zapisywany automatycznie</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtry i wyszukiwarka */}
      <section className="py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Wszystko
            </button>
            {(['journey', 'preparation', 'installation', 'aftercare', 'safety', 'tools'] as Array<
              Exclude<typeof activeCategory, 'all'>
            >).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="max-w-md w-full">
            <input
              type="text"
              value={educationSearch}
              onChange={(e) => setEducationSearch(e.target.value)}
              placeholder="Szukaj w Edukacji..."
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Statystyki klienta */}
      {activeSection === 'overview' && statistics && trends && (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Zakończone projekty</div>
              <div className="text-2xl font-bold text-gray-900">{statistics?.completed_projects ?? 0}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Łączna powierzchnia</div>
              <div className="text-2xl font-bold text-gray-900">{statistics?.total_square_meters ?? 0} m²</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Oszczędności (szac.)</div>
              <div className="text-2xl font-bold text-gray-900">{formatPLN(statistics?.total_savings ?? 0)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Aktualny rabat</div>
              <div className="text-2xl font-bold text-gray-900">{statistics?.current_discount ?? 0}%</div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-4 h-72">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Trendy (ostatnie 30 dni)</h3>
              <div className="text-xs text-gray-600">
                m²: {Number(trends?.square_meters_growth ?? 0)}% • oszczędności: {Number(trends?.savings_growth ?? 0)}% • projekty: {Number(trends?.projects_growth ?? 0)}%
              </div>
            </div>
            <div className="h-56">
              <canvas ref={statsChartRef} />
            </div>
          </div>
        </section>
      )}

      {/* Kafle modułów */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredModules.map((mod: any) => {
            const progress = getModuleProgress(mod.id)
            return (
              <div
                key={mod.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-blue-700/70 font-bold mb-1">
                        {CATEGORY_LABELS[mod.category] || 'Inne'}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{mod.title}</h3>
                      <p className="text-gray-600 mt-2">{mod.description}</p>
                      {mod.estimatedTime && (
                        <div className="text-xs text-gray-500 mt-1">Czas: {mod.estimatedTime}</div>
                      )}
                    </div>
                    <div className="text-right min-w-[90px]">
                      <div className="text-sm text-gray-500">Postęp</div>
                      <div className="font-bold text-gray-900">
                        {progress.count}/{progress.total}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {mod.steps?.length || 0} {mod.steps?.length === 1 ? 'krok' : 'kroki'}
                    </div>
                    <button
                      onClick={() => setActiveGuide(mod.id)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Otwórz
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            Brak wyników. Spróbuj zmienić kategorię lub użyć innego hasła.
          </div>
        )}
      </section>
      )}
      {/* Dane konta klienta */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wyceny */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Twoje wyceny</h2>
                <p className="text-sm text-gray-500">Ostatnio zapisane kalkulacje z kalkulatora</p>
              </div>
              <a href="/valuation" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">+ Nowa wycena</a>
            </div>
            <div className="p-6">
              {quotes && quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.slice(0, 5).map((q) => (
                    <div key={q.id} className="p-4 rounded-lg border bg-gray-50 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{q.area} m² • {q.floor_system}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {q.location} • {q.decorative_system} • {q.substrate_condition}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(q.created_at).toLocaleString('pl-PL')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{q.price_min} - {q.price_max} PLN/m²</div>
                          <div className="text-sm text-gray-700">Razem: {Math.round(q.total_min)} - {Math.round(q.total_max)} PLN</div>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full border
                            ${q.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              q.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              q.status === 'consultation_requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'}">
                            {q.status}
                          </span>
                          <div className="mt-3 flex flex-wrap gap-2 justify-end">
                            <button onClick={() => handlePreviewQuote(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100">Podgląd</button>
                            <button onClick={() => handleDownloadPDF(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50">PDF</button>
                            <button onClick={() => handleRequestConsultation(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50">Konsultacja</button>
                            <button onClick={() => handleDeleteQuote(q)} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-300 text-red-700 hover:bg-red-50">Usuń</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  Brak zapisanych wycen. Użyj kalkulatora, aby dodać pierwszą wycenę.
                </div>
              )}
            </div>
          </div>

          {/* Konsultacje */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Twoje konsultacje</h2>
                <p className="text-sm text-gray-500">Nadchodzące i przeszłe zgłoszenia</p>
              </div>
              <a href="/contact" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Skontaktuj się</a>
            </div>
            <div className="p-6">
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.slice(0, 5).map((c) => (
                    <div key={c.id} className="p-4 rounded-lg border bg-gray-50 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Preferowana data: {c.preferred_date || '-'}</div>
                          <div className="text-sm text-gray-600 mt-1">Godzina: {c.preferred_time || '-'}</div>
                          {c.message && <div className="text-sm text-gray-600 mt-1">Wiadomość: {c.message}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{new Date(c.created_at).toLocaleString('pl-PL')}</div>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full border
                            ${c.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                              c.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              c.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'}">
                            {c.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  Brak konsultacji. Wyślij zapytanie, a skontaktujemy się z Tobą.
                </div>
              )}
            </div>
          </div>

          {/* Dokumenty */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 lg:col-span-1">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Dokumenty</h2>
              <p className="text-sm text-gray-500">Pliki udostępnione dla Twojego konta</p>
            </div>
            <div className="p-6">
              {documents && documents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {documents.slice(0, 6).map(d => (
                    <li key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{d.title}</div>
                        <div className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString('pl-PL')}</div>
                      </div>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                        Pobierz
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-600 text-sm">Brak dokumentów do wyświetlenia.</div>
              )}
            </div>
          </div>

          {/* Zdjęcia */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 lg:col-span-1">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Zdjęcia projektu</h2>
              <p className="text-sm text-gray-500">Zdjęcia z realizacji przypisane do konta</p>
            </div>
            <div className="p-6">
              {photos && photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.slice(0, 6).map(p => (
                    <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border hover:shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbnail_url || p.url} alt={p.title} className="w-full h-28 object-cover" />
                      <div className="px-2 py-1 text-xs text-gray-700 truncate">{p.title}</div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">Brak zdjęć do wyświetlenia.</div>
              )}
            </div>
          </div>

          {/* Program poleceń */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 lg:col-span-2">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Program poleceń</h2>
              <p className="text-sm text-gray-500">Twój kod i aktualne korzyści</p>
            </div>
            <div className="p-6">
              {affiliate ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Twój kod polecający</div>
                    <div className="text-2xl font-bold tracking-wider">{affiliate.referral_code}</div>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <div className="text-sm text-gray-500">Polecenia</div>
                      <div className="text-xl font-bold">{affiliate.referrals_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Zniżka</div>
                      <div className="text-xl font-bold">{affiliate.discount_percentage}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Punkty</div>
                      <div className="text-xl font-bold">{affiliate.points}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 text-sm">Brak danych programu poleceń.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ustawienia konta */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ustawienia konta</h2>
              <p className="text-sm text-gray-500">{isSettingsLoading ? 'Ładowanie ustawień...' : 'Zarządzaj newsletterem, marketingiem oraz profilem/2FA'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUserProfileModal(true)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold"
              >
                Profil i 2FA
              </button>
              <button
                onClick={saveSettingsToAPI}
                disabled={isSavingSettings}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-semibold"
              >
                {isSavingSettings ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Newsletter */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Newsletter</h3>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsletterSettings.generalNewsletter}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, generalNewsletter: e.target.checked }))} />
                  Ogólny newsletter
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsletterSettings.productUpdates}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, productUpdates: e.target.checked }))} />
                  Aktualizacje produktów
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsletterSettings.promotionalOffers}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, promotionalOffers: e.target.checked }))} />
                  Oferty promocyjne
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsletterSettings.technicalNews}
                    onChange={(e) => setNewsletterSettings(prev => ({ ...prev, technicalNews: e.target.checked }))} />
                  Nowości techniczne
                </label>
              </div>
            </div>

            {/* Marketing */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Marketing</h3>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.analyticsConsent}
                    onChange={(e) =>
                      setMarketingSettings((prev) => ({ ...prev, analyticsConsent: e.target.checked }))
                    }
                  />
                  Zgoda na analitykę
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.marketingEmails}
                    onChange={(e) =>
                      setMarketingSettings((prev) => ({ ...prev, marketingEmails: e.target.checked }))
                    }
                  />
                  Maile marketingowe
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.personalizedAds}
                    onChange={(e) =>
                      setMarketingSettings((prev) => ({ ...prev, personalizedAds: e.target.checked }))
                    }
                  />
                  Spersonalizowane reklamy
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketingSettings.dataSharing}
                    onChange={(e) =>
                      setMarketingSettings((prev) => ({ ...prev, dataSharing: e.target.checked }))
                    }
                  />
                  Zgoda na udostępnianie danych partnerom
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showQuotePreviewModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Podgląd wyceny</h3>
            </div>
            <div className="p-6 space-y-2 text-sm">
              <div><span className="text-gray-500">Powierzchnia:</span> <span className="font-semibold">{selectedQuote.area} m²</span></div>
              <div><span className="text-gray-500">System:</span> <span className="font-semibold">{selectedQuote.floor_system}</span></div>
              <div><span className="text-gray-500">Dekoracja:</span> <span className="font-semibold">{selectedQuote.decorative_system}</span></div>
              <div><span className="text-gray-500">Podłoże:</span> <span className="font-semibold">{selectedQuote.substrate_condition}</span></div>
              <div><span className="text-gray-500">Zakres cen:</span> <span className="font-semibold">{formatPLN(selectedQuote.total_min)} – {formatPLN(selectedQuote.total_max)}</span></div>
            </div>
            <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
              <button onClick={() => handleDownloadPDF(selectedQuote)} className="px-4 py-2 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-semibold">Pobierz PDF</button>
              <button onClick={() => handleRequestConsultation(selectedQuote)} className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold">Poproś o konsultację</button>
              <button onClick={() => setShowQuotePreviewModal(false)} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold">Zamknij</button>
            </div>
          </div>
        </div>
      )}
      
      {showConsultationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <form onSubmit={handleConsultationSubmit}>
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Prośba o konsultację</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
                  <input
                    type="date"
                    value={consultationForm.preferredDate}
                    onChange={(e) => {
                      setConsultationForm({ ...consultationForm, preferredDate: e.target.value })
                      loadBookedSlots(e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godzina*</label>
                  <select
                    value={consultationForm.preferredTime}
                    onChange={(e) => setConsultationForm({ ...consultationForm, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Wybierz godzinę</option>
                    {availableSlots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {bookedSlots.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">Zajęte: {bookedSlots.join(', ')}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
                  <textarea
                    rows={3}
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dodatkowe informacje..."
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowConsultationModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold"
                >
                  Wyślij prośbę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showUserProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Profil i bezpieczeństwo (Clerk)</h3>
              <button
                onClick={() => setShowUserProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="p-2">
              <UserProfile />
            </div>
          </div>
        </div>
      )}
      
      {showNotificationCenter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Centrum powiadomień</h3>
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Notifications */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 font-semibold border-b bg-gray-50">Bieżące powiadomienia</div>
                <div className="max-h-80 overflow-auto divide-y">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900">{n.title}</div>
                          <span className="text-[11px] text-gray-500">{new Date(n.timestamp).toLocaleString('pl-PL')}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                        <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border ${
                          n.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                          n.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                          n.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>{n.type}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">Brak powiadomień.</div>
                  )}
                </div>
              </div>

              {/* Server Event Log */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 font-semibold border-b bg-gray-50 flex items-center justify-between">
                  <span>Dziennik zdarzeń</span>
                  <button onClick={loadEventsFromAPI} className="text-xs text-blue-600 hover:text-blue-800 underline">Odśwież</button>
                </div>
                <div className="max-h-80 overflow-auto divide-y">
                  {isEventsLoading ? (
                    <div className="p-3 text-sm text-gray-500">Ładowanie...</div>
                  ) : clientEvents.length > 0 ? (
                    clientEvents.map(e => (
                      <div key={e.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900">{e.type}</div>
                          <span className="text-[11px] text-gray-500">{new Date(e.created_at).toLocaleString('pl-PL')}</span>
                        </div>
                        {e.details && (
                          <pre className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap break-words">
                            {(() => {
                              try { return JSON.stringify(e.details, null, 2) } catch { return String(e.details) }
                            })()}
                          </pre>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">Brak zdarzeń.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeGuide && (() => {
        const current = [...guides, ...instructions].find((g) => g.id === activeGuide)
        if (!current) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-700/70 font-bold mb-1">
                      {CATEGORY_LABELS[current.category] || 'Inne'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{current.title}</h3>
                    <p className="text-gray-600 mt-2">{current.description}</p>
                  </div>
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    aria-label="Zamknij"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {current.steps?.map((s: any, idx: number) => (
                    <div key={s.id || idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-600 text-white">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{s.title}</h4>
                          <p className="text-gray-700 mt-1">{s.content}</p>
                          {s.additionalInfo && (
                            <div className="mt-2 p-3 bg-white border rounded">
                              <div className="text-sm text-amber-800">
                                <span className="font-semibold">Wskazówka: </span>
                                {s.additionalInfo}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
