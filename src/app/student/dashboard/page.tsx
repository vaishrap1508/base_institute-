'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  BookMarked,
  Bug,
  List,
  Rocket,
  MessageSquare,
  Lightbulb,
  FileText,
  Send,
  Video,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { DOMAINS_DATA, SAMPLE_QUESTIONS } from '@/lib/admin/store';

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ROADMAP_CHALLENGES: Record<string, { question: string, options: string[], correctIndex: number, solution: string }> = {
  'Percentages': {
    question: "A laptop price drops from ₹40,000 to ₹34,000. What is the percentage decrease in the price?",
    options: ["10%", "12%", "15%", "18%"],
    correctIndex: 2,
    solution: "Decrease = 40,000 - 34,000 = 6,000. Percentage = (6,000 / 40,000) * 100 = 15%."
  },
  'Ratios & Proportions': {
    question: "If 3A = 4B = 5C, what is the ratio A : B : C?",
    options: ["3 : 4 : 5", "20 : 15 : 12", "5 : 4 : 3", "12 : 15 : 20"],
    correctIndex: 1,
    solution: "Divide by LCM of 3, 4, 5 (which is 60). A/20 = B/15 = C/12. So ratio is 20 : 15 : 12."
  },
  'Profit & Loss': {
    question: "By selling an item for ₹600, a merchant makes a profit of 20%. What is the Cost Price (CP) of the item?",
    options: ["₹480", "₹500", "₹520", "₹540"],
    correctIndex: 1,
    solution: "SP = CP * 1.20 => 600 = CP * 1.20 => CP = 600 / 1.20 = ₹500."
  },
  'Time & Work': {
    question: "A can complete a project in 12 days and B can do it in 24 days. How many days will they take working together?",
    options: ["6 days", "8 days", "9 days", "10 days"],
    correctIndex: 1,
    solution: "Together rate = 1/12 + 1/24 = 3/24 = 1/8. So working together they will take 8 days."
  },
  'Syllogisms': {
    question: "Statements: All stars are planets. Some planets are moons. Conclusion: Are some stars moons?",
    options: ["Yes, definitely", "No, definitely", "Maybe, not certain", "None of the above"],
    correctIndex: 2,
    solution: "There is no connection given between stars and moons, so it is possible but not logically certain."
  },
  'Blood Relations': {
    question: "Anil introduces a man as 'He is the son of the only son of my father'. How is Anil related to the man?",
    options: ["Brother", "Uncle", "Father", "Cousin"],
    correctIndex: 2,
    solution: "The 'only son of Anil's father' is Anil himself. So the man is Anil's son, making Anil his Father."
  },
  'Coding: Arrays': {
    question: "What is the worst-case time complexity of inserting an element into a dynamic array (vector) of size N?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correctIndex: 2,
    solution: "In the worst case, the array is full, requiring copying all N elements to a new location, taking O(N)."
  },
  'Coding: Recursion': {
    question: "What is the time complexity of the standard recursive Fibonacci function (F(n) = F(n-1) + F(n-2))?",
    options: ["O(log N)", "O(N)", "O(N^2)", "O(2^N)"],
    correctIndex: 3,
    solution: "The recursion tree splits into 2 branches at each level, resulting in an exponential O(2^N) time complexity."
  },
  'Mastery Milestone': {
    question: "Which sorting algorithm has O(N log N) worst-case time complexity and O(N) space complexity?",
    options: ["Merge Sort", "Quick Sort", "Heap Sort", "Bubble Sort"],
    correctIndex: 0,
    solution: "Merge Sort has a guaranteed O(N log N) time complexity in all cases but requires O(N) auxiliary space."
  }
};

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, -4, 4, 0],
    transition: { duration: 0.5 }
  },
  idle: { x: 0 }
};

const DOMAIN_ROADMAPS: Record<string, any[]> = {
  all: [
    { id: 1, title: 'Percentages', desc: 'Core fractional relationships', symbol: '%' },
    { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', symbol: '1:2' },
    { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', symbol: '₹' },
    { id: 4, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', symbol: '⏳' },
    { id: 5, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', symbol: 'V' },
    { id: 6, title: 'Blood Relations', desc: 'Structured family maps trees', symbol: '👪' },
    { id: 7, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', symbol: '[]' },
    { id: 8, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', symbol: '()' },
    { id: 9, title: 'Mastery Milestone', desc: 'Complete Career Certification', symbol: '🏆' }
  ],
  quant: [
    { id: 1, title: 'Percentages', desc: 'Core fractional relationships', symbol: '%' },
    { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', symbol: '1:2' },
    { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', symbol: '₹' },
    { id: 4, title: 'Simple Interest', desc: 'Linear accumulation models', symbol: 'P*R' },
    { id: 5, title: 'Compound Interest', desc: 'Exponential curves and compound periods', symbol: 'A^t' },
    { id: 6, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', symbol: '⏳' },
    { id: 7, title: 'Time & Speed', desc: 'Relative velocity equations', symbol: '🚗' },
    { id: 8, title: 'Geometry & Mensuration', desc: 'Shapes properties and formulas', symbol: '📐' },
    { id: 9, title: 'Quant Mastery', desc: 'Aptitude Certification Complete', symbol: '🏆' }
  ],
  logical: [
    { id: 1, title: 'Series & Analogy', desc: 'Visual progressions logic patterns', symbol: '1,2' },
    { id: 2, title: 'Seating Arrangements', desc: 'Linear coordinates spacing constraints', symbol: '🪑' },
    { id: 3, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', symbol: 'V' },
    { id: 4, title: 'Blood Relations', desc: 'Structured family maps trees', symbol: '👪' },
    { id: 5, title: 'Clocks & Calendars', desc: 'Periodic time mathematics checks', symbol: '📅' },
    { id: 6, title: 'Coding-Decoding', desc: 'Cipher shifting mapping tables', symbol: '🔑' },
    { id: 7, title: 'Data Sufficiency', desc: 'Logical evaluation prerequisites', symbol: '📊' },
    { id: 8, title: 'Logical Deductions', desc: 'Analytical deduction steps conclusions', symbol: 'Logic' },
    { id: 9, title: 'Logical Mastery', desc: 'Logical Certification Complete', symbol: '🏆' }
  ],
  verbal: [
    { id: 1, title: 'Spotting Errors', desc: 'Grammar checking logic systems', symbol: '✏️' },
    { id: 2, title: 'Sentence Improvement', desc: 'Syntax phrasing modifications', symbol: 'ABC' },
    { id: 3, title: 'Prepositions', desc: 'Spatial connection structure relationships', symbol: 'Prep' },
    { id: 4, title: 'Reading Comprehension', desc: 'Context interpretation mapping paragraphs', symbol: '📖' },
    { id: 5, title: 'Synonyms & Antonyms', desc: 'Contextual semantic vocabulary checks', symbol: 'Syn' },
    { id: 6, title: 'One Word Substitution', desc: 'Noun definitions dictionary compact', symbol: '1W' },
    { id: 7, title: 'Sentence Arrangement', desc: 'Logical paragraph reordering structures', symbol: 'Sort' },
    { id: 8, title: 'Idioms & Phrases', desc: 'Metaphoric language vocabulary banks', symbol: 'Phrase' },
    { id: 9, title: 'Verbal Mastery', desc: 'Verbal Certification Complete', symbol: '🏆' }
  ],
  coding: [
    { id: 1, title: 'Variables & Loops', desc: 'Flow structures state iterations', symbol: 'loop' },
    { id: 2, title: 'Functions & Scope', desc: 'Modular components calls stack', symbol: 'fn' },
    { id: 3, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', symbol: '[]' },
    { id: 4, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', symbol: '()' },
    { id: 5, title: 'Object Oriented Prog', desc: 'Abstraction encapsulation structures', symbol: 'OOP' },
    { id: 6, title: 'Searching & Sorting', desc: 'Divide and conquer speed limits', symbol: 'Bin' },
    { id: 7, title: 'Linked Lists & Queues', desc: 'Dynamic pointer chaining arrays', symbol: '->' },
    { id: 8, title: 'Trees & Graphs', desc: 'Hierarchical node network traversals', symbol: 'Tree' },
    { id: 9, title: 'Coding Mastery', desc: 'Technical Certification Complete', symbol: '🏆' }
  ]
};

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',     // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana',  // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',   // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',   // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',      // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucy',     // Female
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',    // Male
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',     // Male
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',      // Male
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',      // Male
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie',  // Male
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Toby'      // Male
];

import { Question } from '@/lib/admin/types';

const MOCK_BADGES_DATA = [
  // Standalone Getting Started Badges (Phase 1)
  { id: 'gs_first_step', name: 'First Step', level: 1, description: 'Awarded when you complete your first learning activity, lesson, quiz, or question.', image_url: '/badges/stage1/01.png', category: 'getting_started' },
  { id: 'gs_getting_started', name: 'Getting Started', level: 1, description: 'Awarded when onboarding and profile setup are completed.', image_url: '/badges/stage1/02.png', category: 'getting_started' },
  { id: 'gs_curious_mind', name: 'Curious Mind', level: 1, description: 'Awarded when you explore multiple sections of the platform.', image_url: '/badges/stage1/03.png', category: 'getting_started' },
  { id: 'gs_learning_begins', name: 'Learning Begins', level: 1, description: 'Awarded when your first learning module is completed.', image_url: '/badges/stage1/04.png', category: 'getting_started' },
  { id: 'gs_first_challenge', name: 'First Challenge', level: 1, description: 'Awarded when the first aptitude challenge or practice test is attempted.', image_url: '/badges/stage1/05.png', category: 'getting_started' },
  { id: 'gs_keep_going', name: 'Keep Going', level: 1, description: 'Awarded after completing 5 learning activities.', image_url: '/badges/stage1/06.png', category: 'getting_started' },
  { id: 'gs_early_bird', name: 'Early Bird', level: 1, description: 'Awarded after learning for 3 consecutive days.', image_url: '/badges/stage1/07.png', category: 'getting_started' },
  { id: 'gs_on_track', name: 'On Track', level: 1, description: 'Awarded after reaching 25% completion of the first learning path.', image_url: '/badges/stage1/08.png', category: 'getting_started' },
  { id: 'gs_not_stopping', name: 'Not Stopping', level: 1, description: 'Awarded after completing 10 learning activities.', image_url: '/badges/stage1/09.png', category: 'getting_started' }
];

const getCategoryEmoji = (cat: string) => {
  switch (cat) {
    case 'getting_started': return '🚀';
    case 'learning': return '📚';
    case 'profile': return '⚙️';
    case 'logical': return '🧩';
    case 'quant': return '📐';
    case 'speed': return '⚡';
    case 'streak': return '🔥';
    case 'community': return '💬';
    case 'mock': return '📝';
    default: return '🧠';
  }
};

const getAccentClass = (colorId: string, type: 'bg' | 'border' | 'text' | 'combined' | 'badge' | 'button' | 'ring') => {
  switch (colorId) {
    case 'emerald':
      if (type === 'bg') return 'bg-emerald-500';
      if (type === 'border') return 'border-emerald-500';
      if (type === 'text') return 'text-emerald-600 dark:text-emerald-400';
      if (type === 'badge') return 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20';
      if (type === 'button') return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/20';
      if (type === 'ring') return 'stroke-emerald-600 dark:stroke-emerald-400';
      return 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400';
    case 'purple':
      if (type === 'bg') return 'bg-purple-500';
      if (type === 'border') return 'border-purple-500';
      if (type === 'text') return 'text-purple-600 dark:text-purple-400';
      if (type === 'badge') return 'bg-purple-600 border-purple-500 text-white shadow-purple-500/20';
      if (type === 'button') return 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/20';
      if (type === 'ring') return 'stroke-purple-600 dark:stroke-purple-400';
      return 'bg-purple-50 border-purple-300 text-purple-600 dark:bg-purple-950/30 dark:border-purple-900 dark:text-purple-400';
    case 'amber':
      if (type === 'bg') return 'bg-amber-500';
      if (type === 'border') return 'border-amber-500';
      if (type === 'text') return 'text-amber-600 dark:text-amber-400';
      if (type === 'badge') return 'bg-amber-500 border-amber-400 text-white shadow-amber-500/20';
      if (type === 'button') return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg hover:shadow-amber-500/20';
      if (type === 'ring') return 'stroke-amber-600 dark:stroke-amber-400';
      return 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400';
    case 'rose':
      if (type === 'bg') return 'bg-rose-500';
      if (type === 'border') return 'border-rose-500';
      if (type === 'text') return 'text-rose-600 dark:text-rose-400';
      if (type === 'badge') return 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20';
      if (type === 'button') return 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/20';
      if (type === 'ring') return 'stroke-rose-600 dark:stroke-rose-400';
      return 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400';
    case 'orange':
      if (type === 'bg') return 'bg-orange-500';
      if (type === 'border') return 'border-orange-500';
      if (type === 'text') return 'text-orange-600 dark:text-orange-400';
      if (type === 'badge') return 'bg-orange-500 border-orange-400 text-white shadow-orange-500/20';
      if (type === 'button') return 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-orange-500/20';
      if (type === 'ring') return 'stroke-orange-600 dark:stroke-orange-400';
      return 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-400';
    case 'teal':
      if (type === 'bg') return 'bg-teal-500';
      if (type === 'border') return 'border-teal-500';
      if (type === 'text') return 'text-teal-600 dark:text-teal-400';
      if (type === 'badge') return 'bg-teal-500 border-teal-400 text-white shadow-teal-500/20';
      if (type === 'button') return 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-teal-500/20';
      if (type === 'ring') return 'stroke-teal-600 dark:stroke-teal-400';
      return 'bg-teal-50 border-teal-300 text-teal-600 dark:bg-teal-950/30 dark:border-teal-900 dark:text-teal-400';
    case 'indigo':
      if (type === 'bg') return 'bg-indigo-500';
      if (type === 'border') return 'border-indigo-500';
      if (type === 'text') return 'text-indigo-600 dark:text-indigo-400';
      if (type === 'badge') return 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20';
      if (type === 'button') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20';
      if (type === 'ring') return 'stroke-indigo-600 dark:stroke-indigo-400';
      return 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400';
    case 'blue':
    default:
      if (type === 'bg') return 'bg-blue-500';
      if (type === 'border') return 'border-blue-500';
      if (type === 'text') return 'text-blue-600 dark:text-blue-400';
      if (type === 'badge') return 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20';
      if (type === 'button') return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25';
      if (type === 'ring') return 'stroke-blue-600 dark:stroke-blue-400';
      return 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400';
  }
};

const getHexColor = (colorId: string) => {
  switch (colorId) {
    case 'emerald': return '#10B981';
    case 'purple': return '#8B5CF6';
    case 'amber': return '#F59E0B';
    case 'rose': return '#F43F5E';
    case 'orange': return '#F97316';
    case 'teal': return '#14B8A6';
    case 'indigo': return '#6366F1';
    case 'blue':
    default: return '#3B82F6';
  }
};


const getBadgeProgress = (badgeName: string, isUnlocked: boolean) => {
  const name = badgeName.toLowerCase();

  const hasOnboarding = typeof window !== 'undefined' ? (localStorage.getItem('aptitude_onboarding_completed') === 'true') : false;
  const currentSolved = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_solved_count') || 12) : 12;
  const currentStreak = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_streak') || 14) : 14;
  const bookmarksCount = typeof window !== 'undefined' ? (() => {
    try {
      const b = localStorage.getItem('aptitude_bookmarks');
      return b ? JSON.parse(b).length : 1;
    } catch (_) { return 1; }
  })() : 1;
  const sectionsVisited = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_sections_visited_count') || 2) : 2;

  if (name.includes('first step')) {
    return { current: isUnlocked ? 1 : Math.min(1, currentSolved), target: 1, label: 'Learning Activities' };
  }
  if (name.includes('getting started')) {
    return { current: isUnlocked || hasOnboarding ? 1 : 0, target: 1, label: 'Complete Profile' };
  }
  if (name.includes('curious mind')) {
    return { current: isUnlocked ? 3 : Math.min(3, sectionsVisited), target: 3, label: 'Sections Visited' };
  }
  if (name.includes('learning begins')) {
    return { current: isUnlocked ? 1 : 0, target: 1, label: 'Complete a Concept' };
  }
  if (name.includes('first challenge')) {
    return { current: isUnlocked ? 1 : 0, target: 1, label: 'Attempt a Mock Test' };
  }
  if (name.includes('keep going')) {
    return { current: isUnlocked ? 5 : Math.min(5, currentSolved), target: 5, label: 'Learning Activities' };
  }
  if (name.includes('early bird')) {
    return { current: isUnlocked ? 3 : Math.min(3, Math.min(currentStreak, 2)), target: 3, label: 'Consecutive Days' };
  }
  if (name.includes('on track')) {
    return { current: isUnlocked ? 25 : 0, target: 25, label: 'Path Progress %' };
  }
  if (name.includes('not stopping')) {
    return { current: isUnlocked ? 10 : Math.min(10, currentSolved), target: 10, label: 'Learning Activities' };
  }

  return { current: isUnlocked ? 1 : 0, target: 1, label: 'Progress' };
};

const getBadgeEarnMethod = (badgeName: string) => {
  const name = badgeName.toLowerCase();
  if (name.includes('first step')) {
    return "Complete any learning activity, lesson, quiz, or question on the platform to take your first step.";
  }
  if (name.includes('getting started')) {
    return "Finish your profile registration, enter academic details, and complete the onboarding setup.";
  }
  if (name.includes('curious mind')) {
    return "Navigate through and explore at least 3 different sections/tabs on your student dashboard.";
  }
  if (name.includes('learning begins')) {
    return "Finish your very first structured learning concept module and mark it as complete.";
  }
  if (name.includes('first challenge')) {
    return "Take initiative and attempt your first mock test or practice aptitude challenge.";
  }
  if (name.includes('keep going')) {
    return "Maintain momentum by finishing 5 learning activities or practice tasks.";
  }
  if (name.includes('early bird')) {
    return "Study on the platform for 3 consecutive days to build a regular learning habit.";
  }
  if (name.includes('on track')) {
    return "Advance through your domain roadmap to achieve 25% completion of your first learning path.";
  }
  if (name.includes('not stopping')) {
    return "Keep pushing forward and complete 10 learning activities or aptitude questions.";
  }
  return "Complete relevant platform activities and milestones to unlock this special achievement.";
};

// Memory cache for processed transparent badge images to enable instant subsequent loads
const PROCESSED_BADGE_CACHE: Record<string, string> = {};

const TransparentBadgeImage = ({ src, alt, className, style }: any) => {
  const [processedSrc, setProcessedSrc] = useState<string>(() => {
    if (!src) return '';
    if (src.startsWith('data:')) return src;

    // Try memory cache first
    if (PROCESSED_BADGE_CACHE[src]) {
      return PROCESSED_BADGE_CACHE[src];
    }

    // Try localStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`processed_badge_v2_${src}`);
        if (stored) {
          PROCESSED_BADGE_CACHE[src] = stored;
          return stored;
        }
      } catch (_) { }
    }
    return '';
  });

  const [isReady, setIsReady] = useState(() => !!processedSrc);

  useEffect(() => {
    if (!src) return;
    if (processedSrc) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Limit canvas size to max 512x512 for high clarity and crisp rendering
      const maxDim = 512;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setProcessedSrc(src);
        setIsReady(true);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const visited = new Uint8Array(w * h);
      const queue: [number, number][] = [];

      const isNearWhite = (r: number, g: number, b: number) => {
        return r > 240 && g > 240 && b > 240;
      };

      // Push all borders to seed flood fill
      for (let x = 0; x < w; x++) {
        let idx = x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, 0]);
          visited[idx] = 1;
        }
        idx = (h - 1) * w + x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, h - 1]);
          visited[idx] = 1;
        }
      }

      for (let y = 0; y < h; y++) {
        let idx = y * w;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([0, y]);
          visited[idx] = 1;
        }
        idx = y * w + (w - 1);
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([w - 1, y]);
          visited[idx] = 1;
        }
      }

      while (queue.length > 0) {
        const curr = queue.shift();
        if (!curr) continue;
        const [cx, cy] = curr;
        const idx = cy * w + cx;
        const pixelIdx = idx * 4;

        data[pixelIdx + 3] = 0;

        const dirs = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of dirs) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = ny * w + nx;
            if (!visited[nidx]) {
              const npixelIdx = nidx * 4;
              if (isNearWhite(data[npixelIdx], data[npixelIdx + 1], data[npixelIdx + 2])) {
                queue.push([nx, ny]);
                visited[nidx] = 1;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setProcessedSrc(dataUrl);
        PROCESSED_BADGE_CACHE[src] = dataUrl;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`processed_badge_v2_${src}`, dataUrl);
          } catch (_) { }
        }
      } catch (e) {
        console.warn('Canvas processing error:', e);
        setProcessedSrc(src);
      }
      setIsReady(true);
    };
    img.onerror = () => {
      setProcessedSrc(src);
      setIsReady(true);
    };
  }, [src, processedSrc]);

  if (!isReady || !processedSrc) {
    return (
      <div className="w-full h-full rounded-full bg-slate-900/10 dark:bg-slate-800/10 animate-pulse" />
    );
  }

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={className}
      style={style}
    />
  );
};

