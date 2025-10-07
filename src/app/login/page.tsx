'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth, SignIn } from '@clerk/nextjs'
import { createClientComponentClient } from '@/lib/supabase'

export default function ClientLoginPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: ''
  })
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [consents, setConsents] = useState({
    rodo: false,
    marketing: false,
    communication: false,
    terms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

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
              setError('Konto zostało utworzone, ale nie udało się utworzyć profilu klienta. Skontaktuj się z administratorem.')
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

  // Handle profile creation after Clerk authentication
  const handleCreateProfile = async (userData: any) => {
    try {
      // Create client profile in Supabase
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          id: userData.id,
          first_name: userData.firstName || formData.firstName,
          last_name: userData.lastName || formData.lastName,
          email: userData.primaryEmailAddress?.emailAddress || formData.email,
          phone: userData.phoneNumbers?.[0]?.phoneNumber || formData.phone || null,
          company: formData.company || null
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        setError('Konto zostało utworzone, ale nie udało się utworzyć profilu klienta.')
        return false
      }

      // Save consent data if provided
      if (consents.rodo || consents.marketing || consents.communication || consents.terms) {
        const consentPromises = []

        if (consents.rodo) {
          consentPromises.push(
            supabase.from('client_consents').insert({
              client_id: userData.id,
              consent_type: 'rodo',
              consent_given: true,
              consent_ip: '127.0.0.1',
              consent_user_agent: navigator.userAgent
            })
          )
        }

        if (consents.marketing) {
          consentPromises.push(
            supabase.from('client_consents').insert({
              client_id: userData.id,
              consent_type: 'marketing',
              consent_given: true,
              consent_ip: '127.0.0.1',
              consent_user_agent: navigator.userAgent
            })
          )
        }

        if (consents.communication) {
          consentPromises.push(
            supabase.from('client_consents').insert({
              client_id: userData.id,
              consent_type: 'communication',
              consent_given: true,
              consent_ip: '127.0.0.1',
              consent_user_agent: navigator.userAgent
            })
          )
        }

        if (consents.terms) {
          consentPromises.push(
            supabase.from('client_consents').insert({
              client_id: userData.id,
              consent_type: 'terms',
              consent_given: true,
              consent_ip: '127.0.0.1',
              consent_user_agent: navigator.userAgent
            })
          )
        }

        try {
          await Promise.all(consentPromises)
          console.log('All consents saved successfully')
        } catch (consentError) {
          console.error('Error saving consents:', consentError)
        }
      }

      return true
    } catch (error) {
      console.error('Error in profile creation:', error)
      return false
    }
  }

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
                  {isSignUp ? 'Utwórz konto klienta' : 'Logowanie klienta'}
                </h1>
                <p className="text-gray-600 text-lg">
                  {isSignUp
                    ? 'Zarejestruj się, aby uzyskać dostęp do panelu klienta'
                    : 'Zaloguj się do swojego konta, aby zarządzać wycenami'
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-lg font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-green-600 text-lg font-medium">{success}</p>
                </div>
              )}

              {/* Clerk Sign In/Sign Up Forms */}
              <div className="space-y-8">
                {isSignUp ? (
                  <div className="space-y-6">
                    {/* Additional fields for registration */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Imię *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50"
                          placeholder="Wprowadź imię"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nazwisko *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50"
                          placeholder="Wprowadź nazwisko"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50"
                        placeholder="np. 123 456 789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Firma (opcjonalne)
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50"
                        placeholder="Nazwa firmy"
                      />
                    </div>

                    {/* Consents Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Zgody i regulamin</h3>

                      {/* RODO Consent */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="rodo"
                          checked={consents.rodo}
                          onChange={(e) => setConsents({...consents, rodo: e.target.checked})}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          required
                        />
                        <label htmlFor="rodo" className="text-gray-700 leading-relaxed cursor-pointer">
                          <span className="font-semibold text-gray-900">Wyrażam zgodę na przetwarzanie danych osobowych</span> zgodnie z RODO.
                          Administratorem danych jest DiabloStudio. Dane będą przetwarzane w celu realizacji usług
                          posadzek żywicznych oraz kontaktu związanego z realizacją projektu.
                        </label>
                      </div>

                      {/* Marketing Consent */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="marketing"
                          checked={consents.marketing}
                          onChange={(e) => setConsents({...consents, marketing: e.target.checked})}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="marketing" className="text-gray-700 leading-relaxed cursor-pointer">
                          <span className="font-semibold text-gray-900">Wyrażam zgodę na otrzymywanie informacji marketingowych</span>
                          o nowych usługach, promocjach i aktualnościach firmy DiabloStudio
                          (newsletter, SMS, powiadomienia push).
                        </label>
                      </div>

                      {/* Communication Consent */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="communication"
                          checked={consents.communication}
                          onChange={(e) => setConsents({...consents, communication: e.target.checked})}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="communication" className="text-gray-700 leading-relaxed cursor-pointer">
                          <span className="font-semibold text-gray-900">Wyrażam zgodę na kontakt telefoniczny i e-mailowy</span>
                          w sprawach związanych z realizacją usług, konsultacjami oraz
                          przekazywaniem informacji o statusie projektu.
                        </label>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={consents.terms}
                          onChange={(e) => setConsents({...consents, terms: e.target.checked})}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          required
                        />
                        <label htmlFor="terms" className="text-gray-700 leading-relaxed cursor-pointer">
                          <span className="font-semibold text-gray-900">Akceptuję regulamin świadczenia usług</span> oraz
                          <a href="/regulamin" className="text-blue-600 hover:text-blue-800 underline ml-1 font-semibold">
                            politykę prywatności
                          </a>
                          firmy DiabloStudio.
                        </label>
                      </div>
                    </div>

                    {/* Custom Sign Up Button */}
                    <button
                      onClick={async () => {
                        if (!consents.rodo || !consents.terms) {
                          setError('Musisz zaakceptować wymagane zgody')
                          return
                        }

                        setLoading(true)
                        setError('')

                        try {
                          // Handle registration with additional data
                          const success = await handleCreateProfile({
                            id: 'temp',
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            primaryEmailAddress: { emailAddress: formData.email },
                            phoneNumbers: formData.phone ? [{ phoneNumber: formData.phone }] : []
                          })

                          if (success) {
                            setSuccess('Konto zostało utworzone pomyślnie! Za chwilę zostaniesz przekierowany.')
                            setTimeout(() => {
                              router.push('/client/dashboard')
                            }, 2000)
                          }
                        } catch (error) {
                          setError('Wystąpił błąd podczas tworzenia konta')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading || !formData.firstName || !formData.lastName}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none text-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Tworzenie konta...</span>
                        </div>
                      ) : (
                        'Utwórz konto'
                      )}
                    </button>
                  </div>
                ) : (
                  /* Login Form */
                  <div className="space-y-6">
                    <SignIn
                      appearance={{
                        elements: {
                          formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300',
                          card: 'shadow-none border-none',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-blue-500 rounded-xl py-4 text-lg font-semibold transition-all duration-300',
                          formFieldInput: 'px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg bg-gray-50',
                          formFieldLabel: 'text-sm font-semibold text-gray-700 mb-3',
                          footerAction: 'hidden'
                        }
                      }}
                      redirectUrl="/client/dashboard"
                    />
                  </div>
                )}
              </div>

              {/* Toggle SignUp/Login */}
              <div className="mt-10 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-3xl mr-4">{isSignUp ? '📝' : '🔑'}</span>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isSignUp ? 'Tworzenie nowego konta' : 'Logowanie do konta'}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {isSignUp
                      ? 'Wypełnij formularz poniżej, aby utworzyć nowe konto klienta z dodatkowymi korzyściami'
                      : 'Wprowadź swoje dane logowania, aby uzyskać dostęp do konta'
                    }
                  </p>

                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="inline-flex items-center px-8 py-4 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-800 font-bold rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl text-lg"
                  >
                    <span className="mr-3 text-2xl">{isSignUp ? '🔑' : '📝'}</span>
                    {isSignUp
                      ? 'Przejdź do logowania'
                      : 'Utwórz nowe konto'
                    }
                  </button>
                </div>
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
