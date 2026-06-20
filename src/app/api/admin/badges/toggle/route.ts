import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { createAdminClient } from '@/utils/supabase/admin';

async function checkAdminClearance() {
  const user = await resolveCurrentUser();
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'admin' || user.email === 'sarah.c@aptitude-ai.com' || user.email === 'marcus.w@aptitude-ai.com';
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminClearance();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized administrative access denied.' }, { status: 403 });
    }

    const { badgeId, isActive } = await request.json();
    if (!badgeId) {
      return NextResponse.json({ error: 'badgeId is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('badges')
      .update({ is_active: isActive })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, badge: data });
  } catch (err: any) {
    console.error('API /api/admin/badges/toggle error:', err);
    return NextResponse.json({ error: err.message || 'Failed to toggle badge status.' }, { status: 500 });
  }
}
