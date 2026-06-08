import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const user = await resolveCurrentUser();
    const supabaseAdmin = createAdminClient();

    // 1. Fetch active badges directly
    const { data: badges, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('created_at', { ascending: true });

    if (badgeError) throw badgeError;

    if (!user) {
      // Not logged in: return badges with empty progress
      const emptyProgress = (badges || []).map(b => ({
        badge_id: b.id,
        earned_at: null,
        progress_percentage: 0,
        is_completed: false,
        current_value: 0,
        target_value: b.unlock_condition?.target || 1,
        has_seen_popup: false,
        badge: b
      }));
      return NextResponse.json({ success: true, badges: emptyProgress, isGuest: true });
    }

    // 2. Evaluate and return user badge progress
    const { userBadges } = await BadgeService.evaluateBadges(user.id);
    
    // In case userBadges list is empty due to empty records, let's map all active badges
    const userBadgeMap = new Map(userBadges.map(ub => [ub.badge_id, ub]));
    const mappedBadges = (badges || []).map(b => {
      const ub = userBadgeMap.get(b.id);
      if (ub) return ub;
      return {
        badge_id: b.id,
        earned_at: null,
        progress_percentage: 0,
        is_completed: false,
        current_value: 0,
        target_value: b.unlock_condition?.target || 1,
        has_seen_popup: false,
        badge: b
      };
    });

    // Fetch user XP balance
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      badges: mappedBadges,
      xp: profile?.xp || 0,
      isGuest: false
    });

  } catch (err: any) {
    console.error('API /api/badges error:', err);
    if (err.message?.includes('does not exist') || err.message?.includes('relation "badges"')) {
      return NextResponse.json({
        success: true,
        badges: [],
        warning: 'badges table does not exist. Run migration 00011_badges.sql in the Supabase SQL Editor.'
      });
    }
    return NextResponse.json({ error: err.message || 'Failed to retrieve badges.' }, { status: 500 });
  }
}
