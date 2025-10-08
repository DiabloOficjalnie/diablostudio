import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
import NavigationHeader from './components/NavigationHeader'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DecoSol - Profesjonalne Posadzki Żywiczne',
  description: 'Kompleksowe usługi posadzek żywicznych epoksydowych i poliuretanowych. Darmowa wycena online, realizacje, przewodnik i opinie klientów.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={plPL}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl="/client/dashboard"
      afterSignUpUrl="/client/dashboard"
    >
      <html lang="pl">
        <body className={inter.className} suppressHydrationWarning={true}>
          <NavigationHeader />
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
