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
  Briefcase,
  Sun,
  Moon,
  Lock,
  Heart,
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  HelpCircle,
  BookMarked
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

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [themeMounted, setThemeMounted] = useState(false);

  // Profile Save Message state
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Sync tab from URL parameters to support external routing
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['dashboard', 'learning', 'practice', 'mockTests', 'careerHub', 'leaderboards', 'profile', 'settings'].includes(tabParam)) {
        setActiveSidebarTab(tabParam as any);
      }
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const [solvedCount, setSolvedCount] = useState(12);
  const [streak, setStreak] = useState(14); // Simulated active streak
  const [bookmarks, setBookmarks] = useState<string[]>(['Q-8029-X']); 
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'learning' | 'practice' | 'mockTests' | 'careerHub' | 'leaderboards' | 'profile' | 'settings'>('dashboard');

  // Footer state variables
  const [footerBadgeText, setFooterBadgeText] = useState('Operational Clearance: Sandbox Encrypted');
  const [footerCopyright, setFooterCopyright] = useState('© 2026 Aptitude AI platform. All rights reserved.');

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
    // Load footer settings from localStorage
    const savedFooterBadge = localStorage.getItem('aptitude_footer_badge_text');
    if (savedFooterBadge) setFooterBadgeText(savedFooterBadge);
    
    const savedFooterCopyright = localStorage.getItem('aptitude_footer_copyright');
    if (savedFooterCopyright) setFooterCopyright(savedFooterCopyright);

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

        // Preserve manually toggled admin/preview role across reloads
        const roleStored = localStorage.getItem('aptitude_current_role');
        if (roleStored) {
          try {
            const parsed = JSON.parse(roleStored);
            roleObj.role = parsed.role;
            roleObj.name = parsed.name || roleObj.name;
          } catch (_) {}
        }

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

  // Filtered Opportunities (for Career Hub view and dashboard preview)
  const filteredOpportunities = useMemo(() => {
    if (selectedOpportunityType === 'All') return opportunities;
    // Map custom sub-tabs in career hub to opportunity types
    const mappedType = 
      selectedOpportunityType === 'Hiring Drives' ? 'Hiring' :
      selectedOpportunityType === 'Internships' ? 'Internship' :
      selectedOpportunityType === 'Government Exams' ? 'Government Exam' :
      selectedOpportunityType === 'Hackathons' ? 'Hackathon' :
      selectedOpportunityType;
    return opportunities.filter(o => o.type === mappedType);
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

  // Save profile updates
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aptitude_onboarding_data', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Calculate dynamic daily challenge progress (Starts at 8, increments up to 15)
  const challengeCompletedCount = useMemo(() => {
    return Math.min(15, 8 + (solvedCount - 12));
  }, [solvedCount]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-900 flex flex-col h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm leading-tight">
              KINETIC HUB
            </span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mt-0.5">
              Command Center
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          
          {/* Dashboard Tab */}
          <button 
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'dashboard'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>
          
          {/* Domains Tab */}
          <button 
            onClick={() => router.push('/student/domains')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
          >
            <Layers className="w-4.5 h-4.5" />
            <span>Domains</span>
          </button>
          
          {/* Learning Tab */}
          <button 
            onClick={() => setActiveSidebarTab('learning')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'learning'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Learning</span>
          </button>

          {/* Practice Arena Tab */}
          <button 
            onClick={() => setActiveSidebarTab('practice')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'practice'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Practice Arena</span>
          </button>

          {/* Mock Tests Tab */}
          <button 
            onClick={() => setActiveSidebarTab('mockTests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'mockTests'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>Mock Tests</span>
          </button>

          {/* Career Hub Tab */}
          <button 
            onClick={() => {
              setActiveSidebarTab('careerHub');
              setSelectedOpportunityType('All');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'careerHub'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Career Hub</span>
          </button>

          {/* Leaderboards Tab */}
          <button 
            onClick={() => setActiveSidebarTab('leaderboards')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'leaderboards'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>Leaderboards</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => setActiveSidebarTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'profile'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile</span>
          </button>

          {/* Settings Tab */}
          <button 
            onClick={() => setActiveSidebarTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSidebarTab === 'settings'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>

          {/* Admin Tools Section */}
          {currentRole?.role === 'admin' && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-1 select-none animate-fadeIn">
              <span className="px-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Admin Tools</span>
              <button 
                onClick={() => router.push('/admin/editor')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer text-left"
              >
                <SettingsIcon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450" />
                <span>Content Creator</span>
              </button>
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer text-left"
              >
                <Layers className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* Core User Stats inside Sidebar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-2.5">
            <div className="px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-200 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">Solved Count</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{solvedCount} items</span>
            </div>
            <div className="px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-200 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">Active Streak</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" /> {streak} Days
              </span>
            </div>
          </div>
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900/85 space-y-3 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition-colors cursor-pointer text-left dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/20"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Profile</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-semibold select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Operational SSL sandbox</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center justify-between bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Active goal:</span>
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40 px-2.5 py-0.5 rounded-md uppercase tracking-wider transition-colors duration-300">
              {profile.primary_goal}
            </span>
          </div>
          <div className="flex items-center gap-5">
            
            {/* Preview/Edit Switcher */}
            <div className="flex bg-slate-105 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner select-none mr-2">
              <button
                type="button"
                onClick={() => {
                  const studentRole = {
                    role: 'STUDENT',
                    name: 'Vaishnavi Raparthy',
                    email: 'student@aptitude-ai.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
                  setCurrentRole(studentRole);
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentRole?.role !== 'admin'
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const adminRole = {
                    role: 'admin',
                    name: 'SARAH CONNOR',
                    email: 'sarah.c@aptitude-ai.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
                  setCurrentRole(adminRole);
                  router.push('/admin/editor');
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentRole?.role === 'admin'
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Edit / Admin
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer select-none"
              title="Toggle theme"
              suppressHydrationWarning
            >
              {themeMounted && theme === 'light' ? (
                <Sun className="w-[18px] h-[18px] text-amber-500 animate-fadeIn" />
              ) : (
                <Moon className="w-[18px] h-[18px] text-indigo-400 animate-fadeIn" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3.5">
              <div className="text-right flex flex-col">
                <span className="text-[11.5px] font-black text-slate-900 dark:text-white">{profile.username}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">{profile.degree} · {profile.branch}</span>
              </div>
              <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {profile.username ? profile.username[0] : 'V'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 flex flex-col justify-between">


          {/* ====================================================================
              1. TAB: DASHBOARD (Duolingo Redesign Layout)
              ==================================================================== */}
          {activeSidebarTab === 'dashboard' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              {/* Admin Banner Alert */}
              {currentRole?.role === 'admin' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40 text-blue-800 dark:text-blue-400 animate-fadeIn shadow-xs select-none">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-650 text-white shadow-xs">
                      <SettingsIcon className="w-4 h-4 animate-pulse" />
                    </span>
                    <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider leading-none">Editor Mode Activated</h4>
                      <p className="text-[10px] font-semibold text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed">
                        You are now modifying student view elements. You can edit footer copyright credentials directly in-place or manage platform questions in the editor.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/admin/editor')}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Content Creator</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
              
              {/* Hero Progress Card */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none" />
                
                {/* Hero Info (Left) */}
                <div className="space-y-4 text-center md:text-left relative z-10">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      Welcome back, {profile.username.split(' ')[0]} 👋
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight font-heading">
                      Continue Your Journey
                    </h1>
                    <p className="text-base font-bold text-slate-600 dark:text-slate-350 tracking-tight bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 px-3 py-1.5 rounded-xl inline-block">
                      Percentages → Profit & Loss
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveSidebarTab('learning')}
                      className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 duration-200"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Learning</span>
                    </button>
                    <button 
                      onClick={() => setActiveSidebarTab('practice')}
                      className="py-3 px-5 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300 dark:hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-white/50 dark:bg-transparent"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      <span>Practice Arena</span>
                    </button>
                  </div>
                </div>

                {/* Progress Indicators & Mascot (Right) */}
                <div className="flex items-center gap-8 z-10 shrink-0 select-none flex-col sm:flex-row">
                  
                  {/* Mascot SVG */}
                  <div className="w-24 h-24 hover:scale-105 transition-all duration-300 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.2)]">
                      {/* Mascot body */}
                      <circle cx="50" cy="50" r="40" fill="url(#gradMascot)" stroke="#2563EB" strokeWidth="2.5" />
                      
                      {/* Mascot eyes */}
                      <ellipse cx="38" cy="42" rx="7" ry="10" fill="#FFFFFF" />
                      <ellipse cx="62" cy="42" rx="7" ry="10" fill="#FFFFFF" />
                      
                      {/* Mascot pupils */}
                      <ellipse cx="38" cy="42" rx="3" ry="5" fill="#0F172A" />
                      <ellipse cx="62" cy="42" rx="3" ry="5" fill="#0F172A" />
                      
                      {/* Pupil shines */}
                      <circle cx="36" cy="39" r="1.5" fill="#FFFFFF" />
                      <circle cx="60" cy="39" r="1.5" fill="#FFFFFF" />

                      {/* Cheek blush */}
                      <circle cx="28" cy="54" r="3" fill="#F87171" opacity="0.6" />
                      <circle cx="72" cy="54" r="3" fill="#F87171" opacity="0.6" />
                      
                      {/* Mascot friendly smile */}
                      <path d="M 42 56 Q 50 63 58 56" stroke="#0F172A" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                      
                      {/* Graduation Cap */}
                      <path d="M 22 26 L 50 14 L 78 26 L 50 38 Z" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="1.5" />
                      <path d="M 36 30 L 36 44 Q 50 48 64 44 L 64 30" fill="transparent" stroke="#1D4ED8" strokeWidth="2" />
                      {/* Tassel */}
                      <path d="M 50 24 L 76 34 L 78 40" fill="transparent" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="78" cy="41" r="1.5" fill="#F59E0B" />

                      {/* Sparkles */}
                      <path d="M 85 20 L 88 23 L 85 26 L 82 23 Z" fill="#F59E0B" className="animate-pulse" />

                      <defs>
                        <linearGradient id="gradMascot" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60A5FA" />
                          <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white dark:border-[#030712] animate-bounce">
                      <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  </div>

                  {/* Ring Progress Indicator */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="rgba(226, 232, 240, 0.4)" strokeWidth="5" fill="transparent" className="dark:stroke-slate-850/50" />
                      <circle cx="40" cy="40" r="32" stroke="#2563EB" strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset="50" strokeLinecap="round" className="transition-all duration-1000 stroke-blue-600 dark:stroke-blue-400" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-base font-black font-mono text-slate-800 dark:text-white">75%</span>
                      <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider">Done</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Daily XP */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-amber-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Daily XP</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">120 XP</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-orange-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5 fill-current animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Streak</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">{streak} Days</span>
                  </div>
                </div>

                {/* Level */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-blue-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Level</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">Lvl 12</span>
                  </div>
                </div>

                {/* Rank */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-indigo-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">College Rank</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">#14</span>
                  </div>
                </div>

              </div>

              {/* Grid Layout: Subjects (Left) and Daily Challenge / Career Hub Preview (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 4 Major Subject Tracks (Left Column - 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/80 pb-3">
                    <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                      <span>Subject Learning Tracks</span>
                    </h2>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase">4 categories active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Quant Aptitude */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Quant Aptitude</span>
                        <span className="text-[10px] text-blue-650 bg-blue-50 border border-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 84%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">75%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Logical Reasoning */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Logical Reasoning</span>
                        <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 92%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">40%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Verbal Ability */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Verbal Ability</span>
                        <span className="text-[10px] text-purple-650 bg-purple-50 border border-purple-100 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 78%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">85%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Coding & DSA */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Coding & DSA</span>
                        <span className="text-[10px] text-emerald-650 bg-emerald-50 border border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 64%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">20%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Daily Challenge & Career Hub (Right Column - 5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* Daily Challenge Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900/60 pb-3 mb-4">
                      <Target className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Today's Challenge</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Solve 15 Quant Questions</h4>
                        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">Streak booster: Earn double XP milestones today</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Progress Tracker</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{challengeCompletedCount} / 15 Solved</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(challengeCompletedCount / 15) * 100}%` }} />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSidebarTab('practice');
                          setSelectedDomain('quant');
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <span>Start Challenge</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Opportunities Section (Career Hub Preview - Max 3) */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Active Placements</h3>
                      </div>
                      <button 
                        onClick={() => setActiveSidebarTab('careerHub')}
                        className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase flex items-center gap-0.5 cursor-pointer transition-colors"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {oppsLoading ? (
                      <div className="py-6 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 rounded-full border border-indigo-650 border-t-transparent animate-spin mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {opportunities.slice(0, 3).map((o) => {
                          const statusColor = 
                            o.status === 'Open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/25' :
                            o.status === 'Closing Soon' ? 'text-amber-700 bg-amber-55/60 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/25' :
                            o.status === 'New' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/25' :
                            'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/25';

                          const typeBadge = 
                            o.type === 'Hiring' ? 'Hiring' :
                            o.type === 'Internship' ? 'Intern' :
                            o.type === 'Government Exam' ? 'Gov Exam' :
                            o.type === 'Hackathon' ? 'Hackathon' : o.type;

                          const isExpanded = expandedOpportunityId === o.id;

                          return (
                            <div key={o.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/80 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8.5px] font-black bg-indigo-50 border border-indigo-150 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.2 rounded uppercase">
                                    {typeBadge}
                                  </span>
                                  <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border uppercase font-mono ${statusColor}`}>
                                    {o.status}
                                  </span>
                                </div>
                                <span className="text-[8.5px] font-bold text-slate-500">Till {o.deadline}</span>
                              </div>

                              <div className="space-y-0.5">
                                <h4 className="text-[11.5px] font-black text-slate-900 dark:text-white leading-tight uppercase">{o.title}</h4>
                                <span className="text-[10px] text-slate-450 block font-semibold">{o.organization}</span>
                              </div>

                              {isExpanded && o.details && (
                                <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 animate-fadeIn">
                                  {o.details}
                                </p>
                              )}

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                                  className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[9px] uppercase rounded-lg border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-850 transition-colors cursor-pointer text-center"
                                >
                                  {isExpanded ? 'Hide' : 'Details'}
                                </button>
                                <a 
                                  href={o.link} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                                >
                                  <span>Apply</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ====================================================================
              2. TAB: LEARNING PATHWAY (Duolingo Style roadmap path map)
              ==================================================================== */}
          {activeSidebarTab === 'learning' && (
            <div className="w-full space-y-8 animate-fadeIn">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white font-heading">Your learning roadmap</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">Click on the active lesson nodes to solve matching assessment questions.</p>
              </div>

              {/* Duolingo Winding Roadmap Map */}
              <div className="relative flex flex-col items-center py-10 space-y-12">
                
                {/* Winding Vertical Connector line */}
                <div className="absolute top-10 bottom-10 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-slate-250 dark:to-slate-800 rounded-full z-0" />

                {/* Path Nodes */}
                {[
                  { id: 1, title: 'Percentages', desc: 'Core fractional relationships', status: 'completed', symbol: '%', color: 'emerald' },
                  { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', status: 'completed', symbol: '1:2', color: 'emerald' },
                  { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', status: 'active', symbol: '₹', color: 'blue' },
                  { id: 4, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', status: 'locked', symbol: '⏳', color: 'slate' },
                  { id: 5, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', status: 'locked', symbol: 'V', color: 'slate' },
                  { id: 6, title: 'Blood Relations', desc: 'Structured family maps trees', status: 'locked', symbol: '👪', color: 'slate' },
                  { id: 7, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', status: 'locked', symbol: '[]', color: 'slate' },
                  { id: 8, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', status: 'locked', symbol: '()', color: 'slate' }
                ].map((node, index) => {
                  
                  // Winding left/right positioning classes
                  const offsetClass = 
                    index % 3 === 0 ? 'translate-x-0' :
                    index % 3 === 1 ? 'translate-x-12 sm:translate-x-20' :
                    '-translate-x-12 sm:-translate-x-20';

                  const isCompleted = node.status === 'completed';
                  const isActive = node.status === 'active';

                  return (
                    <div key={node.id} className={`flex flex-col items-center relative z-10 transition-all ${offsetClass}`}>
                      
                      {/* Active floating indicator badge */}
                      {isActive && (
                        <div className="absolute -top-8 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg animate-bounce flex items-center gap-1 border border-blue-400">
                          <Play className="w-2 h-2 fill-current" />
                          <span>Active Unit</span>
                        </div>
                      )}

                      {/* Circular Lesson Node */}
                      <button
                        onClick={() => {
                          if (!node.status.includes('locked')) {
                            setActiveSidebarTab('practice');
                            setSelectedDomain('quant');
                          }
                        }}
                        disabled={node.status === 'locked'}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-b-4 hover:scale-105 active:scale-95 transition-all select-none cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' 
                            : isActive 
                            ? 'bg-blue-600 border-blue-800 text-white animate-pulse-glow hover:bg-blue-500 shadow-blue-500/20' 
                            : 'bg-slate-200 border-slate-350 dark:bg-slate-900 dark:border-slate-950 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-8 h-8 stroke-[3.5]" />
                        ) : node.status === 'locked' ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span className="text-lg font-black font-mono">{node.symbol}</span>
                        )}
                      </button>

                      {/* Node Label card popup on hover */}
                      <div className="mt-3 text-center bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-900 shadow-md w-36 max-w-xs transition-colors">
                        <span className="text-[10px] font-black text-slate-800 dark:text-white block truncate uppercase">{node.title}</span>
                        <span className="text-[8.5px] text-slate-500 font-semibold block leading-tight mt-0.5">{node.desc}</span>
                        {isActive && (
                          <span className="text-[8.5px] text-blue-600 dark:text-blue-400 font-black block mt-1">75% Complete</span>
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* ====================================================================
              3. TAB: PRACTICE ARENA (Interactive Feed)
              ==================================================================== */}
          {activeSidebarTab === 'practice' && (
            <div className="space-y-6 pt-2 animate-fadeIn w-full">
              
              {/* Section Title & Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-5 transition-colors duration-300">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase font-sans flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-blue-600" />
                    <span>Practice Arena Feed</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time Aptitude and Verbal solving sheets updated by editors.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search question stems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Domain Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 shadow-2xs transition-colors duration-300">
                  {['All', 'quant', 'logical', 'verbal'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        selectedDomain === domain 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {domain === 'All' ? 'All Domains' : domain === 'quant' ? 'Quantitative' : domain === 'logical' ? 'Logical' : 'Verbal'}
                    </button>
                  ))}
                </div>

                {/* Difficulty pills */}
                <div className="flex items-center gap-2 bg-slate-50/60 p-1 rounded-xl border border-slate-200 dark:bg-slate-900/60 dark:border-slate-900 transition-colors duration-300">
                  {['All', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        selectedDifficulty === diff 
                          ? 'bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-100 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scalable Practice Question Feed */}
              {isLoading ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full border border-blue-600 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compiling question catalog...</span>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6 transition-colors duration-300">
                  <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-widest">No matching questions cataloged</span>
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
                        className="bg-white border border-slate-200 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-150 shadow-xs relative overflow-hidden"
                      >
                        {/* Top banner tag info */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3 flex-wrap gap-2 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/35 px-2 py-0.5 rounded tracking-wide uppercase transition-colors duration-300">
                              {domainLabel}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border transition-colors duration-300 ${
                              q.difficulty === 'EASY' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-450'
                                : q.difficulty === 'HARD'
                                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-455'
                                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-455'
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
                                  ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-500' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-450'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        {/* Question Stem Text Area */}
                        <div className="space-y-3 leading-relaxed">
                          <div className="text-[12.5px] font-bold text-slate-850 dark:text-slate-100 whitespace-pre-wrap leading-normal font-sans transition-colors duration-300">
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
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-300'
                                    : showIncorrectness
                                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-2xs dark:border-rose-500 dark:bg-rose-950/20 dark:text-rose-300'
                                    : isOptionSelected
                                    ? 'border-blue-600 bg-blue-50/30 text-slate-900 dark:border-blue-600 dark:bg-blue-950/30 dark:text-white'
                                    : 'border-slate-200 bg-slate-50/55 hover:border-slate-350 hover:bg-slate-50 text-slate-700 dark:border-slate-900 dark:bg-slate-950/20 dark:hover:border-slate-800 dark:hover:bg-slate-900/30 dark:text-slate-300 disabled:opacity-60 disabled:hover:border-slate-900'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] shrink-0 border transition-colors duration-300 ${
                                    showCorrectness 
                                      ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/35 dark:text-emerald-450' 
                                      : showIncorrectness 
                                      ? 'border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/35 dark:text-rose-455'
                                      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
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
                          <div className="border-t border-slate-100 dark:border-slate-900/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
                            <button
                              onClick={() => toggleSolution(q.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer select-none"
                            >
                              <span>{showSolution ? 'Hide' : 'Show'} Step-by-Step Explanation</span>
                              {showSolution ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                            </button>
                            
                            {q.videoUrl && (
                              <a 
                                href={q.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-450 flex items-center gap-1 transition-colors select-none"
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
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-xs text-slate-650 dark:bg-slate-900/40 dark:border-slate-900 dark:text-slate-400 leading-normal whitespace-pre-wrap font-medium animate-fadeIn transition-colors duration-300">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-900 pb-1.5 mb-2 select-none">LaTeX Mathematical Solver Output</span>
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

          {/* ====================================================================
              4. TAB: MOCK TESTS (Assessments center)
              ==================================================================== */}
          {activeSidebarTab === 'mockTests' && (
            <div className="w-full space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Placement Mock Arena</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prepare under simulated company timeline checks.</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 px-3 py-1 rounded-full uppercase">3 scheduled tests</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'TCS Aptitude Mock Test #4', difficulty: 'MEDIUM', duration: '90 mins', questions: '60 Questions', participants: '1.4k candidates registered', date: 'Starts today, 2:00 PM', status: 'Live Soon' },
                  { title: 'Goldman Sachs Simulation Staging', difficulty: 'HARD', duration: '120 mins', questions: '45 Questions', participants: '820 candidates registered', date: 'Scheduled: June 8, 10:00 AM', status: 'Register Open' },
                  { title: 'Daily Logic Challenge - Arrays & Matrices', difficulty: 'HARD', duration: '20 mins', questions: '10 Questions', participants: '450 candidates completed', date: 'Daily Challenge Topic', status: 'Completed' }
                ].map((test, idx) => {
                  const statusBg = 
                    test.status === 'Completed' ? 'bg-slate-100 text-slate-500 dark:bg-slate-900 border-slate-200' :
                    test.status === 'Live Soon' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';

                  return (
                    <div key={idx} className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide font-mono ${statusBg}`}>
                            {test.status}
                          </span>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${
                            test.difficulty === 'HARD' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400'
                          }`}>
                            {test.difficulty}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">{test.title}</h3>
                        
                        <div className="flex flex-wrap gap-4 text-[10.5px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.duration}</span>
                          <span>•</span>
                          <span>{test.questions}</span>
                          <span>•</span>
                          <span>{test.participants}</span>
                        </div>
                      </div>

                      <div className="text-left md:text-right flex flex-col items-start md:items-end justify-between shrink-0 gap-3">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">{test.date}</span>
                        <button 
                          disabled={test.status === 'Completed'}
                          className={`py-2 px-5 font-bold text-xs rounded-xl shadow-xs cursor-pointer select-none transition-all ${
                            test.status === 'Completed'
                              ? 'bg-slate-100 text-slate-450 border border-slate-200 dark:bg-slate-900 dark:text-slate-655 dark:border-slate-950 cursor-not-allowed shadow-none'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
                          }`}
                        >
                          {test.status === 'Completed' ? 'Challenge Done' : 'Enter Staging'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====================================================================
              5. TAB: CAREER HUB (Dedicated page with sub-filters)
              ==================================================================== */}
          {activeSidebarTab === 'careerHub' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Dedicated Career Hub Center</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live portal access drives, internships, government exams, hackathons, and placement updates.</p>
              </div>

              {/* Category sub-filters tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
                {['All', 'Hiring Drives', 'Internships', 'Government Exams', 'Hackathons', 'Placement Updates'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedOpportunityType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedOpportunityType === type 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Feed Grid */}
              {oppsLoading || announcementsLoading ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full border border-blue-650 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling opportunities files...</span>
                </div>
              ) : selectedOpportunityType === 'Placement Updates' ? (
                // Display Placement Updates Announcements
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a.id} className="bg-white border border-slate-200 dark:bg-slate-900/15 dark:border-slate-900 p-5 rounded-2xl space-y-2.5 hover:border-slate-350 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30 px-2 py-0.5 rounded-lg uppercase">
                            {a.type}
                          </span>
                          {a.priority === 'High' && (
                            <span className="text-[8px] font-black bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-455 px-1.5 py-0.2 rounded uppercase animate-pulse">
                              High Priority
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold">{a.publisher} · {a.date || 'June 4'}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">{a.title}</h4>
                      <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">{a.content}</p>
                    </div>
                  ))}
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6">
                  <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Active Opportunities in this Category</span>
                  <p className="text-[10px] text-slate-450 mt-1 leading-normal">Check back later for active portal drives.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((o) => {
                    const isExpanded = expandedOpportunityId === o.id;
                    const statusColor = 
                      o.status === 'Open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/25' :
                      o.status === 'Closing Soon' ? 'text-amber-700 bg-amber-55/65 border-amber-250 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/25' :
                      o.status === 'New' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/25' :
                      'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-455 dark:bg-rose-950/20 dark:border-rose-900/25';

                    const typeBadge = 
                      o.type === 'Hiring' ? 'Hiring Drive' :
                      o.type === 'Internship' ? 'Internship' :
                      o.type === 'Government Exam' ? 'Government Exam' :
                      o.type === 'Hackathon' ? 'Hackathon' : o.type;

                    return (
                      <div 
                        key={o.id}
                        className="bg-white border border-slate-200 hover:border-slate-350 dark:bg-slate-900/10 dark:border-slate-900 dark:hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[8.5px] font-black px-2 py-0.5 rounded border bg-indigo-50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 uppercase font-mono">
                              {typeBadge}
                            </span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase font-mono ${statusColor}`}>
                              {o.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-snug">{o.title}</h3>
                            <span className="text-xs text-slate-500 font-bold tracking-tight block">{o.organization}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 space-y-3 transition-colors duration-300">
                          <div className="flex items-center justify-between text-[10.5px]">
                            <div className="flex items-center gap-1 text-slate-500 font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Till {o.deadline}</span>
                            </div>
                            {o.days_remaining > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">{o.days_remaining} Days Left</span>
                            ) : (
                              <span className="text-slate-450 dark:text-slate-550 font-bold uppercase font-mono">Closed</span>
                            )}
                          </div>

                          {isExpanded && o.details && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-[10.5px] text-slate-655 dark:text-slate-400 leading-relaxed border border-slate-250 dark:border-slate-850 animate-fadeIn font-medium">
                              {o.details}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded-lg border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-850 transition-colors cursor-pointer text-center"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                            <a 
                              href={o.link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all"
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
          )}

          {/* ====================================================================
              6. TAB: LEADERBOARD (College/Global/Friends)
              ==================================================================== */}
          {activeSidebarTab === 'leaderboards' && (
            <div className="w-full space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Rankings</h1>
                </div>
                
                {/* Leaderboard sub-tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900">
                  {['college', 'global', 'friends'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveLeaderboardTab(tab as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeLeaderboardTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard lists */}
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Sriram Neppalli', xp: '18,920 XP', progress: '94%', self: false },
                  { rank: 2, name: 'Aditya Sen', xp: '16,400 XP', progress: '88%', self: false },
                  { rank: 3, name: 'Rohan Sharma', xp: '14,200 XP', progress: '85%', self: false },
                  { rank: 4, name: 'Ananya Roy', xp: '13,900 XP', progress: '82%', self: false },
                  { rank: 5, name: 'Kunal Kapoor', xp: '13,500 XP', progress: '80%', self: false },
                  { rank: 14, name: 'Vaishnavi Raparthy (You)', xp: '12,450 XP', progress: '72%', self: true }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      item.self 
                        ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-950 dark:text-blue-400 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:border-slate-900/60 dark:hover:bg-slate-900/40 dark:text-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-450' :
                        item.rank === 3 ? 'bg-amber-50 text-amber-900 dark:bg-amber-700/20 dark:text-amber-700' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500 font-semibold font-mono">{item.xp}</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{item.progress}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ====================================================================
              7. TAB: PROFILE (Editable settings form)
              ==================================================================== */}
          {activeSidebarTab === 'profile' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              <div className="border-b border-slate-250 dark:border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Student credentials</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review onboarding selections and active prep goals.</p>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-450 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold">Profile onboarding configurations saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 p-6 rounded-3xl space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Student Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Student Name</label>
                    <input 
                      type="text" 
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* College */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">College Name</label>
                    <input 
                      type="text" 
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Degree */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Degree</label>
                    <input 
                      type="text" 
                      value={profile.degree}
                      onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Branch</label>
                    <input 
                      type="text" 
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Graduation Year</label>
                    <input 
                      type="number" 
                      value={profile.graduation_year}
                      onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) || 2026 })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Primary Goal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Preparation Goal</label>
                    <select 
                      value={profile.primary_goal}
                      onChange={(e) => setProfile({ ...profile, primary_goal: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="Campus Placements">Campus Placements</option>
                      <option value="Government Exam Prep">Government Exam Prep</option>
                      <option value="Software Engineer Roles">Software Engineer Roles</option>
                      <option value="Higher Education Studies">Higher Education Studies</option>
                    </select>
                  </div>

                  {/* Commit Commitment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Weekly Commitment</label>
                    <select 
                      value={profile.weekly_commitment}
                      onChange={(e) => setProfile({ ...profile, weekly_commitment: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="3–5 Hours">3–5 Hours</option>
                      <option value="5–10 Hours">5–10 Hours</option>
                      <option value="10–20 Hours">10–20 Hours</option>
                      <option value="20+ Hours">20+ Hours</option>
                    </select>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Learning Preference</label>
                    <select 
                      value={profile.learning_preference}
                      onChange={(e) => setProfile({ ...profile, learning_preference: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="Concept + Practice">Concept + Practice</option>
                      <option value="Simulated Mock Focus">Simulated Mock Focus</option>
                      <option value="Interactive Quick Solving">Interactive Quick Solving</option>
                    </select>
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Config</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ====================================================================
              8. TAB: SETTINGS (Theme configuration & credentials)
              ==================================================================== */}
          {activeSidebarTab === 'settings' && (
            <div className="w-full space-y-6 animate-fadeIn">
              
              <div className="border-b border-slate-200 dark:border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure workspace credentials and toggle theme controls.</p>
              </div>

              {/* Theme Settings Card */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Workspace Appearance</h3>
                
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Active Display Mode</span>
                    <p className="text-[10px] text-slate-450 leading-relaxed max-w-xs">Switch between light mode and default sleek dark theme layout.</p>
                  </div>
                  
                  <button 
                    onClick={toggleTheme}
                    className="py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {theme === 'light' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sandbox Security logs */}
              <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-5 rounded-3xl space-y-3">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Sandbox Credentials</h3>
                <div className="space-y-2 text-[10.5px] font-medium text-slate-500">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-950 pb-2">
                    <span>Host Connection Status</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-950 pb-2">
                    <span>SSL Sandbox Crypt</span>
                    <span className="font-mono">AES-GCM-256</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Database Session Sync</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">Supabase V2.102 Active</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-200 dark:border-slate-900/60 pt-6 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {currentRole?.role === 'admin' ? (
                <input
                  type="text"
                  value={footerBadgeText}
                  onChange={(e) => {
                    setFooterBadgeText(e.target.value);
                    localStorage.setItem('aptitude_footer_badge_text', e.target.value);
                  }}
                  className="bg-transparent border-b border-dashed border-slate-405 dark:border-slate-700 focus:border-blue-500 focus:outline-none px-1 text-[10px] font-bold uppercase tracking-wider text-slate-705 dark:text-slate-300 w-64"
                  title="Edit Footer Badge Text"
                />
              ) : (
                <span>{footerBadgeText}</span>
              )}
            </div>
            {currentRole?.role === 'admin' ? (
              <input
                type="text"
                value={footerCopyright}
                onChange={(e) => {
                  setFooterCopyright(e.target.value);
                  localStorage.setItem('aptitude_footer_copyright', e.target.value);
                }}
                className="bg-transparent border-b border-dashed border-slate-405 dark:border-slate-700 focus:border-blue-500 focus:outline-none px-1 text-[10px] font-bold uppercase tracking-wider text-slate-705 dark:text-slate-300 text-right w-80"
                title="Edit Footer Copyright"
              />
            ) : (
              <span>{footerCopyright}</span>
            )}
          </footer>

        </div>
      </div>

    </div>
  );
}
