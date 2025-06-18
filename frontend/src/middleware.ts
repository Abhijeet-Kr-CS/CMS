import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/driver': ['driver'],
  '/user': ['user'],
};

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware - Pathname:', pathname, 'Token:', !!token);

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in, redirect to appropriate dashboard
    if (token) {
      const role = request.cookies.get('userRole')?.value;
      console.log('Middleware - User logged in, role:', role);
      if (role) {
        switch (role) {
          case 'admin':
            console.log('Middleware - Redirecting admin to /admin');
            return NextResponse.redirect(new URL('/admin', request.url));
          case 'driver':
            console.log('Middleware - Redirecting driver to /driver');
            return NextResponse.redirect(new URL('/driver', request.url));
          case 'user':
            console.log('Middleware - Redirecting user to /user/book');
            return NextResponse.redirect(new URL('/user/book', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Check if the route is protected
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      console.log('Middleware - Protected route:', route, 'Allowed roles:', allowedRoles);
      // If no token, redirect to login
      if (!token) {
        console.log('Middleware - No token, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check if user has the required role
      const role = request.cookies.get('userRole')?.value;
      console.log('Middleware - User role:', role);
      if (!role || !allowedRoles.includes(role)) {
        console.log('Middleware - Invalid role, redirecting');
        // If user doesn't have the required role, redirect to appropriate dashboard
        switch (role) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin', request.url));
          case 'driver':
            return NextResponse.redirect(new URL('/driver', request.url));
          case 'user':
            return NextResponse.redirect(new URL('/user/book', request.url));
          default:
            return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 