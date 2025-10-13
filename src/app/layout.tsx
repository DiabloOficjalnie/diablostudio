import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { plPL } from '@clerk/localizations'
import './globals.css'
import { Suspense } from 'react'
import GoogleAnalyticsReporter from './components/GoogleAnalyticsReporter'
import GoogleTagManagerReporter from './components/GoogleTagManagerReporter'

const inter = Inter({ subsets: ['latin'] })

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

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
      signInFallbackRedirectUrl="/client/dashboard"
      signUpFallbackRedirectUrl="/client/dashboard"
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
          {GTM_ID ? (
            <>
              <Script id="gtm-init" strategy="beforeInteractive">
                {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
              </Script>
            </>
          ) : GA_ID ? (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
              <Script id="ga4-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
              </Script>
            </>
          ) : null}
        </head>
        <body className={inter.className} suppressHydrationWarning={true}>
          {GTM_ID ? (
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
              }}
            />
          ) : null}
          {children}
          <Suspense fallback={null}>
            {GTM_ID ? <GoogleTagManagerReporter /> : <GoogleAnalyticsReporter />}
          </Suspense>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
