import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const mockAuthCookie = request.cookies.get('aptitude_mock_auth')?.value;
  if (mockAuthCookie) {
    try {
      const mockUser = JSON.parse(decodeURIComponent(mockAuthCookie));
      return {
        supabase: null as any,
        user: {
          id: mockUser.id || 'mock-user-id',
          email: mockUser.email || 'student@university.edu',
          user_metadata: {
            full_name: mockUser.name,
            role: mockUser.role,
          },
          isMock: true
        } as any,
        supabaseResponse
      };
    } catch (e) {
      // Silently ignore invalid cookies instead of polluting server logs 
      // and causing Next.js dev overlay syntax errors
    }
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  // IMPORTANT: Do NOT remove this getUser() call, as it is required to refresh the token.
  const { data: { user } } = await supabase.auth.getUser();

  return { supabase, user, supabaseResponse };
}
