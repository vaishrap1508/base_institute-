import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';

export async function POST(request: Request) {
  try {
    const user = await resolveCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sectionName } = await request.json();
    if (!sectionName) {
      return NextResponse.json({ error: 'sectionName is required' }, { status: 400 });
    }

    const result = await BadgeService.trackVisit(user.id, sectionName);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/badges/track-visit error:', err);
    return NextResponse.json({ error: err.message || 'Failed to track section visit.' }, { status: 500 });
  }
}
