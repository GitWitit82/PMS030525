import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

/**
 * Role hierarchy for authorization
 */
const roleHierarchy = {
  ADMIN: ['ADMIN', 'MANAGER', 'USER'],
  MANAGER: ['MANAGER', 'USER'],
  USER: ['USER'],
}

/**
 * Route configuration for role-based access
 */
const protectedRoutes = {
  '/dashboard': ['USER', 'MANAGER', 'ADMIN'],
  '/projects': ['USER', 'MANAGER', 'ADMIN'],
  '/workflows': ['MANAGER', 'ADMIN'],
  '/resources': ['MANAGER', 'ADMIN'],
  '/analytics': ['MANAGER', 'ADMIN'],
  '/settings': ['ADMIN'],
}

/**
 * Check if a user has access to a specific route based on their role
 */
const hasAccess = (userRole: string, requiredRoles: string[]): boolean => {
  if (!userRole || !requiredRoles.length) return false
  const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || []
  return requiredRoles.some(role => allowedRoles.includes(role))
}

/**
 * Middleware function for handling authentication and authorization
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes - allow access
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth') || 
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password') {
    return NextResponse.next()
  }

  // Protected routes - check authentication
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Check role-based access for protected routes
  const userRole = token.role as string
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route) && !hasAccess(userRole, roles)) {
      // Redirect to dashboard with access denied message
      const url = new URL('/dashboard', request.url)
      url.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(url)
    }
  }

  // Session timeout check (30 minutes of inactivity)
  const lastActivity = token.iat as number
  const currentTime = Math.floor(Date.now() / 1000)
  const inactivityLimit = 30 * 60 // 30 minutes

  if (currentTime - lastActivity > inactivityLimit) {
    const url = new URL('/login', request.url)
    url.searchParams.set('error', 'session_expired')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

/**
 * Configure which routes should be processed by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 