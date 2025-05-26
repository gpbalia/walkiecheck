import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /auth/dashboard)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/noauth/login' || 
    path === '/noauth/register' || 
    path === '/noauth/pricing' ||
    path === '/'

  // Get the token from the cookies
  const token = request.cookies.get('authToken')?.value

  // Redirect logic for auth routes
  if (path.startsWith('/auth') && !token) {
    // Redirect to login if trying to access auth route without token
    return NextResponse.redirect(new URL('/noauth/login', request.url))
  }

  // Redirect logic for public routes
  if (isPublicPath && token) {
    // Redirect to dashboard if trying to access public route with token
    return NextResponse.redirect(new URL('/auth/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
