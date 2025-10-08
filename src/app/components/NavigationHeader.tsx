"use client"

import Link from 'next/link'
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'

export default function NavigationHeader() {
  const { user, isLoaded } = useUser()
  const [userType, setUserType] = useState<'client' | 'admin' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Hide global NavigationHeader on app panels that have their own header/layout
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/client')) {
    return null
  }

  useEffect(() => {
    const checkUserType = async () => {
      if (!isLoaded || !user) {
        setUserType(null)
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClientComponentClient()
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
          setUserType('admin')
        } else {
          // Check if user has client profile
          const { data: profile } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            setUserType('client')
          } else {
            // Create client profile for new user
            await supabase
              .from('client_profiles')
              .insert({
                id: user.id,
                first_name: user.firstName || 'Unknown',
                last_name: user.lastName || 'User',
                email: email,
                phone: user.phoneNumbers[0]?.phoneNumber || null,
                company: null
              })
            setUserType('client')
          }
        }
      } catch (error) {
        console.error('Error checking user type:', error)
        setUserType('client') // Default to client on error
      } finally {
        setIsLoading(false)
      }
    }

    checkUserType()
  }, [isLoaded, user])

  if (!isLoaded || isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                DecoSol
              </Link>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DecoSol
            </Link>
            <div className="ml-3 text-sm text-gray-600 font-medium">
              Piękno zaklęte w żywicy
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
              >
                🔑 Logowanie
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center space-x-4">
                {userType === 'admin' ? (
                  <Link
                    href="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    👑 Panel administratora
                  </Link>
                ) : (
                  <Link
                    href="/client/dashboard"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    👤 Panel klienta
                  </Link>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10'
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}
