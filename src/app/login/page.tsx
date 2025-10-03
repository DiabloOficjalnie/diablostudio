'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'

export default function ClientLoginPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: ''
  })
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
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Nieprawidłowy email lub hasło')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Konto nie zostało jeszcze potwierdzone. Sprawdź swoją skrzynkę email.')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if user has a client profile
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError)
        }

        if (profile) {
          // Check if there's a pending quote to save
          const pendingQuote = sessionStorage.getItem('pendingQuote')
          if (pendingQuote) {
            try {
              const quoteData = JSON.parse(pendingQuote)
              console.log('Found pending quote, saving to account:', quoteData)

              // Save the quote to the user's account
              const response = await fetch('/api/client-quotes', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  clientId: data.user.id,
                  quoteData: {
                    area: quoteData.area,
                    floorSystem: quoteData.floorSystem,
                    substrateCondition: quoteData.substrateCondition,
                    location: quoteData.location,
                    decorativeSystem: quoteData.decorativeSystem,
                    priceMin: quoteData.priceRange?.min || 0,
                    priceMax: quoteData.priceRange?.max || 0,
                    totalMin: (quoteData.priceRange?.min || 0) * quoteData.area,
                    totalMax: (quoteData.priceRange?.max || 0) * quoteData.area
                  }
                }),
              })

              if (response.ok) {
                console.log('Pending quote saved successfully')
                sessionStorage.removeItem('pendingQuote')
                alert('Wycena została zapisana w Twoim koncie!')
              } else {
                console.error('Failed to save pending quote')
              }
            } catch (error) {
              console.error('Error saving pending quote:', error)
            }
          }

          router.push('/client/dashboard')
        } else {
          // Profile doesn't exist, create it automatically
          console.log('Profile not found, creating automatically...')
          const { error: createProfileError } = await supabase
            .from('client_profiles')
            .insert({
              id: data.user.id,
              first_name: data.user.user_metadata?.first_name || 'Unknown',
              last_name: data.user.user_metadata?.last_name || 'User',
              email: formData.email,
              phone: data.user.user_metadata?.phone || null,
              company: data.user.user_metadata?.company || null
            })

          if (createProfileError) {
            console.error('Error creating profile:', createProfileError)
            setError('Konto istnieje, ale nie udało się utworzyć profilu klienta. Skontaktuj się z administratorem.')
          } else {
            console.log('Profile created successfully')
            router.push('/client/dashboard')
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('Wystąpił błąd podczas logowania')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      setLoading(false)
      return
    }

    // Consent validation
    if (!consents.rodo) {
      setError('Musisz zaakceptować przetwarzanie danych osobowych (RODO)')
      setLoading(false)
      return
    }

    if (!consents.communication) {
      setError('Musisz zaakceptować kontakt telefoniczny i e-mailowy')
      setLoading(false)
      return
    }

    if (!consents.terms) {
      setError('Musisz zaakceptować regulamin świadczenia usług oraz politykę prywatności')
      setLoading(false)
      return
    }

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            company: formData.company
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Konto z tym adresem email już istnieje')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (!authData.session) {
          // Email confirmation required
          setError('Konto zostało utworzone! Sprawdź swoją skrzynkę email i kliknij w link potwierdzający, aby aktywować konto. Dopiero wtedy będziesz mógł się zalogować.')
          return
        }

        // User is confirmed, create client profile
        const { error: profileError } = await supabase
          .from('client_profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            company: formData.company || null
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Even if profile creation fails, allow login since auth was successful
          setError('Konto zostało utworzone pomyślnie! Zaloguj się, aby kontynuować.')
          setTimeout(() => {
            setIsSignUp(false)
            setFormData({...formData, password: '', confirmPassword: ''})
          }, 3000)
        } else {
          // Save consent data to database
          const consentPromises = []

          if (consents.rodo) {
            consentPromises.push(
              supabase.from('client_consents').insert({
                client_id: authData.user.id,
                consent_type: 'rodo',
                consent_given: true,
                consent_ip: '127.0.0.1', // In production, get real IP
                consent_user_agent: navigator.userAgent
              })
            )
          }

          if (consents.marketing) {
            consentPromises.push(
              supabase.from('client_consents').insert({
                client_id: authData.user.id,
                consent_type: 'marketing',
                consent_given: true,
                consent_ip: '127.0.0.1', // In production, get real IP
                consent_user_agent: navigator.userAgent
              })
            )
          }

          if (consents.communication) {
            consentPromises.push(
              supabase.from('client_consents').insert({
                client_id: authData.user.id,
                consent_type: 'communication',
                consent_given: true,
                consent_ip: '127.0.0.1', // In production, get real IP
                consent_user_agent: navigator.userAgent
              })
            )
          }

          if (consents.terms) {
            consentPromises.push(
              supabase.from('client_consents').insert({
                client_id: authData.user.id,
                consent_type: 'terms',
                consent_given: true,
                consent_ip: '127.0.0.1', // In production, get real IP
                consent_user_agent: navigator.userAgent
              })
            )
          }

          // Execute all consent saves
          if (consentPromises.length > 0) {
            try {
              await Promise.all(consentPromises)
              console.log('All consents saved successfully')
            } catch (consentError) {
              console.error('Error saving consents:', consentError)
              // Don't fail registration if consent saving fails
            }
          }

          setSuccess('Konto zostało utworzone pomyślnie! Za chwilę zostaniesz przekierowany do panelu klienta.')
          setTimeout(() => {
            router.push('/client/dashboard')
          }, 2000)
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError('Wystąpił błąd podczas rejestracji')
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess('Link do resetowania hasła został wysłany na Twój adres email. Sprawdź swoją skrzynkę pocztową.')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError(error.message || 'Wystąpił błąd podczas wysyłania emaila resetującego')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Benefits (same as registration) */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dlaczego warto założyć konto?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Dołącz do grona zadowolonych klientów i zyskaj dostęp do ekskluzywnych korzyści
              </p>
            </div>

            {/* Benefits Grid (same as registration) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Warranty Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Status gwarancji</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Śledź terminy i warunki gwarancji na swoje realizacje
                </p>
              </div>

              {/* Project Manager */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <span className="text-xl">👨‍💼</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Opiekun projektu</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Bezpośredni kontakt z dedykowanym specjalistą
                </p>
              </div>

              {/* Before/After Photos */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <span className="text-xl">📸</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Efekt "przed i po"</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Galeria zdjęć z realizacji Twojego projektu
                </p>
              </div>

              {/* Online Documents */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Dokumenty online</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Umowy, faktury i dokumentacja w jednym miejscu
                </p>
              </div>

              {/* Discounts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-pink-100 rounded-lg mr-3">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Rabaty</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Ekskluzywne zniżki dla stałych klientów
                </p>
              </div>

              {/* Post-warranty Service */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <span className="text-xl">🔧</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Serwis pogwarancyjny</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Profesjonalne wsparcie techniczne po zakończeniu gwarancji
                </p>
              </div>
            </div>

            {/* Additional Info (same as registration) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🚀 Rozpocznij swoją podróż z nami</h3>
              <p className="text-blue-100 mb-4">
                Założenie konta to pierwszy krok do profesjonalnej współpracy i dostępu do ekskluzywnych korzyści.
              </p>
              <div className="flex items-center text-sm">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Bezpieczeństwo i poufność danych</span>
              </div>
              <div className="flex items-center text-sm mt-1">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Łatwy dostęp do historii projektów</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Utwórz konto klienta' : 'Logowanie klienta'}
                </h1>
                  <p className="text-gray-600">
                    {isSignUp
                      ? 'Zarejestruj się, aby uzyskać dostęp do panelu klienta'
                      : 'Zaloguj się do swojego konta, aby zarządzać wycenami'
                    }
                  </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={isSignUp ? handleSignUp : handleLogin}>
                {isSignUp && (
                  <>
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imię *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nazwisko *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                        placeholder="np. 123 456 789"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma (opcjonalne)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                        placeholder="Nazwa firmy"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    required
                    placeholder="twoj@email.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasło *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    required
                    minLength={6}
                    placeholder="Wprowadź hasło"
                  />
                </div>

                {/* Confirm Password - Only for signup */}
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potwierdź hasło *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      required
                      minLength={6}
                      placeholder="Potwierdź hasło"
                    />
                  </div>
                )}

                {/* Forgot Password Link - Only for login */}
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Zapomniałeś hasła?
                    </button>
                  </div>
                )}

                {/* Consents Section - Only for signup */}
                {isSignUp && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Zgody i regulamin</h3>

                    {/* RODO Consent */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="rodo"
                        checked={consents.rodo}
                        onChange={(e) => setConsents({...consents, rodo: e.target.checked})}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="rodo" className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium">Wyrażam zgodę na przetwarzanie danych osobowych</span> zgodnie z RODO.
                        Administratorem danych jest DiabloStudio. Dane będą przetwarzane w celu realizacji usług
                        posadzek żywicznych oraz kontaktu związanego z realizacją projektu.
                      </label>
                    </div>

                    {/* Marketing Consent */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={consents.marketing}
                        onChange={(e) => setConsents({...consents, marketing: e.target.checked})}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium">Wyrażam zgodę na otrzymywanie informacji marketingowych</span>
                        o nowych usługach, promocjach i aktualnościach firmy DiabloStudio
                        (newsletter, SMS, powiadomienia push).
                      </label>
                    </div>

                    {/* Communication Consent */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="communication"
                        checked={consents.communication}
                        onChange={(e) => setConsents({...consents, communication: e.target.checked})}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="communication" className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium">Wyrażam zgodę na kontakt telefoniczny i e-mailowy</span>
                        w sprawach związanych z realizacją usług, konsultacjami oraz
                        przekazywaniem informacji o statusie projektu.
                      </label>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={consents.terms}
                        onChange={(e) => setConsents({...consents, terms: e.target.checked})}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-medium">Akceptuję regulamin świadczenia usług</span> oraz
                        <a href="/regulamin" className="text-blue-600 hover:text-blue-800 underline ml-1">
                          politykę prywatności
                        </a>
                        firmy DiabloStudio.
                      </label>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isSignUp ? 'Tworzenie konta...' : 'Logowanie...'}</span>
                    </div>
                  ) : (
                    isSignUp ? 'Utwórz konto' : 'Zaloguj się'
                  )}
                </button>
              </form>

              {/* Toggle SignUp/Login - More Prominent */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-2xl mr-3">{isSignUp ? '📝' : '🔑'}</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isSignUp ? 'Tworzenie nowego konta' : 'Logowanie do konta'}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {isSignUp
                      ? 'Wypełnij formularz poniżej, aby utworzyć nowe konto klienta'
                      : 'Wprowadź swoje dane logowania, aby uzyskać dostęp do konta'
                    }
                  </p>

                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-800 font-semibold rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="mr-2 text-lg">{isSignUp ? '🔑' : '📝'}</span>
                    {isSignUp
                      ? 'Przejdź do logowania'
                      : 'Utwórz nowe konto'
                    }
                  </button>
                </div>
              </div>

              {/* Help Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Potrzebujesz pomocy?{' '}
                  <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
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

  // Forgot Password Modal
  if (isForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Resetowanie hasła</h2>
            <p className="text-gray-600">
              Wprowadź swój adres email, aby otrzymać link resetujący hasło
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                required
                placeholder="twoj@email.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Wysyłanie...</span>
                </div>
              ) : (
                'Wyślij link resetujący'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsForgotPassword(false)
                setError('')
                setSuccess('')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Powrót do logowania
            </button>
          </div>
        </div>
      </div>
    )
  }
}
