'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  User, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Play, 
  Cpu, 
  Award, 
  Flame, 
  LogOut,
  BookOpenCheck,
  ShieldCheck,
  Trophy,
  Compass,
  Briefcase,
  Settings as SettingsIcon,
  ChevronRight,
  ArrowRight,
  Target,
  Sparkles,
  BookMarked,
  Sun,
  Moon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';

// Simple, animated circular progress ring component
const ProgressRing = ({ progress, size = 96, strokeWidth = 9, color = '#3B82F6' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Animate the fill after mounting
    const timer = setTimeout(() => {
      const progressOffset = ((100 - progress) / 100) * circumference;
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <div className="relative flex items-center justify-center select-none animate-fadeIn" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-900 transition-colors duration-300"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered label percentage */}
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-black text-slate-800 dark:text-white tracking-tight font-mono leading-none transition-colors duration-300">{progress}%</span>
        <span className="text-[7px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 leading-none transition-colors duration-300">done</span>
      </div>
    </div>
  );
};

export default function DomainsScreen() {
  const router = useRouter();
  const authSupabase = createAuthClient();

  // Onboarding profile sync state
  const [profile, setProfile] = useState<any>({
    username: 'Vaishnavi Raparthy',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    primary_goal: 'Campus Placements'
  });

  const [solvedCount, setSolvedCount] = useState(12);
  const [streak, setStreak] = useState(14);
  const [searchQuery, setSearchQuery] = useState('');

  // Dark/Light Theme Switcher State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [themeMounted, setThemeMounted] = useState(false);

  // Sync profile details, theme and metrics on mount
  useEffect(() => {
    // 1. Sync theme preference
    setThemeMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // 2. Sync global profile info from local storage
    const onboardingStored = localStorage.getItem('aptitude_onboarding_data');
    if (onboardingStored) {
      try {
        setProfile(JSON.parse(onboardingStored));
      } catch (e) {
        console.warn("Failed to parse onboarding data:", e);
      }
    }

    // 3. Sync active credentials and database profile session
    const syncSession = async () => {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user && !onboardingStored) {
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
    };
    syncSession();

    // 3. Sync metrics from local storage
    const storedSolved = localStorage.getItem('aptitude_solved_count');
    if (storedSolved) setSolvedCount(parseInt(storedSolved, 10));

    const storedStreak = localStorage.getItem('aptitude_streak');
    if (storedStreak) setStreak(parseInt(storedStreak, 10));
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

  const handleLogout = async () => {
    await authSupabase.auth.signOut();
    localStorage.removeItem('aptitude_current_role');
    
    // Clear cookies
    document.cookie = 'aptitude_mock_auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    document.cookie = 'aptitude_onboarding_completed=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    
    router.push('/');
  };

  // 4 Bento Domain Cards Data
  const domains = [
    {
      id: 'quant',
      title: 'Quantitative Aptitude',
      subtitle: 'Arithmetic, Algebra, Geometry & Mensuration',
      accent: '#3B82F6',
      progress: 75,
      topicsLeft: 3,
      solved: 124,
      bgGlow: 'hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:border-blue-200/80 dark:hover:border-blue-900/60 dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)]',
      description: 'Master numbers, mathematical induction, profit & loss, coordinates, and fast calculations.',
      btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-400',
      icon: (
        <svg className="w-16 h-16 text-blue-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
          {/* Coordinates grid lines */}
          <line x1="10" y1="80" x2="90" y2="80" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="20" y1="10" x2="20" y2="90" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50" y1="10" x2="50" y2="90" className="stroke-slate-50 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <line x1="10" y1="50" x2="90" y2="50" className="stroke-slate-50 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          {/* Mathematical Parabola Curve */}
          <path d="M 20 80 Q 50 15 90 35" stroke="url(#blue-grad)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Glowing node coordinates */}
          <circle cx="20" cy="80" r="4.5" fill="#3B82F6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="50" cy="38" r="4.5" fill="#3B82F6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="90" cy="35" r="6.5" fill="#3B82F6" stroke="#FFFFFF" className="dark:stroke-slate-950 animate-pulse" strokeWidth="2" />
          <defs>
            <linearGradient id="blue-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'logical',
      title: 'Logical Reasoning',
      subtitle: 'Arrangements, Syllogisms & Logic Puzzles',
      accent: '#8B5CF6',
      progress: 40,
      topicsLeft: 6,
      solved: 68,
      bgGlow: 'hover:shadow-[0_20px_40px_rgba(139,92,246,0.08)] hover:border-purple-200/80 dark:hover:border-purple-900/60 dark:hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)]',
      description: 'Strengthen spatial matrices, circular deduction paths, syllogistic patterns, and sequences.',
      btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 dark:bg-purple-50 dark:hover:bg-purple-400',
      icon: (
        <svg className="w-16 h-16 text-purple-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
          {/* Linked analysis nodes */}
          <line x1="25" y1="30" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="75" y1="30" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="25" y1="70" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="75" y1="70" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="25" y1="30" x2="75" y2="30" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <line x1="25" y1="70" x2="75" y2="70" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          {/* Nodes representation */}
          <circle cx="50" cy="50" r="9.5" fill="url(#purple-grad)" stroke="#FFFFFF" className="dark:stroke-slate-950 filter drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]" strokeWidth="2" />
          <circle cx="25" cy="30" r="5" fill="#8B5CF6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="75" cy="30" r="5" fill="#8B5CF6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="25" cy="70" r="5" fill="#8B5CF6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="75" cy="70" r="5" fill="#8B5CF6" stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <defs>
            <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      subtitle: 'Grammar, Syntax & Reading Comprehension',
      accent: '#10B981',
      progress: 85,
      topicsLeft: 2,
      solved: 194,
      bgGlow: 'hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200/80 dark:hover:border-emerald-900/60 dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)]',
      description: 'Perfect vocabulary context, verbal modifications, textual inferences, and logic correction.',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 dark:bg-emerald-50 dark:hover:bg-emerald-400',
      icon: (
        <svg className="w-16 h-16 text-emerald-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
          {/* Grammar pill layers */}
          <rect x="15" y="25" width="50" height="20" rx="7" className="fill-emerald-50 dark:fill-emerald-950/20" stroke="#10B981" strokeWidth="1.8" />
          <text x="24" y="38" className="fill-emerald-800 dark:fill-emerald-300 font-extrabold" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.5">SYNTAX</text>
          
          <rect x="35" y="52" width="50" height="20" rx="7" fill="url(#emerald-grad)" className="stroke-white dark:stroke-slate-900 filter drop-shadow-[0_4px_8px_rgba(16,185,129,0.2)]" strokeWidth="1.5" />
          <text x="44" y="65" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.5">VERBAL</text>
          <defs>
            <linearGradient id="emerald-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'coding',
      title: 'Coding & DSA',
      subtitle: 'Data Structures, Algorithms & Problem Solving',
      accent: '#F97316',
      progress: 20,
      topicsLeft: 8,
      solved: 32,
      bgGlow: 'hover:shadow-[0_20px_40px_rgba(249,115,22,0.08)] hover:border-orange-200/80 dark:hover:border-orange-900/60 dark:hover:shadow-[0_20px_40px_rgba(249,115,22,0.12)]',
      description: 'Master binary search trees, search recursion, dynamic array branches, and sorting complexities.',
      btnColor: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20 dark:bg-orange-50 dark:hover:bg-orange-400',
      icon: (
        <svg className="w-16 h-16 text-orange-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
          {/* Code tags vectors */}
          <path d="M 28 32 L 10 50 L 28 68" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 72 32 L 90 50 L 72 68" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="56" y1="26" x2="44" y2="74" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
          
          {/* Binary connections */}
          <circle cx="50" cy="16" r="3" fill="#F97316" />
          <circle cx="15" cy="80" r="3" fill="#F97316" />
          <circle cx="85" cy="80" r="3" fill="#F97316" />
        </svg>
      )
    }
  ];

  // Filtering based on search query
  const filteredDomains = domains.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Decorative vector meshes to add subtle visual premiumness */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-500/3 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-900 flex flex-col h-screen shrink-0 z-20 relative shadow-[2px_0_15px_rgba(0,0,0,0.01)] backdrop-blur-xl transition-colors duration-300">
        
        {/* Sidebar Header Brand */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col select-none">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm leading-none transition-colors duration-300">
              KINETIC HUB
            </span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mt-1 transition-colors duration-300">
              Command Center
            </span>
          </div>
        </div>

        {/* Sidebar Tab Lists */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          
          {/* Dashboard */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>
          
          {/* Domains (Active tab) */}
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all bg-blue-50 text-blue-600 border border-blue-100/60 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 shadow-xs cursor-default"
          >
            <Layers className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <span>Domains</span>
          </button>
          
          {/* Learning */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=learning')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Learning</span>
          </button>

          {/* Practice Arena */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=practice')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Practice Arena</span>
          </button>

          {/* Mock Tests */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=mockTests')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Award className="w-4.5 h-4.5" />
            <span>Mock Tests</span>
          </button>

          {/* Career Hub */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=careerHub')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Career Hub</span>
          </button>

          {/* Leaderboards */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=leaderboards')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>Leaderboards</span>
          </button>

          {/* Profile */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile</span>
          </button>

          {/* Settings */}
          <button 
            onClick={() => router.push('/student/dashboard?tab=settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>

          {/* Sidebar Stats block */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-2 select-none">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 dark:text-slate-500">Solved Count</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-extrabold">{solvedCount} items</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 dark:text-slate-500">Active Streak</span>
              <span className="text-orange-600 dark:text-orange-400 font-mono font-extrabold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {streak} Days
              </span>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Account */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900/85 space-y-3 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition-colors cursor-pointer text-left dark:text-rose-400 dark:hover:text-rose-350 dark:hover:bg-rose-950/20"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Profile</span>
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-550 font-bold select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="uppercase tracking-wide">Operational SSL Sandbox</span>
          </div>
        </div>
      </aside>

      {/* 2. Main content area panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-8 sm:p-12 relative z-10">
        
        <div className="w-full flex-1 flex flex-col justify-between space-y-8 animate-fadeIn">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight font-heading">
                Choose Your Learning Domain
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select a domain to continue your preparation journey
              </p>
            </div>
            
            {/* Header Right utilities: Theme Toggle + User greeting */}
            <div className="flex items-center gap-4.5 select-none">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer"
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

              {/* Quick user welcome indicator */}
              <div className="flex items-center gap-3.5 bg-white border border-slate-200/80 dark:bg-slate-900/10 dark:border-slate-900/50 px-4 py-2.5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                <div className="text-right">
                  <div className="text-[11.5px] font-black text-slate-900 dark:text-white leading-none">{profile.username}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-1">{profile.primary_goal}</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-[0_2px_8px_rgba(59,130,246,0.15)]">
                  {profile.username ? profile.username[0] : 'V'}
                </div>
              </div>

            </div>
          </div>

          {/* Top Utility Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between select-none">
            
            {/* 1. Search Box field */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search learning domains..."
                className="w-full bg-white dark:bg-slate-900/10 border border-slate-200/80 dark:border-slate-900/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.05)] shadow-[0_4px_15px_rgba(0,0,0,0.01)] transition-all"
              />
            </div>

            {/* 2. Streak Badge & Shortcut row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              
              {/* Daily Streak Badge */}
              <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/30 px-4 py-2.5 rounded-2xl shadow-[0_4px_12px_rgba(249,115,22,0.02)]">
                <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </div>
                <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" /> {streak} Day Streak
                </span>
              </div>

              {/* Continue Last Learning Shortcut */}
              <button
                onClick={() => router.push('/student/dashboard?tab=learning')}
                className="group flex items-center justify-between gap-4 bg-white border border-slate-200/80 dark:bg-slate-900/10 dark:border-slate-900/50 px-4 py-2.5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:scale-[1.01] text-left cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">continue last topic</span>
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350 block leading-none">Percentages (Quantitative)</span>
                </div>
                <div className="w-7.5 h-7.5 rounded-xl bg-blue-50 border border-blue-100/30 dark:bg-blue-950/40 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-450 transition-colors group-hover:bg-blue-600 group-hover:text-white shadow-[0_2px_6px_rgba(37,99,235,0.05)]">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </button>

            </div>
          </div>

          {/* Main Bento Grid layout (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-2">
            {filteredDomains.length > 0 ? (
              filteredDomains.map((d) => (
                <div 
                  key={d.id}
                  onClick={() => {
                    const slugMap: Record<string, string> = {
                      'quant': 'quantitative-aptitude',
                      'logical': 'logical-reasoning',
                      'verbal': 'verbal-ability',
                      'coding': 'coding-dsa'
                    };
                    const slug = slugMap[d.id] || d.id;
                    router.push(`/domain/${slug}`);
                  }}
                  className={`group bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[24px] p-6 md:p-8 flex flex-col justify-between gap-6 transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.015)] ${d.bgGlow}`}
                >
                  
                  {/* Top content slot: Icon + Titles */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      
                      {/* Domain Icon illustration */}
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-950/45 dark:border-slate-900/80 flex items-center justify-center shadow-inner overflow-hidden select-none transition-colors duration-300">
                        {d.icon}
                      </div>

                      {/* Header details */}
                      <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight uppercase font-heading transition-colors duration-300">
                          {d.title}
                        </h2>
                        <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none transition-colors duration-300">
                          {d.subtitle}
                        </p>
                      </div>

                    </div>

                    {/* Progress Circle Graphic */}
                    <div className="shrink-0 flex items-center justify-center bg-slate-50/50 border border-slate-100 dark:bg-slate-950/45 dark:border-slate-900/60 p-2 rounded-2xl transition-colors duration-300">
                      <ProgressRing progress={d.progress} color={d.accent} />
                    </div>
                  </div>

                  {/* Middle Description text */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors duration-300">
                    {d.description}
                  </p>

                  {/* Bottom slot: Stats metrics + Button */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900/80 pt-4 mt-1 select-none transition-colors duration-300">
                    
                    {/* Stats trackers */}
                    <div className="flex gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none transition-colors duration-300">solved</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-350 block leading-none transition-colors duration-300">{d.solved} problems</span>
                      </div>
                      <div className="h-6 w-px bg-slate-105 dark:bg-slate-900" />
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none transition-colors duration-300">left</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-350 block leading-none transition-colors duration-300">{d.topicsLeft} topics</span>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button 
                      type="button"
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${d.btnColor}`}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-3xl p-8 space-y-3 transition-colors duration-300">
                <Target className="w-10 h-10 text-slate-350 dark:text-slate-600 mx-auto animate-pulse" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Matching Domains Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">We couldn't find any learning domains matching "{searchQuery}". Try editing your search query.</p>
              </div>
            )}
          </div>

          {/* Footer Clearance Row */}
          <footer className="border-t border-slate-200/60 dark:border-slate-900/80 pt-6 pb-2 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider select-none shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Operational Clearance: Sandbox Encrypted</span>
            </div>
            <span>© 2026 Aptitude AI platform. All rights reserved.</span>
          </footer>

        </div>
      </main>

    </div>
  );
}
