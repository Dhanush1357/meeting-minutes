import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get stored auth data from cookies
  const authData = request.cookies.get('auth-storage')?.value

  // Parse stored auth data
  const isAuthenticated = authData ? JSON.parse(decodeURIComponent(authData)).state.isAuthenticated : false

  // List of routes to exclude from the middleware
  const excludedRoutes = ['/auth/login', '/auth/forgot-password', '/public', '/favicon.ico', '/manifest.json']

   // If the requested path is in the excluded routes, bypass the middleware
   if (excludedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Redirect logic
  if (!isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all routes except public assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json|sw.js|workbox-*.js).*)',
  ],
}