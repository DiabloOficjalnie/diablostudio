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
    '/contact(.*)',
    '/colors(.*)',
    '/realizations(.*)',
    '/reviews(.*)',
    '/guide(.*)',
    '/blog(.*)',
    '/valuation(.*)',
    '/client/login(.*)',
    '/client/register(.*)',
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth()
    const path = req.nextUrl.pathname

    // ⚙️ Pomijanie PUBLICZNYCH endpointów API
    if (
        path.startsWith('/api/main-page-data') ||
        path.startsWith('/api/contractor-pricing')
    ) {
        return NextResponse.next()
    }

    // ✅ Strony publiczne zawsze dostępne
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // 🔒 Jeśli użytkownik nie jest zalogowany, a próbuje wejść na chronioną stronę
    if (isProtectedRoute(req) && !userId) {
        return redirectToSignIn()
    }

    // 🚫 Jeśli użytkownik jest zalogowany i próbuje wejść na stronę logowania → przekieruj
    if (userId && path.startsWith('/login')) {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
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
