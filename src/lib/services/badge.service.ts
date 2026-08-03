import { createAdminClient } from '@/utils/supabase/admin';

export interface Badge {
  id: string;
  badge_name: string;
  badge_category: string;
  description: string;
  image_url: string;
  unlock_condition: {
    type: string;
    target: number;
    path_index?: number;
    [key: string]: any;
  };
  xp_reward: number;
  level: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id?: string;
  user_id: string;
  badge_id: string;
  earned_at: string | null;
  progress_percentage: number;
  is_completed: boolean;
  current_value: number;
  target_value: number;
  has_seen_popup: boolean;
  badge?: Badge;
}

export class BadgeService {
  /**
   * Evaluates badge progress and unlocks for a user.
   * Runs server-side with service_role client to bypass RLS.
   */
  static async evaluateBadges(userId: string): Promise<{ userBadges: UserBadge[]; newlyUnlocked: Badge[] }> {
    const supabaseAdmin = createAdminClient();
    const newlyUnlocked: Badge[] = [];
    const resultUserBadges: UserBadge[] = [];

    try {
      // 1. Gather all user metrics/statistics
      // A. Profile data (XP, visited_sections)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('xp, visited_sections')
        .eq('id', userId)
        .maybeSingle();
      
      const visitedSections = profile?.visited_sections || [];

      // B. Onboarding completed status
      const { data: onboarding } = await supabaseAdmin
        .from('onboarding_profile')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();
      
      const isOnboardingCompleted = onboarding?.onboarding_completed || false;

      // C. Question attempts (count and correctness)
      const { data: attempts } = await supabaseAdmin
        .from('question_attempts')
        .select('id, is_correct')
        .eq('user_id', userId);
      
      const totalAttempts = attempts?.length || 0;

      // D. Learning sessions
      const { data: sessions } = await supabaseAdmin
        .from('learning_sessions')
        .select('id')
        .eq('user_id', userId);
      
      const totalSessions = sessions?.length || 0;

      // Total learning activities = Attempts + Sessions
      const totalActivities = totalAttempts + totalSessions;

      // E. Streak data
      const { data: streak } = await supabaseAdmin
        .from('user_streaks')
        .select('current_streak, max_streak')
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentStreak = streak?.current_streak || 0;

      // F. Concept progress & module completion
      // Fetch progress tracking joined with concept information
      const { data: progress } = await supabaseAdmin
        .from('progress_tracking')
        .select(`
          progress_percent,
          status,
          concept:concepts (
            id,
            sub_topic:sub_topics (
              id,
              domain:domains (id, name)
            )
          )
        `)
        .eq('user_id', userId);

      // Completed modules (concepts marked completed)
      const completedModules = progress?.filter(p => p.status === 'Completed').length || 0;

      // Quant domain concepts progress (Quant is our first learning path)
      const quantProgressRecords = progress?.filter(p => {
        // Safe check for joined relation structures
        const domainName = (p as any).concept?.sub_topic?.domain?.name || '';
        const domainId = (p as any).concept?.sub_topic?.domain?.id || '';
        return domainId === 'quant' || domainName.toLowerCase().includes('quant');
      }) || [];

      // Quant path average completion percentage
      // Quant domain has a total of 13 concepts in our static store (arithmetic, algebra, geometry sub-topics)
      const totalQuantConcepts = 13;
      const sumQuantProgress = quantProgressRecords.reduce((sum, record) => sum + (record.progress_percent || 0), 0);
      const quantPathProgressPercent = Math.min(100, Math.round(sumQuantProgress / totalQuantConcepts));

      // 2. Fetch all active badges
      const { data: activeBadges, error: badgeErr } = await supabaseAdmin
        .from('badges')
        .select('*')
        .eq('is_active', true);

      if (badgeErr) throw badgeErr;
      if (!activeBadges || activeBadges.length === 0) {
        return { userBadges: [], newlyUnlocked: [] };
      }

      // Fetch existing user badge progress
      const { data: existingUserBadges } = await supabaseAdmin
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      const existingMap = new Map<string, any>();
      existingUserBadges?.forEach(ub => {
        existingMap.set(ub.badge_id, ub);
      });

      // 3. Evaluate each badge condition
      for (const badge of activeBadges as Badge[]) {
        const cond = badge.unlock_condition;
        let currentValue = 0;
        let targetValue = cond.target || 1;

        switch (cond.type) {
          case 'activity_count':
            currentValue = totalActivities;
            break;
          case 'onboarding_completed':
            currentValue = isOnboardingCompleted ? 1 : 0;
            targetValue = 1;
            break;
          case 'explore_count':
            currentValue = visitedSections.length;
            break;
          case 'module_completed':
            currentValue = completedModules;
            targetValue = 1; // 1 module / concept completed
            break;
          case 'challenge_attempted':
            currentValue = totalAttempts; // count attempts as practice tests/challenges attempted
            break;
          case 'streak_days':
            currentValue = currentStreak;
            break;
          case 'path_progress':
            currentValue = quantPathProgressPercent;
            break;
          default:
            currentValue = 0;
            break;
        }

        const isCompleted = currentValue >= targetValue;
        const progressPercentage = Math.min(100, Math.round((currentValue / targetValue) * 100));

        const existing = existingMap.get(badge.id);

        let finalEarnedAt = existing?.earned_at || null;
        let isNewlyCompleted = false;
        let hasSeenPopup = existing?.has_seen_popup || false;

        if (isCompleted && (!existing || !existing.is_completed)) {
          finalEarnedAt = new Date().toISOString();
          isNewlyCompleted = true;
          hasSeenPopup = false; // Trigger new popup
          newlyUnlocked.push(badge);

          // Update profile XP balance
          const newXP = (profile?.xp || 0) + badge.xp_reward;
          await supabaseAdmin
            .from('profiles')
            .update({ xp: newXP })
            .eq('id', userId);
        }

        const ubData = {
          user_id: userId,
          badge_id: badge.id,
          earned_at: finalEarnedAt,
          progress_percentage: progressPercentage,
          is_completed: isCompleted,
          current_value: currentValue,
          target_value: targetValue,
          has_seen_popup: hasSeenPopup
        };

        let savedUserBadge: any;

        if (existing) {
          const { data: updated } = await supabaseAdmin
            .from('user_badges')
            .update(ubData)
            .eq('user_id', userId)
            .eq('badge_id', badge.id)
            .select()
            .single();
          savedUserBadge = updated;
        } else {
          const { data: inserted } = await supabaseAdmin
            .from('user_badges')
            .insert(ubData)
            .select()
            .single();
          savedUserBadge = inserted;
        }

        if (savedUserBadge) {
          resultUserBadges.push({
            ...savedUserBadge,
            badge
          });
        }
      }

      return {
        userBadges: resultUserBadges,
        newlyUnlocked
      };

    } catch (err: any) {
      console.error('Badge Engine Evaluation Error:', err);
      // Return safe empty results if table errors occur
      return { userBadges: [], newlyUnlocked: [] };
    }
  }

