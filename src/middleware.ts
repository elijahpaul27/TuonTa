import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;
  const examLevel = req.auth?.user?.examLevel;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isApiRoute = nextUrl.pathname.startsWith('/api/');
  const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isOnboardingRoute = nextUrl.pathname === '/onboarding';
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');
  const isProtectedRoute = isDashboardRoute || nextUrl.pathname.startsWith('/test-center');

  // Always allow auth API routes through
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow public API routes (register, users/profile, etc.)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // ── Unauthenticated user logic ────────────────────────────────────────────

  // Unauthenticated users on protected/admin routes → login
  if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // ── Authenticated user logic ──────────────────────────────────────────────

  if (isAuthenticated) {
    // If on a public auth page → redirect by role
    if (isAuthRoute) {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/qa-dashboard', nextUrl));
      }
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Regular USER without examLevel who hasn't completed onboarding
    // → redirect to onboarding (unless they're already there)
    if (
      userRole === 'USER' &&
      !examLevel &&
      !isOnboardingRoute &&
      !isApiRoute
    ) {
      return NextResponse.redirect(new URL('/onboarding', nextUrl));
    }

    // Authenticated admin accidentally hits /dashboard → redirect to admin panel
    if (isDashboardRoute && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/qa-dashboard', nextUrl));
    }

    // Non-admins trying to access admin routes → back to dashboard
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Fully onboarded user trying to hit /onboarding again → dashboard
    if (isOnboardingRoute && examLevel) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure middleware to intercept relevant paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
