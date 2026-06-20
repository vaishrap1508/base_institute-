import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
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

export async function GET(request: Request) {
  try {
    const isAuthorized = await checkAdminClearance();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized administrative access denied.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabaseAdmin = createAdminClient();
    
    let query = supabaseAdmin
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`recipient.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data: logs, error } = await query.limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, logs });

  } catch (err: any) {
    console.error('Email Logs API Error:', err);
    // If table doesn't exist yet, return mock empty log to prevent admin panel crashing
    if (err.message?.includes('does not exist') || err.message?.includes('relation "email_logs"')) {
      return NextResponse.json({ 
        success: true, 
        logs: [], 
        warning: 'email_logs table is missing in the database. Run the migration script.' 
      });
    }
    return NextResponse.json({ error: err.message || 'Failed to retrieve logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminClearance();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized administrative access denied.' }, { status: 403 });
    }

    const { logId } = await request.json();
    if (!logId) {
      return NextResponse.json({ error: 'Log ID is required.' }, { status: 400 });
    }

    const result = await QueueService.retryFailedEmail(logId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Retry Email Log Error:', err);
    return NextResponse.json({ error: err.message || 'Retry execution failed.' }, { status: 500 });
  }
}
