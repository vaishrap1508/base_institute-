'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Sparkles
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
    username: 'sriram_neppalli',
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
  const [solvedCount, setSolvedCount] = useState(0);
  const [streak, setStreak] = useState(5); // Simulated high streak
  const [bookmarks, setBookmarks] = useState<string[]>(['Q-8029-X']); // Pre-bookmarked

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

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
        setProfile(JSON.parse(onboardingStored));
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

    loadCatalog();
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
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-150 overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Light background decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 dark:opacity-15 pointer-events-none" />

      {/* 1. Standard Light Navigation Sidebar */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col h-screen shrink-0 z-10 relative transition-colors duration-300">
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-850 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[14px] leading-tight">
              STUDIO STUDENT
            </span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              Personalized HUD
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50 transition-all select-none">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Dashboard Hub</span>
          </button>
          
          <a href="#practice-arena" className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-all select-none">
            <BookOpenCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Practice Arena</span>
          </a>

          <button 
            onClick={() => alert(`Your daily streak is at ${streak} 🔥! Keep solving questions to earn clearance credentials.`)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-all select-none text-left"
          >
            <div className="flex items-center gap-3.5">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>Daily Streak</span>
            </div>
            <span className="bg-amber-100 dark:bg-amber-955/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-250 dark:border-amber-900 text-[9px] font-black">{streak} days</span>
          </button>
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-955/20 border border-transparent transition-colors select-none text-left"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out Profile</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-550 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operational SSL sandbox</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 px-8 flex items-center justify-between bg-white dark:bg-slate-900 shadow-xs transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-widest">Active clearance:</span>
            <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-955/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              {profile.primary_goal}
            </span>
          </div>

          <div className="flex items-center gap-5">
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
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-inner">
                {profile.username ? profile.username[0] : 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Welcome HUD Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-955/30 border border-blue-100 dark:border-blue-900 px-3.5 py-1 rounded-full text-[9px] font-black text-blue-700 dark:text-blue-400 tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span>Generating Personalized Learning Path</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                Welcome back, {profile.username}!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
                Your educational curriculum has been customized for placement tracking. Solve concepts daily to reinforce your quantitative reasoning speed and verbal score indicators.
              </p>
            </div>

            {/* Micro progress status widgets */}
            <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 shadow-sm transition-colors duration-300">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Daily Streak</span>
                <span className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight">{streak} days</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 shadow-sm transition-colors duration-300">
                <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Solved Pool</span>
                <span className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight">{solvedCount} items</span>
              </div>
            </div>
          </div>

          {/* User Onboarding Settings Dashboard Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
            
            {/* Primary Goal */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-350 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Target className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-wider">Primary Goal</span>
                <span className="text-xs font-black text-slate-800 truncate mt-1">{profile.primary_goal}</span>
              </div>
            </div>

            {/* Target Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-350 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-wider">Timeline</span>
                <span className="text-xs font-black text-slate-800 truncate mt-1">{profile.target_timeline}</span>
              </div>
            </div>

            {/* Weekly Commitment */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-350 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-black text-slate-455 uppercase tracking-wider">Commitment</span>
                <span className="text-xs font-black text-slate-800 truncate mt-1">{profile.weekly_commitment} / wk</span>
              </div>
            </div>

            {/* Learning Preference */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-350 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-wider">Method Preference</span>
                <span className="text-xs font-black text-slate-800 truncate mt-1">{profile.learning_preference}</span>
              </div>
            </div>

          </div>

          {/* ==========================================
              PRACTICE ARENA CONTAINER (Light Palette)
              ========================================== */}
          <div id="practice-arena" className="space-y-6 pt-2">
            
            {/* Section Title & Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase font-sans">Curated Practice Arena</h3>
                <p className="text-xs text-slate-500 mt-1">Real-time Aptitude and Verbal solving sheets updated by editors.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                <input 
                  type="text" 
                  placeholder="Search question stems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Domain Switcher */}
              <div className="flex bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                {['All', 'quant', 'logical', 'verbal'].map((domain) => (
                  <button
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedDomain === domain 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-450 hover:text-slate-700'
                    }`}
                  >
                    {domain === 'All' ? 'All Domains' : domain === 'quant' ? 'Quantitative' : domain === 'logical' ? 'Logical' : 'Verbal'}
                  </button>
                ))}
              </div>

              {/* Difficulty pills */}
              <div className="flex items-center gap-2 bg-slate-250/20 p-1 rounded-xl border border-slate-200/40">
                {['All', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                      selectedDifficulty === diff 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'text-slate-450 hover:text-slate-750'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Scalable Practice Question Feed */}
            {isLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-14 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border border-blue-600 border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-bold text-slate-450 uppercase tracking-widest">Compiling question catalog...</span>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6">
                <Info className="w-8 h-8 text-slate-400 mb-2.5" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No matching questions cataloged</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-normal">Try clearing domain or difficulty selections.</span>
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
                      className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:border-slate-350 transition-all duration-150 shadow-xs relative overflow-hidden"
                    >
                      {/* Top banner tag info */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded tracking-wide uppercase">
                            {domainLabel}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                            q.difficulty === 'EASY' 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : q.difficulty === 'HARD'
                              ? 'bg-rose-50 border-rose-100 text-rose-705'
                              : 'bg-amber-50 border-amber-100 text-amber-705'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-450 font-bold uppercase tracking-wider">#{q.id}</span>
                        </div>

                        {/* Interactive actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(q.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked 
                                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Question Stem Text Area */}
                      <div className="space-y-3 leading-relaxed">
                        <div className="text-[12.5px] font-bold text-slate-800 whitespace-pre-wrap leading-normal font-sans">
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
                              className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 text-[11.5px] transition-all duration-150 ${
                                showCorrectness
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-805 shadow-2xs'
                                  : showIncorrectness
                                  ? 'border-rose-500 bg-rose-50 text-rose-805 shadow-2xs'
                                  : isOptionSelected
                                  ? 'border-blue-600 bg-blue-50/50 text-slate-900'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-60 disabled:hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] shrink-0 border ${
                                  showCorrectness 
                                    ? 'border-emerald-500/20 bg-emerald-100 text-emerald-700' 
                                    : showIncorrectness 
                                    ? 'border-rose-550/20 bg-rose-100 text-rose-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-500'
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
                        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <button
                            onClick={() => toggleSolution(q.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer select-none"
                          >
                            <span>{showSolution ? 'Hide' : 'Show'} Step-by-Step Explanation</span>
                            {showSolution ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                          </button>
                          
                          {q.videoUrl && (
                            <a 
                              href={q.videoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors select-none"
                            >
                              <Play className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>Watch video solution</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Solved Explanation drawer */}
                      {isSubmitted && showSolution && q.hintText && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-xs text-slate-655 leading-normal whitespace-pre-wrap font-medium animate-fadeIn">
                          <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-200 pb-1.5 mb-2 select-none">LaTeX Mathematical Solver Output</span>
                          {q.hintText.replace(/\\frac/g, '').replace(/\\text/g, '').replace(/[\{\}]/g, ' ')}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  );
}
