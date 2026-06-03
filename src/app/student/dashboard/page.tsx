'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  User, 
  GraduationCap, 
  Target, 
  Clock, 
  Calendar, 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Cpu, 
  Award, 
  Bookmark, 
  Flame, 
  Check, 
  X, 
  LogOut,
  Info,
  ExternalLink,
  BookOpenCheck,
  ShieldCheck,
  Sparkles,
  Bell,
  Globe,
  Activity,
  Trophy,
  TrendingUp,
  Compass,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { DOMAINS_DATA, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { Question } from '@/lib/admin/types';

export default function StudentDashboard() {
  const router = useRouter();
  const authSupabase = createAuthClient();

  // Onboarding profile states
  const [profile, setProfile] = useState<any>({
    username: 'Vaishnavi Raparthy',
    country: 'India',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2026,
    primary_goal: 'Campus Placements',
    target_timeline: 'Within 3 Months',
    weekly_commitment: '5–10 Hours',
    learning_preference: 'Concept + Practice'
  });

  const [currentRole, setCurrentRole] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [solvedCount, setSolvedCount] = useState(12);
  const [streak, setStreak] = useState(14); // Simulated active streak
  const [bookmarks, setBookmarks] = useState<string[]>(['Q-8029-X']); 
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'practice'>('dashboard');

  // Opportunities state
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunityType, setSelectedOpportunityType] = useState<string>('All');
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<string | null>(null);
  const [oppsLoading, setOppsLoading] = useState(true);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  // Leaderboard state
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'college' | 'global' | 'friends'>('college');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Hardcoded premium fallback data
  const DEFAULT_OPPORTUNITIES = [
    { id: 'opt-1', title: 'TCS NQT National Qualifier Test', organization: 'Tata Consultancy Services', type: 'Hiring', deadline: 'July 28', days_remaining: 12, status: 'Closing Soon', details: 'Access the TCS National Qualifier Test for multiple systems roles. Open to 2025/2026 batches.', link: 'https://nextstep.tcs.com/' },
    { id: 'opt-2', title: 'SWE Intern - Product Engineering', organization: 'Microsoft India', type: 'Internship', deadline: 'August 15', days_remaining: 30, status: 'New', details: '3-month summer internship working with the Azure cloud networking tools team in Hyderabad.', link: 'https://careers.microsoft.com/' },
    { id: 'opt-3', title: 'SSC CGL Executive Officers Recruitment', organization: 'Staff Selection Commission', type: 'Government Exam', deadline: 'June 30', days_remaining: 5, status: 'Open', details: 'Staff Selection Commission Combined Graduate Level Examination for assistant audit officers.', link: 'https://ssc.gov.in/' },
    { id: 'opt-4', title: 'Stripe Global FinTech Hackathon', organization: 'Stripe Inc.', type: 'Hackathon', deadline: 'July 10', days_remaining: 18, status: 'Open', details: 'Build next-generation payment interfaces using API integrations. Total prize pool $50,000.', link: 'https://stripe.com/' },
    { id: 'opt-6', title: 'UPSC Civil Services Prelims 2026', organization: 'Union Public Service Commission', type: 'Government Exam', deadline: 'March 15', days_remaining: 0, status: 'Expired', details: 'Union Public Service Commission civil services main stage registration portals.', link: 'https://upsc.gov.in/' }
  ];

  const DEFAULT_ANNOUNCEMENTS = [
    { id: 'ann-1', title: 'Goldman Sachs Mock assessment goes live this Sunday', type: 'Notice', content: 'The weekly simulated mock assessment designed for Goldman Sachs preparation window begins at 10:00 AM on Sunday. Make sure your local sandbox compiler is synced.', publisher: 'Placement Coordinator', priority: 'High', date: 'June 4' },
    { id: 'ann-2', title: 'New Verbal Reasoning modules added to the Practice Arena', type: 'New Course', content: 'We have introduced 15 new high-fidelity sets on grammatical corrections, modifiers, and syntax maps under the Verbal Ability section.', publisher: 'Content Team', priority: 'Medium', date: 'June 2' },
    { id: 'ann-3', title: 'Dynamic Career Opportunities Hub integration completed', type: 'Platform', content: 'You can now view live hiring drives, internships, government exams, hackathons, and webinars directly from your unified Command Center.', publisher: 'Dev Team', priority: 'High', date: 'June 1' }
  ];

  // Sync profile details
  useEffect(() => {
    // 1. Sync active account credentials
    const roleStored = localStorage.getItem('aptitude_current_role');
    if (roleStored) {
      try {
        const parsed = JSON.parse(roleStored);
        setCurrentRole(parsed);
      } catch (e) {
        console.warn(e);
      }
    }

    const syncSession = async () => {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        const { data: profileObj } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        const isSarah = session.user.email === 'sarah.c@aptitude-ai.com';
        const isMarcus = session.user.email === 'marcus.w@aptitude-ai.com';
        const userRole = (profileObj?.role === 'ADMIN' || isSarah || isMarcus) ? 'admin' : 'STUDENT';
        
        const roleObj = {
          role: userRole === 'admin' ? (isMarcus ? 'editor' : 'admin') : 'STUDENT',
          name: session.user.email?.split('@')[0].toUpperCase() || 'STUDENT',
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        localStorage.setItem('aptitude_current_role', JSON.stringify(roleObj));
        setCurrentRole(roleObj);

        if (!localStorage.getItem('aptitude_onboarding_data')) {
          const { data: onboardingData } = await supabase
            .from('onboarding_profile')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (onboardingData) {
            localStorage.setItem('aptitude_onboarding_completed', 'true');
            localStorage.setItem('aptitude_onboarding_data', JSON.stringify(onboardingData));
            setProfile(onboardingData);
          }
        }
      }
    };
    syncSession();

    // 2. Sync onboarding variables
    const onboardingStored = localStorage.getItem('aptitude_onboarding_data');
    if (onboardingStored) {
      try {
        const data = JSON.parse(onboardingStored);
        setProfile((prev: any) => ({
          ...prev,
          username: data.username || prev.username,
          college: data.college || prev.college,
          degree: data.degree || prev.degree,
          branch: data.branch || prev.branch,
          primary_goal: data.primary_goal || prev.primary_goal,
          target_timeline: data.target_timeline || prev.target_timeline,
          weekly_commitment: data.weekly_commitment || prev.weekly_commitment,
          learning_preference: data.learning_preference || prev.learning_preference
        }));
      } catch (e) {
        console.warn(e);
      }
    }

    // 3. Load catalog questions
    const loadCatalog = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            difficulty,
            question_text,
            options,
            explanation,
            video_url,
            is_active,
            concept:concepts (
              id,
              name,
              sub_topic:sub_topics (
                id,
                name,
                domain:domains (id, name)
              )
            )
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Question[] = data.map((q: any) => {
            const domainName = q.concept?.sub_topic?.domain?.name || 'Quantitative Aptitude';
            let resolvedDomainId = 'quant';
            if (domainName.toLowerCase().includes('logical')) resolvedDomainId = 'logical';
            if (domainName.toLowerCase().includes('verbal')) resolvedDomainId = 'verbal';

            return {
              id: q.id,
              domainId: resolvedDomainId,
              subTopicId: q.concept?.sub_topic?.id || 'arithmetic',
              conceptId: q.concept?.id || 'percentages',
              difficulty: q.difficulty || 'MEDIUM',
              companyTags: [],
              shuffleOptions: false,
              questionStem: q.question_text || '',
              hintText: q.explanation || '',
              options: Array.isArray(q.options) 
                ? q.options.map((opt: any, index: number) => ({
                    id: opt.id || String.fromCharCode(65 + index),
                    text: opt.text || '',
                    isCorrect: opt.isCorrect || false,
                    metadata: opt.metadata || ''
                  }))
                : [],
              videoUrl: q.video_url || '',
              status: q.is_active ? 'Published' : 'Draft',
              createdAt: 'Today'
            };
          });
          setQuestions(mapped);
        } else {
          // Local storage fallback
          const stored = localStorage.getItem('aptitude_questions');
          if (stored) {
            setQuestions(JSON.parse(stored));
          } else {
            setQuestions(SAMPLE_QUESTIONS);
          }
        }
      } catch (err) {
        console.warn('Student Dashboard Supabase Sync error:', err);
        const stored = localStorage.getItem('aptitude_questions');
        if (stored) {
          setQuestions(JSON.parse(stored));
        } else {
          setQuestions(SAMPLE_QUESTIONS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 4. Fetch Opportunities from Supabase
    const fetchOpportunities = async () => {
      setOppsLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setOpportunities(data);
        } else {
          setOpportunities(DEFAULT_OPPORTUNITIES);
        }
      } catch (e) {
        console.warn('Opportunities fetch failed, loading presets:', e);
        setOpportunities(DEFAULT_OPPORTUNITIES);
      } finally {
        setOppsLoading(false);
      }
    };

    // 5. Fetch Announcements from Supabase
    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        }
      } catch (e) {
        console.warn('Announcements fetch failed, loading presets:', e);
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadCatalog();
    fetchOpportunities();
    fetchAnnouncements();
  }, []);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Status must be published to show to students
      if (q.status && q.status !== 'Published') return false;

      // 1. Text Search Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesStem = q.questionStem.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query);
        if (!matchesStem && !matchesId) return false;
      }

      // 2. Domain Filter
      if (selectedDomain !== 'All' && q.domainId !== selectedDomain) {
        return false;
      }

      // 3. Difficulty Filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedDomain, selectedDifficulty]);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    if (selectedOpportunityType === 'All') return opportunities;
    return opportunities.filter(o => o.type === selectedOpportunityType);
  }, [opportunities, selectedOpportunityType]);

  // Handle bookmarks
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // Submit Answer validation
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));

    // Increment solvedCount if correct
    const targetQ = questions.find(q => q.id === questionId);
    const targetOpt = targetQ?.options.find(o => o.id === optionId);
    if (targetOpt?.isCorrect && !submittedAnswers[questionId]) {
      setSolvedCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    }
  };

  // Solution drawer toggle
  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await authSupabase.auth.signOut();
    localStorage.removeItem('aptitude_current_role');
    
    // Clear mock session cookies
    document.cookie = 'aptitude_mock_auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    document.cookie = 'aptitude_onboarding_completed=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden antialiased relative">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col h-screen shrink-0 z-20 relative backdrop-blur-xl">
        <div className="p-6 border-b border-slate-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white tracking-tight text-sm leading-tight">
              KINETIC HUB
            </span>
            <span className="text-[9px] font-bold text-blue-400 tracking-widest uppercase mt-0.5">
              Command Center
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'dashboard'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Learning Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveSidebarTab('practice')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'practice'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Practice Arena</span>
          </button>

          <div className="pt-4 border-t border-slate-900 mt-4 space-y-3">
            <div className="px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">Solved Count</span>
              <span className="text-blue-400 font-mono">{solvedCount} items</span>
            </div>
            <div className="px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">Active Streak</span>
              <span className="text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" /> {streak} Days
              </span>
            </div>
          </div>
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-900/80 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Profile</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-semibold select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Operational SSL sandbox</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Active goal:</span>
            <span className="text-[9px] font-black bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              {profile.primary_goal}
            </span>
          </div>          <div className="flex items-center gap-5">
            {/* Dribbble-style Preview / Edit Mode Pill Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-full border border-slate-200/60 dark:border-slate-800/80 shadow-inner select-none">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  // Swap role to admin and redirect to admin dashboard
                  const adminRole = {
                    role: 'admin',
                    name: 'SARAH CONNOR',
                    email: 'sarah.c@aptitude-ai.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
                  router.push('/admin/dashboard');
                }}
                className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 cursor-pointer"
              >
                Edit / Admin
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3.5">
              <div className="text-right flex flex-col">
                <span className="text-[11.5px] font-black text-slate-900 dark:text-white">{profile.username}</span>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider">{profile.degree} · {profile.branch}</span>
              </div>
              <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {profile.username ? profile.username[0] : 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
          
          {activeSidebarTab === 'dashboard' ? (
            // ====================================================================
            // REDESIGNED SAAS COMMAND CENTER VIEW
            // ====================================================================
            <div className="space-y-8 animate-fadeIn">
              
              {/* 1. Welcome Section & Level Progress Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/20 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>84% closer to your next level</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Good Evening, {profile.username.split(' ')[0]}
                  </h1>
                  <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                    You have unlocked tier credentials. Keep solving quantitative modules and coding milestones to elevate your placement readiness indicators.
                  </p>
                </div>

                {/* Level / XP Stats panel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0 w-full lg:w-auto relative z-10">
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-center space-y-1 min-w-[100px]">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block">Level Tier</span>
                    <span className="text-base font-black text-blue-400 font-mono">Lvl 12</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-center space-y-1 min-w-[100px]">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block">Total XP</span>
                    <span className="text-base font-black text-indigo-400 font-mono">12,450 XP</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-center space-y-1 min-w-[100px]">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block">Global Rank</span>
                    <span className="text-base font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> #452
                    </span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-center space-y-1 min-w-[100px]">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block">College Rank</span>
                    <span className="text-base font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> #14
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Continue Learning & Streak / Consistency row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Continue Learning (Duolingo inspired) */}
                <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-slate-800 transition-all">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.03),transparent_50%)] pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resume Learning Path</span>
                    <span className="text-[8.5px] font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">Lvl 12 Track</span>
                  </div>

                  <div className="my-5 flex items-center gap-5">
                    {/* Ring Progress SVG */}
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="rgba(30, 41, 59, 0.5)" strokeWidth="4.5" fill="transparent" />
                        <circle cx="32" cy="32" r="26" stroke="#4f46e5" strokeWidth="4.5" fill="transparent" strokeDasharray="163" strokeDashoffset="45" className="transition-all duration-1000" />
                      </svg>
                      <span className="absolute text-xs font-black font-mono text-indigo-400">72%</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Last Topic Studied</span>
                      <h3 className="text-sm font-bold text-white leading-normal">Percentages → Profit & Loss</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Estimated completion time: 25 mins left</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveSidebarTab('practice')}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Continue Journey</span>
                  </button>
                </div>

                {/* Streak & Activity Heatmap */}
                <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between group hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Consistency & Streak Calendar</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">Consistency Score: 96%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-4">
                    {/* Streak stats info */}
                    <div className="md:col-span-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">XP Earned Today</span>
                        <span className="text-[11px] font-black text-emerald-400 font-mono">+120 XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Weekly Streak</span>
                        <span className="text-[11px] font-black text-white font-mono">2 Weeks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Monthly Streak</span>
                        <span className="text-[11px] font-black text-white font-mono">1 Month</span>
                      </div>
                    </div>

                    {/* GitHub Activity Heatmap (Grid cells represent recent days) */}
                    <div className="md:col-span-8 flex flex-col items-start md:items-end gap-1.5">
                      <div className="grid grid-cols-12 gap-1.5">
                        {Array.from({ length: 36 }).map((_, i) => {
                          const activeLevels = [0, 0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 2, 0, 0, 1, 0, 2, 3, 0, 1, 2, 0, 3, 1, 0, 1, 0, 2, 3, 1, 2, 0, 3, 1, 2, 3];
                          const lvl = activeLevels[i];
                          const bgClass = lvl === 3 
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                            : lvl === 2 
                            ? 'bg-emerald-600/70' 
                            : lvl === 1 
                            ? 'bg-emerald-800/40' 
                            : 'bg-slate-900 border border-slate-950/20';

                          return (
                            <div 
                              key={i} 
                              className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${bgClass}`}
                              title={`Activity level: ${lvl}`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Last 36 days activity tracker map</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Career Opportunities Hub (Redesigned dynamic countdown card) */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(59,130,246,0.02),transparent_60%)] pointer-events-none" />
                
                {/* Hub Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Career Opportunities Hub</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Live hiring drives, internship offers, walk-in events, and government notifications synced from admins.
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="bg-slate-900 p-1 rounded-xl border border-slate-850/80 overflow-hidden max-w-full">
                    <div className="flex overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
                      {['All', 'Hiring', 'Internship', 'Government Exam', 'Hackathon'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedOpportunityType(type)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                            selectedOpportunityType === type 
                              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {type === 'Government Exam' ? 'Gov Exams' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feed Feed */}
                {oppsLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-7 h-7 rounded-full border border-blue-600 border-t-transparent animate-spin mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loading latest drives...</span>
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center p-6 bg-slate-900/10 rounded-2xl border border-dashed border-slate-900">
                    <Info className="w-7 h-7 text-slate-600 mb-2" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active opportunities found</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Check back later for active portal drives.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                    {filteredOpportunities.map((o) => {
                      const isExpanded = expandedOpportunityId === o.id;
                      const statusColor = 
                        o.status === 'Open' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' :
                        o.status === 'Closing Soon' ? 'text-amber-400 bg-amber-950/40 border-amber-900/30' :
                        o.status === 'New' ? 'text-blue-400 bg-blue-950/40 border-blue-900/30' :
                        'text-rose-400 bg-rose-950/40 border-rose-900/30';

                      const typeColor = 
                        o.type === 'Hiring' ? 'bg-blue-900/40 text-blue-400 border-blue-800/20' :
                        o.type === 'Internship' ? 'bg-indigo-900/40 text-indigo-400 border-indigo-800/20' :
                        o.type === 'Government Exam' ? 'bg-amber-900/40 text-amber-400 border-amber-800/20' :
                        o.type === 'Hackathon' ? 'bg-purple-900/40 text-purple-400 border-purple-800/20' :
                        'bg-slate-900/60 text-slate-400 border-slate-800/40';

                      return (
                        <div 
                          key={o.id}
                          className="bg-slate-950/60 border border-slate-900 hover:border-slate-850 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:bg-slate-900/20 hover:-translate-y-0.5"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${typeColor}`}>
                                {o.type}
                              </span>
                              <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border flex items-center gap-1 ${statusColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {o.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-xs font-black text-white tracking-tight uppercase leading-snug">{o.title}</h3>
                              <span className="text-[10px] text-slate-500 font-bold tracking-tight block">{o.organization}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-900/60 pt-3 space-y-3">
                            <div className="flex items-center justify-between text-[9.5px]">
                              <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Before {o.deadline}</span>
                              </div>
                              {o.days_remaining > 0 ? (
                                <span className="text-amber-400 font-bold font-mono">{o.days_remaining} Days Left</span>
                              ) : (
                                <span className="text-rose-500 font-bold font-mono">Expired</span>
                              )}
                            </div>

                            {/* Detail Drawer (expandable) */}
                            {isExpanded && o.details && (
                              <div className="bg-slate-900/50 rounded-xl p-3 text-[10.5px] text-slate-400 leading-relaxed border border-slate-850 animate-fadeIn font-medium">
                                {o.details}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-[10px] uppercase rounded-lg border border-slate-850 transition-colors cursor-pointer"
                              >
                                {isExpanded ? 'Hide Info' : 'Details'}
                              </button>
                              
                              <a 
                                href={o.link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-lg shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-1 cursor-pointer transition-all"
                              >
                                <span>Apply</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Learning Progress Analytics (custom SVG gauges) */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">Learning Progress Analytics</h2>
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Syllabus Milestones</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                  
                  {/* Domain 1: Quantitative Aptitude */}
                  <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Quant Aptitude</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">Accuracy: 84%</span>
                    </div>
                    {/* SVG Gauge */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="5.5" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="#3b82f6" strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset="50" />
                      </svg>
                      <span className="absolute text-sm font-black font-mono text-white">75%</span>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Weak Areas</span>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Ratios</span>
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Partnerships</span>
                      </div>
                    </div>
                  </div>

                  {/* Domain 2: Logical Reasoning */}
                  <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Logical Reasoning</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">Accuracy: 92%</span>
                    </div>
                    {/* SVG Gauge */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="5.5" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="#6366f1" strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset="120" />
                      </svg>
                      <span className="absolute text-sm font-black font-mono text-white">40%</span>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Weak Areas</span>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Syllogisms</span>
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Blood Relations</span>
                      </div>
                    </div>
                  </div>

                  {/* Domain 3: Verbal Ability */}
                  <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Verbal Ability</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">Accuracy: 78%</span>
                    </div>
                    {/* SVG Gauge */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="5.5" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="#a855f7" strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset="30" />
                      </svg>
                      <span className="absolute text-sm font-black font-mono text-white">85%</span>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Weak Areas</span>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Modifiers</span>
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Comprehension</span>
                      </div>
                    </div>
                  </div>

                  {/* Domain 4: Coding */}
                  <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Coding & DS</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">Accuracy: 64%</span>
                    </div>
                    {/* SVG Gauge */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="5.5" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="#10b981" strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset="160" />
                      </svg>
                      <span className="absolute text-sm font-black font-mono text-white">20%</span>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Weak Areas</span>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Recursion</span>
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold">Tree Traversals</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Leaderboard, Tests & Admin Announcements row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Leaderboard Widget (6 cols) */}
                <div className="lg:col-span-6 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between group hover:border-slate-800 transition-all">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4.5 h-4.5 text-amber-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Leaderboard</span>
                      </div>
                      
                      {/* Leaderboard tabs */}
                      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-850">
                        {['college', 'global', 'friends'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveLeaderboardTab(tab as any)}
                            className={`px-2.5 py-1 rounded text-[8.5px] font-black uppercase transition-all cursor-pointer ${
                              activeLeaderboardTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Leaderboard lists */}
                    <div className="space-y-2">
                      {[
                        { rank: 1, name: 'Sriram Neppalli', xp: '18,920 XP', progress: '94%', self: false },
                        { rank: 2, name: 'Aditya Sen', xp: '16,400 XP', progress: '88%', self: false },
                        { rank: 3, name: 'Rohan Sharma', xp: '14,200 XP', progress: '85%', self: false },
                        { rank: 14, name: 'Vaishnavi Raparthy (You)', xp: '12,450 XP', progress: '72%', self: true }
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            item.self 
                              ? 'bg-blue-900/10 border-blue-950 text-blue-400' 
                              : 'bg-slate-900/30 border-slate-900/60 hover:bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] ${
                              item.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                              item.rank === 2 ? 'bg-slate-400/20 text-slate-450' :
                              item.rank === 3 ? 'bg-amber-700/20 text-amber-700' :
                              'bg-slate-900 text-slate-500'
                            }`}>
                              {item.rank}
                            </span>
                            <span className="text-xs font-bold leading-none">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-slate-500 font-semibold font-mono">{item.xp}</span>
                            <span className="font-mono font-black text-blue-400">{item.progress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Tests & Challenges (6 cols) */}
                <div className="lg:col-span-6 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between group hover:border-slate-800 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4.5 h-4.5 text-blue-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upcoming Tests & Challenges</span>
                      </div>
                      <span className="text-[9px] font-black text-indigo-400">3 assessments scheduled</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: 'TCS Aptitude Mock Test #4', difficulty: 'MEDIUM', duration: '90m', participants: '1.4k', date: 'June 5, 2:00 PM' },
                        { title: 'Daily Logic Challenge - Arrays', difficulty: 'HARD', duration: '20m', participants: '450', date: 'Daily Concept' },
                        { title: 'Goldman Sachs Simulation Staging', difficulty: 'HARD', duration: '120m', participants: '820', date: 'June 8, 10:00 AM' }
                      ].map((test, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-900/30 border border-slate-900/60 rounded-xl p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-all"
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-tight">{test.title}</h4>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-semibold">
                              <span>Duration: {test.duration}</span>
                              <span>•</span>
                              <span>{test.participants} registered</span>
                            </div>
                          </div>
                          <div className="text-right space-y-1 shrink-0">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider block text-center ${
                              test.difficulty === 'HARD'
                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-400'
                                : 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                            }`}>
                              {test.difficulty}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 font-mono block">{test.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 6. Admin Announcements & Recommended For You */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Admin Announcements (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4.5 h-4.5 text-blue-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Announcements</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Latest updates</span>
                    </div>

                    {announcementsLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 rounded-full border border-blue-600 border-t-transparent animate-spin mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loading announcements...</span>
                      </div>
                    ) : announcements.length === 0 ? (
                      <div className="py-8 flex items-center justify-center text-slate-500 text-xs">
                        No announcements posted.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {announcements.map((a) => (
                          <div 
                            key={a.id}
                            className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-2 hover:bg-slate-900/40 transition-colors"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded uppercase">
                                  {a.type}
                                </span>
                                {a.priority === 'High' && (
                                  <span className="text-[8px] font-black bg-rose-950/40 border border-rose-900/30 text-rose-400 px-1.5 py-0.2 rounded uppercase animate-pulse">
                                    High Priority
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-500 font-semibold">{a.publisher}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white tracking-tight uppercase">{a.title}</h4>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">{a.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended For You AI Module (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between group hover:border-slate-800 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended For You</span>
                      </div>
                      <span className="text-[9px] font-black text-indigo-400 animate-pulse">AI Generated</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal font-medium">
                      Based on your recent accuracy metrics, here are personalized tasks recommendations to maximize your speed profiles:
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { title: 'Revise Percentages', score: 'Low Accuracy (42%) in tests', category: 'Quant Practice' },
                        { title: 'Practice Time & Work Module 3', score: 'Unattempted concept sheets', category: 'Core Aptitude' },
                        { title: 'Complete Mock Test #4', score: 'Simulate company pressure checks', category: 'Assessment' }
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-900/40 border border-slate-900 hover:border-slate-850 p-3.5 rounded-xl space-y-1 cursor-pointer transition-all hover:bg-slate-900/80 flex justify-between items-center gap-4"
                        >
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            <span className="text-[10px] text-slate-500 font-medium block">{item.score}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            // ====================================================================
            // UNCHANGED CURATED PRACTICE ARENA QUESTION VIEW
            // ====================================================================
            <div className="space-y-6 pt-2 animate-fadeIn">
              
              {/* Section Title & Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase font-sans">Curated Practice Arena</h3>
                  <p className="text-xs text-slate-400 mt-1">Real-time Aptitude and Verbal solving sheets updated by editors.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search question stems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Domain Switcher */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 shadow-2xs">
                  {['All', 'quant', 'logical', 'verbal'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        selectedDomain === domain 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {domain === 'All' ? 'All Domains' : domain === 'quant' ? 'Quantitative' : domain === 'logical' ? 'Logical' : 'Verbal'}
                    </button>
                  ))}
                </div>

                {/* Difficulty pills */}
                <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-900">
                  {['All', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        selectedDifficulty === diff 
                          ? 'bg-slate-800 text-slate-100' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scalable Practice Question Feed */}
              {isLoading ? (
                <div className="bg-slate-950 border border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border border-blue-600 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling question catalog...</span>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="bg-slate-950 border border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6">
                  <Info className="w-8 h-8 text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching questions cataloged</span>
                  <span className="text-[10px] text-slate-500 mt-1 leading-normal">Try clearing domain or difficulty selections.</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredQuestions.map((q) => {
                    const isBookmarked = bookmarks.includes(q.id);
                    const isSubmitted = submittedAnswers[q.id];
                    const selectedOption = selectedAnswers[q.id];
                    const showSolution = revealedSolutions[q.id];

                    const domainLabel = q.domainId === 'quant' ? 'QUANT' : q.domainId === 'logical' ? 'LOGICAL' : 'VERBAL';

                    return (
                      <div 
                        key={q.id}
                        className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-all duration-150 shadow-xs relative overflow-hidden"
                      >
                        {/* Top banner tag info */}
                        <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-blue-950/40 text-blue-400 border border-blue-900/35 px-2 py-0.5 rounded tracking-wide uppercase">
                              {domainLabel}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                              q.difficulty === 'EASY' 
                                ? 'bg-emerald-950/30 border-emerald-900/30 text-emerald-450'
                                : q.difficulty === 'HARD'
                                ? 'bg-rose-955/30 border-rose-900/30 text-rose-450'
                                : 'bg-amber-955/30 border-amber-900/30 text-amber-450'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="font-mono text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">#{q.id}</span>
                          </div>

                          {/* Interactive actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(q.id)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBookmarked 
                                  ? 'bg-amber-950/30 border-amber-900 text-amber-500' 
                                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        {/* Question Stem Text Area */}
                        <div className="space-y-3 leading-relaxed">
                          <div className="text-[12.5px] font-bold text-slate-100 whitespace-pre-wrap leading-normal font-sans">
                            {q.questionStem}
                          </div>
                        </div>

                        {/* Selectable Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {q.options.map((opt) => {
                            const isOptionSelected = selectedOption === opt.id;
                            const showCorrectness = isSubmitted && opt.isCorrect;
                            const showIncorrectness = isSubmitted && isOptionSelected && !opt.isCorrect;

                            return (
                              <button
                                key={opt.id}
                                onClick={() => !isSubmitted && handleAnswerSelect(q.id, opt.id)}
                                disabled={isSubmitted}
                                className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 text-[11.5px] transition-all duration-155 ${
                                  showCorrectness
                                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-2xs'
                                    : showIncorrectness
                                    ? 'border-rose-500 bg-rose-955/20 text-rose-300 shadow-2xs'
                                    : isOptionSelected
                                    ? 'border-blue-600 bg-blue-950/30 text-white'
                                    : 'border-slate-900 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-900/30 text-slate-300 disabled:opacity-60 disabled:hover:border-slate-900'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] shrink-0 border ${
                                    showCorrectness 
                                      ? 'border-emerald-800/40 bg-emerald-900/35 text-emerald-450' 
                                      : showIncorrectness 
                                      ? 'border-rose-800/40 bg-rose-900/35 text-rose-450'
                                      : 'border-slate-800 bg-slate-900 text-slate-400'
                                  }`}>
                                    {opt.id}
                                  </span>
                                  <span className="font-semibold leading-normal break-words mt-0.5">{opt.text}</span>
                                </div>

                                {/* Correctness indicators */}
                                <div className="shrink-0 flex items-center">
                                  {showCorrectness && (
                                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                  {showIncorrectness && (
                                    <div className="w-4.5 h-4.5 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-inner">
                                      <X className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Explanation & Video solver toggler */}
                        {isSubmitted && (
                          <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button
                              onClick={() => toggleSolution(q.id)}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer select-none"
                            >
                              <span>{showSolution ? 'Hide' : 'Show'} Step-by-Step Explanation</span>
                              {showSolution ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                            </button>
                            
                            {q.videoUrl && (
                              <a 
                                href={q.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-450 flex items-center gap-1 transition-colors select-none"
                              >
                                <Play className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>Watch video solution</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Solved Explanation drawer */}
                        {isSubmitted && showSolution && q.hintText && (
                          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4.5 text-xs text-slate-400 leading-normal whitespace-pre-wrap font-medium animate-fadeIn">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5 mb-2 select-none">LaTeX Mathematical Solver Output</span>
                            {q.hintText.replace(/\\frac/g, '').replace(/\\text/g, '').replace(/[\{\}]/g, ' ')}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
