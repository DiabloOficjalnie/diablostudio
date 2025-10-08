'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { useSignIn } from '@clerk/nextjs'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('m.mejza@proton.me')
  const [password, setPassword] = useState('32rfdaseh8923@#*(')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { isLoaded, signIn, setActive } = useSignIn()

  // Debug function to test database connection
  const testDatabaseConnection = async () => {
    try {
      setDebugInfo('Testing database connection...')

      // Test basic connection
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('count')
        .limit(1)

      if (customersError) {
        setDebugInfo(`Database error: ${customersError.message}`)
        return
      }

      // Test admin users table with specific user ID
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1)

      if (adminError) {
        setDebugInfo(`Admin table error: ${adminError.message}`)
        return
      }

      setDebugInfo(`Database OK. Found ${adminData?.length || 0} admin users`)
    } catch (error: any) {
      setDebugInfo(`Connection error: ${error.message}`)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!isLoaded) {
        throw new Error('Usługa logowania nie jest gotowa. Spróbuj ponownie za chwilę.')
      }

      // Clerk password auth
      const result = await signIn.create({
        identifier: email,
        password
      })

      if (result.status === 'complete') {
        // Activate Clerk session
        await setActive({ session: result.createdSessionId })

        // Optional: development/local flags used elsewhere in app
        try {
          localStorage.setItem('admin_session', 'true')
          localStorage.setItem('admin_user_email', email)
        } catch {}

        router.push('/admin')
        return
      }

      // If not complete, show generic error
      setError('Nie udało się zakończyć logowania. Spróbuj ponownie.')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.errors?.[0]?.message || err?.message || 'Wystąpił błąd podczas logowania')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Admin Benefits */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Panel Administratora
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Zaloguj się, aby zarządzać platformą i obsługiwać klientów
              </p>
            </div>

            {/* Admin Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Client Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <span className="text-xl">👥</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Zarządzanie klientami</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Pełny dostęp do danych klientów i ich zgód
                </p>
              </div>

              {/* Quote Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Wyceny klientów</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Przeglądaj i zarządzaj wycenami użytkowników
                </p>
              </div>

              {/* Content Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Zarządzanie treścią</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Edytuj zawartość strony i informacje firmowe
                </p>
              </div>

              {/* Reviews Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <span className="text-xl">⭐</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Opinie klientów</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Moderuj i publikuj opinie od klientów
                </p>
              </div>

              {/* Realizations */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-pink-100 rounded-lg mr-3">
                    <span className="text-xl">🏠</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Realizacje</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Zarządzaj galerią realizacji i projektów
                </p>
              </div>

              {/* Analytics */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Statystyki</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Monitoruj aktywność i wydajność platformy
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🔐 Bezpieczny dostęp</h3>
              <p className="text-blue-100 mb-4">
                Panel administratora zapewnia pełną kontrolę nad platformą z zachowaniem najwyższych standardów bezpieczeństwa.
              </p>
              <div className="flex items-center text-sm">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Pełne uprawnienia administracyjne</span>
              </div>
              <div className="flex items-center text-sm mt-1">
                <span className="text-yellow-300 mr-2">✓</span>
                <span>Zaawansowane narzędzia zarządzania</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Logowanie administratora
                </h1>
                <p className="text-gray-600">
                  Zaloguj się do panelu administratora
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email administratora *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    required
                    placeholder="admin@diablostudio.pl"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasło *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                    required
                    placeholder="Wprowadź hasło administratora"
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
                      <span>Logowanie...</span>
                    </div>
                  ) : (
                    'Zaloguj się do panelu'
                  )}
                </button>
              </form>

              {/* Debug Section */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
                <button
                  type="button"
                  onClick={testDatabaseConnection}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Test Database Connection
                </button>
                {debugInfo && (
                  <p className="text-xs text-gray-600 mt-2">{debugInfo}</p>
                )}
              </div>

              {/* Admin Access Info */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Nie masz konta administratora?
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Skontaktuj się z super administratorem w celu uzyskania dostępu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
