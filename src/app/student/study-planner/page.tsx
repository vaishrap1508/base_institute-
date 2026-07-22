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
  BookMarked,
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

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const pageTransition = {
  duration: 0.85,
  ease: "easeInOut" as const
};

const domainTopicsData: Record<string, Array<{ id: string; title: string; category: string; desc: string; isLocked?: boolean }>> = {
  quant: [
    { id: 'num_sys', title: 'Number Systems', category: 'Arithmetic', desc: 'Integers, HCF & LCM, Prime factors' },
    { id: 'percentages', title: 'Percentages', category: 'Comparison', desc: 'Growth rates, Successive change' },
    { id: 'ratio_prop', title: 'Ratio & Proportion', category: 'Structure', desc: 'Mixtures, Allegation, Partnership' },
    { id: 'profit_loss', title: 'Profit & Loss', category: 'Commercial', desc: 'Margins, Discounts, Simple/Compound Interest' },
    { id: 'averages', title: 'Averages & Mixtures', category: 'Applications', desc: 'Weighted averages, allegation ratios' },
    { id: 'quad_eq', title: 'Quadratic Equations', category: 'Algebra', desc: 'Roots, Inequalities, Maxima', isLocked: true }
  ],
  logical: [
    { id: 'logical_series', title: 'Logical Series', category: 'Reasoning', desc: 'Pattern recognition, sequence checks' },
    { id: 'data_interp', title: 'Data Interpretation', category: 'Analytics', desc: 'Graphs, tables, pie charts' },
    { id: 'syllogisms', title: 'Syllogisms', category: 'Deduction', desc: 'Venn diagrams, logic constraints' },
    { id: 'arrangements', title: 'Arrangements', category: 'Spatial', desc: 'Linear & circular arrangements' },
    { id: 'blood_rel', title: 'Blood Relations', category: 'Family', desc: 'Kinship paths, family tree puzzles' }
  ],
  verbal: [
    { id: 'rc', title: 'Reading Comprehension', category: 'Reading', desc: 'Passage analysis, main ideas' },
    { id: 'sc', title: 'Sentence Correction', category: 'Grammar', desc: 'Subject-verb agreement, modifiers' },
    { id: 'vocabulary', title: 'Vocabulary', category: 'Words', desc: 'Synonyms, antonyms, analogical pairs' },
    { id: 'para_jumbles', title: 'Para Jumbles', category: 'Logic', desc: 'Coherence checks, sequence reordering' }
  ],
  coding: [
    { id: 'arrays', title: 'Arrays & Vectors', category: 'Data Structures', desc: 'Linear memory, static array operations' },
    { id: 'linked_lists', title: 'Linked Lists', category: 'Data Structures', desc: 'Pointers, node traversals, chains' },
    { id: 'stacks_queues', title: 'Stacks & Queues', category: 'Data Structures', desc: 'LIFO/FIFO mechanisms, applications' },
    { id: 'trees_graphs', title: 'Trees & Graphs', category: 'Advanced DS', desc: 'Binary search trees, traversal algorithms' },
    { id: 'sort_search', title: 'Sorting & Searching', category: 'Algorithms', desc: 'Bubble sort, quicksort, binary search' }
  ]
};

const adjustColorBrightness = (hex: string, percent: number) => {
  let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + Math.round(2.55 * percent)));
  g = Math.max(0, Math.min(255, g + Math.round(2.55 * percent)));
  b = Math.max(0, Math.min(255, b + Math.round(2.55 * percent)));
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
};

const applyBrandColor = (color: string) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (color === 'default') {
    root.classList.remove('custom-color-active');
    root.style.removeProperty('--clr-primary');
    root.style.removeProperty('--clr-primary-dark');
    root.style.removeProperty('--clr-primary-tint');
    root.style.removeProperty('--clr-primary-rgb');
    return;
  }
  root.classList.add('custom-color-active');
  root.style.setProperty('--clr-primary', color);
  root.style.setProperty('--clr-primary-dark', adjustColorBrightness(color, -15));
  root.style.setProperty('--clr-primary-tint', color + '20');

  const cleanColor = color.startsWith('#') ? color.slice(1) : color;
  const r = parseInt(cleanColor.substring(0, 2), 16);
  const g = parseInt(cleanColor.substring(2, 4), 16);
  const b = parseInt(cleanColor.substring(4, 6), 16);
  root.style.setProperty('--clr-primary-rgb', `${r}, ${g}, ${b}`);
};

const readymadeTimelines: Record<string, Array<{ id: string; title: string; category: string; duration: string; status: 'Completed' | 'In Progress' | 'Planned'; accuracy?: string; progress?: number; subtasks?: string[] }>> = {
  quant: [
    { id: 'rm_q_1', title: 'Data Interpretation', category: 'Arithmetic', duration: 'Oct 01 - Oct 07', status: 'Completed', accuracy: '94%' },
    { id: 'rm_q_2', title: 'Logical Reasoning', category: 'Deduction', duration: 'Oct 08 - Oct 22', status: 'In Progress', progress: 60, subtasks: ['Linear Arrangements', 'Complex Grid Puzzles'] },
    { id: 'rm_q_3', title: 'Geometry Prep', category: 'Planned', duration: 'Oct 23 - Nov 10', status: 'Planned' }
  ],
  logical: [
    { id: 'rm_l_1', title: 'Syllogisms & Logic', category: 'Deduction', duration: 'Oct 01 - Oct 07', status: 'Completed', accuracy: '92%' },
    { id: 'rm_l_2', title: 'Arrangements', category: 'Spatial', duration: 'Oct 08 - Oct 15', status: 'In Progress', progress: 50, subtasks: ['Circular Seating', 'Row Ordering'] },
    { id: 'rm_l_3', title: 'Blood Relations', category: 'Family', duration: 'Oct 16 - Oct 25', status: 'Planned' }
  ],
  verbal: [
    { id: 'rm_v_1', title: 'Grammar Basics', category: 'Grammar', duration: 'Oct 01 - Oct 07', status: 'Completed', accuracy: '88%' },
    { id: 'rm_v_2', title: 'Reading Comprehension', category: 'Reading', duration: 'Oct 08 - Oct 15', status: 'In Progress', progress: 70, subtasks: ['Tone Analysis', 'Main Idea Inference'] },
    { id: 'rm_v_3', title: 'Para Jumbles', category: 'Logic', duration: 'Oct 16 - Oct 22', status: 'Planned' }
  ],
  coding: [
    { id: 'rm_c_1', title: 'Arrays & Loops', category: 'Coding', duration: 'Oct 01 - Oct 07', status: 'Completed', accuracy: '96%' },
    { id: 'rm_c_2', title: 'Linked Lists', category: 'Data Structures', duration: 'Oct 08 - Oct 15', status: 'In Progress', progress: 40, subtasks: ['Singly LinkedList Reversal', 'Detect Loop in LinkedList'] },
    { id: 'rm_c_3', title: 'Stacks & Queues', category: 'Data Structures', duration: 'Oct 16 - Oct 22', status: 'Planned' }
  ]
};

function StudyPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain');

  // Interactive Study Planner States
  const [plannerView, setPlannerView] = useState<'study_plan' | 'roadmap_builder'>('study_plan');
  const [timelineTab, setTimelineTab] = useState<'timeline' | 'list'>('timeline');
  const [roadmapType, setRoadmapType] = useState<'readymade' | 'custom'>('readymade');
  const [selectedBuilderDomain, setSelectedBuilderDomain] = useState<string>('quant');
  const [roadmapStarted, setRoadmapStarted] = useState<boolean>(false);
  const [customRoadmapItems, setCustomRoadmapItems] = useState<Array<{ id: string; title: string; category: string; duration: string; status: 'Completed' | 'In Progress' | 'Planned'; accuracy?: string; progress?: number; subtasks?: string[] }>>([
    { id: 'custom_1', title: 'Percentages', category: 'Arithmetic', duration: 'Oct 01 - Oct 07', status: 'Completed', accuracy: '90%' },
    { id: 'custom_2', title: 'Number Systems', category: 'Comparison', duration: 'Oct 08 - Oct 15', status: 'In Progress', progress: 40, subtasks: ['Integers and Prime Ratios'] }
  ]);
  const [preparingFor, setPreparingFor] = useState<string>('All Domains (Comprehensive)');
  const [targetDate, setTargetDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [dailyCommitment, setDailyCommitment] = useState<number>(3);
  const [presets, setPresets] = useState<Record<string, { name: string; topics: string[] }>>({
    tcs: { name: 'TCS Pack', topics: ['percentages', 'time_work', 'profit_loss'] },
    infosys: { name: 'Infosys Pack', topics: ['percentages', 'logical_series'] }
  });
  const [selectedPack, setSelectedPack] = useState<string>('custom');
  const [customPresetName, setCustomPresetName] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['time_work']); // starts with 'time_work' checked in the mockup screenshot

  const handleSaveCustomPreset = () => {
    if (!customPresetName.trim()) return;
    const newKey = `custom_${Date.now()}`;
    setPresets({
      ...presets,
      [newKey]: { name: customPresetName.trim(), topics: [...selectedTopics] }
    });
    setSelectedPack(newKey);
    setCustomPresetName('');
    setToastMsg(`Saved custom preset: ${customPresetName.trim()}!`);
  };

  const [customTopicName, setCustomTopicName] = useState<string>('');
  const [customTopicCategory, setCustomTopicCategory] = useState<string>('CORE');
  const [customTopicSub, setCustomTopicSub] = useState<string>('CUSTOM');
  const [customModules, setCustomModules] = useState<Array<{ id: string; title: string; desc: string; category: string; sub: string; tasks: string[]; companyBadges: string[] }>>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>(['streak_checkin', 'Percentage Practice', 'Vedic Math Quiz']);
  const [dailyTasks, setDailyTasks] = useState<Array<{ id: string; text: string; isCustom?: boolean }>>([
    { id: 'task_q_tw', text: '10 Questions: Time & Work' },
    { id: 'task_v_rp', text: 'Ratio & Proportions Video' },
    { id: 'streak_checkin', text: 'Daily-Streak Check-in' }
  ]);
  const [newTaskText, setNewTaskText] = useState<string>('');

  const handleAddCustomTask = () => {
    if (!newTaskText.trim()) return;
    const newId = `custom_task_${Date.now()}`;
    setDailyTasks([
      ...dailyTasks,
      { id: newId, text: newTaskText.trim(), isCustom: true }
    ]);
    setNewTaskText('');
    setToastMsg("Added custom daily task!");
  };

  const [streak, setStreak] = useState<number>(14);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Pre-populate based on domain search parameter
  useEffect(() => {
    if (domainParam) {
      if (domainParam === 'quant') {
        setSelectedPack('custom');
        setPreparingFor('Quantitative Aptitude');
        setSelectedTopics(['percentages', 'time_work', 'profit_loss']);
      } else if (domainParam === 'logical') {
        setSelectedPack('custom');
        setPreparingFor('Logical Reasoning');
        setSelectedTopics(['percentages', 'logical_series', 'data_interpretation']);
      } else if (domainParam === 'coding') {
        setSelectedPack('custom');
        setPreparingFor('Gaming Aptitude');
        setSelectedTopics(['coding_arrays']);
      } else if (domainParam === 'verbal') {
        setSelectedPack('custom');
        setPreparingFor('Verbal Ability');
        setSelectedTopics(['percentages']);
      }
    }
  }, [domainParam]);

  // Synchronize Dark Theme and Custom Color Theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const savedColor = localStorage.getItem('aptitude_custom_brand_color');
    if (savedColor) {
      applyBrandColor(savedColor);
    }
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

  const handleDropTopic = (topicId: string) => {
    // Find topic from domainTopicsData
    let foundTopic: { id: string; title: string; category: string; desc: string } | undefined;
    for (const domain of Object.keys(domainTopicsData)) {
      const topic = domainTopicsData[domain].find(t => t.id === topicId);
      if (topic) {
        foundTopic = topic;
        break;
      }
    }

    if (!foundTopic) return;

    let currentCustomItems = [...customRoadmapItems];
    if (roadmapType === 'readymade') {
      setRoadmapType('custom');
      // Copy readymade items to custom list if default
      if (customRoadmapItems.length === 2 && customRoadmapItems[0].id === 'custom_1') {
        const itemsToCopy = (readymadeTimelines[selectedBuilderDomain] || []).map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          duration: item.duration,
          status: item.status,
          accuracy: item.accuracy,
          progress: item.progress,
          subtasks: item.subtasks
        }));
        currentCustomItems = itemsToCopy;
      }
    }

    const alreadyExists = currentCustomItems.some(item => item.id === foundTopic!.id);
    if (alreadyExists) {
      setToastMsg(`${foundTopic.title} is already in your path!`);
      return;
    }

    const updated = [
      ...currentCustomItems,
      {
        id: foundTopic.id,
        title: foundTopic.title,
        category: foundTopic.category,
        duration: 'Flexible Schedule',
        status: 'Planned' as const
      }
    ];

    setCustomRoadmapItems(updated);
    setToastMsg(`Dropped & scheduled ${foundTopic.title}!`);
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
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const difference = target.getTime() - today.getTime();
      return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  }, [targetDate]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar (Unified thin style) */}
      <aside className="w-[76px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 hidden md:flex flex-col items-center py-6 h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300 select-none">
        {/* Top Logo Button / Dashboard Trigger */}
        <button
          onClick={() => router.push('/student/dashboard?tab=dashboard')}
          className="w-12 h-12 rounded-full bg-[var(--clr-primary)] text-white flex items-center justify-center shadow-md mb-8 cursor-pointer hover:scale-105 transition-all duration-300 border-0 outline-none"
          title="Dashboard"
          type="button"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Sidebar Tabs */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full overflow-y-auto scrollbar-none py-2">
          {[
            { id: 'domains', label: 'Domains', icon: LayoutGrid, route: '/student/dashboard?tab=domains' },
            { id: 'learning', label: 'Progress', icon: BookOpen, route: '/student/dashboard?tab=learning' },
            { id: 'studyPlanner', label: 'Study Plan', icon: Calendar, route: '/student/study-planner' },
            { id: 'library', label: 'Study Library', icon: BookMarked, route: '/student/dashboard?tab=library' },
            { id: 'mockTests', label: 'Mock Tests', icon: Award, route: '/student/dashboard?tab=mockTests' },
            { id: 'careerHub', label: 'Career Hub', icon: Briefcase, route: '/student/dashboard?tab=careerHub' },
            { id: 'leaderboards', label: 'Leaderboard Rankings', icon: Trophy, route: '/student/dashboard?tab=leaderboards' },
            { id: 'badges', label: 'Badges & Achievements', icon: Sparkles, route: '/student/dashboard?tab=badges' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === 'studyPlanner';
            return (
              <button
                key={tab.id}
                onClick={() => {
                  router.push(tab.route);
                }}
                title={tab.label}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer relative group/sidebar-btn border-0 bg-transparent ${
                  isActive
                    ? 'text-white shadow-md scale-105 z-10 font-bold'
                    : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:scale-105 z-10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarGlow"
                    className="absolute inset-0 bg-[var(--clr-primary)] rounded-full z-0 shadow-[0_0_15px_rgba(var(--clr-primary-rgb),0.3)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-slate-100/0 dark:bg-slate-900/0 group-hover/sidebar-btn:bg-slate-100 dark:group-hover/sidebar-btn:bg-slate-900 transition-colors duration-200 z-0" />
                )}
                <Icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover/sidebar-btn:scale-110" />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. Main Space Frame */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10"
      >
        
        {/* Top Header Navigation Tabs */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-900 px-6 md:px-8 flex items-center bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0 select-none">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            
            {/* Left: Back Button + Title */}
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

              <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight hidden sm:block">
                Interactive study planner
              </span>
            </div>

            {/* Center: Segmented view switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                onClick={() => setPlannerView('study_plan')}
                className={`relative px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 outline-none ${
                  plannerView === 'study_plan'
                    ? 'text-slate-950 dark:text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-350'
                }`}
              >
                {plannerView === 'study_plan' && (
                  <motion.div
                    layoutId="activePlannerTabPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Study Plan</span>
              </button>
              <button
                onClick={() => setPlannerView('roadmap_builder')}
                className={`relative px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 outline-none ${
                  plannerView === 'roadmap_builder'
                    ? 'text-slate-950 dark:text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-350'
                }`}
              >
                {plannerView === 'roadmap_builder' && (
                  <motion.div
                    layoutId="activePlannerTabPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Roadmap Builder</span>
              </button>
            </div>

            {/* Spacer to balance the layout and keep the center switcher centered */}
            <div className="w-[180px] hidden md:block" />

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none relative">
          <AnimatePresence mode="wait">
            {plannerView === 'study_plan' ? (
              <motion.div
                key="study_plan"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="max-w-7xl mx-auto select-text">
                    {/* Main Content Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* WIDE COLUMN (Left side - 8 cols) */}
                      <div className="lg:col-span-8 space-y-8">
                        
                        {/* CARD 1: Engineer Your Success */}
                        {plannerView === 'study_plan' && (
                          <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md select-none">
                            <div>
                              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                                Engineer Your Success
                              </h2>
                              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-widest mt-1">
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
                                    if (e.target.value === 'Quantitative Aptitude') {
                                      setSelectedTopics(['percentages', 'time_work', 'profit_loss']);
                                    } else if (e.target.value === 'Logical Reasoning') {
                                      setSelectedTopics(['percentages', 'logical_series', 'data_interpretation']);
                                    } else if (e.target.value === 'Verbal Ability') {
                                      setSelectedTopics(['percentages']);
                                    } else if (e.target.value === 'Gaming Aptitude') {
                                      setSelectedTopics(['coding_arrays']);
                                    } else if (e.target.value === 'All Domains (Comprehensive)') {
                                      setSelectedTopics(['percentages', 'time_work', 'profit_loss', 'logical_series', 'data_interpretation', 'coding_arrays']);
                                    }
                                  }}
                                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-850 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--clr-primary)] cursor-pointer"
                                  style={{ colorScheme: theme }}
                                >
                                  <option value="Quantitative Aptitude" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Quantitative Aptitude</option>
                                  <option value="Logical Reasoning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Logical Reasoning</option>
                                  <option value="Verbal Ability" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Verbal Ability</option>
                                  <option value="Gaming Aptitude" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gaming Aptitude</option>
                                  <option value="All Domains (Comprehensive)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Domains (Comprehensive)</option>
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
                                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-850 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--clr-primary)] cursor-pointer"
                                  style={{ colorScheme: theme }}
                                />
                              </div>

                              {/* Daily Commitment Slider */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest block font-mono">
                                    Daily Commitment
                                  </label>
                                  <span className="text-xs font-black text-[var(--clr-primary)] font-mono leading-none">
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
                                    className="flex-1 accent-[var(--clr-primary)] h-1 rounded-lg cursor-pointer bg-slate-100 dark:bg-slate-955"
                                  />
                                  <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-600 font-mono">5HRS</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CARD 2: Path Builder */}
                        <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md select-none">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-4">
                            <div>
                              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                                Path Builder
                              </h3>
                              <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-505 block leading-tight mt-0.5">
                                Select topics or choose a curated industry pack.
                              </p>
                            </div>

                            {/* Presets List */}
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(presets).map((key) => (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setSelectedPack(key);
                                    setSelectedTopics(presets[key].topics);
                                    setToastMsg(`Loaded preset: ${presets[key].name}!`);
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                                    selectedPack === key
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  {presets[key].name}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  setSelectedPack('custom');
                                  setToastMsg("Switched to Custom Pack. Toggle topics below.");
                                }}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                                  selectedPack === 'custom'
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                Custom Pack
                              </button>
                            </div>
                          </div>

                          {/* Topic grid checkboxes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { id: 'percentages', title: 'Percentages', category: 'CORE ARITHMETIC', sub: 'Foundations' },
                              { id: 'time_work', title: 'Time & Work', category: 'APPLICATION RATES', sub: 'Application' },
                              { id: 'profit_loss', title: 'Profit & Loss', category: 'COMMERCIAL MATH', sub: 'Commercial' },
                              { id: 'logical_series', title: 'Logical Series', category: 'REASONING CORE', sub: 'Logical' }
                            ].map((topic) => {
                              const isChecked = selectedTopics.includes(topic.id);
                              return (
                                <div
                                  key={topic.id}
                                  onClick={() => {
                                    let nextTopics;
                                    if (isChecked) {
                                      nextTopics = selectedTopics.filter(id => id !== topic.id);
                                    } else {
                                      nextTopics = [...selectedTopics, topic.id];
                                    }
                                    setSelectedTopics(nextTopics);
                                    setSelectedPack('custom');
                                  }}
                                  className={`p-4 rounded-2xl border text-xs font-bold text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                                    isChecked
                                      ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-500/30 text-slate-900 dark:text-white'
                                      : 'bg-slate-50/50 dark:bg-slate-955/30 border-slate-200/60 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  <div>
                                    <span className="text-[7.5px] font-black font-mono border px-1.5 py-0.2 rounded uppercase tracking-wider bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-455 dark:text-slate-500">
                                      {topic.category}
                                    </span>
                                    <h4 className="text-xs font-black uppercase mt-1 text-slate-800 dark:text-white">
                                      {topic.title}
                                    </h4>
                                    <p className="text-[9px] text-slate-405 dark:text-slate-550 font-medium">
                                      {topic.sub}
                                    </p>
                                  </div>

                                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-800'
                                  }`}>
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Custom preset creator */}
                          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-900/60 mt-4">
                            <input
                              type="text"
                              placeholder="Name your custom preset..."
                              value={customPresetName}
                              onChange={(e) => setCustomPresetName(e.target.value)}
                              className="flex-1 py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-850 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleSaveCustomPreset}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                            >
                              Save Preset
                            </button>
                          </div>
                        </div>

                        {/* CARD 3: Dynamic Roadmap */}
                        <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-6 relative overflow-hidden backdrop-blur-md select-none">
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900/60 pb-3">
                            <div>
                              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                                Dynamic Roadmap
                              </h3>
                              <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-505 block leading-tight mt-0.5">
                                Track progress of your learning modules.
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9.5px] font-black text-emerald-650 dark:text-emerald-450 uppercase tracking-widest font-mono">
                                ● {roadmapProgress}% COMPLETE
                              </span>
                              <div className="w-24 bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200/20 dark:border-slate-800">
                                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${roadmapProgress}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-1">
                            {/* Week 1 foundations */}
                            {selectedTopics.includes('percentages') && (
                              <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850/70 bg-slate-50/30 dark:bg-slate-955/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                  <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-405 font-mono tracking-wider">
                                    Week 1: Foundations
                                  </span>
                                  <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white mt-0.5">
                                    Master Arithmetic Basics
                                  </h4>
                                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium">
                                    Focus on rapid calculation techniques, percentages, and fractions conversion.
                                  </p>
                                </div>
                                
                                <div className="flex gap-2">
                                  <span className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-650 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                    <Check className="w-3 h-3 stroke-[3]" /> Percentage Practice
                                  </span>
                                  <span className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-650 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                    <Check className="w-3 h-3 stroke-[3]" /> Vedic Math Quiz
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Week 2 Logical Core */}
                            {selectedTopics.includes('time_work') && (
                              <div className="p-4 rounded-2xl border border-blue-500/30 bg-white dark:bg-slate-900/60 shadow-lg shadow-[var(--clr-primary-tint)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                  <span className="text-[8px] font-black uppercase text-[var(--clr-primary)] font-mono tracking-wider">
                                    Week 2: Logical Core
                                  </span>
                                  <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white mt-0.5">
                                    Time, Work & Rates
                                  </h4>
                                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium">
                                    Master rate equations, combined work ratios, and pipe flow problems.
                                  </p>
                                </div>
                                
                                <button
                                  onClick={() => setToastMsg("Resuming Active study session on Time & Work...")}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 shadow-sm"
                                >
                                  Active Session
                                </button>
                              </div>
                            )}

                            {/* Week 3 Advanced Quants */}
                            {selectedTopics.includes('profit_loss') && (
                              <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850/70 bg-slate-50/10 dark:bg-slate-950/10 opacity-70 flex justify-between items-center gap-4">
                                <div>
                                  <span className="text-[8px] font-black uppercase text-slate-400 font-mono tracking-wider">
                                    Week 3: Advanced Quants
                                  </span>
                                  <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 mt-0.5">
                                    Complex Applications
                                  </h4>
                                  <p className="text-[9.5px] text-slate-405 dark:text-slate-650 font-medium">
                                    Navigate margins, discount rates, simple and compound interests.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* NARROW COLUMN (Right side - 4 cols) */}
                      <div className="lg:col-span-4 space-y-8">
                        
                        {/* WIDGET 1: Days Until Target */}
                        <div className="bg-[var(--clr-primary)] text-white rounded-[2rem] p-6 text-left relative overflow-hidden group select-none shadow-xl shadow-[var(--clr-primary-tint)]">
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-sm" />
                          <span className="text-[9px] font-black text-white/80 uppercase tracking-widest block font-mono">
                            Days Until Target
                          </span>
                          <span className="text-4xl font-black font-mono block mt-2.5 leading-none">
                            {daysRemaining} <span className="text-lg font-bold font-sans">Days</span>
                          </span>
                          
                          <div className="border-t border-white/10 pt-4 mt-5 flex items-center justify-between text-[9px] font-mono font-bold text-white/70">
                            <span className="uppercase">Next Milestone:</span>
                            <span className="flex items-center gap-1.5 uppercase">
                              <Calendar className="w-3.5 h-3.5" />
                              Mock Exam 🏆
                            </span>
                          </div>
                        </div>

                        {/* WIDGET 2: Today's Tasks */}
                        <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-6 relative overflow-hidden backdrop-blur-md select-none">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3">
                            <div>
                              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-[var(--clr-primary)]" /> Today's Tasks
                              </h3>
                              <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-550 block leading-tight mt-0.5">
                                Track your daily study objectives.
                              </p>
                            </div>
                            <span className="flex items-center gap-1 text-[9px] font-black text-orange-655 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                              🔥 120 STREAK
                            </span>
                          </div>

                          <div className="space-y-3 pt-1">
                            {dailyTasks.map((task) => {
                              const isChecked = completedTasks.includes(task.id);
                              return (
                                <div
                                  key={task.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setCompletedTasks(completedTasks.filter(t => t !== task.id));
                                    } else {
                                      setCompletedTasks([...completedTasks, task.id]);
                                    }
                                  }}
                                  className={`w-full py-3.5 px-5 rounded-2xl border text-xs font-bold text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                                    isChecked
                                      ? 'bg-slate-50 dark:bg-slate-955/20 border-slate-200 dark:border-slate-900 text-slate-455 line-through'
                                      : 'bg-white dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-905 text-slate-700 dark:text-slate-355 hover:bg-slate-100/40 dark:hover:bg-slate-900/30'
                                  }`}
                                >
                                  <span className="truncate">{task.text}</span>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {task.isCustom && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Avoid toggling checked state
                                          setDailyTasks(dailyTasks.filter(t => t.id !== task.id));
                                          setCompletedTasks(completedTasks.filter(id => id !== task.id));
                                          setToastMsg("Deleted custom daily task!");
                                        }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border-0 bg-transparent cursor-pointer flex items-center justify-center"
                                        title="Delete task"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-800'
                                    }`}>
                                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[4.5]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Custom Task Input Row */}
                          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-900/60 mt-4 select-none">
                            <input
                              type="text"
                              placeholder="Create your own daily task..."
                              value={newTaskText}
                              onChange={(e) => setNewTaskText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddCustomTask();
                              }}
                              className="flex-1 py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-850 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleAddCustomTask}
                              className="px-4 py-2 bg-blue-650 hover:bg-blue-505 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* WIDGET 3: Learning Pulse Heatmap */}
                        <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-4 relative overflow-hidden backdrop-blur-md select-none">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase text-slate-905 dark:text-white tracking-widest">
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
                              // Historical pattern for static days 0-27
                              const historical = [
                                1, 0, 0, 2, 0, 1, 0, 2,
                                0, 1, 1, 0, 2, 0, 0, 1,
                                0, 0, 2, 1, 0, 0, 1, 2,
                                0, 1, 0, 1
                              ];

                              let intensity = 0;
                              if (idx < 28) {
                                intensity = historical[idx];
                              } else if (idx === 28) {
                                intensity = customRoadmapItems.length > 2 ? 2 : customRoadmapItems.length > 0 ? 1 : 0;
                              } else if (idx === 29) {
                                intensity = dailyCommitment >= 4 ? 2 : dailyCommitment >= 2 ? 1 : 0;
                              } else if (idx === 30) {
                                intensity = roadmapStarted ? 2 : 1;
                              } else if (idx === 31) {
                                const total = dailyTasks.length;
                                const completedCount = completedTasks.filter(id => dailyTasks.some(t => t.id === id)).length;
                                const ratio = total > 0 ? completedCount / total : 0;
                                intensity = ratio >= 0.99 ? 2 : ratio > 0 ? 1 : 0;
                              }

                              let opacity = 'bg-slate-50 dark:bg-slate-950/20 border-slate-205 dark:border-slate-900';
                              let label = 'No Study Activity';
                              if (intensity === 2) {
                                opacity = 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
                                label = 'High Study Activity';
                              } else if (intensity === 1) {
                                opacity = 'bg-emerald-500/30 border-emerald-500/40';
                                label = 'Moderate Study Activity';
                              }

                              return (
                                <div
                                  key={idx}
                                  title={`Day ${idx + 1}: ${label}`}
                                  className={`aspect-square rounded border ${opacity} transition-all duration-300 hover:scale-110 cursor-pointer`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* WIDGET 4: Study Mutuals */}
                        <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-4 relative overflow-hidden backdrop-blur-md select-none">
                          <h4 className="text-xs font-black uppercase text-slate-905 dark:text-white tracking-widest flex items-center gap-2">
                            <Layers className="w-4.5 h-4.5 text-[var(--clr-primary)]" /> Study Mutuals
                          </h4>
                          
                          <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black font-mono border px-1.5 py-0.2 rounded uppercase tracking-wider bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-405">
                                PREMIUM RESOURCE
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase">
                                The TCS NQT Prime Guide
                              </h4>
                              <p className="text-[10px] text-slate-455 dark:text-slate-500 font-medium">
                                High-yield aptitude questions, coding pattern cheat-sheets, and interview scripts.
                              </p>
                            </div>
                            <button
                              onClick={() => setToastMsg("Safe Work: Resource unlocked and downloaded to library.")}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                            >
                              Safe Work
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
            </motion.div>
          ) : (
            <motion.div
              key="roadmap_builder"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="max-w-7xl mx-auto space-y-8 select-none text-left">
              
              {/* Roadmap Mode Switcher Toggles (Radio button style) & Overall Completion */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 pb-2">
                <div className="inline-flex bg-slate-100 dark:bg-slate-955 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-850 shadow-inner relative">
                  <button
                    onClick={() => {
                      setRoadmapType('readymade');
                      setToastMsg("Switched to Curated Readymade Roadmap!");
                    }}
                    className={`relative px-6 py-2.5 rounded-[1.2rem] text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 outline-none ${
                      roadmapType === 'readymade'
                        ? 'text-white font-bold'
                        : 'text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350'
                    }`}
                  >
                    {roadmapType === 'readymade' && (
                      <motion.div
                        layoutId="activeRoadmapTypePill"
                        className="absolute inset-0 bg-[var(--clr-primary)] dark:bg-[var(--clr-primary)] rounded-[1.2rem] shadow-md shadow-[var(--clr-primary-tint)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Readymade Roadmap</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoadmapType('custom');
                      setToastMsg("Switched to Customize Roadmap builder!");
                    }}
                    className={`relative px-6 py-2.5 rounded-[1.2rem] text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 outline-none ${
                      roadmapType === 'custom'
                        ? 'text-white font-bold'
                        : 'text-slate-455 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350'
                    }`}
                  >
                    {roadmapType === 'custom' && (
                      <motion.div
                        layoutId="activeRoadmapTypePill"
                        className="absolute inset-0 bg-[var(--clr-primary)] dark:bg-[var(--clr-primary)] rounded-[1.2rem] shadow-md shadow-[var(--clr-primary-tint)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Customize Your Own Roadmap</span>
                  </button>
                </div>

                {/* Overall Completion Progress */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block font-mono">
                    OVERALL COMPLETION
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-36 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-800">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: '25%' }} />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-white font-mono">25%</span>
                  </div>
                </div>
              </div>

              {/* Main Grid: Left Topics (Domain Dropdown), Right Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDEBAR: Domain dropdown & topics list */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 text-left space-y-6 backdrop-blur-md">
                  
                  {/* Select Domain Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                      Select Domain
                    </label>
                    <select
                      value={selectedBuilderDomain}
                      onChange={(e) => {
                        setSelectedBuilderDomain(e.target.value);
                        setToastMsg(`Loaded topics for ${e.target.value.toUpperCase()}!`);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-850 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      style={{ colorScheme: theme }}
                    >
                      <option value="quant" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Quantitative Aptitude</option>
                      <option value="logical" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Logical Reasoning</option>
                      <option value="verbal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Verbal Ability</option>
                      <option value="coding" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gaming Aptitude</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                      Available Topics
                    </h3>
                    <span className="text-[9px] font-mono font-bold bg-[var(--clr-primary-tint)] border border-[var(--clr-primary)]/20 text-[var(--clr-primary)] px-2 py-0.5 rounded-lg uppercase tracking-wider leading-none">
                      {domainTopicsData[selectedBuilderDomain]?.length || 0} Topics
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-none">
                    {domainTopicsData[selectedBuilderDomain]?.map((topic) => {
                      const isAdded = customRoadmapItems.some(item => item.id === topic.id);
                      return (
                        <div
                          key={topic.id}
                          draggable={!topic.isLocked}
                          onDragStart={(e) => {
                            if (topic.isLocked) return;
                            e.dataTransfer.setData("text/plain", topic.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className={`p-4 rounded-2xl border border-slate-200/60 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-955/40 flex items-start justify-between gap-3 group hover:scale-[1.01] transition-all animate-fade-in ${
                            topic.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[8px] font-black font-mono border px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-orange-500/10 border-orange-500/20 text-orange-605 dark:text-orange-400">
                              {topic.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mt-2 leading-tight">
                              {topic.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">
                              {topic.desc}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {topic.isLocked ? (
                              <div className="text-slate-400 p-1">
                                <Lock className="w-4 h-4" />
                              </div>
                            ) : (
                              <>
                                <div className="text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing p-1">
                                  <Sliders className="w-4 h-4 rotate-90" />
                                </div>
                                {roadmapType === 'custom' && (
                                  <button
                                    onClick={() => {
                                      if (isAdded) {
                                        setCustomRoadmapItems(customRoadmapItems.filter(item => item.id !== topic.id));
                                        setToastMsg(`Removed ${topic.title} from custom path!`);
                                      } else {
                                        setCustomRoadmapItems([
                                          ...customRoadmapItems,
                                          {
                                            id: topic.id,
                                            title: topic.title,
                                            category: topic.category,
                                            duration: 'Flexible Schedule',
                                            status: 'Planned'
                                          }
                                        ]);
                                        setToastMsg(`Added ${topic.title} to custom path!`);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                                      isAdded
                                        ? 'bg-red-500/10 text-red-650 dark:text-red-405 hover:bg-red-500/20'
                                        : 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white shadow-sm'
                                    }`}
                                  >
                                    {isAdded ? 'Remove' : '+ Add'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* VIEW ALL TOPICS button */}
                  <button
                    onClick={() => setToastMsg("Opening comprehensive topics catalog...")}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-0 cursor-pointer mt-4"
                  >
                    View All Topics
                  </button>
                </div>

                {/* RIGHT AREA: Learning Path Timeline */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const topicId = e.dataTransfer.getData("text/plain");
                    if (topicId) handleDropTopic(topicId);
                  }}
                  className="lg:col-span-8 bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-8 backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                        Learning Path Timeline
                      </h3>
                      <p className="text-[9.5px] font-semibold text-slate-455 dark:text-slate-550 block leading-tight mt-0.5">
                        October — December 2023
                      </p>
                    </div>

                    {/* Timeline switcher */}
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-0.5 rounded-full border border-slate-200 dark:border-slate-855 shadow-inner shrink-0">
                      <button
                        onClick={() => setTimelineTab('timeline')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          timelineTab === 'timeline'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                            : 'text-slate-405 hover:text-slate-850 dark:text-slate-500 dark:hover:text-slate-300'
                        }`}
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setTimelineTab('list')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          timelineTab === 'list'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                            : 'text-slate-405 hover:text-slate-855 dark:text-slate-505 dark:hover:text-slate-300'
                        }`}
                      >
                        List View
                      </button>
                    </div>
                  </div>

                  {timelineTab === 'timeline' ? (
                    <div className="relative border-l-2 border-blue-500/20 dark:border-slate-850 ml-4 pl-8 space-y-8 py-2">
                      
                      {/* Curated Pre-populated Roadmap timeline or Custom timeline */}
                      {(roadmapType === 'readymade'
                        ? readymadeTimelines[selectedBuilderDomain] || []
                        : customRoadmapItems
                      ).map((item) => (
                        <div key={item.id} className="relative text-left space-y-3 group animate-fade-in">
                          
                          {/* Marker dot */}
                          <div className={`absolute -left-[42px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#0A0F1C] flex items-center justify-center shadow-md ${
                            item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-blue-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-800'
                          }`}>
                            {item.status === 'Completed' ? (
                              <Check className="w-3 h-3 text-white stroke-[4]" />
                            ) : item.status === 'In Progress' ? (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-slate-400 rounded-full" />
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative">
                            <div>
                              <span className={`text-[8px] font-black uppercase tracking-widest font-mono ${
                                item.status === 'Completed' ? 'text-emerald-650 dark:text-emerald-400' : item.status === 'In Progress' ? 'text-blue-550 dark:text-blue-400' : 'text-slate-400'
                              }`}>
                                {item.status}
                              </span>
                              <h4 className={`text-sm font-black uppercase leading-snug ${
                                item.status === 'Planned' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                              }`}>
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-505 font-mono mt-0.5">
                                {item.duration}
                              </p>
                            </div>

                            {/* Completed Status Card */}
                            {item.status === 'Completed' && (
                              <div className="flex-1 max-w-md p-4 bg-slate-50/50 dark:bg-slate-955/30 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center text-[10px] font-black font-mono text-slate-850 dark:text-white">
                                    {item.accuracy || '100%'}
                                  </div>
                                  <div>
                                    <span className="text-xs font-black text-slate-850 dark:text-white block">Caselet Analysis & Charts</span>
                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-405 block uppercase tracking-wider mt-0.5">{item.accuracy || '94%'} Accuracy</span>
                                  </div>
                                </div>
                                <button className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0">
                                  Review
                                </button>
                              </div>
                            )}

                            {/* In Progress Status Card */}
                            {item.status === 'In Progress' && (
                              <div className="flex-1 max-w-md p-5 bg-white dark:bg-slate-955 border-2 border-[var(--clr-primary)]/80 rounded-2xl space-y-4 shadow-lg shadow-[var(--clr-primary-tint)] relative">
                                <button
                                  onClick={() => setToastMsg("Opening path configurations...")}
                                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-205 cursor-pointer bg-transparent border-0 font-bold"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-blue-500" />
                                </button>

                                <div className="space-y-1 text-left">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{item.subtasks?.[0] || 'Syllogisms & Puzzles'}</h4>
                                  <div className="flex gap-2">
                                    <span className="text-[7.5px] font-black uppercase font-mono px-1.5 py-0.2 rounded border bg-[var(--clr-primary-tint)] border-[var(--clr-primary)]/20 text-[var(--clr-primary)] tracking-wider">
                                      Target: Oct 15
                                    </span>
                                    <span className="text-[7.5px] font-black uppercase font-mono px-1.5 py-0.2 rounded border bg-amber-50 border-amber-100 text-amber-705 dark:bg-amber-955/20 dark:border-amber-900/20 dark:text-amber-400 tracking-wider">
                                      Goal: 90% Accuracy
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                  <div>
                                    <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                      <span>{item.subtasks?.[0] || 'Linear Arrangements'}</span>
                                      <span>{item.progress || 60}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-850 mt-1">
                                      <div className="h-full rounded-full bg-[var(--clr-primary)]" style={{ width: `${item.progress || 60}%` }} />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                      <span>{item.subtasks?.[1] || 'Complex Grid Puzzles'}</span>
                                      <span>0%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-850 mt-1">
                                      <div className="h-full rounded-full bg-[var(--clr-primary)]" style={{ width: '0%' }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Deletion cross icon to support path adjustment in custom builder mode */}
                            {roadmapType === 'custom' && (
                              <button
                                onClick={() => {
                                  setCustomRoadmapItems(customRoadmapItems.filter(i => i.id !== item.id));
                                  setToastMsg(`Removed ${item.title} from custom path!`);
                                }}
                                className="absolute -right-2 -top-2 w-5.5 h-5.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-550 flex items-center justify-center transition-all cursor-pointer z-10"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}

                          </div>
                        </div>
                      ))}

                      {/* Empty custom state helper */}
                      {roadmapType === 'custom' && customRoadmapItems.length === 0 && (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                          <p className="text-xs font-bold uppercase tracking-wider">Your custom timeline is empty.</p>
                          <p className="text-[10px] font-semibold mt-1">Select a domain on the left and click "+ Add" to build your custom path!</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Simple list representation for List View */}
                      {(roadmapType === 'readymade'
                        ? readymadeTimelines[selectedBuilderDomain] || []
                        : customRoadmapItems
                      ).map((item) => (
                        <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl flex justify-between items-center relative group">
                          <div>
                            <h4 className="text-xs font-black text-slate-855 dark:text-white uppercase">{item.title}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">{item.duration}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                              item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'In Progress' ? 'bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' : 'bg-slate-500/10 text-slate-550'
                            }`}>
                              {item.status}
                            </span>
                            {item.status === 'Completed' && item.accuracy && (
                              <span className="text-[9px] font-bold font-mono text-emerald-600 dark:text-emerald-400">{item.accuracy} Accuracy</span>
                            )}
                          </div>

                          {/* Delete option for List View */}
                          {roadmapType === 'custom' && (
                            <button
                              onClick={() => {
                                  setCustomRoadmapItems(customRoadmapItems.filter(i => i.id !== item.id));
                                  setToastMsg(`Removed ${item.title} from custom path!`);
                              }}
                              className="absolute -right-2 -top-2 w-5.5 h-5.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Empty custom state helper for list */}
                      {roadmapType === 'custom' && customRoadmapItems.length === 0 && (
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-600 text-center py-6">
                          No topics added to your customized path yet.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Drag and Drop / Add helper container */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const topicId = e.dataTransfer.getData("text/plain");
                      if (topicId) handleDropTopic(topicId);
                    }}
                    className="py-8 border-2 border-dashed border-slate-200 dark:border-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 group hover:border-[var(--clr-primary)]/50 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-955 flex items-center justify-center border border-slate-200 dark:border-slate-900 text-slate-400 group-hover:scale-105 group-hover:text-[var(--clr-primary)] transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10.5px] font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                        Drag topics here to schedule
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-widest block mt-1 font-mono">
                        AVAILABLE: 12 MODULES
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* WIDGET: Predictive Performance */}
              <div className="bg-slate-950 border border-slate-800 text-white rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 mt-8 select-none">
                <div className="space-y-1 max-w-xl text-left">
                  <h4 className="text-xs font-black uppercase text-[var(--clr-primary)] tracking-widest font-mono">
                    Predictive Performance
                  </h4>
                  <p className="text-xs text-slate-305 font-medium leading-relaxed mt-1">
                    Based on your current roadmap and velocity, we predict you will achieve <span className="text-blue-405 font-bold">92nd percentile</span> in the upcoming mock exam.
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setToastMsg("Simulating adaptive mock evaluation...")}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-800"
                  >
                    Simulate Test
                  </button>
                  <button
                    onClick={() => {
                      setRoadmapType('custom');
                      setToastMsg("Customize mode activated. Adjust your path below.");
                    }}
                    className="py-3 px-6 bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                  >
                    Adjust Path
                  </button>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 pb-6 select-none">
                {roadmapType === 'readymade' && (
                  <button
                    onClick={() => {
                      setRoadmapType('custom');
                      // Copy ready-made items to custom list if empty/default
                      if (customRoadmapItems.length === 2 && customRoadmapItems[0].id === 'custom_1') {
                        const itemsToCopy = (readymadeTimelines[selectedBuilderDomain] || []).map(item => ({
                          id: item.id,
                          title: item.title,
                          category: item.category,
                          duration: item.duration,
                          status: item.status,
                          accuracy: item.accuracy,
                          progress: item.progress,
                          subtasks: item.subtasks
                        }));
                        setCustomRoadmapItems(itemsToCopy);
                      }
                      setToastMsg("Switched to Customize mode. Adjust your path now!");
                    }}
                    className="w-full max-w-xs py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg cursor-pointer text-center bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white"
                  >
                    Adjust Path
                  </button>
                )}
                
                <button
                  onClick={() => {
                    const nextState = !roadmapStarted;
                    setRoadmapStarted(nextState);
                    setToastMsg(nextState ? "Roadmap Started!" : "Resuming active study session.");
                  }}
                  className={`w-full max-w-xs py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg cursor-pointer text-center border-0 ${
                    roadmapStarted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 hover:shadow-emerald-600/20'
                      : 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white shadow-[var(--clr-primary-tint)]/10 hover:shadow-[var(--clr-primary-tint)]/20'
                  }`}
                >
                  {roadmapStarted ? 'RESUME' : 'START'}
                </button>
              </div>

            </div>
          </motion.div>
          )}
        </AnimatePresence>
        </main>
      </motion.div>

      {/* Toast feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
