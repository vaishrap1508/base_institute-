import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function resolveCurrentUser() {
  const cookieStore = await cookies();
  const mockAuthCookie = cookieStore.get('aptitude_mock_auth')?.value;
  if (mockAuthCookie) {
    try {
      const mockUser = JSON.parse(decodeURIComponent(mockAuthCookie));
      return { 
        id: mockUser.id || 'mock-user-id', 
        email: mockUser.email || 'student@aptitude-ai.com', 
        role: mockUser.role || 'STUDENT', 
        isMock: true 
      };
    } catch (_) {}
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Fetch profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role || 'STUDENT',
    isMock: false
  };
}
