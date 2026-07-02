'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Layers,
  User,
  GraduationCap,
  Target,
  Clock,
  Calendar,
  BookOpen,
  Search,
  Zap,
  Star,
  Download,
  Sliders,
  ListTodo,
  Award,
  Bookmark,
  Check,
  X,
  Info,
  ExternalLink,
  BookOpenCheck,
  Sparkles,
  Bell,
  Activity,
  Trophy,
  Briefcase,
  Sun,
  Moon,
  Lock,
  Settings as SettingsIcon,
  Plus,
  LayoutGrid,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StudyPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain');

  // Interactive Study Planner States
  const [preparingFor, setPreparingFor] = useState<string>('Placement Season 2024');
  const [targetDate, setTargetDate] = useState<string>('2024-09-15');
  const [dailyCommitment, setDailyCommitment] = useState<number>(3);
  const [selectedPack, setSelectedPack] = useState<'tcs' | 'infosys' | 'custom'>('custom');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['percentages', 'time_work']);
  const [customTopicName, setCustomTopicName] = useState<string>('');
  const [customTopicCategory, setCustomTopicCategory] = useState<string>('CORE');
  const [customTopicSub, setCustomTopicSub] = useState<string>('CUSTOM');
  const [customModules, setCustomModules] = useState<Array<{ id: string; title: string; desc: string; category: string; sub: string; tasks: string[]; companyBadges: string[] }>>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>(['streak_checkin']);
  const [streak, setStreak] = useState<number>(14);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Pre-populate based on domain search parameter
  useEffect(() => {
    if (domainParam) {
      if (domainParam === 'quant') {
        setSelectedPack('tcs');
        setPreparingFor('TCS Prep');
        setSelectedTopics(['percentages', 'time_work', 'profit_loss']);
      } else if (domainParam === 'logical') {
        setSelectedPack('infosys');
        setPreparingFor('Infosys Prep');
        setSelectedTopics(['percentages', 'logical_series', 'data_interpretation']);
      } else if (domainParam === 'coding') {
        setSelectedPack('custom');
        setPreparingFor('Placement Season 2024');
        setSelectedTopics(['coding_arrays']);
      }
    }
  }, [domainParam]);

  // Synchronize Dark Theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const standardModules = [
    {
      id: 'percentages',
      title: 'Master Arithmetic Basics',
      desc: 'Focus on rapid calculation techniques, percentages, and fractions conversion.',
      category: 'Week 1: Foundations',
      companyBadges: ['TCS', 'INF'],
      tasks: ['Percentage Practice', 'Vedic Math Quiz']
    },
    {
      id: 'time_work',
      title: 'Time, Work & Rates',
      desc: 'Master rate equations, combined work ratios, and pipe flow problems.',
      category: 'Week 2: Application',
      companyBadges: ['TCS'],
      tasks: ['Work Rate Exercises', 'Practice Drill']
    },
    {
      id: 'profit_loss',
      title: 'Profit, Loss & Interest',
      desc: 'Navigate margins, discount rates, simple and compound interests.',
      category: 'Week 3: Commercial Math',
      companyBadges: ['TCS'],
      tasks: ['Profit Margin Quiz']
    },
    {
      id: 'logical_series',
      title: 'Reasoning & Series',
      desc: 'Syllogisms, Blood Relations, and Number Series pattern recognition.',
      category: 'Week 4: Logical Core',
      companyBadges: ['INF'],
      tasks: ['Number Series Practice', 'Logic Test']
    },
    {
      id: 'data_interpretation',
      title: 'Data Interpretation',
      desc: 'Analyzing graphs, tables, pie charts, and data sufficiency rules.',
      category: 'Week 5: Analytics',
      companyBadges: ['TCS', 'INF'],
      tasks: ['Chart Analysis Drill']
    },
    {
      id: 'coding_arrays',
      title: 'Data Structures: Arrays',
      desc: 'Linear memory arrays, nested loops search, and multi-pointer solutions.',
      category: 'Week 6: Technical',
      companyBadges: ['INF'],
      tasks: ['Two Sum Challenge', 'Array Quiz']
    }
  ];

  const activeStandardModules = standardModules.filter(m => selectedTopics.includes(m.id));
  const activeModules = [...activeStandardModules, ...customModules];

  const totalTasks = activeModules.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedRoadmapTasks = activeModules.reduce((acc, m) => {
    return acc + m.tasks.filter(t => completedTasks.includes(t)).length;
  }, 0);
  const roadmapProgress = totalTasks > 0 ? Math.round((completedRoadmapTasks / totalTasks) * 100) : 0;

  const daysRemaining = useMemo(() => {
    try {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    } catch {
      return 42;
    }
  }, [targetDate]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* 1. Sidebar Panel (Matches screen style) */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 hidden md:flex flex-col py-6 h-screen shrink-0 z-20 relative transition-colors duration-300">
        <div className="px-6 mb-8 text-left">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block font-mono">
            STUDY ARCHITECT
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight block font-heading mt-0.5">
            Peak Performance
          </span>
        </div>

        {/* Navigation Sidebar Options */}
        <nav className="flex-1 px-4 space-y-1.5 select-none text-left">
          {[
            { label: "Today's Goals", active: true, icon: Target },
            { label: "Weekly Roadmap", active: false, icon: Calendar },
            { label: "Company Presets", active: false, icon: Award },
            { label: "Resources", active: false, icon: BookOpen },
            { label: "Bookmarks", active: false, icon: Bookmark }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-650/10'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Call to Action & Bottom Details */}
        <div className="px-4 space-y-4">
          <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer">
            Start Daily Session
          </button>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider px-2">
            <span>Support</span>
            <span>Archive</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Space Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header Navigation Tabs */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-900 px-6 md:px-8 flex items-center bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0 select-none">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            
            {/* Logo/Tabs with Back Button */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  if (domainParam) {
                    router.push(`/domain/${domainParam === 'quant' ? 'quantitative-aptitude' : domainParam === 'logical' ? 'logical-reasoning' : 'coding-dsa'}`);
                  } else {
                    router.push('/student/dashboard');
                  }
                }}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-8">
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight hidden sm:block">
                  AptitudeFlow
                </span>
                
                <nav className="flex gap-4">
                  {[
                    { label: 'Dashboard', route: '/student/dashboard' },
                    { label: 'Study Plan', active: true, route: '/student/study-planner' },
                    { label: 'Practice', route: '/student/dashboard?tab=domains' },
                    { label: 'Analytics', route: '/student/dashboard?tab=leaderboards' }
                  ].map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(tab.route)}
                      className={`text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                        tab.active
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-905 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right side utility icons (Theme, Streaks, Notifications, Profile) */}
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 flex items-center justify-center text-slate-650 dark:text-slate-450 cursor-pointer transition-colors"
                title="Theme Toggle"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification icon */}
              <button className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-650 dark:text-slate-450 relative cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-900">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black uppercase border-2 border-white dark:border-slate-950 shadow-md">
                  VR
                </div>
                <div className="text-left hidden lg:block select-none leading-tight">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">Vaishnavi R.</span>
                  <span className="text-[9px] font-bold text-slate-400 block font-mono">STUDENT</span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* 3. Main Body Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none">
          <div className="max-w-7xl mx-auto space-y-8 select-text">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* WIDE COLUMN (Left side - 8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* CARD 1: Engineer Your Success */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md select-none">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                      Engineer Your Success
                    </h2>
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                      Personalized Study Architecture Planner
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Goal Select */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                        What are you preparing for?
                      </label>
                      <select
                        value={preparingFor}
                        onChange={(e) => {
                          setPreparingFor(e.target.value);
                          if (e.target.value === 'TCS Prep') {
                            setSelectedPack('tcs');
                            setSelectedTopics(['percentages', 'time_work', 'profit_loss']);
                          } else if (e.target.value === 'Infosys Prep') {
                            setSelectedPack('infosys');
                            setSelectedTopics(['percentages', 'logical_series', 'data_interpretation']);
                          } else {
                            setSelectedPack('custom');
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-900 text-xs font-bold text-slate-800 dark:text-slate-202 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Placement Season 2024">Placement Season 2024</option>
                        <option value="TCS Prep">TCS Prep</option>
                        <option value="Infosys Prep">Infosys Prep</option>
                        <option value="Gate Exam 2025">Gate Exam 2025</option>
                        <option value="CAT Exam 2024">CAT Exam 2024</option>
                        <option value="Custom Study Goal">Custom Study Goal</option>
                      </select>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-900 text-xs font-bold text-slate-800 dark:text-slate-202 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Daily Commitment Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest block font-mono">
                          Daily Commitment
                        </label>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-405 font-mono leading-none">
                          {dailyCommitment} Hours
                        </span>
                      </div>
                      <div className="flex items-center gap-3 pt-1.5">
                        <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-600 font-mono">1HR</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={dailyCommitment}
                          onChange={(e) => setDailyCommitment(parseInt(e.target.value))}
                          className="flex-1 accent-blue-500 h-1 rounded-lg cursor-pointer bg-slate-100 dark:bg-slate-955"
                        />
                        <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-600 font-mono">5HRS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Path Builder */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                        Path Builder
                      </h3>
                      <p className="text-[9.5px] font-semibold text-slate-450 dark:text-slate-505 block leading-tight mt-0.5">
                        Select topics or choose a curated industry pack to create your roadmap.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPack('tcs');
                          setPreparingFor('TCS Prep');
                          setSelectedTopics(['percentages', 'time_work', 'profit_loss']);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                          selectedPack === 'tcs'
                            ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-955 dark:border-slate-900 text-slate-505 dark:text-slate-400'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" /> [TCS Pack]
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPack('infosys');
                          setPreparingFor('Infosys Prep');
                          setSelectedTopics(['percentages', 'logical_series', 'data_interpretation']);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                          selectedPack === 'infosys'
                            ? 'bg-purple-600/10 border-purple-500 text-purple-600 dark:text-purple-400'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-955 dark:border-slate-900 text-slate-505 dark:text-slate-400'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" /> [Infosys Pack]
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 select-none">
                    {[
                      { id: 'percentages', name: 'Percentages', category: 'CORE', sub: 'ARITHMETIC' },
                      { id: 'time_work', name: 'Time & Work', category: 'APPLICATION', sub: 'ARITHMETIC' },
                      { id: 'profit_loss', name: 'Profit & Loss', category: 'COMMERCIAL MATH', sub: 'ARITHMETIC' },
                      { id: 'logical_series', name: 'Logical Series', category: 'REASONING', sub: 'LOGICAL' },
                      { id: 'data_interpretation', name: 'Data Interpretation', category: 'ANALYTICS', sub: 'STATISTICS' },
                      { id: 'coding_arrays', name: 'Coding: Arrays', category: 'TECHNICAL', sub: 'CODING' }
                    ].map((topic) => {
                      const isSelected = selectedTopics.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => {
                            setSelectedPack('custom');
                            if (isSelected) {
                              setSelectedTopics(selectedTopics.filter(t => t !== topic.id));
                            } else {
                              setSelectedTopics([...selectedTopics, topic.id]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                            isSelected
                              ? 'bg-blue-600/5 border-blue-500 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20'
                              : 'bg-slate-50/50 border-slate-200/60 dark:bg-slate-955/20 dark:border-slate-900 text-slate-655 dark:text-slate-355'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-black font-mono border px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-slate-200/50 border-slate-350 dark:bg-slate-900 dark:border-slate-800 text-slate-505 dark:text-slate-400">
                              {topic.category}
                            </span>
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-850'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">{topic.name}</span>
                            <span className="text-[8px] font-bold text-slate-400 block mt-0.5 font-mono uppercase">{topic.sub}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Topic Creator Form */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-200/50 dark:border-slate-900 rounded-2xl space-y-4">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span className="text-[9px] font-black text-slate-850 dark:text-white uppercase tracking-widest block leading-none font-mono">
                        Add Custom Topic to Study (Build Your Own Roadmap)
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Enter custom topic name... (e.g. Probability & Stats)"
                        value={customTopicName}
                        onChange={(e) => setCustomTopicName(e.target.value)}
                        className="flex-grow py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-855 dark:text-slate-250 placeholder-slate-405 focus:outline-none"
                      />
                      <select
                        value={customTopicCategory}
                        onChange={(e) => setCustomTopicCategory(e.target.value)}
                        className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-855 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="CORE">CORE</option>
                        <option value="APPLICATION">APPLICATION</option>
                        <option value="TECHNICAL">TECHNICAL</option>
                        <option value="ANALYTICS">ANALYTICS</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!customTopicName.trim()) return;
                          const newModule = {
                            id: `custom_${Date.now()}`,
                            title: customTopicName.trim(),
                            desc: `Custom study module for ${customTopicName.trim()}. Focus on candidate mastery criteria.`,
                            category: customTopicCategory,
                            sub: customTopicSub,
                            tasks: [`Solve 10 practice sets on ${customTopicName.trim()}`, `Review core worksheets`],
                            companyBadges: ['CUSTOM']
                          };
                          setCustomModules([...customModules, newModule]);
                          setCustomTopicName('');
                        }}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md border-0 cursor-pointer text-center"
                      >
                        Add Topic
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Dynamic Roadmap */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-4 select-none">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                        Dynamic Roadmap
                      </h3>
                      <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-505 block leading-tight mt-0.5">
                        Custom study route compiled below based on chosen options.
                      </p>
                    </div>

                    {/* Completion progress */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 font-mono">
                        {roadmapProgress}% COMPLETE
                      </span>
                      <div className="w-24 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-850">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                          style={{ width: `${roadmapProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {activeModules.length === 0 ? (
                    <div className="py-12 text-center text-slate-450 font-bold text-xs uppercase tracking-wider">
                      Select a few topics above to build your study roadmap.
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 dark:border-slate-900 ml-4 pl-8 space-y-8 py-2">
                      {activeModules.map((module, weekIdx) => {
                        return (
                          <div key={module.id} className="relative text-left space-y-3 animate-fadeIn">
                            {/* Node Dot marker */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#0A0F1C] bg-blue-650 flex items-center justify-center shadow-md">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                                  WEEK {weekIdx + 1}: {module.category}
                                </span>
                                
                                {/* Badges */}
                                <div className="flex gap-1.5">
                                  {module.companyBadges.map((badge, bIdx) => (
                                    <span key={bIdx} className="text-[8.5px] font-black uppercase font-mono px-1.5 py-0.2 rounded border bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 tracking-wider">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">
                                {module.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                {module.desc}
                              </p>
                            </div>

                            {/* Sub-tasks checklist */}
                            <div className="flex flex-wrap gap-2.5 pt-1.5 select-none">
                              {module.tasks.map((task) => {
                                const isTaskCompleted = completedTasks.includes(task);
                                return (
                                  <button
                                    key={task}
                                    onClick={() => {
                                      if (isTaskCompleted) {
                                        setCompletedTasks(completedTasks.filter(t => t !== task));
                                      } else {
                                        setCompletedTasks([...completedTasks, task]);
                                      }
                                    }}
                                    className={`py-1.5 px-3 rounded-xl border text-[10.5px] font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                                      isTaskCompleted
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                                        : 'bg-white dark:bg-slate-955 border-slate-205 dark:border-slate-900 text-slate-550 dark:text-slate-455 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                      isTaskCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-800'
                                    }`}>
                                      {isTaskCompleted && <Check className="w-2.5 h-2.5 stroke-[4.5]" />}
                                    </div>
                                    <span>{task}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* NARROW COLUMN (Right side - 4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* WIDGET 1: Days Until Target */}
                <div className="bg-blue-600 text-white rounded-[2rem] p-6 text-left relative overflow-hidden group select-none shadow-xl shadow-blue-500/10">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-sm" />
                  <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest block font-mono">
                    Days Until Target
                  </span>
                  <span className="text-4xl font-black font-mono block mt-2.5 leading-none">
                    {daysRemaining} <span className="text-lg font-bold font-sans">Days</span>
                  </span>
                  
                  <div className="border-t border-white/10 pt-4 mt-5 flex items-center justify-between text-[9px] font-mono font-bold text-blue-100">
                    <span className="uppercase">Next Milestone:</span>
                    <span className="flex items-center gap-1.5 uppercase">
                      <Calendar className="w-3.5 h-3.5" />
                      Mock Exam 🏆
                    </span>
                  </div>
                </div>

                {/* WIDGET 2: Today's Tasks */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-4 relative overflow-hidden backdrop-blur-md select-none">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4 text-blue-600" /> Today's Tasks
                    </h4>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg uppercase tracking-wider leading-none">
                      {streak}d streak 🔥
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {[
                      { id: 'task_q_tw', text: '10 Questions: Time & Work' },
                      { id: 'task_v_rp', text: 'Ratio & Proportions Video' },
                      { id: 'streak_checkin', text: 'Daily-Streak Check-in' }
                    ].map((task) => {
                      const isChecked = completedTasks.includes(task.id);
                      return (
                        <button
                          key={task.id}
                          onClick={() => {
                            if (isChecked) {
                              setCompletedTasks(completedTasks.filter(t => t !== task.id));
                            } else {
                              setCompletedTasks([...completedTasks, task.id]);
                            }
                          }}
                          className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                            isChecked
                              ? 'bg-slate-50 dark:bg-slate-955/20 border-slate-200 dark:border-slate-900 text-slate-455 line-through'
                              : 'bg-white dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-900 text-slate-700 dark:text-slate-355 hover:bg-slate-100/40 dark:hover:bg-slate-900/30'
                          }`}
                        >
                          <span>{task.text}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-800'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[4.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* WIDGET 3: Learning Pulse Heatmap */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-4 relative overflow-hidden backdrop-blur-md select-none">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">
                      Learning Pulse
                    </h4>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 font-mono uppercase">
                      <span>Less</span>
                      <div className="w-2 h-2 bg-slate-100 dark:bg-slate-955 rounded-xs border border-slate-250 dark:border-slate-800" />
                      <div className="w-2 h-2 bg-emerald-500/20 rounded-xs border border-emerald-500/40" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-xs border border-emerald-555" />
                      <span>More</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1.5 pt-1">
                    {Array.from({ length: 32 }).map((_, idx) => {
                      let opacity = 'bg-slate-50 dark:bg-slate-955/40 border-slate-200 dark:border-slate-900';
                      if (idx === 3 || idx === 7 || idx === 12 || idx === 18 || idx === 22 || idx === 29) {
                        opacity = 'bg-emerald-500 border-emerald-500';
                      } else if (idx % 3 === 0) {
                        opacity = 'bg-emerald-500/20 border-emerald-500/30';
                      }
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded border ${opacity} transition-all`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* WIDGET 4: Study Materials / Resource Spotlight */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-[2rem] p-6 text-left relative overflow-hidden select-none shadow-xl flex flex-col justify-between h-48 group">
                  <div className="absolute right-2 top-2 opacity-5 scale-90 group-hover:scale-100 group-hover:opacity-10 transition-transform duration-500">
                    <BookOpen className="w-32 h-32" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest block font-mono">
                      Study Materials
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Premium Resource
                    </span>
                    <h4 className="text-sm font-black uppercase text-white leading-tight mt-1">
                      The TCS NQT Prime Guide
                    </h4>
                  </div>

                  <button className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white font-bold text-[9px] uppercase rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Study Now
                  </button>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}

export default function StudyPlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <div className="w-8 h-8 rounded-full border border-blue-600/60 border-t-transparent animate-spin" />
      </div>
    }>
      <StudyPlannerContent />
    </Suspense>
  );
}
