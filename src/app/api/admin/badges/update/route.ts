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

    const { badgeId, badgeName, description, xpReward, level, targetValue } = await request.json();
    if (!badgeId) {
      return NextResponse.json({ error: 'badgeId is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch existing badge to update its unlock_condition target value
    const { data: badge } = await supabaseAdmin
      .from('badges')
      .select('unlock_condition')
      .eq('id', badgeId)
      .single();

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    const updatedCondition = {
      ...(badge.unlock_condition as Record<string, any>),
      target: targetValue !== undefined ? Number(targetValue) : (badge.unlock_condition as any).target
    };

    const { data, error } = await supabaseAdmin
      .from('badges')
      .update({
        badge_name: badgeName,
        description,
        xp_reward: xpReward !== undefined ? Number(xpReward) : undefined,
        level: level !== undefined ? Number(level) : undefined,
        unlock_condition: updatedCondition
      })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, badge: data });
  } catch (err: any) {
    console.error('API /api/admin/badges/update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update badge.' }, { status: 500 });
  }
}
