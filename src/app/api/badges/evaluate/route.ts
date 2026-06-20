import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';

export async function POST() {
  try {
    const user = await resolveCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { newlyUnlocked, userBadges } = await BadgeService.evaluateBadges(user.id);
    return NextResponse.json({ success: true, newlyUnlocked, userBadges });
  } catch (err: any) {
    console.error('API /api/badges/evaluate error:', err);
    return NextResponse.json({ error: err.message || 'Failed to evaluate badges.' }, { status: 500 });
  }
}
