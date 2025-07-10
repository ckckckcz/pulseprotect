import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/login', '/register']

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get session data from request headers (if available)
  const userSession = request.cookies.get('user-session')?.value

  if (isProtectedRoute && !userSession) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && userSession) {
    // Redirect to dashboard if accessing auth routes while logged in
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
