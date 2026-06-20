import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';

export async function POST(request: Request) {
  try {
    const user = await resolveCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { badgeId } = await request.json();
    if (!badgeId) {
      return NextResponse.json({ error: 'badgeId is required' }, { status: 400 });
    }

    const success = await BadgeService.claimPopup(user.id, badgeId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('API /api/badges/claim-popup error:', err);
    return NextResponse.json({ error: err.message || 'Failed to claim popup.' }, { status: 500 });
  }
}
