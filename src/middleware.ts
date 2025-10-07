import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/client(.*)',
  '/admin(.*)',
])

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
  '/api/main-page-data(.*)',
  '/api/contractor-pricing(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Get the user ID without throwing errors
  const { userId } = await auth()

  // If user is not signed in and trying to access protected route
  if (isProtectedRoute(req) && !userId) {
    // Redirect to sign-in page with return URL
    const signInUrl = new URL('/login', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If user is signed in and trying to access login page, redirect to dashboard
  if (userId && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/client/dashboard', req.url))
  }

  // Allow access to public routes for everyone
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For all other routes, proceed normally
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
