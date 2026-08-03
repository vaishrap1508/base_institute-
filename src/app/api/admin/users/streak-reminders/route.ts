import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { QueueService } from '@/lib/services/queue.service';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

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
    const isAdmin = await checkAdminClearance();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();

    // Find users with streak 1 or 2
    const { data: streaks, error: streaksError } = await supabaseAdmin
      .from('user_streaks')
      .select('user_id, current_streak')
      .gt('current_streak', 0)
      .lt('current_streak', 3);

    if (streaksError) throw streaksError;
    if (!streaks || streaks.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No students at risk.' });
    }

    const userIds = streaks.map((s: any) => s.user_id);

    // Get their profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (profilesError) throw profilesError;
    
    let count = 0;
    
    for (const profile of profiles || []) {
      if (profile.email) {
        const subject = `Keep your streak alive, ${profile.full_name || 'Student'}!`;
        const bodyHtml = `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Don't lose your momentum!</h2>
            <p>You're on a learning streak right now. Log in today and complete a practice session to keep it going.</p>
            <a href="https://aptitude-ai.com/practice" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Continue Learning</a>
          </div>
        `;
        await QueueService.queueEmail(profile.email, subject, bodyHtml);
        count++;
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Streak reminders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send reminders' }, { status: 500 });
  }
}
