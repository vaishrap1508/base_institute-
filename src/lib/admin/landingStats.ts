import { supabase } from '@/lib/supabase';
import { SAMPLE_QUESTIONS } from './store';

export interface LandingStats {
  active_students: number;
  question_pool: number;
  company_tags: number;
  college_partnerships: number;
  last_calculated_at: string;
  source: 'cache' | 'recalculated' | 'local_fallback';
}

const DEFAULT_STATS: LandingStats = {
  active_students: 204580,
  question_pool: 10482,
  company_tags: 520,
  college_partnerships: 154,
  last_calculated_at: new Date().toISOString(),
  source: 'local_fallback'
};

/**
 * Recalculate stats from live database tables and update the landing_stats_cache.
 * Simulates the 3AM cron job or forces an on-demand calculation from the Admin panel.
 */
export async function recalculateLandingStats(): Promise<LandingStats> {
  try {
    // 1. Fetch real-time count of questions
    const { count: dbQuestionsCount, error: questionError } = await supabase
      .from('questions')
      .select('*', { count: 'estimated', head: true });
    
    // 2. Fetch count of active student profiles
    const { count: dbStudentsCount, error: studentError } = await supabase
      .from('profiles')
      .select('*', { count: 'estimated', head: true })
      .eq('role', 'STUDENT');

    // 3. Fetch count of company tags
    const { count: dbCompaniesCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'estimated', head: true });

    // 4. Fetch count of distinct colleges represented in profile directory
    let collegeCount = 0;
    try {
      const { data: profilesWithColleges, error: collegeError } = await supabase
        .from('profiles')
        .select('college')
        .not('college', 'is', null);
      
      if (profilesWithColleges && !collegeError) {
        const uniqueColleges = new Set(
          profilesWithColleges
            .map((p) => p.college?.trim())
            .filter((c) => c && c.length > 0)
        );
        collegeCount = uniqueColleges.size;
      }
    } catch (e) {
      console.warn("Could not determine dynamic college count, using offset fallback", e);
    }

    // Use direct counts, no fallback inflation
    const finalQuestions = dbQuestionsCount || 0;
    const finalStudents = dbStudentsCount || 0;
    const finalCompanies = dbCompaniesCount || 0;
    const finalColleges = collegeCount || 0;

    const newStats: Omit<LandingStats, 'source'> = {
      active_students: finalStudents,
      question_pool: finalQuestions,
      company_tags: finalCompanies,
      college_partnerships: finalColleges,
      last_calculated_at: new Date().toISOString()
    };

    // Attempt to upsert the newly calculated stats to Supabase cache table
    const { error: upsertError } = await supabase
      .from('landing_stats_cache')
      .upsert({
        id: 'current',
        ...newStats
      });

    if (upsertError) {
      console.warn("Failed to write recalculations to Supabase table, utilizing browser local storage fallback", upsertError);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aptitude_landing_stats_cache', JSON.stringify(newStats));
      }
    }

    return {
      ...newStats,
      source: 'recalculated'
    };
  } catch (err) {
    console.warn("Recalculate stats error. Database schema might not be migrated. Utilizing local calculations.", err);
    
    // In local mode, we base counts strictly on the database schema
    const localStats: LandingStats = {
      active_students: 0,
      question_pool: 0,
      company_tags: 0,
      college_partnerships: 0,
      last_calculated_at: new Date().toISOString(),
      source: 'local_fallback'
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('aptitude_landing_stats_cache', JSON.stringify(localStats));
    }
    return localStats;
  }
}

/**
 * Retrieve statistics. Looks at the cached table 'landing_stats_cache' first.
 * If data is missing or older than 24 hours (3AM Cron Sim), recalculates live.
 */
export async function getLandingStats(): Promise<LandingStats> {
  try {
    // 1. Attempt to fetch from Supabase cache first
    const { data, error } = await supabase
      .from('landing_stats_cache')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error || !data) {
      // If table is not present, fall back to browser local storage check
      if (typeof window !== 'undefined') {
        const localCache = localStorage.getItem('aptitude_landing_stats_cache');
        if (localCache) {
          try {
            const parsed = JSON.parse(localCache) as LandingStats;
            const cacheTime = new Date(parsed.last_calculated_at).getTime();
            const now = new Date().getTime();
            
            // If local cache is still fresh (< 24 hours), return it
            if (now - cacheTime < 24 * 60 * 60 * 1000) {
              return { ...parsed, source: 'cache' };
            }
          } catch (e) {
            console.warn(e);
          }
        }
      }
      // If no valid cache exists, trigger recalculation immediately
      return await recalculateLandingStats();
    }

    // 2. We got valid cache from Supabase, check age
    const cacheTime = new Date(data.last_calculated_at).getTime();
    const now = new Date().getTime();

    // If cache is fresh (< 24 hours old), serve from cache to prevent database load
    if (now - cacheTime < 24 * 60 * 60 * 1000) {
      return {
        active_students: data.active_students,
        question_pool: data.question_pool,
        company_tags: data.company_tags,
        college_partnerships: data.college_partnerships,
        last_calculated_at: data.last_calculated_at,
        source: 'cache'
      };
    }

    // Cache expired (simulating 3AM cron trigger), run fresh recalculations
    console.log("Cached stats expired (older than 24 hours). Recomputing dynamic statistics.");
    return await recalculateLandingStats();
  } catch (err) {
    // Graceful fallback if database read fails
    if (typeof window !== 'undefined') {
      const localCache = localStorage.getItem('aptitude_landing_stats_cache');
      if (localCache) {
        try {
          const parsed = JSON.parse(localCache) as LandingStats;
          return { ...parsed, source: 'local_fallback' };
        } catch (e) {
          console.warn(e);
        }
      }
    }
    return DEFAULT_STATS;
  }
}
