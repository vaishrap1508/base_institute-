import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { QueueService } from '@/lib/services/queue.service';

async function checkAdminClearance() {
  const cookieStore = await cookies();
  const mockAuthCookie = cookieStore.get('aptitude_mock_auth')?.value;
  if (mockAuthCookie) {
    try {
      const mockUser = JSON.parse(decodeURIComponent(mockAuthCookie));
      return mockUser.role === 'ADMIN';
    } catch (_) {}
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
    
  return profile?.role === 'ADMIN' || user.email === 'sarah.c@aptitude-ai.com' || user.email === 'marcus.w@aptitude-ai.com';
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminClearance();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized administrative access denied.' }, { status: 403 });
    }

    const result = await QueueService.processQueue();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Queue Processing Endpoint Error:', err);
    return NextResponse.json({ error: err.message || 'Queue execution failed.' }, { status: 500 });
  }
}
