'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { CONTENT, getDecorativeOption, getFloorSystemData } from '@/lib/content'
import generateQuotePDF from '@/lib/pdfGenerator'
import MainLayout from '../components/MainLayout'
import InstructionGuide from './components/InstructionGuide'
import { executeRecaptcha } from '@/lib/recaptcha-client'
import ConsultationRequestForm from '@/app/components/ConsultationRequestForm'

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
    <span className="text-blue-600 font-medium">Obliczamy...</span>
  </div>
)

// Modern Calculation Animation Component
const FloorAnimation = ({ progress, isVisible }: { progress: number; isVisible: boolean }) => {
  if (!isVisible) return null

  const getStageInfo = (progress: number) => {
    if (progress < 25) return {
      icon: CONTENT.CALCULATION_ANIMATION.STAGES.ANALYZING.ICON,
      title: CONTENT.CALCULATION_ANIMATION.STAGES.ANALYZING.TITLE,
      description: CONTENT.CALCULATION_ANIMATION.STAGES.ANALYZING.DESCRIPTION,
      color: "from-blue-500 to-blue-600"
    }
    if (progress < 50) return {
      icon: CONTENT.CALCULATION_ANIMATION.STAGES.MATERIALS.ICON,
      title: CONTENT.CALCULATION_ANIMATION.STAGES.MATERIALS.TITLE,
      description: CONTENT.CALCULATION_ANIMATION.STAGES.MATERIALS.DESCRIPTION,
      color: "from-green-500 to-green-600"
    }
    if (progress < 75) return {
      icon: CONTENT.CALCULATION_ANIMATION.STAGES.PRICING.ICON,
      title: CONTENT.CALCULATION_ANIMATION.STAGES.PRICING.TITLE,
      description: CONTENT.CALCULATION_ANIMATION.STAGES.PRICING.DESCRIPTION,
      color: "from-purple-500 to-purple-600"
    }
    return {
      icon: CONTENT.CALCULATION_ANIMATION.STAGES.FINALIZING.ICON,
      title: CONTENT.CALCULATION_ANIMATION.STAGES.FINALIZING.TITLE,
      description: CONTENT.CALCULATION_ANIMATION.STAGES.FINALIZING.DESCRIPTION,
      color: "from-yellow-500 to-orange-500"
    }
  }

  const stageInfo = getStageInfo(progress)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {CONTENT.CALCULATION_ANIMATION.TITLE}
          </h3>
          <p className="text-gray-600 text-lg">
            {CONTENT.CALCULATION_ANIMATION.DESCRIPTION}
          </p>
        </div>

        {/* Progress Circle */}
        <div className="relative mb-8">
          <div className="w-48 h-48 mx-auto relative">
            {/* Background circle */}
            <div className="w-full h-full rounded-full bg-gray-100"></div>

            {/* Progress circle */}
            <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={`url(#gradient-${progress})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id={`gradient-${progress}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-1">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-gray-500">Gotowe</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Information */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <span className="text-2xl">{stageInfo.icon}</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {stageInfo.title}
          </h4>
          <p className="text-gray-600">
            {stageInfo.description}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${progress > 20 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${progress > 40 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${progress > 60 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${progress > 80 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Info Tooltip Component
const InfoTooltip = ({ content, onClick, children }: { content: string; onClick?: (e: React.MouseEvent) => void; children?: React.ReactNode }) => (
  <div className="group relative inline-block ml-2">
    <button
      onClick={onClick}
      className="text-blue-500 hover:text-blue-700 text-xl font-bold bg-blue-50 hover:bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 shadow-sm"
    >
      {children || '?'}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

// Floor System Modal Component
const FloorSystemModal = ({ system, onClose }: { system: string; onClose: () => void }) => {
  const data = getFloorSystemData(system) || getFloorSystemData('EPOXY_STANDARD')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{data.icon}</span>
              <h3 className="text-2xl font-bold text-gray-800">{data.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Kategoria</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-blue-50">Gdzie się sprawdzi?</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600">{data.gdzieSprawdzi}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-blue-50">Odporność na uszkodzenia</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600">{data.odpornoscUszkodzenia}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-blue-50">Odporność na środki chemiczne</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600">{data.odpornoscChemikalia}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-blue-50">Kolor i światło (UV)</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600">{data.kolorUV}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-blue-50">Warto wiedzieć</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600">{data.wartoWiedziec}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Trust Bar Component
const TrustBar = () => (
  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
    <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">✅</span>
        <span className="font-medium text-green-800">Bezpłatna wycena</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-2xl">⭐</span>
        <span className="font-medium text-green-800">Średnia ocena klientów 4.9/5</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🕒</span>
        <span className="font-medium text-green-800">Odpowiedź w 24h</span>
      </div>
    </div>
  </div>
)

interface PriceRange {
  min: number
  max: number
}

interface DecorativeOption {
  id: string
  name: string
  description: string
  image: string
}

export default function ValuationPage() {
  const { user } = useUser()
  // Initialize state with consistent values for SSR
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showAreaCalculator, setShowAreaCalculator] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showRoomLimitMessage, setShowRoomLimitMessage] = useState(false)
  const [databaseError, setDatabaseError] = useState<string>('')
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [contactPreferences, setContactPreferences] = useState({
    preferredContact: 'ANY',
    preferredTime: 'ANY',
    preferredDays: 'ANY'
  })
  const [consents, setConsents] = useState({
    marketing: false,
    phoneContact: true,
    emailContact: true,
    terms: false,
    privacy: false
  })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [areaCalculator, setAreaCalculator] = useState({
    length: '',
    width: '',
    shape: 'rectangle'
  })
  const [rooms, setRooms] = useState([{ id: 1, area: '', name: 'Pomieszczenie 1' }])
  const [pricingData, setPricingData] = useState<any>(null)

  // Form state
  const [selectedFloorSystem, setSelectedFloorSystem] = useState('')
  const [selectedSubstrate, setSelectedSubstrate] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDecorative, setSelectedDecorative] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [showFloorSystemModal, setShowFloorSystemModal] = useState(false)
  const [activeFloorSystem, setActiveFloorSystem] = useState('')
  const [showAreaNotification, setShowAreaNotification] = useState(false)
  const [showCalculationAnimation, setShowCalculationAnimation] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null)

  const priceRef = useRef<HTMLDivElement>(null)

  // Function to reset form
  const resetForm = () => {
    setPriceRange(null)
    setShowSuccessMessage(false)
    setRooms([{ id: 1, area: '', name: 'Pomieszczenie 1' }])
    setSelectedFloorSystem('')
    setSelectedSubstrate('')
    setSelectedLocation('')
    setSelectedDecorative('')

    // Reset form fields
    const form = document.querySelector('form') as HTMLFormElement
    if (form) {
      form.reset()
    }
  }


  // Load pricing data from database
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const response = await fetch('/api/contractor-pricing')
        if (response.ok) {
          const data = await response.json()
          setPricingData(data.pricing_data)
        } else {
          console.error('Failed to load pricing data')
        }
      } catch (error) {
        console.error('Error loading pricing data:', error)
      }
    }

    loadPricingData()
  }, [])

  const decorativeOptions: DecorativeOption[] = [
    {
      id: 'SMOOTH',
      name: CONTENT.DECORATIVE_OPTIONS.SMOOTH.name,
      description: CONTENT.DECORATIVE_OPTIONS.SMOOTH.description,
      image: '🏠'
    },
    {
      id: 'FLAKES',
      name: CONTENT.DECORATIVE_OPTIONS.FLAKES.name,
      description: CONTENT.DECORATIVE_OPTIONS.FLAKES.description,
      image: '✨'
    },
    {
      id: 'MARBLE',
      name: CONTENT.DECORATIVE_OPTIONS.MARBLE.name,
      description: CONTENT.DECORATIVE_OPTIONS.MARBLE.description,
      image: '🌀'
    },
    {
      id: 'TEXTURED',
      name: CONTENT.DECORATIVE_OPTIONS.TEXTURED.name,
      description: CONTENT.DECORATIVE_OPTIONS.TEXTURED.description,
      image: '🌊'
    },
    {
      id: 'TRANSPARENT',
      name: CONTENT.DECORATIVE_OPTIONS.TRANSPARENT.name,
      description: CONTENT.DECORATIVE_OPTIONS.TRANSPARENT.description,
      image: '💎'
    }
  ]

  const calculatePrice = (area: number, floorSystem: string, decorativeSystem: string, substrateCondition: string, location: string, pricingData?: any): PriceRange => {
    let basePrice = 0

    // Base price per m² based on floor system - use database data if available
    if (pricingData?.material_costs?.resin_types) {
      switch (floorSystem) {
        case 'EPOXY_STANDARD':
          basePrice = pricingData.material_costs.resin_types.epoxy_standard?.cost_per_sqm || 150
          break
        case 'EPOXY_PREMIUM':
          basePrice = pricingData.material_costs.resin_types.epoxy_premium?.cost_per_sqm || 250
          break
        case 'PU_STANDARD':
          basePrice = pricingData.material_costs.resin_types.pu_standard?.cost_per_sqm || 180
          break
        case 'PU_PREMIUM':
          basePrice = pricingData.material_costs.resin_types.pu_premium?.cost_per_sqm || 320
          break
      }
    } else {
      // Fallback to hardcoded values if no database data
      switch (floorSystem) {
        case 'EPOXY_STANDARD':
          basePrice = 150
          break
        case 'EPOXY_PREMIUM':
          basePrice = 250
          break
        case 'PU_STANDARD':
          basePrice = 180
          break
        case 'PU_PREMIUM':
          basePrice = 320
          break
      }
    }

    // Decorative system modifier - use database data if available
    if (pricingData?.material_costs?.decorative_effects) {
      switch (decorativeSystem) {
        case 'MARBLE':
          basePrice += pricingData.material_costs.decorative_effects.marble?.cost_per_sqm || 85
          break
        case 'FLAKES':
          basePrice += pricingData.material_costs.decorative_effects.flakes?.cost_per_sqm || 45
          break
        case 'TRANSPARENT':
          basePrice += pricingData.material_costs.decorative_effects.transparent?.cost_per_sqm || 120
          break
        case 'TEXTURED':
          basePrice += pricingData.material_costs.decorative_effects.textured?.cost_per_sqm || 35
          break
      }
    } else {
      // Fallback to hardcoded values if no database data
      switch (decorativeSystem) {
        case 'MARBLE':
          basePrice += 85
          break
        case 'FLAKES':
          basePrice += 45
          break
        case 'TRANSPARENT':
          basePrice += 120
          break
        case 'TEXTURED':
          basePrice += 35
          break
      }
    }

    // Substrate condition modifier - use database data if available
    if (pricingData?.labor_costs) {
      if (substrateCondition === 'CONCRETE_DEFECTS') {
        basePrice += pricingData.labor_costs.defect_repair?.cost_per_sqm || 55
      }
      if (substrateCondition === 'TILES') {
        basePrice += pricingData.labor_costs.substrate_prep?.cost_per_sqm || 35
      }
      if (substrateCondition === 'OLD_RESIN') {
        basePrice += pricingData.labor_costs.substrate_prep?.cost_per_sqm || 35
      }
      if (substrateCondition === 'OTHER') {
        basePrice += pricingData.labor_costs.substrate_prep?.cost_per_sqm || 35
      }
    } else {
      // Fallback to hardcoded values if no database data
      if (substrateCondition === 'CONCRETE_DEFECTS') {
        basePrice += 55
      }
      if (substrateCondition === 'TILES') {
        basePrice += 35
      }
      if (substrateCondition === 'OLD_RESIN') {
        basePrice += 35
      }
      if (substrateCondition === 'OTHER') {
        basePrice += 35
      }
    }

    // Location modifier
    if (location === 'OUTDOOR') {
      basePrice *= 1.1 // 10% more for outdoor applications
    }

    // Calculate range (±15%)
    const min = Math.round(basePrice * 0.85)
    const max = Math.round(basePrice * 1.15)

    return { min, max }
  }

  const addRoom = () => {
    if (rooms.length >= 10) {
      setShowRoomLimitMessage(true)
      return
    }
    const newRoomNumber = rooms.length + 1
    setRooms([...rooms, { id: Date.now(), area: '', name: `Pomieszczenie ${newRoomNumber}` }])
  }

  const removeRoom = (roomId: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== roomId))
    }
  }

  const updateRoomArea = (roomId: number, area: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId ? { ...room, area } : room
    ))

    // Update the hidden form input immediately
    setTimeout(() => {
      const totalArea = calculateTotalArea()
      const areaInputs = document.querySelectorAll('input[name="area"]') as NodeListOf<HTMLInputElement>
      areaInputs.forEach((areaInput) => {
        if (areaInput instanceof HTMLInputElement && !isNaN(totalArea) && totalArea > 0) {
          areaInput.value = totalArea.toString()
          // Trigger form validation update
          areaInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
    }, 0)
  }

  const calculateTotalArea = () => {
    const total = rooms.reduce((total, room) => {
      const area = parseFloat(room.area) || 0
      return total + area
    }, 0)
    console.log('Calculated total area:', total, 'rooms:', rooms)
    return total
  }

  const hasValidArea = () => {
    return calculateTotalArea() > 0
  }

  const hasAllRequiredFields = () => {
    return hasValidArea() &&
           selectedFloorSystem &&
           selectedSubstrate &&
           selectedLocation &&
           selectedDecorative
  }

  const calculateArea = () => {
    const length = parseFloat(areaCalculator.length)
    const width = parseFloat(areaCalculator.width)

    if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
      alert('Wprowadź poprawne wymiary')
      return
    }

    const area = length * width

    // Update the first room's area input (visible field)
    if (rooms.length > 0) {
      const updatedRooms = [...rooms]
      updatedRooms[0] = { ...updatedRooms[0], area: area.toString() }
      setRooms(updatedRooms)
    }

    // Update all hidden area inputs for form validation
    const areaInputs = document.querySelectorAll('input[name="area"]') as NodeListOf<HTMLInputElement>
    areaInputs.forEach((areaInput) => {
      if (areaInput instanceof HTMLInputElement) {
        areaInput.value = area.toString()
        // Trigger form validation
        areaInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    setShowAreaCalculator(false)
  }

  const handleRadioClick = (fieldName: string, value: string, currentValue: string, setValue: (value: string) => void) => {
    if (currentValue === value) {
      // If clicking the same radio button that's already selected, deselect it
      setValue('')
    } else {
      // Select the new value
      setValue(value)
    }
  }



  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== FORM SUBMISSION DEBUG ===')
    console.log('Room areas:', rooms.map(r => ({ name: r.name, area: r.area })))

    const totalArea = calculateTotalArea()
    console.log('Calculated total area:', totalArea)

    // Use React state instead of DOM queries for better reliability
    const floorSystem = selectedFloorSystem
    const substrateCondition = selectedSubstrate
    const location = selectedLocation
    const decorativeSystem = selectedDecorative

    console.log('Form values:', { totalArea, floorSystem, substrateCondition, location, decorativeSystem })

    // Check if all required fields are filled
    if (!totalArea || totalArea <= 0) {
      setShowAreaNotification(true)
      return
    }

    if (!floorSystem || !substrateCondition || !location || !decorativeSystem) {
      setShowAreaNotification(true)
      return
    }

    // Start loading state
    setIsCalculating(true)
    setShowSuccessMessage(false)
    setShowCalculationAnimation(true)
    setCalculationProgress(0)

    // Animate progress from 0 to 100 over 15 seconds
    const duration = 15000 // 15 seconds
    const steps = 100
    const stepDuration = duration / steps

    let currentStep = 0
    const progressInterval = setInterval(() => {
      currentStep++
      const progress = Math.min((currentStep / steps) * 100, 100)
      setCalculationProgress(progress)

      if (currentStep >= steps) {
        clearInterval(progressInterval)

        // Calculate final price using database pricing data
        const calculatedPrice = calculatePrice(totalArea, floorSystem, decorativeSystem, substrateCondition, location, pricingData)
        console.log('Calculated price:', calculatedPrice)

        setPriceRange(calculatedPrice)
        setShowSuccessMessage(true)
        setIsCalculating(false)
        setShowCalculationAnimation(false)
        setCalculationProgress(0)

        // Show price modal after calculation
        setTimeout(() => {
          setShowPriceModal(true)
        }, 500)
      }
    }, stepDuration)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Get current form values
      const currentArea = calculateTotalArea()
      const currentFloorSystem = selectedFloorSystem
      const currentDecorativeSystem = selectedDecorative
      const currentLocation = selectedLocation
      const currentSubstrate = selectedSubstrate

      console.log('Current form values:', {
        area: currentArea,
        floorSystem: currentFloorSystem,
        decorativeSystem: currentDecorativeSystem,
        location: currentLocation,
        substrate: currentSubstrate,
        priceRange
      })

      if (!currentArea || currentArea <= 0) {
        setShowAreaNotification(true)
        return
      }

      if (!currentFloorSystem || !currentDecorativeSystem || !currentLocation || !currentSubstrate) {
        setShowAreaNotification(true)
        return
      }

  // Check if user is logged in (Clerk)
  // Using Clerk user from useUser()
  const token = await executeRecaptcha(user ? 'client_quotes' : 'customer_quotes')

      if (user) {
        // User is logged in - save to client account
        console.log('User is logged in, saving to client account:', user.id)

        const clientQuoteData = {
          area: currentArea,
          floorSystem: currentFloorSystem,
          substrateCondition: currentSubstrate,
          location: currentLocation,
          decorativeSystem: currentDecorativeSystem,
          priceMin: priceRange?.min || 0,
          priceMax: priceRange?.max || 0,
          totalMin: (priceRange?.min || 0) * currentArea,
          totalMax: (priceRange?.max || 0) * currentArea,
          contactPreferences,
          consents
        }

        console.log('Sending client quote to API (authenticated flow):', clientQuoteData)

        const response = await fetch('/api/client/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientQuoteData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Błąd podczas zapisywania wyceny')
        }

        console.log('Client quote saved successfully:', result)

        // Open unified consultation modal with the newly created quote
        const newId = result?.id || result?.data?.id || null
        if (newId) {
          setCreatedQuoteId(newId)
          setShowConsultationModal(true)
        }

        setShowContactForm(false)
        setContactData({ name: '', email: '', phone: '' })
      } else {
        // User is not logged in - save as anonymous customer
        console.log('User is not logged in, saving as anonymous customer')

        const requestData = {
          customerData: {
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone || null
          },
          quoteData: {
            area: currentArea,
            floorSystem: currentFloorSystem,
            substrateCondition: currentSubstrate,
            location: currentLocation,
            decorativeSystem: currentDecorativeSystem,
            priceMin: priceRange?.min || 0,
            priceMax: priceRange?.max || 0,
            totalMin: (priceRange?.min || 0) * currentArea,
            totalMax: (priceRange?.max || 0) * currentArea
          },
          contactPreferences,
          consents,
          recaptchaToken: token,
        }

        console.log('Sending anonymous quote to API:', requestData)

        const response = await fetch('/api/customer-quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Błąd podczas zapisywania danych')
        }

        console.log('Anonymous quote saved successfully:', result)

        alert('Dziękujemy! Skontaktujemy się z Państwem w ciągu 24 godzin z szczegółową wyceną PDF.')
        setShowContactForm(false)
        setContactData({ name: '', email: '', phone: '' })
      }
    } catch (error: any) {
      console.error('Error saving data:', error)
      setDatabaseError(error.message)

      // Show user-friendly error message
      if (error.message.includes('reset') || error.message.includes('connection')) {
        alert(`Baza danych jest chwilowo niedostępna. Proszę poczekać chwilę i spróbować ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z nami bezpośrednio.`)
      } else {
        alert(`Wystąpił błąd podczas zapisywania danych: ${error.message}`)
      }
    }
  }

  // Calculate current step for instruction guide
  const getCurrentStep = () => {
    if (!hasValidArea()) return 1
    if (!selectedFloorSystem) return 2
    if (!selectedSubstrate) return 3
    if (!selectedLocation) return 4
    if (!selectedDecorative) return 5
    if (isCalculating) return 6
    if (priceRange) return 7
    return 1
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {CONTENT.MAIN_TITLE}
            <span className="block text-blue-300">{CONTENT.MAIN_SUBTITLE}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Otrzymaj profesjonalną wycenę dostosowaną do Twoich potrzeb.
            Nasz kalkulator uwzględni wszystkie czynniki wpływające na ostateczny koszt.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 sm:pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Instruction Guide */}
          <div className="lg:col-span-1">
            <InstructionGuide
              currentStep={getCurrentStep()}
              totalArea={calculateTotalArea()}
              hasFloorSystem={!!selectedFloorSystem}
              hasSubstrate={!!selectedSubstrate}
              hasLocation={!!selectedLocation}
              hasDecorative={!!selectedDecorative}
              isCalculating={isCalculating}
              hasResults={!!priceRange}
            />
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-8">
                {/* Area */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="form-label">
                      Powierzchnia (m²) *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
                      >
                        🔄 Resetuj
                      </button>
                      <button
                        type="button"
                        onClick={addRoom}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                      >
                        + Dodaj pomieszczenie
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {rooms.map((room, index) => (
                      <div key={room.id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-700">{room.name}</span>
                            {rooms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRoom(room.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                🗑️ Usuń
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.1"
                              className="form-input flex-1"
                              value={room.area}
                              onChange={(e) => {
                                const value = e.target.value
                                updateRoomArea(room.id, value)
                              }}
                              placeholder="np. 25"
                              suppressHydrationWarning={true}
                            />
                            <button
                              type="button"
                              onClick={() => setShowAreaCalculator(true)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-lg font-medium min-w-[50px]"
                            >
                              📏
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <span className="font-medium text-blue-800">
                        Łączna powierzchnia: {calculateTotalArea().toFixed(2)} m²
                      </span>
                    </div>
                  </div>

                  {/* Hidden area input for form validation */}
                  <input
                    type="hidden"
                    name="area"
                    value={calculateTotalArea().toString()}
                  />
                </div>

              {/* Floor System Selection */}
              <div>
                <label className="form-label">
                  Rodzaj żywicy *
                  <InfoTooltip content="Wybierz odpowiedni rodzaj żywicy w zależności od warunków użytkowania">
                    ℹ️
                  </InfoTooltip>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(CONTENT.FLOOR_SYSTEMS).map(([key, system]) => (
                    <label
                      key={key}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFloorSystem === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="floorSystem"
                        value={key}
                        checked={selectedFloorSystem === key}
                        onChange={() => setSelectedFloorSystem(key)}
                        className="sr-only"
                        required
                      />
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{system.ICON}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{system.NAME}</h3>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setActiveFloorSystem(key)
                                setShowFloorSystemModal(true)
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                              Szczegóły →
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{system.DESCRIPTION}</p>
                          <div className="text-lg font-bold text-green-600">
                            od {system.PRICE} PLN/m²
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Substrate Condition */}
              <div>
                <label className="form-label">
                  Stan podłoża *
                  <InfoTooltip content="Wybierz stan podłoża, na którym będzie układana posadzka">
                    ℹ️
                  </InfoTooltip>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(CONTENT.SUBSTRATE_CONDITIONS).map(([key, substrate]) => (
                    <label
                      key={key}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSubstrate === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="substrateCondition"
                        value={key}
                        checked={selectedSubstrate === key}
                        onChange={() => setSelectedSubstrate(key)}
                        className="sr-only"
                        required
                      />
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{substrate.ICON}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{substrate.NAME}</h3>
                          <p className="text-sm text-gray-600">{substrate.DESCRIPTION}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="form-label">
                  Lokalizacja *
                  <InfoTooltip content="Czy posadzka będzie układana wewnątrz czy na zewnątrz budynku">
                    ℹ️
                  </InfoTooltip>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(CONTENT.LOCATIONS).map(([key, location]) => (
                    <label
                      key={key}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLocation === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="location"
                        value={key}
                        checked={selectedLocation === key}
                        onChange={() => setSelectedLocation(key)}
                        className="sr-only"
                        required
                      />
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{location.ICON}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{location.NAME}</h3>
                          <p className="text-sm text-gray-600">{location.DESCRIPTION}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Decorative System */}
              <div>
                <label className="form-label">
                  System dekoracyjny *
                  <InfoTooltip content="Wybierz wykończenie dekoracyjne posadzki">
                    ℹ️
                  </InfoTooltip>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {decorativeOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedDecorative === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decorativeSystem"
                        value={option.id}
                        checked={selectedDecorative === option.id}
                        onChange={() => setSelectedDecorative(option.id)}
                        className="sr-only"
                        required
                      />
                      <div className="text-center">
                        <div className="text-3xl mb-2">{option.image}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={!hasAllRequiredFields() || isCalculating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl py-4 px-12 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCalculating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <LoadingSpinner />
                        <span>Obliczanie wyceny...</span>
                      </div>
                    ) : (
                      '🚀 Oblicz wycenę'
                    )}
                  </button>

                  {!hasAllRequiredFields() && (
                    <p className="text-sm text-gray-500 mt-3">
                      Wypełnij wszystkie pola oznaczone * aby obliczyć wycenę
                    </p>
                  )}
                </div>
              </form>

                {/* Contact Form Modal */}
                {showContactForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold mb-2">
                            {CONTENT.CONTACT_FORM.TITLE}
                          </h3>
                          <p className="text-blue-100">
                            {CONTENT.CONTACT_FORM.SUBTITLE}
                          </p>
                        </div>
                      </div>

                      {/* Contact Form Content */}
                      <div className="p-8">
                        <form onSubmit={handleContactSubmit} className="space-y-6">
                          {/* Basic Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="form-label">
                                {CONTENT.CONTACT_FORM.NAME_LABEL}
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={contactData.name}
                                onChange={(e) => setContactData({...contactData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="form-label">
                                {CONTENT.CONTACT_FORM.EMAIL_LABEL}
                              </label>
                              <input
                                type="email"
                                className="form-input"
                                value={contactData.email}
                                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="form-label">
                              {CONTENT.CONTACT_FORM.PHONE_LABEL}
                            </label>
                            <input
                              type="tel"
                              className="form-input"
                              value={contactData.phone}
                              onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                            />
                          </div>

                          {/* Contact Preferences */}
                          <div className="space-y-4">
                            <div>
                              <label className="form-label">
                                {CONTENT.CONTACT_FORM.PREFERRED_CONTACT}
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {Object.entries(CONTENT.CONTACT_FORM.CONTACT_OPTIONS).map(([key, value]) => (
                                  <label key={key} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                      type="radio"
                                      name="preferredContact"
                                      value={key}
                                      checked={contactPreferences.preferredContact === key}
                                      onChange={(e) => setContactPreferences({...contactPreferences, preferredContact: e.target.value})}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium">{value}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="form-label">
                                  {CONTENT.CONTACT_FORM.CONTACT_TIME}
                                </label>
                                <div className="space-y-2">
                                  {Object.entries(CONTENT.CONTACT_FORM.TIME_OPTIONS).map(([key, value]) => (
                                    <label key={key} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="preferredTime"
                                        value={key}
                                        checked={contactPreferences.preferredTime === key}
                                        onChange={(e) => setContactPreferences({...contactPreferences, preferredTime: e.target.value})}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-sm">{value}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="form-label">
                                  {CONTENT.CONTACT_FORM.CONTACT_DAYS}
                                </label>
                                <div className="space-y-2">
                                  {Object.entries(CONTENT.CONTACT_FORM.DAY_OPTIONS).map(([key, value]) => (
                                    <label key={key} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="preferredDays"
                                        value={key}
                                        checked={contactPreferences.preferredDays === key}
                                        onChange={(e) => setContactPreferences({...contactPreferences, preferredDays: e.target.value})}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-sm">{value}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Consents */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="font-semibold text-gray-800 mb-4">Zgody i regulaminy *</h4>

                            <div className="space-y-3">
                              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consents.marketing}
                                  onChange={(e) => setConsents({...consents, marketing: e.target.checked})}
                                  className="w-4 h-4 text-blue-600 mt-0.5"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {CONTENT.CONTACT_FORM.CONSENTS.MARKETING.LABEL}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {CONTENT.CONTACT_FORM.CONSENTS.MARKETING.DESCRIPTION}
                                  </div>
                                </div>
                              </label>

                              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consents.phoneContact}
                                  onChange={(e) => setConsents({...consents, phoneContact: e.target.checked})}
                                  className="w-4 h-4 text-blue-600 mt-0.5"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {CONTENT.CONTACT_FORM.CONSENTS.PHONE_CONTACT.LABEL}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {CONTENT.CONTACT_FORM.CONSENTS.PHONE_CONTACT.DESCRIPTION}
                                  </div>
                                </div>
                              </label>

                              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consents.emailContact}
                                  onChange={(e) => setConsents({...consents, emailContact: e.target.checked})}
                                  className="w-4 h-4 text-blue-600 mt-0.5"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {CONTENT.CONTACT_FORM.CONSENTS.EMAIL_CONTACT.LABEL}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {CONTENT.CONTACT_FORM.CONSENTS.EMAIL_CONTACT.DESCRIPTION}
                                  </div>
                                </div>
                              </label>

                              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consents.terms}
                                  onChange={(e) => setConsents({...consents, terms: e.target.checked})}
                                  className="w-4 h-4 text-blue-600 mt-0.5"
                                  required
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {CONTENT.CONTACT_FORM.CONSENTS.TERMS.LABEL}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {CONTENT.CONTACT_FORM.CONSENTS.TERMS.DESCRIPTION}
                                  </div>
                                </div>
                              </label>

                              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consents.privacy}
                                  onChange={(e) => setConsents({...consents, privacy: e.target.checked})}
                                  className="w-4 h-4 text-blue-600 mt-0.5"
                                  required
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {CONTENT.CONTACT_FORM.CONSENTS.PRIVACY.LABEL}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {CONTENT.CONTACT_FORM.CONSENTS.PRIVACY.DESCRIPTION}
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>


                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                              type="submit"
                              disabled={!consents.terms || !consents.privacy}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {CONTENT.CONTACT_FORM.SUBMIT_BUTTON}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowContactForm(false)
                                setContactSubmitted(false)
                              }}
                              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Anuluj
                            </button>
                          </div>
                        </form>

                        {/* Success Message */}
                        {contactSubmitted && (
                          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h4 className="text-xl font-bold text-green-800 mb-2">
                              {CONTENT.CONTACT_FORM.SUCCESS_TITLE}
                            </h4>
                            <p className="text-green-700 mb-6">
                              {CONTENT.CONTACT_FORM.SUCCESS_MESSAGE}
                            </p>
                            <button
                              onClick={() => {
                                setShowContactForm(false)
                                setContactSubmitted(false)
                                resetForm()
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                              {CONTENT.CONTACT_FORM.SUCCESS_BUTTON}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={() => {
                          setShowContactForm(false)
                          setContactSubmitted(false)
                        }}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

              {/* Area Calculator Modal */}
              {showAreaCalculator && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Kalkulator Powierzchni 📏
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">Długość (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          value={areaCalculator.length}
                          onChange={(e) => setAreaCalculator({...areaCalculator, length: e.target.value})}
                          placeholder="np. 10"
                        />
                      </div>
                      <div>
                        <label className="form-label">Szerokość (m)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          value={areaCalculator.width}
                          onChange={(e) => setAreaCalculator({...areaCalculator, width: e.target.value})}
                          placeholder="np. 5"
                        />
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        Powierzchnia: {areaCalculator.length && areaCalculator.width ?
                          `${(parseFloat(areaCalculator.length) * parseFloat(areaCalculator.width)).toFixed(2)} m²` :
                          '0.00 m²'
                        }
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={calculateArea}
                          className="btn-primary flex-1 text-lg py-3"
                        >
                          Oblicz
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAreaCalculator(false)}
                          className="btn-secondary flex-1 text-lg py-3"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Room Limit Modal */}
              {showRoomLimitMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 w-full max-w-lg mx-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                      Skontaktuj się z nami po bezpłatną wycenę! 📞
                    </h3>
                    <p className="text-gray-600 mb-6 text-center">
                      Skontaktuj się z nami po bezpłatną wycenę stworzoną przez jednego z naszych ekspertów, pozostaw swoje dane, oddzwonimy.
                    </p>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="form-label">Imię i nazwisko *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={contactData.name}
                          onChange={(e) => setContactData({...contactData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          value={contactData.email}
                          onChange={(e) => setContactData({...contactData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label">Telefon</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={contactData.phone}
                          onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button type="submit" disabled={false} className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
                          Wyślij - Oddzwonimy!
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRoomLimitMessage(false)}
                          className="btn-secondary flex-1"
                        >
                          Zamknij
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Beautiful Price Modal */}
              {showPriceModal && priceRange && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
                      <div className="text-center">
                        <div className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-full text-lg font-semibold mb-4">
                          <span className="text-3xl mr-2">🎉</span>
                          {CONTENT.PRICE_MODAL.SUCCESS_MESSAGE}
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-4xl font-bold text-gray-800 mb-3">
                          {CONTENT.PRICE_MODAL.PRICE_TITLE}
                        </h3>

                        {/* Main Price Display */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8 border border-blue-200">
                          <div className="text-6xl font-bold text-blue-600 mb-3">
                            {priceRange.min} - {priceRange.max} PLN/m²
                          </div>
                          <div className="text-2xl text-gray-600 mb-6">
                            {CONTENT.PRICE_MODAL.TOTAL_COST} {Math.round(priceRange.min * calculateTotalArea())} - {Math.round(priceRange.max * calculateTotalArea())} PLN
                          </div>

                          {/* Trust Elements */}
                          <div className="flex flex-wrap justify-center items-center gap-4 text-sm mb-6">
                            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-full shadow-sm border border-green-200">
                              <span className="text-2xl">✅</span>
                              <span className="font-medium text-green-800">{CONTENT.PRICE_MODAL.TRUST_ELEMENTS.FREE_QUOTE}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-full shadow-sm border border-green-200">
                              <span className="text-2xl">⭐</span>
                              <span className="font-medium text-green-800">{CONTENT.PRICE_MODAL.TRUST_ELEMENTS.RATING}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-full shadow-sm border border-green-200">
                              <span className="text-2xl">🕒</span>
                              <span className="font-medium text-green-800">{CONTENT.PRICE_MODAL.TRUST_ELEMENTS.RESPONSE_TIME}</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                            {CONTENT.PRICE_MODAL.PRICE_DISCLAIMER}
                          </p>
                        </div>

                        {/* Account Options - NEW SECTION */}
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-orange-200">
                          {user ? (
                            <div className="text-center">
                              <h4 className="text-xl font-bold text-gray-800 mb-2">✅ Jesteś zalogowany</h4>
                              <p className="text-gray-700">
                                Po wysłaniu formularza wyceny zostanie ona zapisana w Twoim panelu klienta.
                              </p>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                💾 Zapisz wycenę na koncie klienta
                              </h4>
                              <p className="text-gray-600 text-center mb-6">
                                Zaloguj się lub zarejestruj, aby zapisać tę wycenę i móc zamawiać konsultacje.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <a
                                  href="/login"
                                  onClick={() => {
                                    sessionStorage.setItem('pendingQuote', JSON.stringify({
                                      area: calculateTotalArea(),
                                      floorSystem: selectedFloorSystem,
                                      substrateCondition: selectedSubstrate,
                                      location: selectedLocation,
                                      decorativeSystem: selectedDecorative,
                                      priceRange: priceRange
                                    }))
                                  }}
                                  className="flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
                                >
                                  <span className="text-2xl mr-3">👤</span>
                                  <div className="text-center">
                                    <div className="font-bold">Mam konto</div>
                                    <div className="text-sm opacity-90">Zaloguj się</div>
                                  </div>
                                </a>

                                <a
                                  href="/login"
                                  onClick={() => {
                                    sessionStorage.setItem('pendingQuote', JSON.stringify({
                                      area: calculateTotalArea(),
                                      floorSystem: selectedFloorSystem,
                                      substrateCondition: selectedSubstrate,
                                      location: selectedLocation,
                                      decorativeSystem: selectedDecorative,
                                      priceRange: priceRange
                                    }))
                                  }}
                                  className="flex items-center justify-center px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
                                >
                                  <span className="text-2xl mr-3">✨</span>
                                  <div className="text-center">
                                    <div className="font-bold">Nowe konto</div>
                                    <div className="text-sm opacity-90">Zarejestruj się</div>
                                  </div>
                                </a>
                              </div>

                              <div className="text-center">
                                <button
                                  onClick={() => setShowPriceModal(false)}
                                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                                >
                                  Kontynuuj bez konta →
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={async () => {
                              try {
                                const quoteData = {
                                  area: calculateTotalArea(),
                                  floorSystem: selectedFloorSystem,
                                  substrateCondition: selectedSubstrate,
                                  location: selectedLocation,
                                  decorativeSystem: selectedDecorative,
                                  priceRange: priceRange,
                                  totalMin: priceRange.min * calculateTotalArea(),
                                  totalMax: priceRange.max * calculateTotalArea(),
                                  customerName: contactData.name || undefined,
                                  customerEmail: contactData.email || undefined,
                                  customerPhone: contactData.phone || undefined
                                }

                                await generateQuotePDF(quoteData)
                              } catch (error) {
                                console.error('Error generating PDF:', error)
                                alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.')
                              }
                            }}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            📄 Pobierz PDF
                          </button>
                          <button
                            onClick={() => {
                              setShowPriceModal(false)
                              setShowContactForm(true)
                            }}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            📧 Wyślij do Eksperta
                          </button>
                          <button
                            onClick={() => {
                              setShowPriceModal(false)
                              resetForm()
                            }}
                            className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            {CONTENT.PRICE_MODAL.NEW_QUOTE_BUTTON}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowPriceModal(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Floor System Modal */}
              {showFloorSystemModal && (
                <FloorSystemModal
                  system={activeFloorSystem}
                  onClose={() => setShowFloorSystemModal(false)}
                />
              )}

              {/* Modern Calculation Animation */}
              <FloorAnimation
                progress={calculationProgress}
                isVisible={showCalculationAnimation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Zaloguj się do konta</h2>
              <p className="text-gray-600">Zaloguj się, aby zapisać wycenę i móc zamawiać konsultacje</p>
            </div>

            <div className="space-y-4 mb-8">
              <Link
                href="/login"
                onClick={() => {
                  setShowLoginModal(false)
                  // Store current quote data for after login
                  sessionStorage.setItem('pendingQuote', JSON.stringify({
                    area: calculateTotalArea(),
                    floorSystem: selectedFloorSystem,
                    substrateCondition: selectedSubstrate,
                    location: selectedLocation,
                    decorativeSystem: selectedDecorative,
                    priceRange: priceRange
                  }))
                }}
                className="block w-full p-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-3">👤</span>
                  <span className="text-xl">Zaloguj się jako klient</span>
                </div>
                <p className="text-sm opacity-90">Mam już konto - zaloguj się</p>
              </Link>

              <Link
                href="/admin/login"
                onClick={() => setShowLoginModal(false)}
                className="block w-full p-4 bg-gray-600 hover:bg-gray-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-3">👨‍💼</span>
                  <span className="text-xl">Administrator</span>
                </div>
                <p className="text-sm opacity-90">Panel zarządzania</p>
              </Link>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal (authenticated flow after saving quote) */}
      {showConsultationModal && user && createdQuoteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Prośba o konsultację</h3>
            </div>
            <ConsultationRequestForm
              quoteId={createdQuoteId}
              onClose={() => setShowConsultationModal(false)}
              onSubmitted={() => {
                alert('Wysłano prośbę o konsultację.')
                setShowConsultationModal(false)
              }}
              className="pt-0"
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Utwórz konto klienta</h2>
              <p className="text-gray-600">Zarejestruj się, aby zapisać wycenę i móc zamawiać konsultacje</p>
            </div>

            <div className="space-y-4 mb-8">
              <Link
                href="/login"
                onClick={() => {
                  setShowRegisterModal(false)
                  // Store current quote data for after registration
                  sessionStorage.setItem('pendingQuote', JSON.stringify({
                    area: calculateTotalArea(),
                    floorSystem: selectedFloorSystem,
                    substrateCondition: selectedSubstrate,
                    location: selectedLocation,
                    decorativeSystem: selectedDecorative,
                    priceRange: priceRange
                  }))
                }}
                className="block w-full p-4 bg-green-600 hover:bg-green-700 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-3">✨</span>
                  <span className="text-xl">Utwórz konto klienta</span>
                </div>
                <p className="text-sm opacity-90">Zarejestruj się i zapisz wycenę</p>
              </Link>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
