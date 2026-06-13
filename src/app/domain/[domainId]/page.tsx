'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  Search,
  Play,
  Award,
  Flame,
  LogOut,
  BookOpen,
  BookOpenCheck,
  ShieldCheck,
  Trophy,
  Compass,
  Briefcase,
  User,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Loader2,
  HelpCircle,
  CheckCircle,
  FileText,
  Bug,
  List,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import {
  getDomainById,
  getDomainProgress,
  getWeakestTopic,
  getStrongestTopic,
  getRadarData,
  getSmartInsights,
  getContinueLearning,
  getDomainTopicsGrid,
  DomainInfo,
  DomainProgress,
  TopicProgress,
  RadarPoint,
  SmartInsight,
  ContinueLearning
} from '@/lib/services/domain.service';
import ThemeToggle from '@/components/ThemeToggle';

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const authSupabase = createAuthClient();

  const domainId = (params?.domainId as string) || 'quantitative-aptitude';

  // Navigation sidebar & profile state
  const [profile, setProfile] = useState<any>({
    username: 'Vaishnavi Raparthy',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    primary_goal: 'Campus Placements',
    avatar: 'initial'
  });
  const [solvedGlobal, setSolvedGlobal] = useState(12);
  const [streak, setStreak] = useState(14);

  // Dynamic Domain Data states
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [progress, setProgress] = useState<DomainProgress | null>(null);
  const [weakest, setWeakest] = useState<{ name: string; accuracy: number } | null>(null);
  const [strongest, setStrongest] = useState<{ name: string; accuracy: number } | null>(null);
  const [radarData, setRadarData] = useState<RadarPoint[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearning | null>(null);
  const [topics, setTopics] = useState<TopicProgress[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('00000000-0000-0000-0000-000000000000');
  const [userEmail, setUserEmail] = useState('shellysros1922@gmail.com');

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Dark/Light Theme Switcher State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Load and sync all telemetry
  useEffect(() => {
    // Sync theme preference
    setThemeMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // 1. Sync global profile info
    const onboardingStored = localStorage.getItem('aptitude_onboarding_data');
    if (onboardingStored) {
      try {
        const data = JSON.parse(onboardingStored);
        setProfile({
          ...data,
          avatar: data.avatar || 'initial'
        });
      } catch (e) {
        console.warn('Failed to parse onboarding data:', e);
      }
    }

    // Sync email from active credentials
    const roleStored = localStorage.getItem('aptitude_current_role');
    if (roleStored) {
      try {
        const roleData = JSON.parse(roleStored);
        if (roleData.email) setUserEmail(roleData.email);
      } catch (_) {}
    }

    const storedSolved = localStorage.getItem('aptitude_solved_count');
    if (storedSolved) setSolvedGlobal(parseInt(storedSolved, 10));

    const storedStreak = localStorage.getItem('aptitude_streak');
    if (storedStreak) setStreak(parseInt(storedStreak, 10));

    // 2. Fetch authenticated session to retrieve dynamic stats
    const loadSessionAndData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await authSupabase.auth.getSession();
        if (session?.user?.email) setUserEmail(session.user.email);
        const activeUserId = session?.user?.id || '00000000-0000-0000-0000-000000000000';
        setUserId(activeUserId);

        // Fetch everything in parallel
        const [
          infoRes,
          progressRes,
          weakestRes,
          strongestRes,
          radarRes,
          insightsRes,
          continueRes,
          topicsRes
        ] = await Promise.all([
          getDomainById(domainId),
          getDomainProgress(activeUserId, domainId),
          getWeakestTopic(activeUserId, domainId),
          getStrongestTopic(activeUserId, domainId),
          getRadarData(activeUserId, domainId),
          getSmartInsights(activeUserId, domainId),
          getContinueLearning(activeUserId, domainId),
          getDomainTopicsGrid(activeUserId, domainId)
        ]);

        setDomainInfo(infoRes);
        setProgress(progressRes);
        setWeakest(weakestRes);
        setStrongest(strongestRes);
        setRadarData(radarRes);
        setInsights(insightsRes);
        setContinueLearning(continueRes);
        setTopics(topicsRes);
      } catch (err) {
        console.error('Error fetching domain details data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndData();
  }, [domainId]);

  const handleLogout = async () => {
    await authSupabase.auth.signOut();
    localStorage.removeItem('aptitude_current_role');
    document.cookie = 'aptitude_mock_auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    document.cookie = 'aptitude_onboarding_completed=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    router.push('/');
  };

  // Radar Coordinates translation math
  const getRadarCoordinates = (points: RadarPoint[], field: 'accuracy' | 'mastery' | 'completion') => {
    const N = points.length;
    if (N === 0) return '';
    const cx = 150;
    const cy = 150;
    const r = 90;

    return points.map((p, i) => {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const val = p[field];
      const px = cx + r * (val / 100) * Math.cos(angle);
      const py = cy + r * (val / 100) * Math.sin(angle);
      return `${px},${py}`;
    }).join(' ');
  };

  // Filter topics list by search input
  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      {/* Background radial gradient meshes */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-500/3 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-900 flex flex-col h-screen shrink-0 z-20 relative shadow-[2px_0_15px_rgba(0,0,0,0.01)] backdrop-blur-xl transition-colors duration-300">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)]">
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

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => router.push('/student/dashboard?tab=dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => router.push('/student/domains')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all bg-blue-50 text-blue-600 border border-blue-100/60 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 shadow-xs cursor-pointer"
          >
            <Layers className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <span>Domains</span>
          </button>

          <button
            onClick={() => router.push('/student/dashboard?tab=learning')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Learning</span>
          </button>

          <button
            onClick={() => router.push('/student/dashboard?tab=practice')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Practice Arena</span>
          </button>

          <button
            onClick={() => router.push('/student/dashboard?tab=mockTests')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Award className="w-4.5 h-4.5" />
            <span>Mock Tests</span>
          </button>

          <button
            onClick={() => router.push('/student/dashboard?tab=careerHub')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Career Hub</span>
          </button>

          <button
            onClick={() => router.push('/student/dashboard?tab=leaderboards')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>Leaderboards</span>
          </button>



          {/* Quick Metrics in Sidebar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-2 select-none">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 dark:text-slate-500">Solved Count</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-extrabold">{solvedGlobal} items</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 dark:text-slate-500">Active Streak</span>
              <span className="text-orange-600 dark:text-orange-400 font-mono font-extrabold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {streak} Days
              </span>
            </div>
          </div>
        </nav>

        {/* User profile popup menu trigger */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900/60 w-full flex flex-col items-center shrink-0 relative animate-fadeIn" ref={profileDropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            title="User Profile Menu"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer relative ${profileDropdownOpen ? 'ring-2 ring-blue-500 bg-slate-50 dark:bg-slate-900' : ''}`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden relative border border-slate-200 dark:border-slate-800">
              {profile.avatar && profile.avatar !== 'initial' ? (
                <img 
                  src={profile.avatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-4.5 h-4.5" />
              )}
            </div>
            
            <div className="flex flex-col min-w-0 text-left flex-1">
              <span className="font-bold text-slate-900 dark:text-white text-xs truncate leading-snug">
                {profile.username || 'Vaishnavi Raparthy'}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate leading-normal">
                {userEmail}
              </span>
            </div>

            {/* Red dot notification badge */}
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          </button>

          {/* User profile dropdown overlay */}
          {profileDropdownOpen && (
            <div className="absolute left-4 bottom-16 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-1 z-50 animate-scaleUp text-slate-800 dark:text-slate-200 select-none">
              {/* Profile details header */}
              <div className="flex items-center gap-3 p-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden">
                  {profile.avatar && profile.avatar !== 'initial' ? (
                    <img 
                      src={profile.avatar} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate leading-snug">
                    {profile.username || 'Vaishnavi Raparthy'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold truncate leading-normal">
                    {userEmail}
                  </span>
                </div>
              </div>

              {/* Menu Options */}
              <div className="flex flex-col pt-1.5 pb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                
                {/* My Profile option */}
                <button
                  onClick={() => {
                    router.push('/student/dashboard?tab=profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span className="flex-1">My Profile</span>
                </button>

                {/* Account option */}
                <button
                  onClick={() => {
                    router.push('/student/dashboard?tab=settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span className="flex-1">Account</span>
                </button>

                {/* Buganizer (locked option) */}
                <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 opacity-60 select-none font-bold">
                  <div className="flex items-center gap-3">
                    <Bug className="w-4 h-4 shrink-0" />
                    <span>Buganizer</span>
                  </div>
                  <Lock className="w-3.5 h-3.5" />
                </div>

                {/* Sessions (locked option) */}
                <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 dark:text-slate-600 opacity-60 select-none font-bold">
                  <div className="flex items-center gap-3">
                    <List className="w-4 h-4 shrink-0" />
                    <span>Sessions</span>
                  </div>
                  <Lock className="w-3.5 h-3.5" />
                </div>

                {/* Troubleshooting option */}
                <button
                  onClick={() => {
                    alert('Troubleshooting utility loaded. Sandbox is operating securely.');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span className="flex-1">Troubleshooting</span>
                </button>

                {/* New Features option */}
                <button
                  onClick={() => {
                    router.push('/student/dashboard?tab=badges');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                    <span>New Features</span>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>
                </button>

                {/* Theme Toggle option */}
                <button
                  onClick={() => {
                    toggleTheme(); // Theme Toggle inside details tab checks theme logic directly
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="flex-1">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="flex-1">Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Notification option */}
                <button
                  onClick={() => {
                    router.push('/student/dashboard?tab=settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                    <span>Notification</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                </button>

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1.5" />

                {/* Logout option */}
                <button
                  onClick={() => {
                    handleLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left text-rose-600 dark:text-rose-400 transition-colors cursor-pointer font-bold"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="flex-1 font-extrabold text-rose-600 dark:text-rose-400">Logout</span>
                </button>

              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
        <div className="w-full flex-1 flex flex-col justify-between space-y-6">
          {/* Header Utilities / Breadcrumbs Row */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900 pb-4 select-none">
            <button
              onClick={() => router.push('/student/domains')}
              className="group flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Domains</span>
            </button>


          </div>

          {loading ? (
            /* Premium Shimmer Loading Skeleton */
            <div className="flex-1 flex flex-col gap-6 animate-pulse select-none">
              <div className="h-44 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-[24px]" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-28 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-2xl" />
                <div className="h-28 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-2xl" />
                <div className="h-28 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 h-96 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-[24px]" />
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="h-44 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-2xl" />
                  <div className="h-44 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-900 rounded-2xl" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Dynamic Hero Section */}
              <div className="group bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-[0_15px_30px_rgba(59,130,246,0.02)] transition-all duration-300">
                <div className="space-y-3 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Learning Journey Detail</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight font-heading">
                    {domainInfo?.name}
                  </h1>

                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {domainInfo?.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400 select-none">
                    <div className="flex items-center gap-1.5">
                      <BookOpenCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{progress?.solvedCount} / {progress?.totalCount} Problems Solved</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 self-center" />
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{progress?.accuracy}% Accuracy</span>
                    </div>
                  </div>
                </div>

                {/* Circular overall mastery circle */}
                <div className="relative shrink-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-900/60 p-4 rounded-3xl select-none">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-full h-full">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        className="stroke-slate-100 dark:stroke-slate-900 transition-colors"
                        strokeWidth="9"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="url(#hero-grad)"
                        strokeWidth="9"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={((100 - (progress?.overallMastery || 0)) / 100) * (2 * Math.PI * 48)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="hero-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight font-mono leading-none">
                        {progress?.overallMastery}%
                      </span>
                      <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1 leading-none">
                        Mastery
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics summary rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                {/* 1. Accuracy Card */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Overall Accuracy
                    </span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white font-mono block leading-none">
                      {progress?.accuracy}%
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 block">
                      Steady performance rate
                    </span>
                  </div>
                </div>

                {/* 2. Weakest Topic Card */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5 max-w-[calc(100%-3.5rem)]">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Weakest Focus Areas
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white truncate block leading-tight">
                      {weakest?.name}
                    </span>
                    <span className="text-[9.5px] font-extrabold text-orange-700 dark:text-orange-400 block font-mono">
                      Needs improvement ({weakest?.accuracy}% accuracy)
                    </span>
                  </div>
                </div>

                {/* 3. Strongest Topic Card */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5 max-w-[calc(100%-3.5rem)]">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      Strongest Mastery Zone
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white truncate block leading-tight">
                      {strongest?.name}
                    </span>
                    <span className="text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-400 block font-mono">
                      Peak execution ({strongest?.accuracy}% accuracy)
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Bento Analytics + Insights Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Learning Radar Chart Section */}
                <div className="lg:col-span-3 bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[24px] p-6 md:p-8 flex flex-col justify-between gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-300">
                  <div className="space-y-1 select-none">
                    <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                      Dynamic Skill Profiler
                    </h2>
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Competence breakdown mapped across subtopic domains
                    </p>
                  </div>

                  {/* SVG Radar Chart container */}
                  <div className="flex items-center justify-center py-4">
                    {radarData.length > 0 ? (
                      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
                          {/* 1. Draw concentric grid polygons */}
                          {[25, 50, 75, 100].map((pct) => {
                            const N = radarData.length;
                            const cx = 150;
                            const cy = 150;
                            const r = 90;
                            const pointsStr = radarData.map((_, i) => {
                              const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                              const px = cx + r * (pct / 100) * Math.cos(angle);
                              const py = cy + r * (pct / 100) * Math.sin(angle);
                              return `${px},${py}`;
                            }).join(' ');

                            return (
                              <g key={pct}>
                                <polygon
                                  points={pointsStr}
                                  className="fill-transparent stroke-slate-100 dark:stroke-slate-900 transition-colors"
                                  strokeWidth="1.2"
                                />
                                {/* Label for coordinate grids */}
                                <text
                                  x={cx}
                                  y={cy - r * (pct / 100) + 4}
                                  className="fill-slate-350 dark:fill-slate-600 font-mono text-[7.5px] text-center"
                                  textAnchor="middle"
                                >
                                  {pct}%
                                </text>
                              </g>
                            );
                          })}

                          {/* 2. Draw axis grid lines and labels */}
                          {radarData.map((pt, i) => {
                            const N = radarData.length;
                            const cx = 150;
                            const cy = 150;
                            const r = 90;
                            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                            const px = cx + r * Math.cos(angle);
                            const py = cy + r * Math.sin(angle);

                            // Text adjustments to prevent labels cropping
                            const lx = cx + (r + 18) * Math.cos(angle);
                            const ly = cy + (r + 14) * Math.sin(angle);
                            let anchor: 'start' | 'middle' | 'end' = 'middle';
                            if (Math.cos(angle) > 0.1) anchor = 'start';
                            else if (Math.cos(angle) < -0.1) anchor = 'end';

                            return (
                              <g key={pt.axis}>
                                <line
                                  x1={cx}
                                  y1={cy}
                                  x2={px}
                                  y2={py}
                                  className="stroke-slate-100 dark:stroke-slate-900 transition-colors"
                                  strokeWidth="1.2"
                                  strokeDasharray="2 2"
                                />
                                <text
                                  x={lx}
                                  y={ly + 3}
                                  className="fill-slate-500 dark:fill-slate-400 font-extrabold text-[9.5px] uppercase tracking-wider transition-colors"
                                  textAnchor={anchor}
                                >
                                  {pt.axis.length > 13 ? `${pt.axis.substring(0, 11)}..` : pt.axis}
                                </text>
                              </g>
                            );
                          })}

                          {/* 3. Plot Accuracy Polygon */}
                          <polygon
                            points={getRadarCoordinates(radarData, 'accuracy')}
                            className="fill-blue-500/10 stroke-blue-600 dark:stroke-blue-400 transition-all duration-700"
                            strokeWidth="2.5"
                          />

                          {/* 4. Plot Completion Polygon */}
                          <polygon
                            points={getRadarCoordinates(radarData, 'completion')}
                            className="fill-purple-500/10 stroke-purple-600 dark:stroke-purple-400 transition-all duration-700"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />

                          {/* 5. Glowing vertex nodes */}
                          {radarData.map((pt, i) => {
                            const N = radarData.length;
                            const cx = 150;
                            const cy = 150;
                            const r = 90;
                            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;

                            // Accuracy dot
                            const ax = cx + r * (pt.accuracy / 100) * Math.cos(angle);
                            const ay = cy + r * (pt.accuracy / 100) * Math.sin(angle);

                            // Completion dot
                            const cxCoord = cx + r * (pt.completion / 100) * Math.cos(angle);
                            const cyCoord = cy + r * (pt.completion / 100) * Math.sin(angle);

                            return (
                              <g key={i}>
                                <circle
                                  cx={ax}
                                  cy={ay}
                                  r="4"
                                  className="fill-blue-550 dark:fill-blue-400 stroke-white dark:stroke-slate-950 transition-all"
                                  strokeWidth="1.5"
                                />
                                <circle
                                  cx={cxCoord}
                                  cy={cyCoord}
                                  r="3"
                                  className="fill-purple-550 dark:fill-purple-400 stroke-white dark:stroke-slate-950 transition-all"
                                  strokeWidth="1"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    ) : (
                      <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                        Insufficient analytics data
                      </div>
                    )}
                  </div>

                  {/* Chart Legends */}
                  <div className="flex items-center justify-center gap-6 border-t border-slate-100 dark:border-slate-900/60 pt-4 text-[9.5px] font-extrabold uppercase tracking-widest select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3 bg-blue-500/20 border border-blue-600 dark:border-blue-400 rounded-sm" />
                      <span className="text-slate-700 dark:text-slate-400">Accuracy (%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3 bg-purple-500/20 border border-dashed border-purple-600 dark:border-purple-400 rounded-sm" />
                      <span className="text-slate-700 dark:text-slate-400">Topic Completion (%)</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Recommendations + Telemetry insights */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Continue Learning card */}
                  {continueLearning && (
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
                      <div className="space-y-1 select-none">
                        <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">
                          Up Next Checklist
                        </span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          Recommended Topic
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                          {continueLearning.name}
                        </h3>

                        {/* Progress slider bar */}
                        <div className="space-y-1.5 select-none">
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">
                            <span>Completeness</span>
                            <span>{continueLearning.progress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                              style={{ width: `${continueLearning.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-extrabold text-slate-500 dark:text-slate-400 block pt-0.5">
                            Solved {continueLearning.solved} / {continueLearning.total} tasks
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/student/dashboard?tab=learning&concept=${continueLearning.topicId}`)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-500/15"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Resume Lesson</span>
                      </button>
                    </div>
                  )}

                  {/* Smart Insights Panel */}
                  <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-0.5 select-none">
                      <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">
                        AI telemetry diagnostics
                      </span>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                        Smart Performance Insights
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {insights.map((ins) => {
                        const isWarning = ins.type === 'warning';
                        const isSuccess = ins.type === 'success';

                        return (
                          <div
                            key={ins.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                              isWarning
                                ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30 text-amber-800 dark:text-amber-400'
                                : isSuccess
                                ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                                : 'bg-blue-50/40 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/20 text-blue-800 dark:text-blue-400'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5">
                              {isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-500" />
                              ) : isSuccess ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                              )}
                            </span>
                            <span className="text-[11px] font-medium leading-relaxed">
                              {ins.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick navigation pills */}
                    <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 flex flex-wrap gap-2 select-none">
                      <button
                        onClick={() => router.push('/student/dashboard?tab=practice')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer transition-colors"
                      >
                        Practice Arena
                      </button>
                      <button
                        onClick={() => router.push('/student/dashboard?tab=mockTests')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer transition-colors"
                      >
                        Speed Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Concepts details checklist table replacement grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-3">
                  <div className="space-y-1 select-none">
                    <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                      Domain Concepts & Modules
                    </h2>
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Detailed breakdown of syllabus completion status
                    </p>
                  </div>

                  {/* Filter input field */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter concepts..."
                      className="w-full bg-white dark:bg-slate-900/10 border border-slate-200/80 dark:border-slate-900/50 rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold placeholder-slate-400 dark:placeholder-slate-550 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => {
                      const isCompleted = topic.status === 'Completed';
                      const isInProgress = topic.status === 'In Progress';
                      const isLocked = topic.status === 'Locked';

                      return (
                        <div
                          key={topic.id}
                          className={`bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01] ${
                            isCompleted
                              ? 'hover:border-emerald-200 dark:hover:border-emerald-900/60'
                              : isInProgress
                              ? 'hover:border-blue-200 dark:hover:border-blue-900/60'
                              : 'opacity-85 hover:border-slate-300 dark:hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-tight">
                                {topic.name}
                              </h3>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 select-none">
                                <span>Solved {topic.solved} / {topic.total}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span>{topic.accuracy}% Accuracy</span>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className="shrink-0 select-none">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-100/50 dark:border-emerald-900/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Completed</span>
                                </span>
                              ) : isInProgress ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider border border-blue-100/50 dark:border-blue-900/30">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-wider border border-slate-100 dark:border-slate-900">
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Completion Progress slider */}
                          <div className="space-y-1.5 select-none">
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-950/50 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500'
                                    : isInProgress
                                    ? 'bg-blue-600'
                                    : 'bg-slate-300 dark:bg-slate-800'
                                }`}
                                style={{ width: `${topic.progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              <span>Completeness</span>
                              <span>{topic.progress}%</span>
                            </div>
                          </div>

                          {/* Action CTA inside grid item */}
                          <div className="border-t border-slate-100 dark:border-slate-950/80 pt-3 select-none flex justify-end">
                            {isLocked ? (
                              <button
                                disabled
                                className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest cursor-not-allowed"
                              >
                                <span>Locked</span>
                                <Lock className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push(`/student/dashboard?tab=learning&concept=${topic.id}`)}
                                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                                  isCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
                                }`}
                              >
                                <span>{isCompleted ? 'Review Topic' : 'Start Topic'}</span>
                                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-2xl p-6 space-y-2 select-none">
                      <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        No Matching Concepts
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        No concepts matched your search query "{searchQuery}".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
}
