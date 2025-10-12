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

export default clerkMiddleware(async (auth, req) => {
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
        return res
    }

    // Jeśli użytkownik jest zalogowany i wchodzi na stronę logowania → przekieruj do panelu klienta
    // (musi być przed sprawdzeniem tras publicznych)
    if (userId && path.startsWith('/login')) {
        const expired = req.nextUrl.searchParams.get('expired')
        if (expired !== '1') {
            return NextResponse.redirect(new URL('/client/dashboard', req.url))
        }
    }

    // ⚙️ Pomijanie PUBLICZNYCH endpointów API
    if (
        path.startsWith('/api/main-page-data') ||
        path.startsWith('/api/contractor-pricing') ||
        path.startsWith('/api/reviews/public')
    ) {
        return NextResponse.next()
    }

    // ✅ Strony publiczne zawsze dostępne
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // 🕒 Niestandardowe ograniczenie czasu życia sesji (np. max 14 dni)
    const MAX_SESSION_DAYS = 14
    const MAX_SESSION_MS = MAX_SESSION_DAYS * 24 * 60 * 60 * 1000
    const loginAtCookie = req.cookies.get('session_login_at')?.value
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
            return res
        } else {
            const loginAt = parseInt(loginAtCookie, 10)
            if (Number.isFinite(loginAt) && now - loginAt > MAX_SESSION_MS) {
                // Sesja przekroczyła nasz maksymalny czas życia → wyloguj użytkownika (po stronie klienta) i pozwól na ponowne logowanie
                const res = NextResponse.redirect(new URL('/login?expired=1', req.url))
                // Wyczyść nasz znacznik czasu
                res.cookies.set('session_login_at', '', { maxAge: 0, path: '/' })
                return res
            }
        }
    }

    // 🔒 Jeśli użytkownik nie jest zalogowany, a próbuje wejść na chronioną stronę
    if (isProtectedRoute(req) && !userId) {
        // Zamiast domyślnego /sign-in wymuszamy /login, by uniknąć 404
        return NextResponse.redirect(new URL('/login', req.url))
    }

    

    // ✅ Pozwól na dostęp do pozostałych (niechronionych) ścieżek
    return NextResponse.next()
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
