// Temporarily disable middleware to fix 500 error
export default function middleware() {
  // Middleware disabled - Clerk authentication will be handled by components
  return new Response(null, { status: 200 })
}

export const config = {
  matcher: [],
}
