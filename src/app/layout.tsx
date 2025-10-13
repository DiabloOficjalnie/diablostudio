import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl'),
  title: {
    default: 'DecoSol - Profesjonalne Posadzki Żywiczne',
    template: '%s | DecoSol',
  },
  description:
    'Kompleksowe usługi posadzek żywicznych epoksydowych i poliuretanowych. Darmowa wycena online, realizacje, przewodnik i opinie klientów.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DecoSol - Profesjonalne Posadzki Żywiczne',
    description:
      'Kompleksowe usługi posadzek żywicznych epoksydowych i poliuretanowych. Darmowa wycena online, realizacje, przewodnik i opinie klientów.',
    url: '/',
    siteName: 'DecoSol',
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DecoSol - Profesjonalne Posadzki Żywiczne',
    description:
      'Kompleksowe usługi posadzek żywicznych epoksydowych i poliuretanowych. Darmowa wycena online, realizacje, przewodnik i opinie klientów.',
  },
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
      signUpUrl="/login"
      fallbackRedirectUrl="/client/dashboard"
    >
      <html lang="pl">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                  {
                    '@type': 'Organization',
                    name: 'DecoSol',
                    url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl').replace(/\/$/, ''),
                    logo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl').replace(/\/$/, '') + '/assets/hero-header.png',
                  },
                  {
                    '@type': 'WebSite',
                    url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl').replace(/\/$/, ''),
                    name: 'DecoSol - Profesjonalne Posadzki Żywiczne',
                    potentialAction: {
                      '@type': 'SearchAction',
                      target: (process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl').replace(/\/$/, '') + '/search?q={search_term_string}',
                      'query-input': 'required name=search_term_string'
                    }
                  }
                ]
              })
            }}
          />
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-G0KX4ZHEMB'}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-G0KX4ZHEMB'}');`}
          </Script>
        </head>
        <body className={inter.className} suppressHydrationWarning={true}>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
