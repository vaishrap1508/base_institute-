import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';

async function checkAdminClearance() {
  const user = await resolveCurrentUser();
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'admin' || user.email === 'sarah.c@aptitude-ai.com' || user.email === 'marcus.w@aptitude-ai.com';
}

export async function GET() {
  try {
    const isAuthorized = await checkAdminClearance();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized administrative access denied.' }, { status: 403 });
    }

    const stats = await BadgeService.getBadgeStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (err: any) {
    console.error('API /api/admin/badges/stats error:', err);
    return NextResponse.json({ error: err.message || 'Failed to retrieve stats.' }, { status: 500 });
  }
}
