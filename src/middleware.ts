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
    '/guide(.*)',
    '/blog(.*)',
    '/valuation(.*)',
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = await auth()
    const path = req.nextUrl.pathname

    // Jeśli użytkownik jest zalogowany i wchodzi na stronę logowania → przekieruj do panelu klienta
    // (musi być przed sprawdzeniem tras publicznych)
    if (userId && path.startsWith('/login')) {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
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
