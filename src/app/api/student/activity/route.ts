import { NextResponse } from 'next/server';
import { resolveCurrentUser } from '@/utils/auth-session';
import { BadgeService } from '@/lib/services/badge.service';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const user = await resolveCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { type, details } = await request.json();
    if (!type || !details) {
      return NextResponse.json({ error: 'type and details are required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    if (type === 'question_attempt') {
      const { questionId, isCorrect, timeSpentMs } = details;
      
      // 1. Log attempt
      await supabaseAdmin
        .from('question_attempts')
        .insert({
          user_id: user.id,
          question_id: questionId,
          is_correct: isCorrect,
          time_spent_ms: timeSpentMs || 0
        });

      // 2. If correct, update user_progress to solved
      if (isCorrect) {
        await supabaseAdmin
          .from('user_progress')
          .upsert({
            user_id: user.id,
            question_id: questionId,
            is_solved: true,
            solve_time_ms: timeSpentMs || 0,
            solved_at: new Date().toISOString()
          }, { onConflict: 'user_id,question_id' });
      }

    } else if (type === 'lesson_complete') {
      const { conceptId, durationSeconds } = details;

      // 1. Log session
      await supabaseAdmin
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          concept_id: conceptId,
          duration_seconds: durationSeconds || 60
        });

      // 2. Update progress tracking to Completed (100%)
      await supabaseAdmin
        .from('progress_tracking')
        .upsert({
          user_id: user.id,
          concept_id: conceptId,
          progress_percent: 100,
          status: 'Completed',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,concept_id' });
    }

    // Evaluate badges for the user
    const { newlyUnlocked, userBadges } = await BadgeService.evaluateBadges(user.id);
    
    return NextResponse.json({
      success: true,
      newlyUnlocked,
      userBadges
    });

  } catch (err: any) {
    console.error('API /api/student/activity error:', err);
    return NextResponse.json({ error: err.message || 'Failed to record activity.' }, { status: 500 });
  }
}
