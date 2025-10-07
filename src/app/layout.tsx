import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiabloStudio - Profesjonalne Posadzki Żywiczne',
  description: 'Kompleksowe usługi posadzek żywicznych epoksydowych i poliuretanowych. Darmowa wycena online, realizacje, przewodnik i opinie klientów.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body className={inter.className} suppressHydrationWarning={true}>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
