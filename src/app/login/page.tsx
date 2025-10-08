'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { SignIn, SignUp } from '@clerk/nextjs'
import { createClientComponentClient } from '@/lib/supabase'

export default function LoginPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showFullBenefits, setShowFullBenefits] = useState(false)

  // Handle user redirection after authentication
  useEffect(() => {
    if (isLoaded && user) {
      // Check user type and redirect accordingly
      const checkUserTypeAndRedirect = async () => {
        try {
          const email = user.primaryEmailAddress?.emailAddress || ''

          // Check if user is admin based on company email
          const adminEmails = [
            'admin@diablostudio.pl',
            'administrator@diablostudio.pl',
            'biuro@diablostudio.pl',
            'kontakt@diablostudio.pl',
            'office@diablostudio.pl'
          ]

          if (adminEmails.includes(email.toLowerCase())) {
            // User is admin - redirect to admin panel
            router.push('/admin')
          } else {
            // User is client - check/create profile and redirect to client dashboard
            const { data: profile, error: profileError } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile check error:', profileError)
            }

            if (profile) {
              router.push('/client/dashboard')
            } else {
              // Create profile from Clerk user data
              const { error: createProfileError } = await supabase
                .from('client_profiles')
                .insert({
                  id: user.id,
                  first_name: user.firstName || 'Unknown',
                  last_name: user.lastName || 'User',
                  email: email,
                  phone: user.phoneNumbers[0]?.phoneNumber || null,
                  company: null
                })

              if (createProfileError) {
                console.error('Error creating profile:', createProfileError)
              } else {
                router.push('/client/dashboard')
              }
            }
          }
        } catch (error) {
          console.error('Error in user type check:', error)
          // Default to client dashboard on error
          router.push('/client/dashboard')
        }
      }

      checkUserTypeAndRedirect()
    }
  }, [isLoaded, user, router, supabase])

  // Show loading spinner while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Witaj w DiabloStudio
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Zaloguj się do swojego konta lub utwórz nowe
          </p>
        </div>

        {/* Auth Mode Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 mx-auto max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Co chcesz zrobić?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setAuthMode('signin')}
                className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔑 Zalogować się
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✨ Założyć konto
              </button>
            </div>
          </div>

          {/* Authentication Form */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md">
              {authMode === 'signin' ? (
                <SignIn
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full',
                      card: 'shadow-none border-none bg-transparent',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-blue-500 rounded-xl py-3 text-base font-semibold transition-all duration-300 w-full',
                      formFieldInput: 'px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base bg-gray-50 w-full',
                      formFieldLabel: 'text-sm font-semibold text-gray-700 mb-2',
                      footerAction: 'hidden',
                      form: 'bg-transparent p-0'
                    }
                  }}
                />
              ) : (
                <SignUp
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full',
                      card: 'shadow-none border-none bg-transparent',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-green-500 rounded-xl py-3 text-base font-semibold transition-all duration-300 w-full',
                      formFieldInput: 'px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base bg-gray-50 w-full',
                      formFieldLabel: 'text-sm font-semibold text-gray-700 mb-2',
                      footerAction: 'hidden',
                      form: 'bg-transparent p-0'
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section - Collapsible */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Dlaczego warto założyć konto?
            </h2>
            <button
              onClick={() => setShowFullBenefits(!showFullBenefits)}
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg underline"
            >
              {showFullBenefits ? 'Ukryj szczegóły' : 'Zobacz wszystkie korzyści'}
            </button>
          </div>

          {/* Short Benefits Preview */}
          {!showFullBenefits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <span className="text-2xl mb-2 block">📋</span>
                <h3 className="font-semibold text-gray-900">Status gwarancji</h3>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <span className="text-2xl mb-2 block">👨‍💼</span>
                <h3 className="font-semibold text-gray-900">Opiekun projektu</h3>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <span className="text-2xl mb-2 block">📸</span>
                <h3 className="font-semibold text-gray-900">Galeria zdjęć</h3>
              </div>
            </div>
          )}

          {/* Full Benefits Grid */}
          {showFullBenefits && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warranty Status */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">📋</span>
                    <h3 className="text-lg font-bold text-gray-900">Status gwarancji</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Śledź terminy i warunki gwarancji na swoje realizacje w czasie rzeczywistym
                  </p>
                </div>

                {/* Project Manager */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">👨‍💼</span>
                    <h3 className="text-lg font-bold text-gray-900">Opiekun projektu</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Bezpośredni kontakt z dedykowanym specjalistą przez cały okres współpracy
                  </p>
                </div>

                {/* Before/After Photos */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">📸</span>
                    <h3 className="text-lg font-bold text-gray-900">Efekt "przed i po"</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Galeria zdjęć z realizacji Twojego projektu dostępna online
                  </p>
                </div>

                {/* Online Documents */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">📄</span>
                    <h3 className="text-lg font-bold text-gray-900">Dokumenty online</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Umowy, faktury i dokumentacja w jednym bezpiecznym miejscu
                  </p>
                </div>

                {/* Discounts */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">💰</span>
                    <h3 className="text-lg font-bold text-gray-900">Rabaty</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Ekskluzywne zniżki dla stałych klientów i program lojalnościowy
                  </p>
                </div>

                {/* Post-warranty Service */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🔧</span>
                    <h3 className="text-lg font-bold text-gray-900">Serwis pogwarancyjny</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Profesjonalne wsparcie techniczne po zakończeniu gwarancji
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">🚀 Rozpocznij swoją podróż z nami</h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Założenie konta to pierwszy krok do profesjonalnej współpracy i dostępu do ekskluzywnych korzyści.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-2">✓</span>
                    <span className="text-sm">Bezpieczeństwo danych</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-2">✓</span>
                    <span className="text-sm">Historia projektów</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-2">✓</span>
                    <span className="text-sm">Priorytetowe wsparcie</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Potrzebujesz pomocy?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800 font-semibold underline">
              Skontaktuj się z nami
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