const BadgeCard = ({ badge, isUnlocked, onClick }: { badge: any, isUnlocked: boolean, onClick?: () => void }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const imgContainer = imageRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;

    // Calculate rotation angles (max tilt ~12 degrees for visible 3D effect)
    const rotateX = -(y - yc) / (rect.height / 15);
    const rotateY = (x - xc) / (rect.width / 15);

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;

    // Parallax Lift on the image container to pop out of the card
    if (imgContainer) {
      imgContainer.style.transform = `translateZ(30px) scale(1.1) rotateX(${-rotateX * 0.2}deg) rotateY(${-rotateY * 0.2}deg)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const imgContainer = imageRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.4s ease-out';

    if (imgContainer) {
      imgContainer.style.transform = 'translateZ(0px) scale(1)';
      imgContainer.style.transition = 'transform 0.4s ease-out';
    }
  };

  const getLevelStyles = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          border: 'border-emerald-500/20 dark:border-emerald-500/30',
          bg: 'bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-slate-900',
          glow: 'shadow-emerald-500/5',
          banner: 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400',
          badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/20 text-emerald-600',
          emoji: '🌱'
        };
      case 2:
        return {
          border: 'border-blue-500/20 dark:border-blue-500/30',
          bg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900',
          glow: 'shadow-blue-500/5',
          banner: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400',
          badgeStyle: 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/20 text-blue-600',
          emoji: '🛡️'
        };
      case 3:
        return {
          border: 'border-purple-500/20 dark:border-purple-500/30',
          bg: 'bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900',
          glow: 'shadow-purple-500/5',
          banner: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400',
          badgeStyle: 'bg-purple-50 dark:bg-purple-950/50 border-purple-500/20 text-purple-600',
          emoji: '🔮'
        };
      case 4:
        return {
          border: 'border-amber-500/30 dark:border-amber-500/40',
          bg: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900',
          glow: 'shadow-amber-500/10 dark:shadow-amber-500/20',
          banner: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400',
          badgeStyle: 'bg-amber-50 dark:bg-amber-950/50 border-amber-500/20 text-amber-600',
          emoji: '👑'
        };
      case 5:
        return {
          border: 'border-indigo-500/40 dark:border-indigo-500/50',
          bg: 'bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-pink-950/20',
          glow: 'shadow-indigo-500/15 dark:shadow-indigo-500/30',
          banner: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400',
          badgeStyle: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500/20 text-indigo-600',
          emoji: '🌌'
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-800',
          bg: 'bg-white dark:bg-slate-900',
          glow: '',
          banner: 'bg-slate-100 dark:bg-slate-800',
          badgeStyle: 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500',
          emoji: '🎓'
        };
    }
  };

  const style = getLevelStyles(badge.level);
  const progress = getBadgeProgress(badge.name, isUnlocked);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
      className={`border rounded-2xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm min-h-[280px] cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 ${isUnlocked
          ? `${style.border} ${style.bg} ${style.glow}`
          : 'border-slate-200 bg-slate-50/30 dark:border-slate-800/60 dark:bg-slate-900/40 opacity-70 hover:opacity-100'
        }`}
    >
      {/* Lock Icon in Top-Right when Locked */}
      {!isUnlocked && (
        <div className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <Lock className="w-3.5 h-3.5" />
        </div>
      )}


      <div
        ref={imageRef}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
        className="w-20 h-20 mb-4 relative flex items-center justify-center select-none"
      >
        {badge.image_url ? (
          <TransparentBadgeImage
            src={badge.image_url}
            alt={badge.name}
            className={`w-full h-full object-contain transition-all duration-300 ${isUnlocked
                ? 'scale-100 drop-shadow-[0_4px_10px_rgba(16,185,129,0.25)] dark:drop-shadow-[0_4px_10px_rgba(52,211,153,0.2)]'
                : 'scale-95 opacity-30 grayscale-[80%]'
              }`}
          />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border shadow-inner relative ${isUnlocked ? style.badgeStyle : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}>
            <span className="z-10">{getCategoryEmoji(badge.category)}</span>
            <span className="absolute bottom-0 right-0 text-xs">{style.emoji}</span>
          </div>
        )}
      </div>

      <div className="space-y-1 w-full flex-grow flex flex-col justify-center">
        <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white font-bold">
          {badge.name}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-semibold max-w-[150px] mx-auto min-h-[30px]">
          {badge.description}
        </p>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 w-full">
        {isUnlocked ? (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase tracking-widest">
            <Check className="w-3 h-3 stroke-[3]" /> Unlocked
          </span>
        ) : (
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <span>Progress</span>
              <span>{progress.current}/{progress.target}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(progress.current / progress.target) * 100}%` }}
              />
            </div>
            <div className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center pt-0.5">
              {progress.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



const CanvasCelebration = ({ confettiStyle }: { confettiStyle: 'confetti' | 'fireworks' | 'none' }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    interface Spark {
      x: number;
      y: number;
      color: string;
      angle: number;
      speed: number;
      friction: number;
      gravity: number;
      opacity: number;
      decay: number;
      size: number;
    }

    interface Firework {
      x: number;
      y: number;
      targetY: number;
      speedY: number;
      color: string;
      exploded: boolean;
      sparks: Spark[];
    }

    const particles: Particle[] = [];
    const fireworks: Firework[] = [];

    const colors = ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#8BC34A'];

    if (confettiStyle === 'confetti') {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * -height - 20,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 4 - 2,
          speedY: Math.random() * 5 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 - 2,
          opacity: 1
        });
      }
    }

    const launchFirework = () => {
      const x = Math.random() * (width - 200) + 100;
      const y = height + 10;
      const targetY = Math.random() * (height * 0.4) + height * 0.15;
      const color = colors[Math.floor(Math.random() * colors.length)];
      fireworks.push({
        x,
        y,
        targetY,
        speedY: -(Math.random() * 6 + 8),
        color,
        exploded: false,
        sparks: []
      });
    };

    if (confettiStyle === 'fireworks') {
      for (let i = 0; i < 4; i++) {
        setTimeout(launchFirework, i * 400);
      }
    }

    const createSparks = (x: number, y: number, color: string) => {
      const sparks: Spark[] = [];
      const count = 60;
      for (let i = 0; i < count; i++) {
        sparks.push({
          x,
          y,
          color,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 6 + 2,
          friction: 0.96,
          gravity: 0.15,
          opacity: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 2 + 1
        });
      }
      return sparks;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      if (confettiStyle === 'confetti') {
        let activeParticles = 0;
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          if (p.y > height) {
            p.opacity -= 0.02;
          }

          if (p.opacity > 0) {
            activeParticles++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            if (p.size % 2 === 0) {
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else {
              ctx.beginPath();
              ctx.moveTo(0, -p.size / 2);
              ctx.lineTo(p.size / 2, p.size / 2);
              ctx.lineTo(-p.size / 2, p.size / 2);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
          }
        });

        if (activeParticles > 0) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      } else if (confettiStyle === 'fireworks') {
        let activeFireworks = 0;

        fireworks.forEach((fw) => {
          if (!fw.exploded) {
            fw.y += fw.speedY;

            ctx.beginPath();
            ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(fw.x, fw.y);
            ctx.lineTo(fw.x, fw.y - fw.speedY * 2);
            ctx.strokeStyle = fw.color;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            if (fw.y <= fw.targetY) {
              fw.exploded = true;
              fw.sparks = createSparks(fw.x, fw.y, fw.color);
            }
            activeFireworks++;
          } else {
            let activeSparks = 0;
            fw.sparks.forEach((spark) => {
              spark.speed *= spark.friction;
              spark.x += Math.cos(spark.angle) * spark.speed;
              spark.y += Math.sin(spark.angle) * spark.speed + spark.gravity;
              spark.opacity -= spark.decay;

              if (spark.opacity > 0) {
                activeSparks++;
                ctx.beginPath();
                ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
                ctx.fillStyle = spark.color;
                ctx.globalAlpha = spark.opacity;
                ctx.fill();
              }
            });
            if (activeSparks > 0) {
              activeFireworks++;
            }
          }
        });

        if (activeFireworks > 0 || fireworks.length < 8) {
          if (fireworks.length < 8 && Math.random() < 0.02) {
            launchFirework();
          }
          animationFrameId = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [confettiStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

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
    learning_preference: 'Concept + Practice',
    avatar: 'initial'
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
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'learning' | 'practice' | 'mockTests' | 'careerHub' | 'leaderboards' | 'profile' | 'settings' | 'badges'>('dashboard');
  const [roadmapFilter, setRoadmapFilter] = useState<'all' | 'quant' | 'logical' | 'verbal' | 'coding'>('all');

  // Concept-Hub Practice Arena Redesign States
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeLearningTab, setActiveLearningTab] = useState<'explanation' | 'notes' | 'tips' | 'discussion' | 'related'>('explanation');
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState<boolean>(false);
  const [videoPlayTime, setVideoPlayTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number>(600); 
  const [videoProgress, setVideoProgress] = useState<number>(0); 
  const [practiceTimeSpent, setPracticeTimeSpent] = useState<number>(142);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [activeQuestionComments, setActiveQuestionComments] = useState<Record<string, Array<{ id: string; user: string; avatar: string; comment: string; time: string }>>>({
    'Q-8029-X': [
      { id: 'c1', user: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', comment: 'Loved Saleem Sir’s explanation on the selling price formula. The shortcut saved me 2 minutes!', time: '2h ago' },
      { id: 'c2', user: 'Rohit Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', comment: 'Are percentages like these common in TCS NQT rounds?', time: '1d ago' },
      { id: 'c3', user: 'Sriram Neppalli', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', comment: 'Remember: standard formula CP = (100 * profit) / profit% is great, but the 100x variable method is safer for complex adjustments.', time: '3d ago' }
    ]
  });

  const scrollablePanelRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync activeQuestion comments dynamic lookup
  const currentComments = useMemo(() => {
    if (!activeQuestion) return [];
    return activeQuestionComments[activeQuestion.id] || [
      { id: 'fc1', user: 'Admin Instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', comment: 'Be sure to post any clarifications here. Standard response turnaround is within 4 hours.', time: 'Just now' }
    ];
  }, [activeQuestion, activeQuestionComments]);



  // Increment practice time spent
  useEffect(() => {
    if (activeSidebarTab !== 'practice') return;
    const interval = setInterval(() => {
      setPracticeTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSidebarTab]);

  // Sticky video player scroll checker
  useEffect(() => {
    if (activeSidebarTab !== 'practice' || !activeQuestion) {
      setIsMiniPlayerActive(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMiniPlayerActive(!entry.isIntersecting);
      },
      {
        threshold: 0,
        root: scrollablePanelRef.current,
      }
    );

    const currentVideoRef = mainVideoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, [activeSidebarTab, activeQuestion]);

  const handleAddComment = () => {
    if (!newCommentText.trim() || !activeQuestion) return;
    const qId = activeQuestion.id;
    const newComment = {
      id: `c-${Date.now()}`,
      user: profile.username || 'You (Student)',
      avatar: profile.avatar === 'initial' || !profile.avatar ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' : profile.avatar,
      comment: newCommentText,
      time: 'Just now'
    };
    setActiveQuestionComments(prev => ({
      ...prev,
      [qId]: [...(prev[qId] || []), newComment]
    }));
    setNewCommentText('');
  };

  const handleTimestampClick = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(err => console.warn(err));
      setIsVideoPlaying(true);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setVideoPlayTime(current);
      setVideoProgress((current / duration) * 100);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDurationSeconds(videoRef.current.duration);
    }
  };

  const handleVideoSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setVideoProgress(newProgress);
    if (videoRef.current) {
      const duration = videoRef.current.duration || 1;
      videoRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handlePlayToggle = () => {
    const isYouTube = activeQuestion?.videoUrl && getYouTubeId(activeQuestion.videoUrl);
    if (isYouTube) {
      setIsVideoPlaying(!isVideoPlaying);
      return;
    }
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.ended) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current.play().catch(err => console.warn(err));
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Gamified Roadmap and animation states
  const [completedNodeIds, setCompletedNodeIds] = useState<number[]>([1, 2]);
  const [activeNodeId, setActiveNodeId] = useState<number>(3);
  const [justUnlockedNodeId, setJustUnlockedNodeId] = useState<number | null>(null);
  const [shakeNodeId, setShakeNodeId] = useState<number | null>(null);

  const [animatedXp, setAnimatedXp] = useState<number>(0);
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [activeChallengeNode, setActiveChallengeNode] = useState<any | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, string>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState<Record<number, boolean>>({});

  const [showXpBurst, setShowXpBurst] = useState<any | null>(null); // { x: number, y: number, amount: number }
  const [showConfettiBurst, setShowConfettiBurst] = useState<boolean>(false);

  const getNodeCoords = (index: number) => {
    let x = 50;
    let y = 80;
    if (index < 3) {
      x = index === 0 ? 10 : index === 1 ? 50 : 90;
      y = 80;
    } else if (index < 6) {
      x = index === 3 ? 90 : index === 4 ? 50 : 10;
      y = 260;
    } else {
      x = index === 6 ? 10 : index === 7 ? 50 : 90;
      y = 440;
    }
    return { x, y };
  };

  const handleChallengeSuccess = (node: any) => {
    setShowConfettiBurst(true);
    setShowXpBurst(node.id);
    setAnimatedXp(prev => prev + 150);

    setTimeout(() => {
      setCompletedNodeIds(prev => {
        if (!prev.includes(node.id)) {
          const nextList = [...prev, node.id];
          const percentage = Math.round((nextList.length / 9) * 100);
          setAnimatedProgress(percentage);
          return nextList;
        }
        return prev;
      });

      const nextNodeId = node.id + 1;
      if (nextNodeId <= 9) {
        setJustUnlockedNodeId(nextNodeId);
        setActiveNodeId(nextNodeId);

        setTimeout(() => {
          setJustUnlockedNodeId(null);
        }, 3000);
      }
    }, 1000);
  };

  const handleFilterChange = (id: any) => {
    setRoadmapFilter(id);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (activeSidebarTab === 'learning') {
      // Animate XP from 0 to 12450 over 1 second
      const targetXp = 12450;
      const durationXp = 1000;
      const stepTimeXp = 15;
      const startTimeXp = Date.now();

      const xpInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeXp;
        if (elapsed >= durationXp) {
          setAnimatedXp(targetXp);
          clearInterval(xpInterval);
        } else {
          const progressRatio = elapsed / durationXp;
          const easeOutQuad = progressRatio * (2 - progressRatio);
          setAnimatedXp(Math.floor(easeOutQuad * targetXp));
        }
      }, stepTimeXp);

      // Animate Progress Ring from 0 to 72 over 1.5 seconds
      const targetProg = 72;
      const durationProg = 1500;
      const startTimeProg = Date.now();

      const progInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeProg;
        if (elapsed >= durationProg) {
          setAnimatedProgress(targetProg);
          clearInterval(progInterval);
        } else {
          const progressRatio = elapsed / durationProg;
          const easeOutQuad = progressRatio * (2 - progressRatio);
          setAnimatedProgress(Math.floor(easeOutQuad * targetProg));
        }
      }, stepTimeXp);

      return () => {
        clearInterval(xpInterval);
        clearInterval(progInterval);
      };
    } else {
      setAnimatedXp(0);
      setAnimatedProgress(0);
    }
  }, [activeSidebarTab]);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  const [badges, setBadges] = useState<any[]>(MOCK_BADGES_DATA);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [justUnlockedBadge, setJustUnlockedBadge] = useState<any | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(9); // Defaults to June 9, 2026 (Today)
  const [earnedBadgesHistory, setEarnedBadgesHistory] = useState<any[]>([]);

  // Compute active study days dynamically from history
  const streakDaysFromHistory = useMemo(() => {
    const days = new Set<number>();
    earnedBadgesHistory.forEach(item => {
      if (!item.earned_at) return;
      const d = new Date(item.earned_at);
      // June 2026 (year 2026, month 5)
      if (d.getFullYear() === 2026 && d.getMonth() === 5) {
        days.add(d.getDate());
      }
    });
    return Array.from(days);
  }, [earnedBadgesHistory]);

  // Compute badges earned on selected calendar day with multipliers for duplicate earnings
  const badgesEarnedOnSelectedDay: Array<{ badge: any; count: number }> = useMemo(() => {
    const dayHistory = earnedBadgesHistory.filter(item => {
      if (!item.earned_at) return false;
      const d = new Date(item.earned_at);
      return d.getFullYear() === 2026 && d.getMonth() === 5 && d.getDate() === selectedCalendarDay;
    });

    const badgeCounts: Record<string, number> = {};
    dayHistory.forEach(item => {
      badgeCounts[item.badge_id] = (badgeCounts[item.badge_id] || 0) + 1;
    });

    return Object.entries(badgeCounts).map(([badgeId, count]: [string, number]) => {
      const badgeDetail = badges.find(b => b.id === badgeId) || MOCK_BADGES_DATA.find(b => b.id === badgeId);
      return {
        badge: badgeDetail,
        count
      };
    }).filter((item): item is { badge: any; count: number } => item.badge !== undefined);
  }, [earnedBadgesHistory, selectedCalendarDay, badges]);

  // Custom Settings States
  const [dailyXpGoal, setDailyXpGoal] = useState<number>(100);
  const [tiltEnabled, setTiltEnabled] = useState<boolean>(true);
  const [confettiStyle, setConfettiStyle] = useState<'confetti' | 'fireworks' | 'none'>('confetti');
  const [soundWaveActive, setSoundWaveActive] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>('blue');
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);

  // Time Tracker State (Reference 1 style)
  const [timeTrackerSeconds, setTimeTrackerSeconds] = useState<number>(5048); // Start at 01:24:08 (5048 seconds)
  const [timeTrackerIsRunning, setTimeTrackerIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval = null;
    if (timeTrackerIsRunning) {
      interval = setInterval(() => {
        setTimeTrackerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTrackerIsRunning]);

  // Listen for Escape key to close badge modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBadge(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Helper to format seconds as HH:MM:SS
  const formatTimeTracker = (secondsCount: number) => {
    const hrs = Math.floor(secondsCount / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secondsCount % 3600) / 60).toString().padStart(2, '0');
    const secs = (secondsCount % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

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

  // Load user badges
  const loadBadges = async (userId: string) => {
    const DEFAULT_SEED_HISTORY = [
      { badge_id: 'gs_first_step', earned_at: '2026-06-02T10:00:00.000Z' },
      { badge_id: 'gs_getting_started', earned_at: '2026-06-04T11:00:00.000Z' },
      { badge_id: 'gs_curious_mind', earned_at: '2026-06-06T14:30:00.000Z' },
      { badge_id: 'gs_first_challenge', earned_at: '2026-06-08T09:15:00.000Z' },
      { badge_id: 'gs_first_challenge', earned_at: '2026-06-08T16:45:00.000Z' }, // x2
      { badge_id: 'gs_learning_begins', earned_at: '2026-06-09T10:00:00.000Z' },
      { badge_id: 'gs_keep_going', earned_at: '2026-06-14T15:20:00.000Z' },
      { badge_id: 'gs_early_bird', earned_at: '2026-06-15T06:10:00.000Z' },
      { badge_id: 'gs_early_bird', earned_at: '2026-06-15T06:30:00.000Z' }, // x3
      { badge_id: 'gs_early_bird', earned_at: '2026-06-15T06:50:00.000Z' },
    ];

    try {
      // 1. Fetch all badges
      const { data: dbBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('level', { ascending: true });

      if (badgesError) throw badgesError;

      let mappedBadges = MOCK_BADGES_DATA;
      if (dbBadges && dbBadges.length > 0) {
        mappedBadges = dbBadges
          .filter((b: any) => (b.badge_category || b.category || '').toLowerCase().includes('started'))
          .map((b: any) => ({
            id: b.id,
            name: b.badge_name || b.name,
            category: 'getting_started',
            description: b.description,
            image_url: b.image_url,
            level: b.level
          }));
      }
      setBadges(mappedBadges);

      // 2. Fetch unlocked user badges
      const { data: dbUserBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId);

      if (userBadgesError) throw userBadgesError;

      if (dbUserBadges) {
        const history = dbUserBadges
          .map((ub: any) => ({
            badge_id: ub.badge_id,
            earned_at: ub.earned_at || ub.created_at
          }));

        let finalHistory = history;
        if (history.length === 0) {
          // If DB history is empty, check localStorage
          const storedHistory = localStorage.getItem('aptitude_badges_history');
          if (storedHistory) {
            try {
              finalHistory = JSON.parse(storedHistory);
            } catch (e) {
              finalHistory = [];
            }
          } else {
            // Seed default history. Map the static badge_id strings to actual database UUIDs by matching name
            const seed = DEFAULT_SEED_HISTORY.map(item => {
              const mockBadge = MOCK_BADGES_DATA.find(b => b.id === item.badge_id);
              if (mockBadge) {
                const dbB = mappedBadges.find(b => b.name === mockBadge.name);
                if (dbB) {
                  return { ...item, badge_id: dbB.id };
                }
              }
              return item;
            });
            finalHistory = seed;
            localStorage.setItem('aptitude_badges_history', JSON.stringify(finalHistory));
          }
        } else {
          localStorage.setItem('aptitude_badges_history', JSON.stringify(finalHistory));
        }

        setEarnedBadgesHistory(finalHistory);

        // Also extract unique unlocked badge IDs for unlockedBadgeIds state
        const uniqueUnlocked: string[] = Array.from(new Set(finalHistory.map((h: any) => h.badge_id as string)));

        // Retrospectively unlock Getting Started if onboarding is completed
        const hasOnboarding = localStorage.getItem('aptitude_onboarding_completed') === 'true';
        const gettingStartedBadge = mappedBadges.find(b => b.name === 'Getting Started');
        if (hasOnboarding && gettingStartedBadge && !uniqueUnlocked.includes(gettingStartedBadge.id)) {
          uniqueUnlocked.push(gettingStartedBadge.id);
          const nowStr = new Date().toISOString();
          finalHistory.push({ badge_id: gettingStartedBadge.id, earned_at: nowStr });
          setEarnedBadgesHistory([...finalHistory]);
          localStorage.setItem('aptitude_badges_history', JSON.stringify(finalHistory));
          try {
            await supabase.from('user_badges').insert({
              user_id: userId,
              badge_id: gettingStartedBadge.id,
              earned_at: nowStr,
              progress_percentage: 100,
              is_completed: true,
              current_value: 1,
              target_value: 1,
              has_seen_popup: false
            });
          } catch (e) { }
        }

        setUnlockedBadgeIds(uniqueUnlocked);
        localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(uniqueUnlocked));
      }
    } catch (err) {
      console.warn("Could not load badges from database, checking local storage:", err);

      const storedHistory = localStorage.getItem('aptitude_badges_history');
      let finalHistory = [];
      if (storedHistory) {
        try {
          finalHistory = JSON.parse(storedHistory);
        } catch (e) { }
      } else {
        finalHistory = DEFAULT_SEED_HISTORY;
        localStorage.setItem('aptitude_badges_history', JSON.stringify(finalHistory));
      }
      setEarnedBadgesHistory(finalHistory);

      const uniqueUnlocked: string[] = Array.from(new Set(finalHistory.map((h: any) => h.badge_id as string)));

      const stored = localStorage.getItem('aptitude_unlocked_badges');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.forEach((id: string) => {
            if (!uniqueUnlocked.includes(id)) {
              uniqueUnlocked.push(id);
            }
          });
        } catch (e) { }
      } else {
        const hasOnboarding = localStorage.getItem('aptitude_onboarding_completed') === 'true';
        if (hasOnboarding && !uniqueUnlocked.includes('gs_getting_started')) {
          uniqueUnlocked.push('gs_getting_started');
        }
      }

      setUnlockedBadgeIds(uniqueUnlocked);
      localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(uniqueUnlocked));
    }
  };

  const awardBadge = async (badgeId: string) => {
    // 1. Map client-side string ID to real database UUID or name
    const BADGE_ID_NAME_MAP: Record<string, string> = {
      'gs_first_step': 'First Step',
      'gs_getting_started': 'Getting Started',
      'gs_curious_mind': 'Curious Mind',
      'gs_learning_begins': 'Learning Begins',
      'gs_first_challenge': 'First Challenge',
      'gs_keep_going': 'Keep Going',
      'gs_early_bird': 'Early Bird',
      'gs_on_track': 'On Track',
      'gs_not_stopping': 'Not Stopping',
    };

    const targetName = BADGE_ID_NAME_MAP[badgeId] || badgeId;
    const badgeDetails = badges.find(b => b.name === targetName || b.id === badgeId) || MOCK_BADGES_DATA.find(b => b.id === badgeId);

    if (!badgeDetails) return;

    // Use the badge's actual ID (which will be UUID from db, or gs_ string ID from mock fallback)
    const dbBadgeId = badgeDetails.id;

    console.log(`Awarding/Unlocking Badge: ${badgeDetails.name} (${dbBadgeId})`);

    // Add to unique unlocked list if not already present
    if (!unlockedBadgeIds.includes(dbBadgeId)) {
      const updated = [...unlockedBadgeIds, dbBadgeId];
      setUnlockedBadgeIds(updated);
      localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(updated));
    }

    // Push new achievement record with current timestamp into earnedBadgesHistory
    const nowStr = new Date().toISOString();
    const newHistoryEntry = { badge_id: dbBadgeId, earned_at: nowStr };
    const updatedHistory = [...earnedBadgesHistory, newHistoryEntry];
    setEarnedBadgesHistory(updatedHistory);
    localStorage.setItem('aptitude_badges_history', JSON.stringify(updatedHistory));

    setJustUnlockedBadge(badgeDetails);
    // Trigger chime & celebration
    playPreviewChime();
    triggerCelebration();

    try {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_badges').insert({
          user_id: session.user.id,
          badge_id: dbBadgeId,
          earned_at: nowStr,
          progress_percentage: 100,
          is_completed: true,
          current_value: 1,
          target_value: 1,
          has_seen_popup: false
        });
      }
    } catch (err) {
      console.warn("Could not save unlocked badge in database:", err);
    }
  };

  const triggerCelebration = () => {
    if (confettiStyle === 'none') return;
    setCelebrationActive(true);
    setTimeout(() => {
      setCelebrationActive(false);
    }, 6000);
  };

  const playPreviewChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.1);
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.9);

      // Note 3 (C#6)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1109.73, now + 0.2);
      gain3.gain.setValueAtTime(0, now + 0.2);
      gain3.gain.linearRampToValueAtTime(0.25, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.2);
      osc3.stop(now + 1.2);

      setSoundWaveActive(true);
      setTimeout(() => {
        setSoundWaveActive(false);
      }, 1200);
    } catch (e) {
      console.warn("Audio blocked or not supported:", e);
    }
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('aptitude_accent_color', color);
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'spacious') => {
    setLayoutDensity(density);
    localStorage.setItem('aptitude_layout_density', density);
  };

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = -(y - yc) / (rect.height / 10);
    const rotateY = (x - xc) / (rect.width / 10);

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'transform 0.05s ease-out';
  };

  const handleMouseLeave3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease-out';
  };

  // Sync profile details
  useEffect(() => {
    // Load footer settings from localStorage
    const savedFooterBadge = localStorage.getItem('aptitude_footer_badge_text');
    if (savedFooterBadge) setFooterBadgeText(savedFooterBadge);

    const savedFooterCopyright = localStorage.getItem('aptitude_footer_copyright');
    if (savedFooterCopyright) setFooterCopyright(savedFooterCopyright);

    // Load custom settings
    const savedDailyXp = localStorage.getItem('aptitude_daily_xp_goal');
    if (savedDailyXp) setDailyXpGoal(Number(savedDailyXp));

    const savedTiltEnabled = localStorage.getItem('aptitude_tilt_enabled');
    if (savedTiltEnabled !== null) setTiltEnabled(savedTiltEnabled === 'true');

    const savedConfettiStyle = localStorage.getItem('aptitude_confetti_style');
    if (savedConfettiStyle) setConfettiStyle(savedConfettiStyle as any);

    const savedAccentColor = localStorage.getItem('aptitude_accent_color');
    if (savedAccentColor) setAccentColor(savedAccentColor);

    const savedDensity = localStorage.getItem('aptitude_layout_density');
    if (savedDensity) setLayoutDensity(savedDensity as any);

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
        // Load badges for active user
        loadBadges(session.user.id);

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
          avatar: session.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
        };

        // Preserve manually toggled admin/preview role across reloads
        const roleStored = localStorage.getItem('aptitude_current_role');
        if (roleStored) {
          try {
            const parsed = JSON.parse(roleStored);
            roleObj.role = parsed.role;
            roleObj.name = parsed.name || roleObj.name;
          } catch (_) { }
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
            localStorage.setItem('aptitude_onboarding_data', JSON.stringify({
              ...onboardingData,
              avatar: onboardingData.avatar || 'initial'
            }));
            setProfile({
              ...onboardingData,
              avatar: onboardingData.avatar || 'initial'
            });
          }
        }
      } else {
        // Guest mode fallback
        loadBadges('guest');
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
          learning_preference: data.learning_preference || prev.learning_preference,
          avatar: data.avatar || prev.avatar || 'initial'
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

  // Update activeQuestion on filter/collection select
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      const exists = filteredQuestions.some(q => q.id === activeQuestion?.id);
      if (!exists) {
        setActiveQuestion(filteredQuestions[0]);
      }
    } else {
      setActiveQuestion(null);
    }
  }, [selectedCollection, selectedDomain, selectedDifficulty, searchQuery, filteredQuestions]);

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
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      const count = next.length;
      if (count >= 1) {
        awardBadge('gs_curious_mind');
      }
      if (count >= 5) {
        awardBadge('gs_learning_begins');
      }
      return next;
    });
  };

  // Submit Answer validation
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));

    // Increment solvedCount if correct
    const targetQ = questions.find(q => q.id === questionId);
    const targetOpt = targetQ?.options.find(o => o.id === optionId);
    if (targetOpt?.isCorrect && !submittedAnswers[questionId]) {
      const newSolvedCount = solvedCount + 1;
      const newStreak = streak + 1;
      setSolvedCount(newSolvedCount);
      setStreak(newStreak);

      localStorage.setItem('aptitude_solved_count', String(newSolvedCount));
      localStorage.setItem('aptitude_streak', String(newStreak));

      // Save user progress row to Supabase
      const saveProgress = async () => {
        try {
          const { data: { session } } = await authSupabase.auth.getSession();
          if (session?.user) {
            await supabase
              .from('user_progress')
              .upsert({
                user_id: session.user.id,
                question_id: questionId,
                is_solved: true,
                solved_at: new Date().toISOString()
              }, { onConflict: 'user_id,question_id' });
          }
        } catch (e) {
          console.warn("Could not save user progress to database:", e);
        }
      };
      saveProgress();

      // Award Standalone Getting Started Badges (Phase 1)
      if (newSolvedCount >= 1) {
        awardBadge('gs_first_step');
      }
      if (newSolvedCount >= 10) {
        awardBadge('gs_keep_going');
      }
      if (newStreak >= 3) {
        awardBadge('gs_on_track');
      }
      if (newStreak >= 5) {
        awardBadge('gs_not_stopping');
      }
      const currentHour = new Date().getHours();
      if (currentHour >= 4 && currentHour < 7) {
        awardBadge('gs_early_bird');
      }

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
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aptitude_onboarding_data', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        // Try updating/upserting in Supabase
        await supabase
          .from('onboarding_profile')
          .upsert({
            user_id: session.user.id,
            username: profile.username,
            college: profile.college,
            degree: profile.degree,
            branch: profile.branch,
            graduation_year: profile.graduation_year,
            primary_goal: profile.primary_goal,
            weekly_commitment: profile.weekly_commitment,
            learning_preference: profile.learning_preference,
            avatar: profile.avatar,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (err) {
      console.warn('Failed to sync profile updates to Supabase:', err);
    }
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

      {/* 1. Left Navigation Sidebar (Reference 2 style) */}
      <aside className="w-[76px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col items-center py-6 h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300">
        {/* Top Logo Button */}
        <div className="w-12 h-12 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] flex items-center justify-center shadow-md mb-8 cursor-pointer hover:scale-105 transition-transform" title="Kinetic Hub">
          <Layers className="w-5 h-5" />
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full overflow-y-auto scrollbar-none py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass, action: 'tab' },
            { id: 'domains', label: 'Domains', icon: Layers, action: 'nav', route: '/student/domains' },
            { id: 'learning', label: 'Learning Roadmap', icon: BookOpen, action: 'tab' },
            { id: 'practice', label: 'Practice Arena', icon: BookOpenCheck, action: 'tab' },
            { id: 'mockTests', label: 'Mock Tests', icon: Award, action: 'tab' },
            { id: 'careerHub', label: 'Career Hub', icon: Briefcase, action: 'tab', subAction: () => setSelectedOpportunityType('All') },
            { id: 'leaderboards', label: 'Leaderboard Rankings', icon: Trophy, action: 'tab' },
            { id: 'badges', label: 'Badges & Achievements', icon: Sparkles, action: 'tab' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.action === 'nav' && tab.route) {
                    router.push(tab.route);
                  } else {
                    setActiveSidebarTab(tab.id as any);
                    if (tab.subAction) tab.subAction();
                  }
                }}
                title={tab.label}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer relative group/sidebar-btn ${
                  isActive
                    ? 'text-white dark:text-slate-900 shadow-md scale-105 z-10 font-bold'
                    : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:scale-105 z-10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarGlow"
                    className="absolute inset-0 bg-[#111827] dark:bg-white rounded-full z-0 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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

          {/* Admin Tools Section */}
          {currentRole?.role === 'admin' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-900 w-full flex flex-col gap-3 items-center">
              <button
                onClick={() => router.push('/admin/editor')}
                title="Content Creator (Admin)"
                className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-105 transition-all cursor-pointer"
              >
                <SettingsIcon className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                title="Admin Dashboard"
                className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105 transition-all cursor-pointer"
              >
                <Layers className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </nav>

        {/* User profile popup menu trigger */}
        <div className="p-4 w-full flex flex-col items-center shrink-0 relative" ref={profileDropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            title="User Profile Menu"
            className={`w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-100 transition-all cursor-pointer relative overflow-hidden ${profileDropdownOpen ? 'ring-2 ring-blue-500' : ''}`}
          >
            {profile.avatar && profile.avatar !== 'initial' ? (
              <img
                src={profile.avatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}

            {/* Red dot notification badge */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white dark:border-slate-950" />
          </button>

          {/* User profile dropdown overlay */}
          {profileDropdownOpen && (
            <div className="absolute left-[84px] bottom-0 w-72 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-1 z-50 animate-scaleUp text-slate-800 dark:text-slate-200 select-none">
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
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate leading-normal">
                    {currentRole?.email || 'shellysros1922@gmail.com'}
                  </span>
                </div>
              </div>

              {/* Menu Options */}
              <div className="flex flex-col pt-1.5 pb-1 text-xs font-bold text-slate-700 dark:text-slate-300">

                {/* My Profile option */}
                <button
                  onClick={() => {
                    setActiveSidebarTab('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="flex-1">My Profile</span>
                </button>

                {/* Account option */}
                <button
                  onClick={() => {
                    setActiveSidebarTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
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
                <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 opacity-60 select-none font-bold">
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
                  <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="flex-1">Troubleshooting</span>
                </button>

                {/* New Features option */}
                <button
                  onClick={() => {
                    setActiveSidebarTab('badges');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>New Features</span>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>
                </button>

                {/* Theme Toggle option */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="flex-1">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="flex-1">Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Notification option */}
                <button
                  onClick={() => {
                    setActiveSidebarTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
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

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Top Header (Reference 2 style) */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center justify-between bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0 select-none">
          <div className="flex flex-col items-start text-left">
            <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white flex items-center gap-2">
              {activeSidebarTab === 'dashboard' ? (
                <>Welcome back, {profile.username.split(' ')[0]} 👋</>
              ) : activeSidebarTab === 'learning' ? (
                <>Learning Roadmap 🗺️</>
              ) : activeSidebarTab === 'practice' ? (
                <>Practice Arena 🎯</>
              ) : activeSidebarTab === 'mockTests' ? (
                <>Mock Assessments 🏆</>
              ) : activeSidebarTab === 'careerHub' ? (
                <>Career Opportunity Hub 💼</>
              ) : activeSidebarTab === 'leaderboards' ? (
                <>Placement Leaderboard 📊</>
              ) : activeSidebarTab === 'badges' ? (
                <>Achievements & Credentials 🏅</>
              ) : activeSidebarTab === 'profile' ? (
                <>Profile Credentials ⚙️</>
              ) : (
                <>Settings Hub ⚙️</>
              )}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              {activeSidebarTab === 'dashboard' ? 'Here is your activities overview for today.' : 'Manage your preparations'}
            </p>
          </div>

          <div className="flex items-center gap-5">

            {/* Search Input Box */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search something..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-60 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Preview/Edit Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner mr-2">
              <button
                type="button"
                onClick={() => {
                  const studentRole = {
                    role: 'STUDENT',
                    name: 'Vaishnavi Raparthy',
                    email: 'student@aptitude-ai.com',
                    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
                  setCurrentRole(studentRole);
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${currentRole?.role !== 'admin'
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
                    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
                  setCurrentRole(adminRole);
                  router.push('/admin/editor');
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${currentRole?.role === 'admin'
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                Edit / Admin
              </button>
            </div>

          </div>
        </header>

        {/* Scrollable Panel Area */}
        <div ref={scrollablePanelRef} className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between ${layoutDensity === 'compact' ? 'p-4' : layoutDensity === 'spacious' ? 'p-10' : 'p-6 sm:p-8'
          }`}>


          {/* ====================================================================
              1. TAB: DASHBOARD (Duolingo Redesign Layout)
              ==================================================================== */}
          {activeSidebarTab === 'dashboard' && (
            <div className="w-full space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">

              {/* Admin Banner Alert */}
              {currentRole?.role === 'admin' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40 text-blue-800 dark:text-blue-400 animate-fadeIn shadow-xs select-none">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                      <SettingsIcon className="w-4 h-4 animate-pulse" />
                    </span>
                    <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider leading-none">Editor Mode Activated</h4>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        You are now modifying student view elements. You can edit footer credentials directly in-place or manage platform questions in the editor.
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

              {/* Main 12-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column (8 cols): Activities & Progress */}
                <div className="lg:col-span-8 space-y-8">

                  {/* "Your activities today" Section (Reference 2 style) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                        Your activities today <span className="text-slate-400 font-medium text-sm ml-1.5">(3)</span>
                      </h2>
                    </div>

                    {/* Horizontal/Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Card 1: Quant Aptitude */}
                      <div className="bg-[#E6F4F8] dark:bg-[#0B303E]/30 border border-[#CDE5EE] dark:border-[#1E4E5D]/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                          <span className="bg-white/80 dark:bg-slate-900/60 border border-[#B8DCE7] dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-[#1E4E5D] dark:text-[#38BDF8] flex items-center gap-1">
                            ⭐ 4.9 <span className="text-[9px] text-[#558CA0]">Accuracy: 84%</span>
                          </span>

                          {/* Diagonal Arrow button */}
                          <button
                            onClick={() => {
                              setActiveSidebarTab('practice');
                              setSelectedDomain('quant');
                            }}
                            className="w-10 h-10 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-600 -rotate-45" />
                          </button>
                        </div>

                        <div className="space-y-2 text-left">
                          <h3 className="text-base font-bold text-slate-800 dark:text-white">Quant Aptitude</h3>
                          <p className="text-[11px] text-[#47707E] dark:text-slate-400 font-semibold leading-relaxed">
                            Percentages, Profit & Loss, Ratios, Speed & Distance
                          </p>
                        </div>

                        {/* Stacked avatars */}
                        <div className="flex items-center -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">AR</div>
                          <div className="w-6 h-6 rounded-full bg-purple-500 border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">SN</div>
                          <div className="w-6 h-6 rounded-full bg-pink-500 border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">KK</div>
                          <span className="text-[9.5px] text-[#47707E] dark:text-slate-400 font-bold ml-3">+12 others active</span>
                        </div>
                      </div>

                      {/* Card 2: Logical Reasoning */}
                      <div className="bg-[#FDF2F8] dark:bg-[#3B1229]/20 border border-[#FBCFE8] dark:border-[#652047]/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-48 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                          <span className="bg-white/80 dark:bg-slate-900/60 border border-[#F9A8D4] dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-[#9D174D] dark:text-[#F472B6] flex items-center gap-1">
                            ⭐ 4.8 <span className="text-[9px] text-[#C2410C]">Accuracy: 92%</span>
                          </span>

                          <button
                            onClick={() => {
                              setActiveSidebarTab('practice');
                              setSelectedDomain('logical');
                            }}
                            className="w-10 h-10 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-600 -rotate-45" />
                          </button>
                        </div>

                        <div className="space-y-2 text-left">
                          <h3 className="text-base font-bold text-slate-800 dark:text-white">Logical Reasoning</h3>
                          <p className="text-[11px] text-[#B04A75] dark:text-slate-400 font-semibold leading-relaxed">
                            Syllogisms, Blood Relations, Seating arrangements, Series
                          </p>
                        </div>

                        <div className="flex items-center -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">AS</div>
                          <div className="w-6 h-6 rounded-full bg-yellow-500 border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">RS</div>
                          <div className="w-6 h-6 rounded-full bg-[#111827] border border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center">VR</div>
                          <span className="text-[9.5px] text-[#B04A75] dark:text-slate-400 font-bold ml-3">+6 others active</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* "Learning progress" Section (Reference 2 style) */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">Learning progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                      {/* Completed Stat */}
                      <div className="bg-[#E6F4F1] dark:bg-[#112F28]/30 border border-[#C7E9E1] dark:border-[#205D4F]/30 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Completed</span>
                          <span className="text-xl font-black text-[#065F46] dark:text-[#34D399] font-mono leading-none">{solvedCount} Modules</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-[#C7E9E1] dark:border-[#205D4F]/30 flex items-center justify-center text-[#065F46] dark:text-[#34D399] -rotate-45 group-hover:scale-105 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Score Stat */}
                      <div className="bg-[#FEF3C7] dark:bg-[#3D2C08]/20 border border-[#FDE68A] dark:border-[#6B4E0E]/20 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Your Streak</span>
                          <span className="text-xl font-black text-[#92400E] dark:text-[#FBBF24] font-mono leading-none">{streak} Days</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-[#FDE68A] dark:border-[#6B4E0E]/20 flex items-center justify-center text-[#92400E] dark:text-[#FBBF24] -rotate-45 group-hover:scale-105 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Active Stat */}
                      <div className="bg-[#F3E8FF] dark:bg-[#2A154D]/20 border border-[#E9D5FF] dark:border-[#53289E]/20 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Active Level</span>
                          <span className="text-xl font-black text-[#6B21A8] dark:text-[#C084FC] font-mono leading-none">Lvl 12 (#14)</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-[#E9D5FF] dark:border-[#53289E]/20 flex items-center justify-center text-[#6B21A8] dark:text-[#C084FC] -rotate-45 group-hover:scale-105 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                    </div>

                    {/* Large Yellow Active concept banner (Reference 2 style) */}
                    <div className="bg-[#FFFBEB] dark:bg-[#251E0E]/40 border border-[#FEF3C7] dark:border-[#4B3B18]/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300">
                      <div className="space-y-3 text-left flex-1 w-full">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                            Active Track Unit
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">QUANT APTITUDE</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-snug">
                          Percentages → Profit & Loss
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <span>Concept Completion</span>
                            <span className="font-mono">{challengeCompletedCount} / 15 solved lessons</span>
                          </div>
                          <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(challengeCompletedCount / 15) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Large diagonal arrow button */}
                      <button
                        onClick={() => {
                          setActiveSidebarTab('learning');
                        }}
                        className="w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer self-end md:self-center"
                      >
                        <ChevronRight className="w-6 h-6 text-white -rotate-45" />
                      </button>
                    </div>

                  </div>

                </div>

                {/* Right Column (4 cols): Lesson Schedule Calendar, Opportunities & Time Tracker */}
                <div className="lg:col-span-4 space-y-8">

                  {/* 1. Lesson Schedule Calendar Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left">
                    <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-100 dark:border-slate-900/60">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Lesson schedule</h3>
                      <span className="text-xs font-bold text-slate-500">June 2026</span>
                    </div>

                    {/* Monthly calendar Grid */}
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>

                      {/* Dates grid for June 2026. Starts on Monday, 30 days */}
                      <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center text-xs font-bold text-slate-700 dark:text-slate-400">
                        {/* Day 1 to 30 */}
                        {[...Array(30)].map((_, i) => {
                          const dateNum = i + 1;

                          // Streak/active study dates from dynamic history
                          const isStreakDay = streakDaysFromHistory.includes(dateNum);
                          const isToday = dateNum === 9; // Today is June 9, 2026
                          const isSelected = selectedCalendarDay === dateNum;

                          let dateStyles = "w-7 h-7 flex items-center justify-center mx-auto rounded-full transition-all cursor-pointer focus:outline-none ";

                          if (isToday) {
                            dateStyles += "bg-[#111827] dark:bg-white text-white dark:text-slate-900 font-black shadow-sm ";
                          } else if (isStreakDay) {
                            dateStyles += "bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-extrabold ";
                          } else {
                            dateStyles += "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 ";
                          }

                          if (isSelected) {
                            dateStyles += "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 ";
                          }

                          return (
                            <button
                              key={dateNum}
                              onClick={() => setSelectedCalendarDay(dateNum)}
                              className="relative focus:outline-none"
                              type="button"
                            >
                              <span className={dateStyles}>{dateNum}</span>
                              {isStreakDay && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Badges Earned Section */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-900/60">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1">
                          <span>Badges Earned • June {selectedCalendarDay}</span>
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                            {badgesEarnedOnSelectedDay.reduce((acc: number, item: any) => acc + item.count, 0)} Badges
                          </span>
                        </div>

                        {badgesEarnedOnSelectedDay.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {badgesEarnedOnSelectedDay.map(({ badge, count }: { badge: any; count: number }) => (
                              <button
                                key={badge.id}
                                onClick={() => setSelectedBadge(badge)}
                                className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between transition-all group cursor-pointer focus:outline-none"
                                type="button"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    {badge.image_url ? (
                                      <img src={badge.image_url} alt={badge.name} className="w-6 h-6 object-contain" />
                                    ) : (
                                      <span className="text-base">{getCategoryEmoji(badge.category)}</span>
                                    )}
                                  </div>
                                  <div className="leading-tight">
                                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {badge.name}
                                    </h4>
                                    <p className="text-[9.5px] text-slate-400 mt-0.5 line-clamp-1">{badge.description}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {count > 1 && (
                                    <span className="bg-blue-600 text-white dark:bg-blue-500 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                      x{count}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-blue-500 dark:text-blue-400 font-extrabold group-hover:translate-x-0.5 transition-transform">
                                    →
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center flex items-center justify-center">
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic font-medium">No badges earned on this day</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Time Tracker Stopwatch widget (Reference 1 style) */}
                  <div className="bg-[#0B3A27] dark:bg-[#062418] text-white border border-[#0A3322] dark:border-[#041B12] rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-48 group">
                    {/* Visual pattern overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#A7F3D0] font-mono">Time Tracker</span>
                      </div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#065F46] rounded-md text-emerald-200">
                        {timeTrackerIsRunning ? "Active" : "Paused"}
                      </span>
                    </div>

                    <div className="text-center py-2 relative z-10">
                      <span className="text-3xl font-black font-mono tracking-tight leading-none text-white block">
                        {formatTimeTracker(timeTrackerSeconds)}
                      </span>
                      <span className="text-[9px] text-[#A7F3D0]/60 font-semibold mt-1.5 block uppercase tracking-wider">
                        Active Study Session duration
                      </span>
                    </div>

                    <div className="flex gap-2 relative z-10 pt-2 border-t border-[#092B1D]/80">

                      {/* Toggle play/pause button */}
                      <button
                        onClick={() => setTimeTrackerIsRunning(!timeTrackerIsRunning)}
                        className={`flex-1 py-1.8 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer text-center ${timeTrackerIsRunning
                            ? "bg-amber-600 hover:bg-amber-500 text-white"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                      >
                        {timeTrackerIsRunning ? "Pause Session" : "Start Study"}
                      </button>

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          setTimeTrackerIsRunning(false);
                          setTimeTrackerSeconds(0);
                        }}
                        className="py-1.8 px-3 bg-[#092B1D] hover:bg-[#061E14] text-[#A7F3D0] font-bold text-[10px] uppercase rounded-xl border border-[#082419] transition-colors cursor-pointer text-center"
                      >
                        Reset
                      </button>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {activeSidebarTab === 'learning' && (
            <div className="w-full space-y-8 relative overflow-hidden p-6 rounded-3xl bg-slate-50/50 dark:bg-[#020617]/50 border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-xl transition-all duration-300">

              {/* Ambient Background Particles and Orbs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 w-64 h-64 rounded-full blur-3xl absolute -left-20 -top-20 pointer-events-none" />
                <div className="bg-blue-500/10 dark:bg-blue-500/5 w-72 h-72 rounded-full blur-3xl absolute -right-20 -bottom-20 pointer-events-none" />
                {!reducedMotion && (
                  [...Array(12)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -40, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        duration: 6 + Math.random() * 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))
                )}
              </div>

              {/* Hero Title & Subtitle with Blur-Fade-Up Reveal */}
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-2 relative z-10"
              >
                <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white font-heading">
                  Your learning roadmap
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Click on the active lesson nodes to solve matching assessment questions.
                </p>
              </motion.div>

              {/* Stats Panel Widget (Circular Progress Ring & XP Counter) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8 relative z-10">
                {/* Progress Ring Card */}
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm backdrop-blur-md">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="4.5"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="stroke-emerald-500 dark:stroke-emerald-400"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 22}
                        initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 22) - ((2 * Math.PI * 22) * animatedProgress) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-slate-800 dark:text-white">
                      {animatedProgress}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Roadmap Progress</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white mt-0.5 block">
                      {completedNodeIds.length} of 9 Completed
                    </span>
                  </div>
                </div>

                {/* XP Counter Card */}
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm backdrop-blur-md">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-400/5 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Total Experience</span>
                    <span className="text-base font-black text-slate-800 dark:text-white mt-0.5 block font-mono">
                      {animatedXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm backdrop-blur-md">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 dark:bg-orange-400/5 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Daily Streak</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white mt-0.5 block">{streak} Days Active</span>
                  </div>
                </div>
              </div>

              {/* Subject Filters Tab Switcher */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 select-none relative z-10">
                {[
                  { id: 'all', label: 'All Subjects', icon: '🌐' },
                  { id: 'quant', label: 'Quantitative', icon: '📐' },
                  { id: 'logical', label: 'Logical Reasoning', icon: '🧩' },
                  { id: 'verbal', label: 'Verbal Ability', icon: '📚' },
                  { id: 'coding', label: 'Coding & CS', icon: '💻' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setRoadmapFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-305 cursor-pointer flex items-center gap-1.5 border ${roadmapFilter === tab.id
                        ? 'bg-[#111827] dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md scale-105'
                        : 'bg-white/60 dark:bg-slate-900/40 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Gamified Winding Bezier Roadmap Path */}
              {(() => {
                const rawNodesList = DOMAIN_ROADMAPS[roadmapFilter] || DOMAIN_ROADMAPS.all;
                const nodesList = rawNodesList.map((node: any) => {
                  let status: 'completed' | 'active' | 'locked' = 'locked';
                  if (completedNodeIds.includes(node.id)) {
                    status = 'completed';
                  } else if (node.id === activeNodeId) {
                    status = 'active';
                  } else {
                    status = 'locked';
                  }
                  return { ...node, status };
                });

                const illustrationsList = [
                  { y: 170, x: 25, icon: <Award className="w-5 h-5 text-emerald-500" />, title: "Apex Peak", desc: "Aptitude standards reached" },
                  { y: 170, x: 75, icon: <Sparkles className="w-5 h-5 text-amber-500" />, title: "Unlock Spark", desc: "Reveal hidden concepts" },
                  { y: 350, x: 25, icon: <Cpu className="w-5 h-5 text-indigo-500" />, title: "Logic Gate", desc: "Algorithms unlocked" },
                  { y: 350, x: 75, icon: <Target className="w-5 h-5 text-orange-500" />, title: "Precision Target", desc: "Aim for mastery goals" }
                ];

                const rawSegmentPaths = [
                  "M 10,80 L 50,80",
                  "M 50,80 L 90,80",
                  "M 90,80 C 99,80 99,260 90,260",
                  "M 90,260 L 50,260",
                  "M 50,260 L 10,260",
                  "M 10,260 C 1,260 1,440 10,440",
                  "M 10,440 L 50,440",
                  "M 50,440 L 90,440"
                ];

                const segments = rawSegmentPaths.map((pathStr: string, idx: number) => {
                  const startNode = nodesList[idx];
                  const endNode = nodesList[idx + 1];

                  let status = "locked";
                  if (startNode.status === 'completed') {
                    if (endNode && endNode.status === 'completed') {
                      status = 'completed';
                    } else if (endNode && endNode.status === 'active') {
                      status = 'active-transition';
                    } else {
                      status = 'completed';
                    }
                  } else if (startNode.status === 'active') {
                    status = 'locked';
                  }

                  return { d: pathStr, status };
                });

                // Find active index to compute traveling path coordinates
                const activeIndex = nodesList.findIndex((n: any) => n.status === 'active');
                const completedCoords = [];
                for (let i = 0; i <= (activeIndex !== -1 ? activeIndex : 0); i++) {
                  const { x, y } = getNodeCoords(i);
                  completedCoords.push(`${x},${y}`);
                }
                const motionPath = completedCoords.length > 1
                  ? `M ${completedCoords.join(' L ')}`
                  : `M 10,80 L 10,80`;

                return (
                  <div
                    className="relative w-full h-[520px] select-none my-6 transition-all duration-500 ease-out"
                    style={{
                      transform: 'perspective(1200px) rotateX(12deg)',
                      transformStyle: 'preserve-3d',
                    }}
                  >

                    {/* SVG Curve Canvas */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 520" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2050/svg">
                      <defs>
                        <linearGradient id="completed-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="active-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                        <linearGradient id="active-flow-grad" x1="0" y1="0" x2="100%" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="50%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                        <filter id="active-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3B82F6" floodOpacity="0.5" />
                        </filter>
                        <filter id="completed-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.35" />
                        </filter>
                      </defs>

                      {/* Decorative graphics: background stars & flags */}
                      <g opacity="0.25" className="text-emerald-500 dark:text-emerald-400">
                        <path d="M 78,130 L 81,133 L 86,133 L 82,136 L 83,141 L 78,138 L 73,141 L 74,136 L 70,133 L 75,133 Z" fill="currentColor" />
                        <path d="M 25,360 L 28,363 L 33,363 L 29,366 L 30,371 L 25,368 L 20,371 L 21,366 L 17,363 L 22,363 Z" fill="currentColor" />
                      </g>
                      <g opacity="0.3" className="text-blue-500 dark:text-blue-400 animate-pulse">
                        <path d="M 30,150 L 33,153 L 38,153 L 34,157 L 35,162 L 30,159 L 25,162 L 26,157 L 22,153 L 27,153 Z" fill="currentColor" />
                        <path d="M 75,320 L 78,323 L 83,323 L 79,326 L 80,331 L 75,328 L 70,331 L 71,326 L 67,323 L 72,323 Z" fill="currentColor" />
                      </g>

                      {/* 3D Road Side Extrusion (Thick Depth Edge) */}
                      {segments.map((seg, i) => (
                        <path
                          key={`extrusion-${i}`}
                          d={seg.d}
                          fill="none"
                          className="stroke-slate-300/40 dark:stroke-[#020617]"
                          strokeWidth="16"
                          strokeLinecap="round"
                          transform="translate(0, 5)"
                        />
                      ))}

                      {/* Colored Road Side Extrusion for Completed & Active tracks */}
                      {segments.map((seg, i) => {
                        if (seg.status === 'completed') {
                          return (
                            <path
                              key={`ext-completed-${i}`}
                              d={seg.d}
                              fill="none"
                              stroke="#047857"
                              strokeWidth="12"
                              strokeLinecap="round"
                              transform="translate(0, 4)"
                            />
                          );
                        } else if (seg.status === 'active-transition') {
                          return (
                            <path
                              key={`ext-active-${i}`}
                              d={seg.d}
                              fill="none"
                              stroke="#1D4ED8"
                              strokeWidth="12"
                              strokeLinecap="round"
                              transform="translate(0, 4)"
                            />
                          );
                        }
                        return null;
                      })}

                      {/* Background Road Borders & Fill */}
                      {segments.map((seg, i) => (
                        <React.Fragment key={`bg-road-${i}`}>
                          {/* Outer dark grey/slate road border line */}
                          <path
                            d={seg.d}
                            fill="none"
                            className="stroke-slate-200/50 dark:stroke-slate-900"
                            strokeWidth="14"
                            strokeLinecap="round"
                          />
                          {/* Inner road background fill */}
                          <path
                            d={seg.d}
                            fill="none"
                            className="stroke-slate-100 dark:stroke-[#030712]/90"
                            strokeWidth="10"
                            strokeLinecap="round"
                          />
                        </React.Fragment>
                      ))}

                      {/* Active / Completed Winding Road Colors */}
                      {segments.map((seg, i) => {
                        if (seg.status === 'completed') {
                          return (
                            <React.Fragment key={`fg-road-${i}`}>
                              {/* Green colored road segment */}
                              <motion.path
                                d={seg.d}
                                fill="none"
                                stroke="url(#completed-grad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                filter="url(#completed-glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                              {/* White dashed highway lane divider lines */}
                              <path
                                d={seg.d}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeDasharray="4 4"
                                opacity="0.6"
                              />
                              {/* Shimmer overlay */}
                              {!reducedMotion && (
                                <motion.path
                                  d={seg.d}
                                  fill="none"
                                  stroke="#10B981"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  opacity="0.3"
                                  initial={{ strokeDasharray: "15 30", strokeDashoffset: 0 }}
                                  animate={{ strokeDashoffset: -45 }}
                                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                />
                              )}
                            </React.Fragment>
                          );
                        } else if (seg.status === 'active-transition') {
                          return (
                            <React.Fragment key={`fg-road-${i}`}>
                              {/* Green to Blue gradient transition road segment */}
                              <motion.path
                                d={seg.d}
                                fill="none"
                                stroke="url(#active-grad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                filter="url(#active-glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                              {/* White dashed highway lane divider lines */}
                              <path
                                d={seg.d}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeDasharray="4 4"
                                opacity="0.7"
                              />
                              {/* Active flow overlay */}
                              {!reducedMotion && (
                                <motion.path
                                  d={seg.d}
                                  fill="none"
                                  stroke="url(#active-flow-grad)"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  initial={{ strokeDasharray: "8 12", strokeDashoffset: 0 }}
                                  animate={{ strokeDashoffset: -20 }}
                                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                />
                              )}
                            </React.Fragment>
                          );
                        } else {
                          return (
                            <path
                              key={`fg-road-${i}`}
                              d={seg.d}
                              fill="none"
                              className="stroke-slate-200 dark:stroke-slate-800"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="8 6"
                            />
                          );
                        }
                      })}

                      {/* Animated Traveling Glow Orb along the completed path */}
                      {completedCoords.length > 1 && (
                        <circle r="6" fill="#60A5FA" className="filter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
                          <animateMotion
                            dur="5s"
                            repeatCount="indefinite"
                            path={motionPath}
                          />
                        </circle>
                      )}
                    </svg>

                    {/* Side decorative Illustration cards in the empty columns */}
                    {illustrationsList.map((ill: any, i: number) => (
                      <motion.div
                        key={i}
                        className="absolute flex items-center gap-2.5 bg-white/80 dark:bg-slate-950/75 border border-slate-200 dark:border-slate-900/80 p-2.5 rounded-2xl shadow-md w-36 select-none transition-all duration-300 hover:scale-105 pointer-events-none"
                        style={{
                          left: `${ill.x}%`,
                          top: `${ill.y}px`,
                          transform: 'translate3d(-50%, -50%, 15px)',
                          boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
                        }}
                        initial={{ opacity: 0, y: ill.y + 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: ill.y, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.15, duration: 0.6, type: "spring" }}
                        whileHover={{
                          scale: 1.08,
                          y: ill.y - 4,
                          boxShadow: '0 15px 30px -5px rgba(0,0,0,0.2), 0 0 15px rgba(245,158,11,0.2)',
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group">
                          <motion.div
                            className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                            animate={{
                              left: ["-20%", "120%"]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut"
                            }}
                          />
                          {ill.icon}
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="text-[9px] font-black text-slate-800 dark:text-white block uppercase tracking-wide leading-none">{ill.title}</span>
                          <span className="text-[7.5px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight mt-0.5 truncate">{ill.desc}</span>
                        </div>
                      </motion.div>
                    ))}

                    {/* HTML Nodes overlay */}
                    {nodesList.map((node: any, index: number) => {
                      const { x, y } = getNodeCoords(index);
                      const isCompleted = node.status === 'completed';
                      const isActive = node.status === 'active';
                      const isLocked = node.status === 'locked';
                      const isJustUnlocked = justUnlockedNodeId === node.id;

                      const zElevation = isActive ? 35 : isCompleted ? 20 : 5;

                      return (
                        <div
                          key={node.id}
                          className="absolute flex flex-col items-center z-10 group"
                          style={{
                            left: `${x}%`,
                            top: `${y}px`,
                            transform: `translate3d(-50%, -50%, ${zElevation}px)`,
                            transformStyle: 'preserve-3d',
                          }}
                        >

                          {/* Pulsing Active glow */}
                          {isActive && (
                            <motion.div
                              className="absolute w-20 h-20 rounded-full bg-blue-500/30 dark:bg-blue-400/20 blur-md pointer-events-none"
                              animate={reducedMotion ? {} : {
                                scale: [0.9, 1.4, 0.9],
                                opacity: [0.2, 0.7, 0.2]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}

                          {/* Active floating indicator badge with rocket */}
                          {isActive && (
                            <motion.div
                              className="absolute -top-12 z-20 pointer-events-none flex flex-col items-center"
                              animate={reducedMotion ? {} : {
                                y: [-4, 4, -4]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <div className="bg-gradient-to-tr from-amber-500 to-orange-700 p-1.5 rounded-full shadow-lg border border-amber-300">
                                <Rocket className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="w-2 h-2 bg-orange-600 rotate-45 -mt-1 shadow-md border-r border-b border-amber-300/30" />
                            </motion.div>
                          )}

                          {/* Circular 3D Lesson Node */}
                          <motion.button
                            variants={shakeVariants}
                            animate={
                              shakeNodeId === node.id
                                ? "shake"
                                : isJustUnlocked
                                  ? { scale: [0.8, 1.2, 1], rotate: [0, -5, 5, 0] }
                                  : "idle"
                            }
                            onAnimationComplete={() => setShakeNodeId(null)}
                            onClick={() => {
                              if (isLocked) {
                                setShakeNodeId(node.id);
                              } else {
                                setActiveChallengeNode(node);
                              }
                            }}
                            whileHover={!isLocked ? {
                              y: -6,
                              scale: 1.05,
                              boxShadow: "0px 10px 25px rgba(59, 130, 246, 0.3)"
                            } : {}}
                            initial={isJustUnlocked ? { scale: 0.8 } : false}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none cursor-pointer ${isCompleted
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-b-4 border-emerald-700 text-white shadow-[0_4px_0_#047857,0_6px_12px_rgba(16,185,129,0.15)] hover:border-b-[6px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2'
                                : isActive
                                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 border-b-[6px] border-blue-800 text-white shadow-[0_6px_0_#1E40AF,0_8px_16px_rgba(59,130,246,0.25)] hover:border-b-[8px] hover:brightness-110'
                                  : 'bg-slate-100 border-b-2 border-slate-300 dark:bg-slate-900 dark:border-slate-950 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              }`}
                          >
                            {isCompleted ? (
                              <Check className="w-7 h-7 stroke-[3.5]" />
                            ) : node.symbol === '🏆' ? (
                              <Trophy className={`w-5.5 h-5.5 ${isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-amber-500'}`} />
                            ) : isLocked ? (
                              <Lock className="w-4.5 h-4.5" />
                            ) : (
                              <span className="text-base font-black font-mono">{node.symbol}</span>
                            )}
                          </motion.button>

                          {/* Node Label card popup on hover */}
                          <div
                            className="absolute top-16 text-center bg-white/95 dark:bg-slate-900/90 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md w-34 transition-all duration-300 backdrop-blur-md"
                            style={{
                              transform: 'translate3d(0, 0, 15px)',
                              boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)'
                            }}
                          >
                            <span className="text-[9px] font-black text-slate-800 dark:text-white block truncate uppercase">{node.title}</span>
                            <span className="text-[7.5px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight mt-0.5">{node.desc}</span>
                            {isActive && (
                              <span className="text-[7.5px] text-blue-600 dark:text-blue-400 font-black block mt-0.5">75% Complete</span>
                            )}
                          </div>

                          {/* Locked node warning tooltip */}
                          {isLocked && (
                            <div className="absolute top-16 text-center bg-slate-950 text-white p-2 rounded-xl border border-slate-800 shadow-md w-36 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                              <span className="text-[9px] font-black block uppercase tracking-wide">Locked Unit</span>
                              <span className="text-[7.5px] text-slate-400 font-semibold block leading-tight mt-0.5">Complete previous unit to unlock</span>
                            </div>
                          )}

                          {/* Floating XP Burst overlay */}
                          <AnimatePresence>
                            {showXpBurst === node.id && (
                              <motion.div
                                key={`xp-burst-${node.id}`}
                                className="absolute -top-16 text-emerald-500 font-heading font-black text-sm select-none pointer-events-none z-30 flex items-center gap-1 shadow-sm px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-300/40"
                                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                animate={{ opacity: 1, y: -30, scale: 1.25 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              >
                                <span>+150 XP</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}

                  </div>
                );
              })()}

                {/* 3. Horizontal Question Selector Track */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left">Set Navigation Track</span>
                  {isLoading ? (
                    <div className="w-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center">
                      <div className="w-6 h-6 rounded-full border border-blue-600 border-t-transparent animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loading set track...</span>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="w-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center text-center">
                      <Info className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">No questions in this filter set</span>
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                      {filteredQuestions.map((q, idx) => {
                        const isSolved = submittedAnswers[q.id];
                        const isCurrent = activeQuestion?.id === q.id;
                        const isCorrect = isSolved && selectedAnswers[q.id] === q.options.find(o => o.isCorrect)?.id;
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setActiveQuestion(q);
                              setIsVideoPlaying(false);
                              setVideoProgress(0);
                              setVideoPlayTime(0);
                            }}
                            className={`flex-shrink-0 w-44 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-950/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                                : isSolved
                                  ? isCorrect
                                    ? 'bg-emerald-950/10 border-emerald-900 hover:border-emerald-700'
                                    : 'bg-rose-950/10 border-rose-900 hover:border-rose-700'
                                  : 'bg-slate-900/30 border-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[9px] font-black text-slate-500">#{q.id}</span>
                              {isSolved ? (
                                isCorrect ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white text-[8px] font-black">✗</span>
                                )
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              )}
                            </div>
                            <h5 className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 mt-2 truncate">Lesson Unit {idx + 1}</h5>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[7.5px] font-black uppercase bg-slate-100 dark:bg-slate-900/80 px-1.5 py-0.2 rounded leading-normal text-slate-500">
                                {q.difficulty}
                              </span>
                              <span className="text-[7.5px] font-semibold text-slate-500">
                                {q.domainId === 'quant' ? 'Quant' : q.domainId === 'logical' ? 'Logic' : 'Verbal'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Main Active Learning Module Card */}
                {activeQuestion && (
                  <div className="bg-white border border-slate-200 dark:bg-slate-950/40 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden">
                    
                    {/* Visual shine gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/2 to-transparent pointer-events-none" />

                    {/* Question Header & Tags */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4 flex-wrap gap-3 relative z-10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full tracking-wider uppercase">
                          {activeQuestion.domainId === 'quant' ? 'QUANTITATIVE' : activeQuestion.domainId === 'logical' ? 'LOGICAL' : 'VERBAL'}
                        </span>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                          activeQuestion.difficulty === 'EASY'
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                            : activeQuestion.difficulty === 'HARD'
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400'
                        }`}>
                          {activeQuestion.difficulty}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                          #{activeQuestion.id}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Instructor Walk-through</span>
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Ravi Kumar</span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(activeQuestion.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer hover:scale-105 ${
                            bookmarks.includes(activeQuestion.id)
                              ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Question Title & Stem */}
                    <div className="space-y-4 text-left relative z-10">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-snug tracking-tight font-heading">
                        {activeQuestion.questionStem.split('###')[0].trim()}
                      </h2>
                    </div>

                    {/* Immersive Custom Video Player Section */}
                    {activeQuestion.videoUrl && (
                      <div className="space-y-3 relative z-10">
                        
                        {/* Placeholder for Sticky video player gap */}
                        {isMiniPlayerActive && (
                          <div className="w-full aspect-video bg-slate-950/30 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center text-[10px] uppercase font-black tracking-widest text-slate-500 select-none">
                            <Video className="w-5 h-5 mb-2.5 animate-pulse text-blue-500" />
                            <span>Playing in Sticky Picture-in-Picture mode</span>
                          </div>
                        )}

                        {/* actual animated player tag */}
                        <motion.div
                          ref={mainVideoRef}
                          layout="position"
                          className={isMiniPlayerActive
                            ? "fixed bottom-6 right-6 w-80 aspect-video shadow-2xl z-50 rounded-2xl border border-blue-500/40 bg-slate-950 overflow-hidden flex flex-col group/pip cursor-pointer"
                            : "w-full aspect-video bg-black rounded-2xl overflow-hidden group relative border border-slate-200 dark:border-slate-900 shadow-md flex flex-col justify-end cursor-pointer"
                          }
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('input') || target.closest('a')) {
                              return;
                            }
                            handlePlayToggle();
                          }}
                        >
                          {(() => {
                            const ytId = getYouTubeId(activeQuestion.videoUrl);
                            if (ytId) {
                              if (isVideoPlaying) {
                                return (
                                  <div className="absolute inset-0 w-full h-full bg-black z-0">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&controls=1`}
                                      title={activeQuestion.videoTitle || "Video solution"}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      className="w-full h-full border-0"
                                    ></iframe>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsVideoPlaying(false);
                                      }}
                                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white hover:text-rose-400 transition-colors shadow-md flex items-center justify-center cursor-pointer"
                                      title="Close Player"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden z-0">
                                    <img
                                      src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                                      alt="Video Walkthrough Thumbnail"
                                      className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-102"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                      }}
                                    />
                                  </div>
                                );
                              }
                            } else {
                              return (
                                <video
                                  ref={videoRef}
                                  src={activeQuestion.videoUrl}
                                  onTimeUpdate={handleVideoTimeUpdate}
                                  onLoadedMetadata={handleVideoLoadedMetadata}
                                  onEnded={() => {
                                    setIsVideoPlaying(false);
                                    setVideoProgress(100);
                                  }}
                                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                                  playsInline
                                />
                              );
                            }
                          })()}

                          {/* Hover Overlay Controls */}
                          {(() => {
                            const ytId = getYouTubeId(activeQuestion.videoUrl);
                            if (ytId) {
                              if (!isVideoPlaying) {
                                return (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 flex flex-col justify-between p-4 z-10 pointer-events-none">
                                    <div className="flex justify-between items-center w-full">
                                      <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">
                                        {activeQuestion.videoTitle || 'Walkthrough Explanation'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            } else {
                              return (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                                  {/* Player Top Bar */}
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">
                                      {activeQuestion.videoTitle || 'Walkthrough Explanation'}
                                    </span>
                                  </div>

                                  {/* Player Bottom Bar / Controls */}
                                  <div className="space-y-2.5 w-full">
                                    {/* Progress Slider Track */}
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={videoProgress}
                                        onChange={handleVideoSliderChange}
                                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                                      />
                                    </div>

                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={handlePlayToggle}
                                          className="p-1 rounded-md text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                          {isVideoPlaying ? (
                                            <span className="font-mono text-xs font-black select-none">PAUSE</span>
                                          ) : (
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                          )}
                                        </button>

                                        <span className="font-mono text-[9px] text-white/70 select-none">
                                          {formatTime(videoPlayTime)} / {formatTime(videoDurationSeconds)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 relative">
                                        {isSpeedMenuOpen && (
                                          <div 
                                            className="absolute bottom-full right-0 mb-2 bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 w-32 shadow-xl z-20 flex flex-col gap-0.5 text-left"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="text-[7.5px] font-black uppercase text-slate-400 px-2 py-1 tracking-wider border-b border-slate-700/60 mb-1 select-none">
                                              Playback Speed
                                            </div>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((sp) => (
                                              <button
                                                key={sp}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePlaybackSpeedChange(sp);
                                                  setIsSpeedMenuOpen(false);
                                                }}
                                                className={`text-[9px] font-black font-mono w-full text-left px-2 py-1.5 rounded hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer ${
                                                  playbackSpeed === sp ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'
                                                }`}
                                              >
                                                <span>{sp === 1 ? 'Normal' : `${sp}x`}</span>
                                                {playbackSpeed === sp && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                              </button>
                                            ))}
                                          </div>
                                        )}

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsSpeedMenuOpen(!isSpeedMenuOpen);
                                          }}
                                          className="flex items-center gap-1 text-[8.5px] font-black font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                                        >
                                          <span>Speed: {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                                          <SettingsIcon className={`w-3 h-3 transition-transform duration-300 ${isSpeedMenuOpen ? 'rotate-90 text-blue-400' : 'text-white/80'}`} />
                                        </button>
                                        
                                        {isMiniPlayerActive && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIsMiniPlayerActive(false);
                                            }}
                                            className="text-[9.5px] font-black text-white hover:text-blue-400 transition-colors bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                                          >
                                            EXPAND
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })()}

                          {/* Non-hover initial play state overlay */}
                          {!isVideoPlaying && !isMiniPlayerActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
                              <span className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center text-white shadow-xl animate-pulse pointer-events-auto cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handlePlayToggle();
                              }}>
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </span>
                            </div>
                          )}
                        </motion.div>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-1 select-none">
                          <span>Video Lesson explanation by Ravi Kumar</span>
                          <span>Duration: {activeQuestion.videoDuration || '10 mins'}</span>
                        </div>
                      </div>
                    )}

                    {/* AI Generated Quick Summary insights */}
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-left relative overflow-hidden group shadow-xs">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl rounded-full" />
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                        <Cpu className="w-4 h-4" />
                        <span className="uppercase tracking-wider font-black text-[10px]">AI Generated Lesson Summary</span>
                      </div>
                      <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300 font-semibold list-disc list-inside leading-relaxed">
                        <li>
                          {activeQuestion.domainId === 'quant' 
                            ? 'Algebraic variable modeling is safer than manual trial logic.' 
                            : activeQuestion.domainId === 'logical'
                              ? 'Circular constraints usually have two branching solutions.'
                              : 'Synonyms like Prolific imply output capacity (Productive).'}
                        </li>
                        <li>Important Placement question category for TCS and Amazon rounds.</li>
                        <li>Option A is mathematically consistent under standard parameters.</li>
                        <li>Mastery percentage average for this unit is 84% speed index.</li>
                      </ul>
                    </div>

                    {/* Selectable Options */}
                    <div className="space-y-4 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left">Interactive Learning Choices</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeQuestion.options.map((opt) => {
                          const isOptionSelected = selectedAnswers[activeQuestion.id] === opt.id;
                          const isSubmitted = submittedAnswers[activeQuestion.id];
                          const showCorrectness = isSubmitted && opt.isCorrect;
                          const showIncorrectness = isSubmitted && isOptionSelected && !opt.isCorrect;

                          return (
                            <button
                              key={opt.id}
                              onClick={() => !isSubmitted && handleAnswerSelect(activeQuestion.id, opt.id)}
                              disabled={isSubmitted}
                              className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 text-xs transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                                showCorrectness
                                  ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                  : showIncorrectness
                                    ? 'border-rose-500 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-shake'
                                    : isOptionSelected
                                      ? 'border-blue-500 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-950/30 text-slate-800 dark:text-white'
                                      : 'border-slate-200 bg-slate-50/50 hover:border-blue-500/40 hover:shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:bg-slate-50 dark:border-slate-900 dark:bg-slate-950/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[10.5px] shrink-0 border transition-colors duration-300 ${
                                  showCorrectness
                                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/35 dark:text-emerald-400'
                                    : showIncorrectness
                                      ? 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/35 dark:text-rose-400'
                                      : isOptionSelected
                                        ? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/35 dark:text-blue-400'
                                        : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                }`}>
                                  {opt.id.toUpperCase()}
                                </span>
                                <span className="font-semibold">{opt.text}</span>
                              </div>
                              {isSubmitted && opt.isCorrect && (
                                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                              )}
                              {isSubmitted && isOptionSelected && !opt.isCorrect && (
                                <X className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          {/* ====================================================================
              3. TAB: PRACTICE ARENA (Curated Hub redesign layout)
              ==================================================================== */}
          {activeSidebarTab === 'practice' && (
            <div className="w-full space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
              
              {/* Three-Column Workspace layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Center Column - Main Workspace (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* 1. Curated Practice Collections (Netflix style) */}
                  <div className="bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 shadow-xs text-left relative overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading mb-4">Curated Practice Arenas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 'all', title: 'All Practice Sets', domain: 'All', icon: '🌐', gradient: 'from-blue-600/15 to-indigo-600/15 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-500/20 dark:border-blue-900/40 text-blue-600 dark:text-blue-400', count: questions.length },
                        { id: 'quant', title: 'Quantitative Arena', domain: 'quant', icon: '📐', gradient: 'from-amber-600/15 to-orange-600/15 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-500/20 dark:border-amber-900/40 text-amber-600 dark:text-amber-400', count: questions.filter(q => q.domainId === 'quant').length },
                        { id: 'logical', title: 'Logical Sequences', domain: 'logical', icon: '🧩', gradient: 'from-pink-600/15 to-rose-600/15 dark:from-pink-950/40 dark:to-rose-950/40 border-pink-500/20 dark:border-pink-900/40 text-pink-600 dark:text-pink-400', count: questions.filter(q => q.domainId === 'logical').length },
                        { id: 'verbal', title: 'Verbal Mastery', domain: 'verbal', icon: '📚', gradient: 'from-emerald-600/15 to-teal-600/15 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-500/20 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400', count: questions.filter(q => q.domainId === 'verbal').length }
                      ].map((col) => {
                        const isSelected = selectedCollection === col.id;
                        return (
                          <button
                            key={col.id}
                            onClick={() => {
                              setSelectedCollection(col.id);
                              setSelectedDomain(col.domain);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group/collection-btn cursor-pointer flex flex-col justify-between h-28 ${
                              isSelected
                                ? 'bg-slate-50 border-blue-500 dark:bg-slate-900 dark:border-blue-500 shadow-md shadow-blue-500/10 scale-102 font-bold'
                                : 'bg-white hover:bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 hover:border-slate-800 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xl">{col.icon}</span>
                              <span className="text-[9px] font-black font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded uppercase">
                                {col.count} Sets
                              </span>
                            </div>
                            <div className="mt-2 text-left">
                              <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white leading-tight">
                                {col.title}
                              </h4>
                              <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 block mt-1">
                                {col.id === 'all' ? 'Unified course track' : `Concepts in ${col.id}`}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Set Navigation Track */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left">Set Navigation Track</span>
                    {isLoading ? (
                      <div className="w-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center">
                        <div className="w-6 h-6 rounded-full border border-blue-600 border-t-transparent animate-spin mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loading set track...</span>
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <div className="w-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center text-center">
                        <Info className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">No questions in this filter set</span>
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {filteredQuestions.map((q, idx) => {
                          const isSolved = submittedAnswers[q.id];
                          const isCurrent = activeQuestion?.id === q.id;
                          const isCorrect = isSolved && selectedAnswers[q.id] === q.options.find(o => o.isCorrect)?.id;
                          return (
                            <button
                              key={q.id}
                              onClick={() => {
                                setActiveQuestion(q);
                                setIsVideoPlaying(false);
                                setVideoProgress(0);
                                setVideoPlayTime(0);
                              }}
                              className={`flex-shrink-0 w-44 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer ${
                                isCurrent
                                  ? 'bg-blue-100/30 border-blue-500 dark:bg-blue-950/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                                  : isSolved
                                    ? isCorrect
                                      ? 'bg-emerald-100/10 border-emerald-900 dark:bg-emerald-950/10 hover:border-emerald-700'
                                      : 'bg-rose-100/10 border-rose-900 dark:bg-rose-950/10 hover:border-rose-700'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-400 dark:bg-slate-900/30 dark:border-slate-900 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] text-slate-400">#{q.id}</span>
                                {isSolved ? (
                                  isCorrect ? (
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                                  ) : (
                                    <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white text-[8px] font-black">✗</span>
                                  )
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                )}
                              </div>
                              <h5 className="text-[11px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-300 mt-2 truncate">Lesson Unit {idx + 1}</h5>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[7.5px] font-black uppercase bg-slate-100 dark:bg-slate-900 px-1.5 py-0.2 rounded leading-normal text-slate-500">
                                  {q.difficulty}
                                </span>
                                <span className="text-[7.5px] font-semibold text-slate-500">
                                  {q.domainId === 'quant' ? 'Quant' : q.domainId === 'logical' ? 'Logic' : 'Verbal'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Active Learning Card */}
                  {activeQuestion && (
                    <div className="bg-white border border-slate-200 dark:bg-slate-950/40 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden">
                      
                      {/* Visual shine gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/2 to-transparent pointer-events-none" />

                      {/* Question Header & Tags */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4 flex-wrap gap-3 relative z-10">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full tracking-wider uppercase">
                            {activeQuestion.domainId === 'quant' ? 'QUANTITATIVE' : activeQuestion.domainId === 'logical' ? 'LOGICAL' : 'VERBAL'}
                          </span>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                            activeQuestion.difficulty === 'EASY'
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                              : activeQuestion.difficulty === 'HARD'
                                ? 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400'
                                : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400'
                          }`}>
                            {activeQuestion.difficulty}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                            #{activeQuestion.id}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col text-right">
                            <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Instructor Walk-through</span>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Ravi Kumar</span>
                          </div>
                          <button
                            onClick={() => toggleBookmark(activeQuestion.id)}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer hover:scale-105 ${
                              bookmarks.includes(activeQuestion.id)
                                ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-500'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Bookmark className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Question Title & Stem */}
                      <div className="space-y-4 text-left relative z-10">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-snug tracking-tight font-heading">
                          {activeQuestion.questionStem.split('###')[0].trim()}
                        </h2>
                      </div>

                      {/* Immersive Custom Video Player Section */}
                      {activeQuestion.videoUrl && (
                        <div className="space-y-3 relative z-10">
                          
                          {/* Placeholder for Sticky video player gap */}
                          {isMiniPlayerActive && (
                            <div className="w-full aspect-video bg-slate-950/30 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center text-[10px] uppercase font-black tracking-widest text-slate-500 select-none">
                              <Video className="w-5 h-5 mb-2.5 animate-pulse text-blue-500" />
                              <span>Playing in Sticky Picture-in-Picture mode</span>
                            </div>
                          )}

                          {/* actual animated player tag */}
                          <motion.div
                            ref={mainVideoRef}
                            layout="position"
                            className={isMiniPlayerActive
                              ? "fixed bottom-6 right-6 w-80 aspect-video shadow-2xl z-50 rounded-2xl border border-blue-500/40 bg-slate-950 overflow-hidden flex flex-col group/pip cursor-pointer"
                              : "w-full aspect-video bg-black rounded-2xl overflow-hidden group relative border border-slate-200 dark:border-slate-900 shadow-md flex flex-col justify-end cursor-pointer"
                            }
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest('button') || target.closest('input') || target.closest('a')) {
                                return;
                              }
                              handlePlayToggle();
                            }}
                          >
                          {(() => {
                            const ytId = getYouTubeId(activeQuestion.videoUrl);
                            if (ytId) {
                              if (isVideoPlaying) {
                                return (
                                  <div className="absolute inset-0 w-full h-full bg-black z-0">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&controls=1`}
                                      title={activeQuestion.videoTitle || "Video solution"}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      className="w-full h-full border-0"
                                    ></iframe>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsVideoPlaying(false);
                                      }}
                                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white hover:text-rose-400 transition-colors shadow-md flex items-center justify-center cursor-pointer"
                                      title="Close Player"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden z-0">
                                    <img
                                      src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                                      alt="Video Walkthrough Thumbnail"
                                      className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-102"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                      }}
                                    />
                                  </div>
                                );
                              }
                            } else {
                              return (
                                <video
                                  ref={videoRef}
                                  src={activeQuestion.videoUrl}
                                  onTimeUpdate={handleVideoTimeUpdate}
                                  onLoadedMetadata={handleVideoLoadedMetadata}
                                  onEnded={() => {
                                    setIsVideoPlaying(false);
                                    setVideoProgress(100);
                                  }}
                                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
                                  playsInline
                                />
                              );
                            }
                          })()}

                          {/* Hover Overlay Controls */}
                          {(() => {
                            const ytId = getYouTubeId(activeQuestion.videoUrl);
                            if (ytId) {
                              if (!isVideoPlaying) {
                                return (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 flex flex-col justify-between p-4 z-10 pointer-events-none">
                                    <div className="flex justify-between items-center w-full">
                                      <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">
                                        {activeQuestion.videoTitle || 'Walkthrough Explanation'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            } else {
                              return (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                                  {/* Player Top Bar */}
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">
                                      {activeQuestion.videoTitle || 'Walkthrough Explanation'}
                                    </span>
                                  </div>

                                  {/* Player Bottom Bar / Controls */}
                                  <div className="space-y-2.5 w-full">
                                    {/* Progress Slider Track */}
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={videoProgress}
                                        onChange={handleVideoSliderChange}
                                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                                      />
                                    </div>

                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={handlePlayToggle}
                                          className="p-1 rounded-md text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                          {isVideoPlaying ? (
                                            <span className="font-mono text-xs font-black select-none">PAUSE</span>
                                          ) : (
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                          )}
                                        </button>

                                        <span className="font-mono text-[9px] text-white/70 select-none">
                                          {formatTime(videoPlayTime)} / {formatTime(videoDurationSeconds)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 relative">
                                        {isSpeedMenuOpen && (
                                          <div 
                                            className="absolute bottom-full right-0 mb-2 bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 w-32 shadow-xl z-20 flex flex-col gap-0.5 text-left"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="text-[7.5px] font-black uppercase text-slate-400 px-2 py-1 tracking-wider border-b border-slate-700/60 mb-1 select-none">
                                              Playback Speed
                                            </div>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((sp) => (
                                              <button
                                                key={sp}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePlaybackSpeedChange(sp);
                                                  setIsSpeedMenuOpen(false);
                                                }}
                                                className={`text-[9px] font-black font-mono w-full text-left px-2 py-1.5 rounded hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer ${
                                                  playbackSpeed === sp ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'
                                                }`}
                                              >
                                                <span>{sp === 1 ? 'Normal' : `${sp}x`}</span>
                                                {playbackSpeed === sp && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                              </button>
                                            ))}
                                          </div>
                                        )}

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsSpeedMenuOpen(!isSpeedMenuOpen);
                                          }}
                                          className="flex items-center gap-1 text-[8.5px] font-black font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                                        >
                                          <span>Speed: {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                                          <SettingsIcon className={`w-3 h-3 transition-transform duration-300 ${isSpeedMenuOpen ? 'rotate-90 text-blue-400' : 'text-white/80'}`} />
                                        </button>
                                        
                                        {isMiniPlayerActive && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIsMiniPlayerActive(false);
                                            }}
                                            className="text-[9.5px] font-black text-white hover:text-blue-400 transition-colors bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                                          >
                                            EXPAND
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })()}

                          {/* Non-hover initial play state overlay */}
                          {!isVideoPlaying && !isMiniPlayerActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
                              <span className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center text-white shadow-xl animate-pulse pointer-events-auto cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handlePlayToggle();
                              }}>
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </span>
                            </div>
                          )}

                          </motion.div>
                          
                          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold px-1 select-none">
                            <span>Video Lesson explanation by Ravi Kumar</span>
                            <span>Duration: {activeQuestion.videoDuration || '10 mins'}</span>
                          </div>
                        </div>
                      )}

                      {/* AI Generated Quick Summary insights */}
                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 dark:bg-blue-950/10 dark:border-blue-900/30 text-left relative overflow-hidden group shadow-xs">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl rounded-full" />
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          <Cpu className="w-4 h-4" />
                          <span className="uppercase tracking-wider font-black text-[10px]">AI Generated Lesson Summary</span>
                        </div>
                        <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold list-disc list-inside leading-relaxed">
                          <li>
                            {activeQuestion.domainId === 'quant' 
                              ? 'Algebraic variable modeling is safer than manual trial logic.' 
                              : activeQuestion.domainId === 'logical'
                                ? 'Circular constraints usually have two branching solutions.'
                                : 'Synonyms like Prolific imply output capacity (Productive).'}
                          </li>
                          <li>Important Placement question category for TCS and Amazon rounds.</li>
                          <li>Option A is mathematically consistent under standard parameters.</li>
                          <li>Mastery percentage average for this unit is 84% speed index.</li>
                        </ul>
                      </div>

                      {/* Selectable Options */}
                      <div className="space-y-4 pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left">Interactive Learning Choices</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeQuestion.options.map((opt) => {
                            const isOptionSelected = selectedAnswers[activeQuestion.id] === opt.id;
                            const isSubmitted = submittedAnswers[activeQuestion.id];
                            const showCorrectness = isSubmitted && opt.isCorrect;
                            const showIncorrectness = isSubmitted && isOptionSelected && !opt.isCorrect;

                            return (
                              <button
                                key={opt.id}
                                onClick={() => !isSubmitted && handleAnswerSelect(activeQuestion.id, opt.id)}
                                disabled={isSubmitted}
                                className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 text-xs transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                                  showCorrectness
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : showIncorrectness
                                      ? 'border-rose-500 bg-rose-50/50 dark:border-rose-600 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-shake'
                                      : isOptionSelected
                                        ? 'border-blue-500 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-950/30 text-slate-800 dark:text-white font-bold shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-blue-500/40 hover:shadow-[0_0_10px_rgba(59,130,246,0.1)] dark:border-slate-900 dark:bg-slate-950/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[10.5px] shrink-0 border transition-colors duration-300 ${
                                    showCorrectness
                                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/35 dark:text-emerald-500'
                                      : showIncorrectness
                                        ? 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/35 dark:text-rose-500'
                                        : isOptionSelected
                                          ? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/35 dark:text-blue-400'
                                          : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                  }`}>
                                    {opt.id.toUpperCase()}
                                  </span>
                                  <span className="font-semibold">{opt.text}</span>
                                </div>
                                {isSubmitted && opt.isCorrect && (
                                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                                )}
                                {isSubmitted && isOptionSelected && !opt.isCorrect && (
                                  <X className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Learning Tabs Switcher */}
                      <div className="flex border-b border-slate-200 dark:border-slate-900 select-none pb-0.5 pt-4 overflow-x-auto gap-2">
                        {[
                          { id: 'explanation', label: 'Explanation' },
                          { id: 'notes', label: 'Video Transcript' },
                          { id: 'tips', label: 'Mentor Tips & Cheats' },
                          { id: 'discussion', label: `Discussion (${currentComments.length})` },
                          { id: 'related', label: 'Related Questions' }
                        ].map((tab) => {
                          const isActive = activeLearningTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveLearningTab(tab.id as any)}
                              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-205 relative cursor-pointer whitespace-nowrap ${
                                isActive
                                  ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
                              }`}
                            >
                              {tab.label}
                              {isActive && (
                                <motion.div
                                  layoutId="activeLearningTabGlowPractice"
                                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab Content Panels */}
                      <div className="pt-2">
                        {activeLearningTab === 'explanation' && (
                          <div className="bg-slate-50/50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-900 p-5 rounded-2xl text-left space-y-3 font-medium text-xs leading-relaxed transition-all duration-300 animate-fadeIn">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2 select-none">LaTeX Mathematical Solver Output</span>
                            <div className="text-slate-700 dark:text-slate-300 space-y-2.5">
                              {activeQuestion.hintText ? (
                                <p className="font-semibold whitespace-pre-line font-mono text-[11px] leading-relaxed">
                                  {activeQuestion.hintText.replace(/\\frac/g, '').replace(/\\text/g, '').replace(/[\{\}]/g, ' ')}
                                </p>
                              ) : (
                                <p className="italic text-slate-400">Step-by-step formula derivation is currently loading...</p>
                              )}
                            </div>
                          </div>
                        )}

                        {activeLearningTab === 'notes' && (
                          <div className="space-y-3.5 text-left animate-fadeIn">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block select-none">Interactive Transcript Notes</span>
                            <div className="grid grid-cols-1 gap-2.5">
                              {(activeQuestion.domainId === 'quant' ? [
                                { time: '0:00', sec: 0, text: 'Read the question stem and extract key variable constants' },
                                { time: '1:30', sec: 90, text: 'Model the Cost Price as 100x variable multiplier' },
                                { time: '3:15', sec: 195, text: 'Setup Profit equation relationships & margin margins' },
                                { time: '5:45', sec: 345, text: 'Solve the linear variables for variable value x' },
                                { time: '7:40', sec: 460, text: 'Alternative quick short-cut review for campus test timing' }
                              ] : activeQuestion.domainId === 'logical' ? [
                                { time: '0:00', sec: 0, text: 'Deconstruct arrangement parameters and absolute rules' },
                                { time: '2:15', sec: 135, text: 'Establish circular reference points coordinates' },
                                { time: '4:40', sec: 280, text: 'Map remaining candidates using relative directions checks' },
                                { time: '6:50', sec: 410, text: 'Re-evaluating options correctness against initial logic board' }
                              ] : [
                                { time: '0:00', sec: 0, text: 'Identify the structural core of grammatical corrections' },
                                { time: '1:20', sec: 80, text: 'Applying subject-verb modifiers rules' },
                                { time: '3:45', sec: 225, text: 'Eliminating syntactical filler clauses' },
                                { time: '5:30', sec: 330, text: 'Final semantic check of context definitions mapping' }
                              ]).map((note, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (videoRef.current) {
                                      videoRef.current.currentTime = note.sec;
                                      setVideoPlayTime(note.sec);
                                      setIsVideoPlaying(true);
                                      videoRef.current.play();
                                    }
                                  }}
                                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-100 dark:border-slate-900/60 rounded-xl flex items-start gap-4 transition-all duration-200 text-left cursor-pointer group"
                                >
                                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 font-mono text-[10px] font-black px-2 py-0.5 rounded group-hover:scale-105 transition-transform shrink-0">
                                    {note.time}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {note.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeLearningTab === 'tips' && (
                          <div className="space-y-4 text-left animate-fadeIn">
                            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 dark:bg-amber-950/10 dark:border-amber-900/40 relative overflow-hidden">
                              <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                                <Lightbulb className="w-4 h-4 animate-bounce" /> Mentor Cheat Sheet
                              </h4>
                              <div className="mt-3.5 space-y-3">
                                {activeQuestion.domainId === 'quant' ? (
                                  <>
                                    <div className="flex items-start gap-3 border-b border-amber-500/10 pb-2.5">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">FORMULA</span>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-400 font-mono">
                                        CP = Selling Price × 100 / (100 + Profit%)
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">SHORTCUT</span>
                                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 leading-normal">
                                        Assume Base CP = 100x. When markup is 20%, MP = 120x. If discount is 10%, SP = 108x. Hence Profit = 8%. Saves equations modeling time.
                                      </p>
                                    </div>
                                  </>
                                ) : activeQuestion.domainId === 'logical' ? (
                                  <>
                                    <div className="flex items-start gap-3 border-b border-amber-500/10 pb-2.5">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">STRATEGY</span>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                                        Identify absolute placements (e.g. "A is sitting third to the right of B") first before checking branching conditions.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">TIP</span>
                                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 leading-normal">
                                        For circular arrangements with even candidates, opposite positions align symmetrically. Mark diagonals early.
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-start gap-3 border-b border-amber-500/10 pb-2.5">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">RULE</span>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                                        Subject-Verb separation: Ignore prepositional modifier blocks between subject and verb (e.g., "The box [of pencils] is red").
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">TRAP</span>
                                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 leading-normal">
                                        Double negatives: "Hardly" and "Scarcely" already contain negative implications; pairing with "not" is syntactically invalid.
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeLearningTab === 'discussion' && (
                          <div className="space-y-5 text-left animate-fadeIn">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block select-none">Community Board</span>
                            
                            {/* Comments List */}
                            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                              {currentComments.map((comment) => (
                                <div key={comment.id} className="flex items-start gap-3.5 bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-900/50">
                                  <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" />
                                  <div className="leading-tight">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">{comment.user}</span>
                                      <span className="text-[9px] font-bold text-slate-400 font-mono">{comment.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1.5 leading-relaxed">{comment.comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* New comment input */}
                            <div className="flex gap-3 pt-2">
                              <input
                                type="text"
                                placeholder="Ask a clarification or post advice..."
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                              />
                              <button
                                onClick={() => {
                                  if (newCommentText.trim() === '') return;
                                  const newC = {
                                    id: `c_${Date.now()}`,
                                    user: profile.username || 'You',
                                    avatar: profile.avatar && profile.avatar !== 'initial' ? profile.avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
                                    comment: newCommentText,
                                    time: 'Just now'
                                  };
                                  setActiveQuestionComments(prev => {
                                    const currentQList = prev[activeQuestion.id] || [];
                                    return {
                                      ...prev,
                                      [activeQuestion.id]: [newC, ...currentQList]
                                    };
                                  });
                                  setNewCommentText('');
                                }}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Send</span>
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {activeLearningTab === 'related' && (
                          <div className="space-y-4 text-left animate-fadeIn">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block select-none">Linked Learning Sets</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {questions.filter(q => q.domainId === activeQuestion.domainId && q.id !== activeQuestion.id).slice(0, 4).map((q) => (
                                <button
                                  key={q.id}
                                  onClick={() => {
                                    setActiveQuestion(q);
                                    setIsVideoPlaying(false);
                                    setVideoProgress(0);
                                    setVideoPlayTime(0);
                                  }}
                                  className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-100 dark:border-slate-900/80 rounded-2xl flex flex-col justify-between text-left transition-all duration-205 group cursor-pointer"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-mono text-[9px] text-slate-400 font-bold">#{q.id}</span>
                                    <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-500">
                                      {q.difficulty}
                                    </span>
                                  </div>
                                  <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-2 line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                    {q.questionStem.split('###')[0].trim()}
                                  </h5>
                                  <span className="text-[9px] text-blue-500 dark:text-blue-400 font-extrabold mt-2 block group-hover:translate-x-0.5 transition-transform">
                                    Start Walk-through →
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* Right Column - Insights Panel (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* 1. Live Practice Stopwatch & Stats */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900/60 mb-4 select-none">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Practice Analytics</h3>
                      <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">Real-time stats</span>
                    </div>

                    <div className="space-y-4">
                      {/* Live stopwatch block */}
                      <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 dark:border-emerald-900/30 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[8.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-mono">Live Study Time</span>
                          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                            {Math.floor(practiceTimeSpent / 60)}m {practiceTimeSpent % 60}s
                          </span>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>

                      {/* Accuracy & Avg speed stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-900/60">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Solve Accuracy</span>
                          <span className="text-sm font-mono font-black text-slate-800 dark:text-white block mt-1">84.5%</span>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-900/60">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Avg Solve Speed</span>
                          <span className="text-sm font-mono font-black text-slate-800 dark:text-white block mt-1">42 Secs</span>
                        </div>
                      </div>

                      {/* Progress slider bar: daily goals */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Daily Practice Goal</span>
                          <span>8 / 10 Complete</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '80%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Concept Mastery Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading pb-3 border-b border-slate-200 dark:border-slate-900/60 mb-4">Concept Mastery</h3>
                    <div className="space-y-3.5">
                      {[
                        { name: 'Percentages & Margins', val: 94, color: 'bg-emerald-500' },
                        { name: 'Ratios & Proportions', val: 82, color: 'bg-blue-500' },
                        { name: 'Profit & Loss Systems', val: 78, color: 'bg-indigo-500' },
                        { name: 'Syllogisms & Logic Venns', val: 65, color: 'bg-amber-500' },
                        { name: 'CS Coding Arrays & Stack', val: 45, color: 'bg-pink-500' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span className="truncate max-w-[75%]">{item.name}</span>
                            <span className="font-mono">{item.val}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Placement Leaderboard */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading pb-3 border-b border-slate-100 dark:border-slate-900/60 mb-4">Placement Leaderboard</h3>
                    <div className="space-y-3">
                      {[
                        { rank: 1, name: 'Aniketh Rao', score: '1,450 XP', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack' },
                        { rank: 2, name: 'Megha Shetty', score: '1,320 XP', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe' },
                        { rank: 3, name: 'Sriram Reddy', score: '1,280 XP', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
                        { rank: 14, name: 'Vaishnavi Raparthy (You)', score: '950 XP', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie', isSelf: true }
                      ].map((student, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-xl ${student.isSelf ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-transparent'}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`font-mono text-xs font-black w-4 text-center ${student.rank === 1 ? 'text-amber-500' : student.rank === 2 ? 'text-slate-400' : student.rank === 3 ? 'text-amber-700' : 'text-slate-500'}`}>
                              #{student.rank}
                            </span>
                            <img src={student.avatar} alt={student.name} className="w-6.5 h-6.5 rounded-full border border-slate-200 dark:border-slate-800" />
                            <span className={`text-[11px] truncate font-bold ${student.isSelf ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                              {student.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-black text-slate-500 shrink-0">{student.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Mentor insights box */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left relative overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading pb-3 border-b border-slate-100 dark:border-slate-900/60 mb-4">Mentor Insights</h3>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 select-none">
                        <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded font-mono uppercase">TCS NQT Target</span>
                        <span className="text-[8px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded font-mono uppercase">Amazon Target</span>
                        <span className="text-[8px] font-black bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900 px-2 py-0.5 rounded font-mono uppercase">Goldman Sachs</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-normal">
                        Percentages and Profit/Loss margins represent 35% of all quantitative questions in the TCS NQT qualifier round, and constitute 4 interview puzzles in the Amazon technical screening round.
                      </p>
                    </div>
                  </div>

                  {/* 5. Compact vertical roadmap */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs text-left">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading pb-3 border-b border-slate-100 dark:border-slate-900/60 mb-4">Arena Learning Path</h3>
                    <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-5 py-2">
                      {[
                        { title: 'Level 1: Percentages', status: 'completed' },
                        { title: 'Level 2: Ratios & Proportions', status: 'completed' },
                        { title: 'Level 3: Profit & Loss', status: 'active' },
                        { title: 'Level 4: Time & Work', status: 'locked' },
                        { title: 'Level 5: Syllogisms', status: 'locked' }
                      ].map((step, idx) => (
                        <div key={idx} className="relative">
                          {/* Left node dot */}
                          <div className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-xs ${
                            step.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : step.status === 'active'
                                ? 'bg-blue-600 border-blue-700 text-white animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}>
                            {step.status === 'completed' ? (
                              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                            ) : (
                              <span className="text-[9px] font-bold font-mono">{idx + 1}</span>
                            )}
                          </div>
                          
                          <div className="leading-tight text-left pl-1">
                            <h4 className={`text-xs font-black uppercase tracking-tight ${step.status === 'active' ? 'text-blue-600 dark:text-blue-400 font-bold' : step.status === 'completed' ? 'text-slate-800 dark:text-white font-bold' : 'text-slate-400'}`}>
                              {step.title}
                            </h4>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                              {step.status === 'completed' ? 'Set Completed • 150 XP' : step.status === 'active' ? 'Solve sets to certify' : 'Locked Unit'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
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
                      test.status === 'Live Soon' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';

                  return (
                    <div key={idx} className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide font-mono ${statusBg}`}>
                            {test.status}
                          </span>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${test.difficulty === 'HARD' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400'
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
                          className={`py-2 px-5 font-bold text-xs rounded-xl shadow-xs cursor-pointer select-none transition-all ${test.status === 'Completed'
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-950 cursor-not-allowed shadow-none'
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
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${selectedOpportunityType === type
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
                  <div className="w-8 h-8 rounded-full border border-blue-600 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling opportunities files...</span>
                </div>
              ) : selectedOpportunityType === 'Placement Updates' ? (
                // Display Placement Updates Announcements
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a.id} className="bg-white border border-slate-200 dark:bg-slate-900/15 dark:border-slate-900 p-5 rounded-2xl space-y-2.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30 px-2 py-0.5 rounded-lg uppercase">
                            {a.type}
                          </span>
                          {a.priority === 'High' && (
                            <span className="text-[8px] font-black bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400 px-1.5 py-0.2 rounded uppercase animate-pulse">
                              High Priority
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold">{a.publisher} · {a.date || 'June 4'}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">{a.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{a.content}</p>
                    </div>
                  ))}
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6">
                  <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Active Opportunities in this Category</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Check back later for active portal drives.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((o) => {
                    const isExpanded = expandedOpportunityId === o.id;
                    const statusColor =
                      o.status === 'Open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/25' :
                        o.status === 'Closing Soon' ? 'text-amber-700 bg-amber-50/65 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/25' :
                          o.status === 'New' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/25' :
                            'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/25';

                    const typeBadge =
                      o.type === 'Hiring' ? 'Hiring Drive' :
                        o.type === 'Internship' ? 'Internship' :
                          o.type === 'Government Exam' ? 'Government Exam' :
                            o.type === 'Hackathon' ? 'Hackathon' : o.type;

                    return (
                      <div
                        key={o.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 dark:bg-slate-900/10 dark:border-slate-900 dark:hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[8.5px] font-black px-2 py-0.5 rounded border bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 uppercase font-mono">
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
                              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">Closed</span>
                            )}
                          </div>

                          {isExpanded && o.details && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-800 animate-fadeIn font-medium">
                              {o.details}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded-lg border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 transition-colors cursor-pointer text-center"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeLeaderboardTab === tab
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
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.self
                        ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-950 dark:text-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:border-slate-900/60 dark:hover:bg-slate-900/40 dark:text-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${item.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-400' :
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

              <div className="border-b border-slate-200 dark:border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Student credentials</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review onboarding selections and active prep goals.</p>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
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

                {/* Choose Profile Photo */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Choose Profile Photo / Avatar
                  </label>
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Option: First Letter Initials */}
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, avatar: 'initial' })}
                      className={`relative w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer border-2 ${(!profile.avatar || profile.avatar === 'initial')
                          ? 'border-blue-600 ring-2 ring-blue-400 dark:ring-blue-700/50 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      title="Use Initials"
                    >
                      {profile.username ? profile.username[0] : 'V'}
                    </button>

                    {/* Predefined Avatar Images */}
                    {AVATAR_PRESETS.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatar: imgUrl })}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer border-2 ${profile.avatar === imgUrl
                            ? 'border-blue-600 ring-2 ring-blue-400 dark:ring-blue-700/50 scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Avatar Option ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Custom URL Input */}
                  <div className="space-y-1.5 max-w-md text-left">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">
                      Or use a custom image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Paste image URL (e.g. https://example.com/avatar.jpg)"
                      value={
                        profile.avatar &&
                          profile.avatar !== 'initial' &&
                          !AVATAR_PRESETS.includes(profile.avatar)
                          ? profile.avatar
                          : ''
                      }
                      onChange={(e) => setProfile({ ...profile, avatar: e.target.value || 'initial' })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
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
              7.5. TAB: ACHIEVEMENTS & BADGES
              ==================================================================== */}
          {activeSidebarTab === 'badges' && (
            <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
              {/* Premium Header HUD card */}
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="space-y-3 relative z-10 text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full text-[9px] font-black text-amber-400 tracking-wider uppercase">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Aptitude Leaderboard Clearance</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight uppercase leading-tight">
                    Your Achievements & Badges
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed font-semibold">
                    Track your credentials, progress, and performance across your onboarding and consistency achievements. Keep completing challenges to level up!
                  </p>
                </div>

                {/* Score indicators */}
                <div className="flex flex-col items-center sm:items-start md:items-center bg-slate-950/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shrink-0 w-full md:w-auto text-center md:text-left gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold border border-amber-500/30">
                      🏆
                    </div>
                    <div className="text-left flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unlocked Badges</span>
                      <span className="text-lg font-black text-white">{unlockedBadgeIds.length} / {badges.length}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${badges.length > 0 ? (unlockedBadgeIds.length / badges.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Achievements Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Getting Started Badges</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Standalone starter achievements for onboarding and consistency.</p>
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {badges.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.includes(badge.id);
                    return (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isUnlocked={isUnlocked}
                        onClick={() => {
                          setSelectedBadge(badge);
                          if (isUnlocked) {
                            playPreviewChime();
                            triggerCelebration();
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              8. TAB: SETTINGS (Theme configuration & credentials)
              ==================================================================== */}
          {activeSidebarTab === 'settings' && (
            <div className="w-full space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">

              <div className="border-b border-slate-200 dark:border-slate-900 pb-4 text-left">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Settings Hub</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure advanced dashboard properties, 3D interactions, sound nodes, and live customizations.</p>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Settings Customizations (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Card 1: 3D Tilts & Celebrations */}
                  <div
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Interactive Dynamics</h3>
                    </div>

                    {/* 3D tilt Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-900" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Dynamic 3D Hover Tilt</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed max-w-[220px]">Enable smooth interactive mouse-coordinate perspective card rotation.</p>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !tiltEnabled;
                          setTiltEnabled(nextVal);
                          localStorage.setItem('aptitude_tilt_enabled', String(nextVal));
                        }}
                        className={`py-1.5 px-4 rounded-xl text-xs font-extrabold uppercase transition-all duration-300 cursor-pointer ${tiltEnabled
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}
                      >
                        {tiltEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* Celebration Confetti Style Switcher */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Confetti Celebration Blast</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Choose canvas animation style to launch upon achieving a badge milestone.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(['confetti', 'fireworks', 'none'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => {
                              setConfettiStyle(style);
                              localStorage.setItem('aptitude_confetti_style', style);
                            }}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${confettiStyle === style
                                ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400'
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                          >
                            {style === 'confetti' ? '🎉 Confetti' : style === 'fireworks' ? '🎆 Fireworks' : '🚫 None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Personal Goals & Appearance */}
                  <div
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Target className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Personalization & Goals</h3>
                    </div>

                    {/* Daily XP Goals Selector */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Daily XP Milestone Goal</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Determine your daily target value. Updates dashboard trackers dynamically.</p>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {([
                          { label: 'Casual', value: 50 },
                          { label: 'Active', value: 100 },
                          { label: 'Serious', value: 200 },
                          { label: 'Insane', value: 500 }
                        ]).map((item) => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setDailyXpGoal(item.value);
                              localStorage.setItem('aptitude_daily_xp_goal', String(item.value));
                            }}
                            className={`py-2 px-1 text-[10px] flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer ${dailyXpGoal === item.value
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400'
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                          >
                            <span className="font-extrabold uppercase tracking-tight">{item.label}</span>
                            <span className="text-[9px] font-mono opacity-80 mt-0.5">{item.value} XP</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme display mode toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-900" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Active Display Mode</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Switch workspace lighting themes in real-time.</p>
                      </div>

                      <button
                        onClick={toggleTheme}
                        className="py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {theme === 'light' ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-indigo-400" />
                            <span>Dark Theme</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Custom Accent Palette Swatches */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Brand Accent Color</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Switch component preview accent color schema overrides.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                          { id: 'blue', label: 'Sapphire', bg: 'bg-blue-500', activeClass: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/10' },
                          { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', activeClass: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10' },
                          { id: 'purple', label: 'Cyberpunk', bg: 'bg-purple-500', activeClass: 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/10' },
                          { id: 'amber', label: 'Amber', bg: 'bg-amber-500', activeClass: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10' },
                          { id: 'rose', label: 'Crimson', bg: 'bg-rose-500', activeClass: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/10' },
                          { id: 'orange', label: 'Sunset', bg: 'bg-orange-500', activeClass: 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/10' },
                          { id: 'teal', label: 'Teal', bg: 'bg-teal-500', activeClass: 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:bg-teal-500/10' },
                          { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', activeClass: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/10' }
                        ]).map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleAccentColorChange(color.id)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer justify-center ${accentColor === color.id
                                ? `${color.activeClass} shadow-md`
                                : 'bg-transparent border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                              }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${color.bg} shrink-0`} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Density Pills */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Layout Density</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Change padding scale inside elements and tables.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(['compact', 'normal', 'spacious'] as const).map((density) => (
                          <button
                            key={density}
                            onClick={() => handleDensityChange(density)}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${layoutDensity === density
                                ? getAccentClass(accentColor, 'combined')
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                          >
                            {density === 'compact' ? '🔍 Compact' : density === 'normal' ? '⚖️ Normal' : '📖 Spacious'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Security credentials logs */}
                  <div
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-5 rounded-3xl space-y-3 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div style={{ transform: 'translateZ(15px)' }}>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest text-left">Sandbox Credentials</h3>
                      <div className="space-y-2 text-[10.5px] font-medium text-slate-500 mt-3.5">
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

                </div>

                {/* Right Column: 3D Isometric Preview & Audio Hub (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-6">

                  {/* Isometric Live Dashboard Preview widget */}
                  <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl text-left space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[4/3] group/preview">
                    {/* Glowing lights background */}
                    <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-blue-500/15 rounded-full blur-[60px] pointer-events-none group-hover/preview:bg-blue-500/25 transition-colors" />
                    <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-950 border border-blue-900/40 px-3 py-1 rounded-full">
                        3D Live Isometric Previewer
                      </span>
                      <p className="text-[10px] text-slate-500 mt-2 font-semibold">Hover to tilt; updates colors, density, and bounds in real-time.</p>
                    </div>

                    {/* Isometric tilted miniature card */}
                    <div className="flex-1 flex items-center justify-center [perspective:1000px] py-4">
                      <div
                        className={`w-64 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl relative transition-all duration-500 [transform:rotateX(25deg)_rotateY(-35deg)_rotateZ(5deg)] hover:[transform:rotateX(15deg)_rotateY(-20deg)_rotateZ(2deg)] group-hover/preview:shadow-[0_20px_50px_rgba(8,112,184,0.15)]`}
                        style={{
                          transformStyle: 'preserve-3d',
                          padding: layoutDensity === 'compact' ? '10px' : layoutDensity === 'spacious' ? '24px' : '16px'
                        }}
                      >
                        {/* Fake Content on tilted Card */}
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${getAccentClass(accentColor, 'bg')}`} />
                            <span className="text-[9px] font-black uppercase text-slate-300 font-mono tracking-wider">Dashboard</span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-500">v2.4</span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Student XP Goal</div>
                            <div className="text-xs font-black text-white mt-0.5 font-mono">{dailyXpGoal} XP</div>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-xl flex items-center justify-between border border-slate-800">
                            <div className="text-[7.5px] text-slate-400 font-semibold uppercase">Tilt Response</div>
                            <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${tiltEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                              }`}>
                              {tiltEnabled ? 'Active' : 'Muted'}
                            </span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-xl flex items-center justify-between border border-slate-800">
                            <div className="text-[7.5px] text-slate-400 font-semibold uppercase">Confetti Style</div>
                            <span className="text-[7px] font-black uppercase text-blue-400">
                              {confettiStyle}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`absolute -right-3 -top-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs border shadow-lg transition-all duration-300 ${getAccentClass(accentColor, 'badge')}`}
                          style={{ transform: 'translateZ(30px)' }}
                        >
                          ⚡
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Hub widget */}
                  <div
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl text-left space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Activity className="w-4 h-4 text-rose-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Acoustic Sound Hub</h3>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal font-semibold" style={{ transform: 'translateZ(10px)' }}>
                      Play high-fidelity synthesized chime sounds. Bouncing equalizers visualize frequency pulses.
                    </p>

                    {/* Sound control block */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-900" style={{ transform: 'translateZ(15px)' }}>
                      <button
                        onClick={playPreviewChime}
                        className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Play Preview Chime
                      </button>

                      {/* Equalizer Visualizer */}
                      <div className="flex items-end gap-1 h-6">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full bg-rose-500 transition-all duration-150 ${soundWaveActive ? 'animate-equalizer h-6' : 'h-1.5'
                              }`}
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: `${0.45 + i * 0.08}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}



          {/* Real-time Badge Unlock Celebration Popup Modal */}
          {justUnlockedBadge && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
              {/* Glow Effect */}
              <div className="absolute w-[350px] h-[350px] bg-blue-500/25 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[60px] animate-pulse delay-75" />

              {/* Main Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl transform transition-all scale-100 animate-scaleUp">
                {/* Floating Sparks */}
                <div className="absolute top-4 left-4 text-amber-500 animate-bounce text-lg">✨</div>
                <div className="absolute top-8 right-6 text-blue-500 animate-pulse text-lg">⭐</div>
                <div className="absolute bottom-8 left-8 text-purple-500 animate-pulse text-lg">🔥</div>
                <div className="absolute bottom-6 right-10 text-emerald-500 animate-bounce text-lg">💡</div>

                <div className="relative z-10 flex flex-col items-center font-sans">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 mb-6 border-4 border-white dark:border-slate-800 relative animate-[spin_4s_linear_infinite]">
                    🏆
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-3 py-1 rounded-full mb-3">
                    NEW ACHIEVEMENT UNLOCKED!
                  </span>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight animate-pulse">
                    {justUnlockedBadge.name}
                  </h3>

                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 mb-4 block">
                    Level {justUnlockedBadge.level} · {justUnlockedBadge.category}
                  </span>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mb-6 font-semibold">
                    "{justUnlockedBadge.description}"
                  </p>

                  <button
                    onClick={() => {
                      setJustUnlockedBadge(null);
                      setActiveSidebarTab('badges');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer mb-2.5"
                  >
                    Go View in Achievements
                  </button>

                  <button
                    onClick={() => setJustUnlockedBadge(null)}
                    className="text-[10px] font-extrabold uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2 block cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Badge Details Modal Popup */}
          {selectedBadge && (() => {
            const isSelectedUnlocked = unlockedBadgeIds.includes(selectedBadge.id);
            const earnMethod = getBadgeEarnMethod(selectedBadge.name);
            const selectedProgress = getBadgeProgress(selectedBadge.name, isSelectedUnlocked);

            const getLevelInfo = (lvl: number) => {
              switch (lvl) {
                case 1: return { name: 'Bronze Standard', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
                case 2: return { name: 'Silver Standard', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' };
                case 3: return { name: 'Gold Standard', color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' };
                case 4: return { name: 'Platinum Elite', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
                case 5: return { name: 'Titanium Master', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' };
                default: return { name: 'Standard Badge', color: 'text-slate-400 border-slate-700 bg-slate-800/50' };
              }
            };

            const lvlInfo = getLevelInfo(selectedBadge.level);

            return (
              <div
                className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-50 flex items-center justify-center animate-fadeIn"
                onClick={() => setSelectedBadge(null)}
              >
                {/* Floating Background Sparkles */}
                <div className="absolute top-[12%] left-[8%] text-amber-500 animate-bounce text-xl pointer-events-none select-none opacity-40">✨</div>
                <div className="absolute top-[20%] right-[12%] text-blue-400 animate-pulse text-2xl pointer-events-none select-none opacity-30">⭐</div>
                <div className="absolute bottom-[15%] left-[10%] text-purple-400 animate-pulse text-xl pointer-events-none select-none opacity-40">🔥</div>
                <div className="absolute bottom-[25%] right-[8%] text-emerald-400 animate-bounce text-xl pointer-events-none select-none opacity-30">💡</div>
                <div className="absolute top-[60%] left-[5%] text-indigo-400 animate-pulse text-lg pointer-events-none select-none opacity-30">✨</div>
                <div className="absolute top-[8%] right-[45%] text-pink-400 animate-bounce text-lg pointer-events-none select-none opacity-20">⭐</div>

                {/* Modal box */}
                <div
                  className="bg-slate-900 w-full h-full text-white overflow-y-auto relative animate-scaleUp grid grid-cols-1 md:grid-cols-12 rounded-none border-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="absolute top-6 right-6 z-50 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-950 p-3.5 rounded-full border border-slate-800 transition-all duration-200 cursor-pointer active:scale-90"
                    title="Close Dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Left Column (Details Info) - Order-2 on mobile, Order-1 on desktop */}
                  <div className="md:col-span-7 p-8 sm:p-12 md:p-20 lg:p-24 flex flex-col justify-center min-h-[50vh] md:min-h-screen order-2 md:order-1 text-left font-sans">
                    <div className="max-w-xl md:mx-auto w-full space-y-8">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-full">
                          {getCategoryEmoji(selectedBadge.category)} {selectedBadge.category.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full border ${lvlInfo.color}`}>
                          Level {selectedBadge.level} · {lvlInfo.name}
                        </span>
                      </div>

                      {/* Badge Name & Desc */}
                      <div className="space-y-3">
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-heading leading-tight animate-pulse-glow">
                          {selectedBadge.name}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-400 font-semibold leading-relaxed italic">
                          "{selectedBadge.description}"
                        </p>
                      </div>

                      {/* How to Earn */}
                      <div className="space-y-3 pt-6 border-t border-slate-800/80">
                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          How it is earned
                        </h4>
                        <p className="text-sm text-slate-300 font-semibold leading-relaxed bg-slate-950/35 p-5 rounded-2xl border border-slate-800/50">
                          {earnMethod}
                        </p>
                      </div>

                      {/* Lock/Unlock Progress */}
                      {(!isSelectedUnlocked || (selectedProgress.current < selectedProgress.target)) && (
                        <div className="space-y-3 pt-4">
                          <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            <span>Unlock Progress</span>
                            <span>{selectedProgress.current} / {selectedProgress.target} {selectedProgress.label}</span>
                          </div>
                          <div className="w-full bg-slate-950 p-1 rounded-full border border-slate-800/50 overflow-hidden">
                            <div className="bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(selectedProgress.current / selectedProgress.target) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="max-w-xl md:mx-auto w-full mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setSelectedBadge(null)}
                        className="flex-1 bg-slate-800 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all active:scale-95 cursor-pointer"
                      >
                        Close Details
                      </button>
                      {!isSelectedUnlocked && (
                        <button
                          onClick={() => {
                            setSelectedBadge(null);
                            setActiveSidebarTab('learning');
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
                        >
                          Start Learning
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Badge Image) - Order-1 on mobile, Order-2 on desktop */}
                  <div className="md:col-span-5 p-8 sm:p-12 md:p-20 flex flex-col items-center justify-center bg-slate-950/40 border-b md:border-b-0 md:border-l border-slate-800/60 relative order-1 md:order-2 overflow-hidden min-h-[45vh] md:min-h-screen">
                    {/* Shimmer reflection sweep overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-reflection-sweep pointer-events-none z-20" />

                    {/* Ambient Glow */}
                    <div className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] opacity-25 pointer-events-none ${selectedBadge.level === 1 ? 'bg-emerald-500' :
                        selectedBadge.level === 2 ? 'bg-blue-500' :
                          selectedBadge.level === 3 ? 'bg-purple-500' :
                            selectedBadge.level === 4 ? 'bg-amber-500' :
                              selectedBadge.level === 5 ? 'bg-indigo-500' : 'bg-blue-500'
                      }`} />

                    <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center select-none relative z-10 animate-floatSlow">
                      {selectedBadge.image_url ? (
                        <TransparentBadgeImage
                          src={selectedBadge.image_url}
                          alt={selectedBadge.name}
                          className={`w-full h-full object-contain transition-all duration-500 ${isSelectedUnlocked
                              ? 'scale-100 drop-shadow-[0_12px_30px_rgba(16,185,129,0.35)] dark:drop-shadow-[0_12px_30px_rgba(52,211,153,0.3)]'
                              : 'scale-95 opacity-20 grayscale'
                            }`}
                        />
                      ) : (
                        <div className={`w-36 h-36 rounded-full flex items-center justify-center text-6xl border shadow-inner relative ${isSelectedUnlocked
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-600'
                          }`}>
                          <span className="z-10">{getCategoryEmoji(selectedBadge.category)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 text-center relative z-10">
                      {isSelectedUnlocked ? (
                        <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-5 py-2 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Unlocked Card
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 px-5 py-2 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <Lock className="w-3.5 h-3.5" /> Lock Status
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Confetti Explosion Overlay */}
          {showConfettiBurst && (
            <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => {
                const angle = (i / 50) * 2 * Math.PI;
                const velocity = 100 + Math.random() * 200;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity - 150;
                const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
                return (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute w-2.5 h-2.5 rounded-sm"
                    style={{
                      left: "50%",
                      top: "50%",
                      backgroundColor: colors[i % colors.length],
                    }}
                    initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      scale: [1, 0.8, 0],
                      x: tx,
                      y: [0, ty, ty + 400],
                      rotate: [0, Math.random() * 720 - 360],
                    }}
                    transition={{
                      duration: 2.5,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Mini-Lesson Challenge Modal */}
          <AnimatePresence>
            {activeChallengeNode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 30 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Glow decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Mini-Lesson Challenge</span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-0.5">{activeChallengeNode.title}</h4>
                    </div>
                    <button
                      onClick={() => setActiveChallengeNode(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Question details */}
                  {(() => {
                    const challenge = ROADMAP_CHALLENGES[activeChallengeNode.title];
                    if (!challenge) {
                      return (
                        <div className="text-center py-6 text-sm text-slate-500">
                          No mock challenge loaded for this node yet.
                        </div>
                      );
                    }

                    const selectedOption = challengeAnswers[activeChallengeNode.id];
                    const isSubmitted = challengeSubmitted[activeChallengeNode.id];
                    const isCorrect = isSubmitted && selectedOption !== undefined && parseInt(selectedOption) === challenge.correctIndex;

                    return (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {challenge.question}
                        </p>

                        <div className="space-y-2">
                          {challenge.options.map((opt, oIdx) => {
                            const isOptSelected = selectedOption === oIdx.toString();
                            let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50";

                            if (isOptSelected) {
                              if (isSubmitted) {
                                if (oIdx === challenge.correctIndex) {
                                  btnStyle = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                                } else {
                                  btnStyle = "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-600 dark:text-rose-400";
                                }
                              } else {
                                btnStyle = "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-600 dark:text-blue-400";
                              }
                            } else if (isSubmitted && oIdx === challenge.correctIndex) {
                              btnStyle = "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400";
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isSubmitted}
                                onClick={() => {
                                  setChallengeAnswers(prev => ({ ...prev, [activeChallengeNode.id]: oIdx.toString() }));
                                }}
                                className={`w-full p-3.5 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && oIdx === challenge.correctIndex && (
                                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {isSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl text-xs ${isCorrect ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'}`}
                          >
                            <p className="font-black uppercase tracking-wider mb-1">
                              {isCorrect ? "🎉 Correct! +150 XP" : "❌ Incorrect"}
                            </p>
                            <p className="leading-relaxed font-medium opacity-90">{challenge.solution}</p>
                          </motion.div>
                        )}

                        <div className="pt-2 flex gap-3">
                          {!isSubmitted ? (
                            <button
                              disabled={selectedOption === undefined}
                              onClick={() => {
                                setChallengeSubmitted(prev => ({ ...prev, [activeChallengeNode.id]: true }));
                                const isAnsCorrect = selectedOption !== undefined && parseInt(selectedOption) === challenge.correctIndex;
                                if (isAnsCorrect) {
                                  handleChallengeSuccess(activeChallengeNode);
                                }
                              }}
                              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20"
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveChallengeNode(null);
                              }}
                              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black uppercase text-xs tracking-wider rounded-2xl transition-all"
                            >
                              Close & Continue
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Celebration graphics canvas overlay */}
          {celebrationActive && <CanvasCelebration confettiStyle={confettiStyle} />}

        </div>
      </div>

    </div>
  );
}