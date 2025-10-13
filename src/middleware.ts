import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 🔒 Ścieżki chronione (wymagają logowania)
const isProtectedRoute = createRouteMatcher([
  '/client(.*)',
  '/admin(.*)',
])

// 🔓 Ścieżki publiczne (dostępne bez logowania)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/admin/login(.*)',
  '/client/login(.*)',
  '/contact(.*)',
  '/colors(.*)',
  '/realizations(.*)',
  '/reviews(.*)',
  '/edukacja(.*)',
  '/blog(.*)',
  '/valuation(.*)',
])

/**
 * Zastosuj twarde nagłówki bezpieczeństwa w odpowiedzi (uzupełniające do next.config.js headers()).
 * Dodajemy też X-Robots-Tag=noindex,nofollow na trasach chronionych.
 */
function applySecurityHeaders(req: Request, res: NextResponse) {
  // Cross-origin isolation bez ryzyka blokad (COOP/CORP). COEP pomijamy aby nie blokować zasobów zewnętrznych.
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  // Nie indeksuj części chronionych
  const url = new URL(req.url)
  if (url.pathname.startsWith('/client') || url.pathname.startsWith('/admin')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return res
}

/**
 * Wymuszenie HTTPS na produkcji (ochrona przed downgrade attack).
 * Działa jeśli za proxy (Vercel/Cloudflare) — używa x-forwarded-proto.
 */
function enforceHttpsIfNeeded(req: Request) {
  const isProd = process.env.NODE_ENV === 'production'
  if (!isProd) return null

  const url = new URL(req.url)
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
  const host = url.hostname

  const isLocalhost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local')

  if (!isLocalhost && proto !== 'https') {
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }
  return null
}

export default clerkMiddleware(async (auth, req) => {
  // 1) Wymuś HTTPS na produkcji
  const httpsRedirect = enforceHttpsIfNeeded(req)
  if (httpsRedirect) {
    return applySecurityHeaders(req, httpsRedirect)
  }

  const { userId, redirectToSignIn } = await auth()
  const path = req.nextUrl.pathname

  // 🎯 Referral cookie capture (?ref=CODE) → zapisz cookie i usuń parametr z URL
  const ref = req.nextUrl.searchParams.get('ref')
  if (ref) {
    const url = req.nextUrl.clone()
    url.searchParams.delete('ref')
    const res = NextResponse.redirect(url)
    res.cookies.set('referral_code', ref, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 rok
    })
    return applySecurityHeaders(req, res)
  }

  // Jeśli użytkownik jest zalogowany i wchodzi na stronę logowania → przekieruj do panelu klienta
  // (musi być przed sprawdzeniem tras publicznych)
  if (userId && path.startsWith('/login')) {
    const expired = req.nextUrl.searchParams.get('expired')
    if (expired !== '1') {
      const res = NextResponse.redirect(new URL('/client/dashboard', req.url))
      return applySecurityHeaders(req, res)
    }
  }

  // ⚙️ Pomijanie PUBLICZNYCH endpointów API
  if (
    path.startsWith('/api/main-page-data') ||
    path.startsWith('/api/contractor-pricing') ||
    path.startsWith('/api/reviews/public')
  ) {
    return applySecurityHeaders(req, NextResponse.next())
  }

  // ✅ Strony publiczne zawsze dostępne
  if (isPublicRoute(req)) {
    return applySecurityHeaders(req, NextResponse.next())
  }

  // 🕒 Niestandardowe ograniczenie czasu życia sesji (np. max 14 dni)
  const MAX_SESSION_DAYS = 14
  const MAX_SESSION_MS = MAX_SESSION_DAYS * 24 * 60 * 60 * 1000
  const loginAtCookie = req.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('session_login_at='))?.split('=')[1]
  const now = Date.now()

  if (userId && isProtectedRoute(req)) {
    if (!loginAtCookie) {
      // Ustaw znacznik czasu pierwszego zalogowania do sesji
      const res = NextResponse.next()
      res.cookies.set('session_login_at', String(now), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      })
      return applySecurityHeaders(req, res)
    } else {
      const loginAt = parseInt(loginAtCookie, 10)
      if (Number.isFinite(loginAt) && now - loginAt > MAX_SESSION_MS) {
        // Sesja przekroczyła nasz maksymalny czas życia → wyloguj użytkownika (po stronie klienta) i pozwól na ponowne logowanie
        const res = NextResponse.redirect(new URL('/login?expired=1', req.url))
        // Wyczyść nasz znacznik czasu
        res.cookies.set('session_login_at', '', { maxAge: 0, path: '/' })
        return applySecurityHeaders(req, res)
      }
    }
  }

  // 🔒 Jeśli użytkownik nie jest zalogowany, a próbuje wejść na chronioną stronę
  if (isProtectedRoute(req) && !userId) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    return applySecurityHeaders(req, res)
  }

  // ✅ Pozwól na dostęp do pozostałych (niechronionych) ścieżek
  return applySecurityHeaders(req, NextResponse.next())
})

// 🧩 Middleware nie obejmuje plików statycznych i Next.js internals
export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
  ],
}
