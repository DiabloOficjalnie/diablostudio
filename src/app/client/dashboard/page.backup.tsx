'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useUser, useAuth, useClerk, UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
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
  const [quizAttempts, setQuizAttempts] = useState<{[key: string]: number}>({})
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<{[key: string]: boolean}>({})
  const [userGuideProgress, setUserGuideProgress] = useState<{[key: string]: {step: number, completed: boolean, quizResults: any}}>({})
  
  // Edukacja: kategorie zgodne stylistycznie ze stroną główną
  const [activeCategory, setActiveCategory] = useState<'all' | 'journey' | 'preparation' | 'installation' | 'aftercare' | 'safety' | 'tools'>('all')
  const [educationSearch, setEducationSearch] = useState('')

  const CATEGORY_LABELS: Record<string, string> = {
    journey: 'Proces współpracy',
    preparation: 'Przygotowanie',
    installation: 'Realizacja',
    aftercare: 'Po realizacji',
    safety: 'Bezpieczeństwo',
    tools: 'Narzędzia'
  }

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
      loadUserProgress() // Load user progress from database
      // Check if 2FA is enabled for this user
      if (profile.two_factor_enabled) {
        setIsTwoFactorEnabled(true)
      }
