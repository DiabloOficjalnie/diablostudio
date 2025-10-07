'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { SignIn, SignUp } from '@clerk/nextjs'
import { createClientComponentClient } from '@/lib/supabase'

export default function LoginPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Handle user redirection after authentication
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has a client profile in Supabase
      const checkAndCreateProfile = async () => {
        try {
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
                email: user.primaryEmailAddress?.emailAddress || '',
                phone: user.phoneNumbers[0]?.phoneNumber || null,
                company: null
              })

            if (createProfileError) {
              console.error('Error creating profile:', createProfileError)
            } else {
              router.push('/client/dashboard')
            }
          }
        } catch (error) {
          console.error('Error in profile check:', error)
        }
      }

      checkAndCreateProfile()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Dlaczego warto założyć konto?
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Dołącz do grona zadowolonych klientów i zyskaj dostęp do ekskluzywnych korzyści
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Warranty Status */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Status gwarancji</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Śledź terminy i warunki gwarancji na swoje realizacje w czasie rzeczywistym
                </p>
              </div>

              {/* Project Manager */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Opiekun projektu</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Bezpośredni kontakt z dedykowanym specjalistą przez cały okres współpracy
                </p>
              </div>

              {/* Before/After Photos */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Efekt "przed i po"</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Galeria zdjęć z realizacji Twojego projektu dostępna online
                </p>
              </div>

              {/* Online Documents */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl mr-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Dokumenty online</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Umowy, faktury i dokumentacja w jednym bezpiecznym miejscu
                </p>
              </div>

              {/* Discounts */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-pink-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-pink-100 rounded-xl mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Rabaty</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ekskluzywne zniżki dla stałych klientów i program lojalnościowy
                </p>
              </div>

              {/* Post-warranty Service */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Serwis pogwarancyjny</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Profesjonalne wsparcie techniczne po zakończeniu gwarancji
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">🚀 Rozpocznij swoją podróż z nami</h3>
              <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                Założenie konta to pierwszy krok do profesjonalnej współpracy i dostępu do ekskluzywnych korzyści.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-3 text-xl">✓</span>
                  <span className="text-lg">Bezpieczeństwo i poufność danych</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-3 text-xl">✓</span>
                  <span className="text-lg">Łatwy dostęp do historii projektów</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-3 text-xl">✓</span>
                  <span className="text-lg">Priorytetowe wsparcie klienta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Clerk Authentication */}
          <div className="flex flex-col justify-center">
            <div className="bg-white py-12 px-10 shadow-2xl rounded-3xl border border-gray-100">
              {/* Header */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Logowanie i rejestracja
                </h1>
                <p className="text-gray-600 text-lg">
                  Zaloguj się do swojego konta lub utwórz nowe
                </p>
              </div>

              {/* Clerk Authentication Components */}
              <div className="space-y-8">
                <SignIn
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full',
                      card: 'shadow-none border-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-blue-500 rounded-xl py-4 text-lg font-semibold transition-all duration-300 w-full',
                      formFieldInput: 'px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50 w-full',
                      formFieldLabel: 'text-sm font-semibold text-gray-700 mb-3',
                      footerAction: 'hidden'
                    }
                  }}
                  redirectUrl="/client/dashboard"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">lub</span>
                  </div>
                </div>

                <SignUp
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-5 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full',
                      card: 'shadow-none border-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-green-500 rounded-xl py-4 text-lg font-semibold transition-all duration-300 w-full',
                      formFieldInput: 'px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-lg bg-gray-50 w-full',
                      formFieldLabel: 'text-sm font-semibold text-gray-700 mb-3',
                      footerAction: 'hidden'
                    }
                  }}
                  redirectUrl="/client/dashboard"
                />
              </div>

              {/* Help Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-lg">
                  Potrzebujesz pomocy?{' '}
                  <a href="/contact" className="text-blue-600 hover:text-blue-800 font-semibold underline text-lg">
                    Skontaktuj się z nami
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
