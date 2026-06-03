import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);

  const url = new URL(request.url);
  const path = url.pathname;

  const isProtectedRoute = path.startsWith('/student') || path.startsWith('/admin') || path.startsWith('/onboarding');
  const isLoginRoute = path === '/login';

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    if ('isMock' in user && (user as any).isMock) {
      const isSarah = user.email === 'sarah.c@aptitude-ai.com';
      const isMarcus = user.email === 'marcus.w@aptitude-ai.com';
      const userRole = (user.user_metadata?.role === 'ADMIN' || isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';

      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        const onboardingCompleted = request.cookies.get('aptitude_onboarding_completed')?.value === 'true';
        if (onboardingCompleted) {
          return NextResponse.redirect(new URL('/student/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isSarah = user.email === 'sarah.c@aptitude-ai.com';
    const isMarcus = user.email === 'marcus.w@aptitude-ai.com';
    const userRole = (profile?.role === 'ADMIN' || isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';

    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      const { data: onboarding } = await supabase
        .from('onboarding_profile')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboarding?.onboarding_completed) {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
