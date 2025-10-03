'use client'

import { useState, useEffect } from 'react'

interface InstructionStep {
  id: number
  title: string
  description: string
  icon: string
  completed: boolean
  active: boolean
}

interface InstructionGuideProps {
  currentStep: number
  totalArea: number
  hasFloorSystem: boolean
  hasSubstrate: boolean
  hasLocation: boolean
  hasDecorative: boolean
  isCalculating: boolean
  hasResults: boolean
}

export default function InstructionGuide({
  currentStep,
  totalArea,
  hasFloorSystem,
  hasSubstrate,
  hasLocation,
  hasDecorative,
  isCalculating,
  hasResults
}: InstructionGuideProps) {
  const [animatedStep, setAnimatedStep] = useState(1)

  useEffect(() => {
    setAnimatedStep(currentStep)
  }, [currentStep])

  const steps: InstructionStep[] = [
    {
      id: 1,
      title: 'Oblicz powierzchnię',
      description: 'Wprowadź wymiary pomieszczeń lub użyj kalkulatora',
      icon: '📏',
      completed: totalArea > 0,
      active: animatedStep === 1
    },
    {
      id: 2,
      title: 'Wybierz rodzaj żywicy',
      description: 'Epoksyd Standard, Premium, Poliuretan Standard lub Premium',
      icon: '🏗️',
      completed: hasFloorSystem,
      active: animatedStep === 2
    },
    {
      id: 3,
      title: 'Określ rodzaj podłoża',
      description: 'Beton, płytki, stara żywica lub inne materiały',
      icon: '🔍',
      completed: hasSubstrate,
      active: animatedStep === 3
    },
    {
      id: 4,
      title: 'Wybierz lokalizację',
      description: 'Wnętrze lub zewnątrz budynku',
      icon: '📍',
      completed: hasLocation,
      active: animatedStep === 4
    },
    {
      id: 5,
      title: 'Wybierz system dekoracyjny',
      description: 'Gładka, cząsteczki, marmur, teksturowana lub przezroczysta',
      icon: '✨',
      completed: hasDecorative,
      active: animatedStep === 5
    },
    {
      id: 6,
      title: 'Oblicz wycenę',
      description: 'Kliknij przycisk aby otrzymać orientacyjną cenę',
      icon: '🧮',
      completed: isCalculating,
      active: animatedStep === 6
    },
    {
      id: 7,
      title: 'Otrzymaj szczegółową wycenę',
      description: 'Podaj dane kontaktowe aby otrzymać PDF z wyceną',
      icon: '📧',
      completed: hasResults,
      active: animatedStep === 7
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Jak korzystać?</h3>
        <p className="text-sm text-gray-600">Postępuj zgodnie z krokami aby otrzymać wycenę</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
              step.active
                ? 'bg-blue-50 border-2 border-blue-200'
                : step.completed
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step.active
                ? 'bg-blue-600 text-white animate-pulse'
                : step.completed
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step.completed ? '✓' : step.id}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{step.icon}</span>
                <h4 className={`font-medium transition-colors duration-300 ${
                  step.active
                    ? 'text-blue-800'
                    : step.completed
                    ? 'text-green-800'
                    : 'text-gray-700'
                }`}>
                  {step.title}
                </h4>
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                step.active
                  ? 'text-blue-600'
                  : step.completed
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}>
                {step.description}
              </p>

              {/* Progress indicator */}
              {step.active && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600 text-lg">💡</span>
          <div>
            <p className="text-sm font-medium text-yellow-800 mb-1">Wskazówka</p>
            <p className="text-xs text-yellow-700">
              {animatedStep === 1 && "Użyj kalkulatora 📏 aby szybko obliczyć powierzchnię pomieszczenia"}
              {animatedStep === 2 && "Kliknij znak ? aby zobaczyć szczegóły każdego rodzaju żywicy"}
              {animatedStep === 3 && "Sprawdź podłoże opukując je młotkiem - nie powinno się kruszyć"}
              {animatedStep === 4 && "Posadzki zewnętrzne wymagają dodatkowej ochrony UV"}
              {animatedStep === 5 && "Efekt marmurowy nadaje się do ekskluzywnych wnętrz"}
              {animatedStep === 6 && "Obliczenie trwa 15 sekund - zobaczysz animację postępu"}
              {animatedStep === 7 && "Otrzymasz szczegółową wycenę PDF w ciągu 24 godzin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
