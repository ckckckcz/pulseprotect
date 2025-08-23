import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getHomePathForRole } from '@/lib/role-utils'

// Define protected routes and their allowed roles
const protectedRoutes = [
  {
    path: '/dokter',
    roles: ['dokter']
  },
  {
    path: '/admin',
    roles: ['admin']
  },
  {
    path: '/dashboard',
    roles: ['user', 'dokter', 'admin'] // All authenticated users can access dashboard
  }
]

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get('session_id')
  const path = request.nextUrl.pathname
  
  // Check if path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route.path)
  )
  
  // If this is not a protected route, allow the request
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // If no session exists, redirect to login
  if (!userSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // Parse the session cookie
    const session = JSON.parse(userSession.value)
    
    // Check if session is expired
    const now = new Date()
    const expires = new Date(session.expires)
    
    if (now > expires) {
      // Session expired, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session_id')
      return response
    }
    
    // Check if user has permission for this route
    const routeConfig = protectedRoutes.find(route => path.startsWith(route.path))
    if (routeConfig && !routeConfig.roles.includes(session.role)) {
      // User doesn't have permission, redirect to their appropriate homepage
      const homePath = getHomePathForRole(session.role)
      return NextResponse.redirect(new URL(homePath, request.url))
    }
    
    // User has permission, allow the request
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error parsing the cookie, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Specify which paths this middleware will run for
export const config = {
  matcher: ['/dokter/:path*', '/admin/:path*', '/dashboard/:path*']
}
