import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/((?!api|_next/static|_next/image|favicon.ico).*)',
])

export default clerkMiddleware((auth, req) => {
  // Don't protect public routes - let them pass through
  // Only protect specific client and admin routes
  if (req.nextUrl.pathname.startsWith('/client') || req.nextUrl.pathname.startsWith('/admin')) {
    auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