  /**
   * Sets popup seen flag to true for a user badge achievement
   */
  static async claimPopup(userId: string, badgeId: string): Promise<boolean> {
    const supabaseAdmin = createAdminClient();
    try {
      const { error } = await supabaseAdmin
        .from('user_badges')
        .update({ has_seen_popup: true })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);
      
      return !error;
    } catch (err) {
      console.error('Claim Popup Error:', err);
      return false;
    }
  }

  /**
   * Tracks a section visit by adding it to the profile's visited sections array
   */
  static async trackVisit(userId: string, sectionName: string): Promise<{ success: boolean; newlyUnlocked: Badge[] }> {
    const supabaseAdmin = createAdminClient();
    try {
      // Fetch existing visited_sections
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('visited_sections')
        .eq('id', userId)
        .maybeSingle();

      const visited = profile?.visited_sections || [];
      if (!visited.includes(sectionName)) {
        const updatedVisited = [...visited, sectionName];
        await supabaseAdmin
          .from('profiles')
          .update({ visited_sections: updatedVisited })
          .eq('id', userId);
        
        // Evaluate badges
        const evalResult = await this.evaluateBadges(userId);
        return { success: true, newlyUnlocked: evalResult.newlyUnlocked };
      }
      
      return { success: true, newlyUnlocked: [] };
    } catch (err) {
      console.error('Track Visit Error:', err);
      return { success: false, newlyUnlocked: [] };
    }
  }

  /**
   * Gets stats for all user achievements
   */
  static async getBadgeStats(userId?: string) {
    const supabaseAdmin = createAdminClient();
    try {
      // Get all active badges
      const { data: badges } = await supabaseAdmin
        .from('badges')
        .select('id, badge_name, badge_category, xp_reward')
        .eq('is_active', true);

      const totalAvailable = badges?.length || 0;

      if (!userId) {
        // Return system-wide stats if no user is specified (for admin view)
        const { data: allUserBadges } = await supabaseAdmin
          .from('user_badges')
          .select('id, is_completed, badge_id')
          .limit(5000);
        
        const totalCompleted = allUserBadges?.filter(ub => ub.is_completed).length || 0;
        const completionRate = totalAvailable > 0 ? (totalCompleted / (totalAvailable * 100)) * 100 : 0; // rough metric

        // Compute distribution per badge
        const badgeStatsMap = new Map<string, number>();
        allUserBadges?.forEach(ub => {
          if (ub.is_completed) {
            badgeStatsMap.set(ub.badge_id, (badgeStatsMap.get(ub.badge_id) || 0) + 1);
          }
        });

        const distribution = badges?.map(b => ({
          id: b.id,
          name: b.badge_name,
          category: b.badge_category,
          earnedCount: badgeStatsMap.get(b.id) || 0
        })) || [];

        return {
          totalAvailable,
          totalCompleted,
          systemCompletionRate: Math.round(completionRate),
          distribution
        };
      }

      // User specific stats
      const { data: userBadges } = await supabaseAdmin
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      const earnedBadges = userBadges?.filter(ub => ub.is_completed) || [];
      const totalEarned = earnedBadges.length;
      const completionPercentage = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

      // Group by categories
      const categoryStats: Record<string, { earned: number; total: number }> = {};
      badges?.forEach(b => {
        const cat = b.badge_category;
        if (!categoryStats[cat]) {
          categoryStats[cat] = { earned: 0, total: 0 };
        }
        categoryStats[cat].total += 1;
        
        const wasEarned = userBadges?.some(ub => ub.badge_id === b.id && ub.is_completed);
        if (wasEarned) {
          categoryStats[cat].earned += 1;
        }
      });

      return {
        totalAvailable,
        totalEarned,
        completionPercentage,
        categoryStats,
        recentlyEarned: earnedBadges
          .sort((a, b) => new Date(b.earned_at || 0).getTime() - new Date(a.earned_at || 0).getTime())
          .slice(0, 3)
      };

    } catch (err) {
      console.error('Get Badge Stats Error:', err);
      return {
        totalAvailable: 0,
        totalEarned: 0,
        completionPercentage: 0,
        categoryStats: {},
        recentlyEarned: []
      };
    }
  }
}
