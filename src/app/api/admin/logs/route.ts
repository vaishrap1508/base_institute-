import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

// In-memory store for admin actions (purges, override toggles, etc.)
// Persists through the server lifecycle
let adminLogs: any[] = [
  {
    id: 'ADMIN-LOG-001',
    category: 'SYSTEM',
    title: 'Platform Initialized',
    description: 'Secured Sandbox v2.4 initialized with active memory logs.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
    user: 'System Admin',
    severity: 'info'
  }
];

export async function GET() {
  const supabase = createAdminClient();
  
  try {
    // 1. Fetch recent signups (profiles)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, college, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    const signupLogs = (profiles || []).map(p => ({
      id: `SIGNUP-${p.id.substring(0, 8)}`,
      category: 'AUTHENTICATION',
      title: 'New Student Signup',
      description: `Student ${p.username || 'Anonymous'} signed up from ${p.college || 'VIT Vellore'}.`,
      timestamp: p.created_at,
      user: p.username || 'Student',
      severity: 'info'
    }));

    // 2. Fetch recent question attempts
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select(`
        id,
        is_correct,
        created_at,
        profiles (
          username
        )
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    const practiceLogs = (attempts || []).map((a: any) => ({
      id: `PRACTICE-${a.id.substring(0, 8)}`,
      category: 'PRACTICE',
      title: a.is_correct ? 'MCQ Solved Successfully' : 'Practice Compilation Error',
      description: `Student ${a.profiles?.username || 'Student'} completed a domain practice problem ${a.is_correct ? 'with correct response' : 'with incorrect code interpreter response'}.`,
      timestamp: a.created_at,
      user: a.profiles?.username || 'Student',
      severity: a.is_correct ? 'success' : 'warning'
    }));

    // 3. Fetch badge achievements
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        id,
        earned_at,
        profiles (
          username
        ),
        badges (
          badge_name
        )
      `)
      .eq('is_completed', true)
      .order('earned_at', { ascending: false })
      .limit(15);

    const badgeLogs = (userBadges || []).map((ub: any) => ({
      id: `BADGE-${ub.id.substring(0, 8)}`,
      category: 'ACHIEVEMENT',
      title: 'Badge Awarded',
      description: `Student ${ub.profiles?.username || 'Student'} claimed achievement badge: '${ub.badges?.badge_name || 'Dynamic Solver'}'.`,
      timestamp: ub.earned_at || new Date().toISOString(),
      user: ub.profiles?.username || 'Student',
      severity: 'info'
    }));

    // 4. Combine all logs
    const combinedLogs = [...adminLogs, ...signupLogs, ...practiceLogs, ...badgeLogs];

    // Sort chronologically (newest first)
    combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, logs: combinedLogs });
  } catch (err: any) {
    console.error("Activity Logs API Error:", err);
    // Return safe fallback list
    return NextResponse.json({ success: false, error: err.message, logs: adminLogs });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, user, severity } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Missing title or description' }, { status: 400 });
    }

    const newLog = {
      id: `ADMIN-LOG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      category: category || 'SYSTEM',
      title,
      description,
      timestamp: new Date().toISOString(),
      user: user || 'System Admin',
      severity: severity || 'info'
    };

    adminLogs.unshift(newLog);

    return NextResponse.json({ success: true, log: newLog });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
