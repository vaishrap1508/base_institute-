'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
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
  Pause,
  RotateCcw,
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
  Plus,
  GripVertical,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { DOMAINS_DATA, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import PlacementProfile from '@/components/PlacementProfile';
import DomainsTab from '@/components/DomainsTab';

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

const COMPANY_PREP_HUBS: Record<string, {
  title: string;
  desc: string;
  probability: number;
  probabilityLabel: string;
  probabilitySub: string;
  patternLabel: string;
  badges: string[];
  metrics: {
    duration: string;
    questionsCount: number;
    difficulty: string;
  };
  insights: {
    weightage: Array<{ category: string; value: number; color: string }>;
    difficulty: Array<{ level: string; value: number; color: string }>;
  };
  focusFeed: Array<{ id: string; category: string; question: string; options: string[]; correctIndex: number; solution?: string }>;
  directMocks: Array<{ id: string; title: string; desc: string; questions: number; duration: number; status: 'Open' | 'Planned' | 'Locked' }>;
}> = {
  tcs: {
    title: 'TCS NQT Preparation Hub',
    desc: 'Analyzing historical trends from 2021-2026. The current pattern emphasizes Advanced Quantitative Analysis and Psychometric Evaluation.',
    probability: 75,
    probabilityLabel: 'OPTIMAL',
    probabilitySub: 'Based on 142 past questions solved correctly.',
    patternLabel: 'Advanced Quantitative & Psychometric Focus',
    badges: ['Priority Target', 'Luminex Pulse Active', 'Top Candidate'],
    metrics: { duration: '90 Mins', questionsCount: 60, difficulty: 'Medium-High' },
    insights: {
      weightage: [
        { category: 'Numerical Ability', value: 85, color: 'bg-blue-500' },
        { category: 'Verbal Ability', value: 70, color: 'bg-emerald-500' },
        { category: 'Logical Reasoning', value: 75, color: 'bg-amber-500' },
        { category: 'Coding (Advanced)', value: 60, color: 'bg-rose-500' }
      ],
      difficulty: [
        { level: 'Easy', value: 20, color: 'bg-emerald-500' },
        { level: 'Medium', value: 60, color: 'bg-blue-500' },
        { level: 'Hard', value: 20, color: 'bg-rose-500' }
      ]
    },
    focusFeed: [
      {
        id: 'tcs_q1',
        category: 'Numerical Ability',
        question: 'The ratio of profit to investment in a partnership scheme is 3:5. If total investment is $25,000 and the duration is 1 year, what is the total profit?',
        options: ['$15,000', '$10,000', '$7,500', '$12,500'],
        correctIndex: 0,
        solution: 'Investment ratio is 5 units = $25,000, so 1 unit = $5,000. Profit ratio is 3 units = $15,000.'
      },
      {
        id: 'tcs_q2',
        category: 'Verbal Ability',
        question: 'Choose the correct preposition: She has been working at the office ____ five years.',
        options: ['since', 'for', 'from', 'during'],
        correctIndex: 1,
        solution: "'for' is used for a duration/period of time (five years)."
      },
      {
        id: 'tcs_q3',
        category: 'Logical Reasoning',
        question: 'In a row of 60 students, Raj is 15th from the left. What is his position from the right end of the row?',
        options: ['45th', '46th', '44th', '47th'],
        correctIndex: 1,
        solution: 'Right position = (Total - Left position) + 1 = (60 - 15) + 1 = 46th.'
      }
    ],
    directMocks: [
      { id: 'tcs_m1', title: 'TCS Mock #12 (Advanced)', desc: 'August 2026 pattern with new psychometric items.', questions: 60, duration: 90, status: 'Open' },
      { id: 'tcs_m2', title: 'TCS Mock #11 (Standard)', desc: 'Full length quant and reasoning test framework.', questions: 60, duration: 90, status: 'Open' },
      { id: 'tcs_m3', title: 'TCS Mock #10 (Diagnostic)', desc: 'Historical benchmark assessment.', questions: 60, duration: 90, status: 'Open' },
      { id: 'tcs_m4', title: 'TCS Mock #13 (Locked)', desc: 'High stakes exam simulator.', questions: 60, duration: 90, status: 'Locked' }
    ]
  },
  infosys: {
    title: 'Infosys SP/DSE Prep Hub',
    desc: 'Focuses heavily on algorithmic design, programming constructs, object-oriented concepts, and puzzles.',
    probability: 64,
    probabilityLabel: 'IMPROVING',
    probabilitySub: 'Based on 89 custom database queries executed.',
    patternLabel: 'Advanced Coding & Puzzle Solving',
    badges: ['Secondary Goal', 'Practice Mode Active'],
    metrics: { duration: '180 Mins', questionsCount: 5, difficulty: 'High' },
    insights: {
      weightage: [
        { category: 'Data Structures & Algos', value: 90, color: 'bg-rose-500' },
        { category: 'Mathematical Puzzles', value: 80, color: 'bg-amber-500' },
        { category: 'DBMS & Query Design', value: 70, color: 'bg-blue-500' },
        { category: 'System Architecture', value: 45, color: 'bg-emerald-500' }
      ],
      difficulty: [
        { level: 'Easy', value: 10, color: 'bg-emerald-500' },
        { level: 'Medium', value: 40, color: 'bg-blue-500' },
        { level: 'Hard', value: 50, color: 'bg-rose-500' }
      ]
    },
    focusFeed: [
      {
        id: 'info_q1',
        category: 'Data Structures',
        question: 'What is the time complexity to search an element in a balanced Binary Search Tree?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctIndex: 2,
        solution: 'A balanced BST splits the search space in half at each level, taking logarithmic time O(log n).'
      },
      {
        id: 'info_q2',
        category: 'Puzzles',
        question: 'A clock shows 3:15. What is the angle between the hour hand and the minute hand?',
        options: ['0°', '7.5°', '15°', '12.5°'],
        correctIndex: 1,
        solution: 'At 3:00, hands are 90 deg apart. In 15 minutes, hour hand moves 15 * 0.5 = 7.5 deg. So angle is 7.5°.'
      }
    ],
    directMocks: [
      { id: 'info_m1', title: 'Infosys Specialist Mock #1', desc: 'Coding-heavy test case scenarios.', questions: 3, duration: 180, status: 'Open' },
      { id: 'info_m2', title: 'Infosys DSE Standard Test', desc: 'Syllabus alignment with recent hiring tests.', questions: 5, duration: 180, status: 'Open' },
      { id: 'info_m3', title: 'Infosys Specialist Mock #2', desc: 'Graph algorithm simulation tests.', questions: 3, duration: 180, status: 'Locked' }
    ]
  },
  accenture: {
    title: 'Accenture Masterclass Prep',
    desc: 'Emphasizes analytical skills, critical reasoning, and common applications of technical aptitude.',
    probability: 88,
    probabilityLabel: 'EXCELLENT',
    probabilitySub: 'Outstanding marks across 5 active test sets.',
    patternLabel: 'Analytical & Technical Integration',
    badges: ['High Match', 'Top Tier Candidate'],
    metrics: { duration: '90 Mins', questionsCount: 75, difficulty: 'Medium' },
    insights: {
      weightage: [
        { category: 'Cognitive Assessment', value: 80, color: 'bg-emerald-500' },
        { category: 'Technical & Pseudo-code', value: 85, color: 'bg-blue-500' },
        { category: 'Network Security Basics', value: 70, color: 'bg-purple-500' },
        { category: 'MS Office Applications', value: 90, color: 'bg-amber-500' }
      ],
      difficulty: [
        { level: 'Easy', value: 30, color: 'bg-emerald-500' },
        { level: 'Medium', value: 50, color: 'bg-blue-500' },
        { level: 'Hard', value: 20, color: 'bg-rose-500' }
      ]
    },
    focusFeed: [
      {
        id: 'acc_q1',
        category: 'Pseudo-code',
        question: 'What is the value of: Integer a = 10, b = 20; a = a + b; b = a - b; a = a - b; print a, b;',
        options: ['10, 20', '20, 10', '30, -10', '10, 10'],
        correctIndex: 1,
        solution: 'This is the standard arithmetic XOR swap: a becomes 30, b becomes 10 (30 - 20), a becomes 20 (30 - 10).'
      },
      {
        id: 'acc_q2',
        category: 'Cognitive',
        question: 'Complete the sequence: 2, 6, 12, 20, 30, ____',
        options: ['40', '42', '36', '44'],
        correctIndex: 1,
        solution: 'Differences are 4, 6, 8, 10, 12. Next is 30 + 12 = 42.'
      }
    ],
    directMocks: [
      { id: 'acc_m1', title: 'Accenture Masterclass Mock #1', desc: 'Complete assessment with pseudo-code analysis.', questions: 75, duration: 90, status: 'Open' },
      { id: 'acc_m2', title: 'Accenture Cognitive Prep #1', desc: 'Timed reasoning speed drill.', questions: 50, duration: 60, status: 'Open' }
    ]
  },
  amazon: {
    title: 'Amazon AWS/SDE Prep Hub',
    desc: 'Targeted preparation for SDE-1, specializing in algorithmic complexity, concurrency, system scale, and leadership principles.',
    probability: 52,
    probabilityLabel: 'CRITICAL ZONE',
    probabilitySub: 'Requires additional hard item completions.',
    patternLabel: 'DSA Mastery & Leadership Behavior',
    badges: ['Dream Target', 'Elite Tier Challenging'],
    metrics: { duration: '120 Mins', questionsCount: 4, difficulty: 'Expert' },
    insights: {
      weightage: [
        { category: 'Algorithms & Optimizations', value: 95, color: 'bg-rose-500' },
        { category: 'System Architecture & Scale', value: 85, color: 'bg-purple-500' },
        { category: 'Object-Oriented Design', value: 75, color: 'bg-blue-500' },
        { category: 'Leadership Principles', value: 90, color: 'bg-amber-500' }
      ],
      difficulty: [
        { level: 'Easy', value: 5, color: 'bg-emerald-500' },
        { level: 'Medium', value: 25, color: 'bg-blue-500' },
        { level: 'Hard', value: 70, color: 'bg-rose-500' }
      ]
    },
    focusFeed: [
      {
        id: 'amzn_q1',
        category: 'Algorithms',
        question: 'Which scheduling approach is optimal for sorting massive datasets that do not fit in RAM?',
        options: ['Quick Sort', 'Merge Sort (External)', 'Heap Sort', 'Radix Sort'],
        correctIndex: 1,
        solution: 'External Merge Sort is a key algorithm for external sorting because it manages chunked disk IO efficiently.'
      },
      {
        id: 'amzn_q2',
        category: 'Leadership Principles',
        question: 'If you disagree with your manager on a technical architecture decision, what should you do?',
        options: [
          'Acquiesce to avoid conflict',
          'Respectfully disagree, explain your data, and commit to the final decision',
          'Escalate to the director immediately',
          'Implement your choice secretly'
        ],
        correctIndex: 1,
        solution: "Amazon's principle is: Have Backbone; Disagree and Commit."
      }
    ],
    directMocks: [
      { id: 'amzn_m1', title: 'Amazon Online Assessment #1', desc: 'Two coding items and behavioral queries.', questions: 12, duration: 120, status: 'Open' },
      { id: 'amzn_m2', title: 'Amazon System Design Simulation', desc: 'High level design mock evaluation.', questions: 2, duration: 90, status: 'Planned' }
    ]
  }
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

const LEADERBOARD_PERIOD_DATA = {
  weekly: {
    podium: [
      { rank: 1, name: 'Elena Rodriguez', xp: '28,120', accuracy: '98%', streak: '42d', avatarSeed: 'Elena' },
      { rank: 2, name: 'Marcus Chen', xp: '24,850', accuracy: '94%', streak: '18d', avatarSeed: 'Marcus' },
      { rank: 3, name: 'Julian Thorne', xp: '21,400', accuracy: '91%', streak: '12d', avatarSeed: 'Julian' }
    ],
    list: [
      { rank: '#04', name: 'Sarah Jenkins', xp: '19,820', accuracy: '89%', streak: '9d', avatarSeed: 'Sarah' },
      { rank: '#05', name: 'David Miller', xp: '18,150', accuracy: '87%', streak: '14d', avatarSeed: 'David' },
      { rank: '#1,284', name: 'You', xp: '4,920', accuracy: '82%', streak: '5d', isSelf: true },
      { rank: '#1,285', name: 'Leo Vance', xp: '4,890', accuracy: '79%', streak: '2d', avatarSeed: 'Leo' }
    ]
  },
  monthly: {
    podium: [
      { rank: 1, name: 'Rohan Sharma', xp: '98,400', accuracy: '95%', streak: '60d', avatarSeed: 'Rohan' },
      { rank: 2, name: 'Elena Rodriguez', xp: '92,120', accuracy: '97%', streak: '45d', avatarSeed: 'Elena' },
      { rank: 3, name: 'Marcus Chen', xp: '88,500', accuracy: '93%', streak: '22d', avatarSeed: 'Marcus' }
    ],
    list: [
      { rank: '#04', name: 'Kunal Kapoor', xp: '84,200', accuracy: '90%', streak: '15d', avatarSeed: 'Kunal' },
      { rank: '#05', name: 'Ananya Roy', xp: '79,800', accuracy: '88%', streak: '30d', avatarSeed: 'Ananya' },
      { rank: '#1,052', name: 'You', xp: '18,450', accuracy: '84%', streak: '12d', isSelf: true },
      { rank: '#1,053', name: 'Sriram Neppalli', xp: '17,900', accuracy: '86%', streak: '8d', avatarSeed: 'Sriram' }
    ]
  },
  global: {
    podium: [
      { rank: 1, name: 'Sriram Neppalli', xp: '245,000', accuracy: '96%', streak: '150d', avatarSeed: 'Sriram' },
      { rank: 2, name: 'Rohan Sharma', xp: '210,000', accuracy: '94%', streak: '90d', avatarSeed: 'Rohan' },
      { rank: 3, name: 'Elena Rodriguez', xp: '195,000', accuracy: '97%', streak: '85d', avatarSeed: 'Elena' }
    ],
    list: [
      { rank: '#04', name: 'Aditya Sen', xp: '180,400', accuracy: '92%', streak: '40d', avatarSeed: 'Aditya' },
      { rank: '#05', name: 'Marcus Chen', xp: '174,200', accuracy: '93%', streak: '25d', avatarSeed: 'Marcus' },
      { rank: '#984', name: 'You', xp: '45,920', accuracy: '86%', streak: '15d', isSelf: true },
      { rank: '#985', name: 'Kunal Kapoor', xp: '42,500', accuracy: '89%', streak: '18d', avatarSeed: 'Kunal' }
    ]
  }
};

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

const adjustColorBrightness = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
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
  root.style.setProperty('--clr-primary-tint', color + '20'); // 12% opacity in hex

  // Parse and set rgb
  const cleanColor = color.startsWith('#') ? color.slice(1) : color;
  const r = parseInt(cleanColor.substring(0, 2), 16);
  const g = parseInt(cleanColor.substring(2, 4), 16);
  const b = parseInt(cleanColor.substring(4, 6), 16);
  root.style.setProperty('--clr-primary-rgb', `${r}, ${g}, ${b}`);
};

const getAccentClass = (colorId: string, type: 'bg' | 'border' | 'text' | 'combined' | 'badge' | 'button' | 'ring') => {
  if (type === 'bg') return 'bg-[var(--clr-primary)]';
  if (type === 'border') return 'border-[var(--clr-primary)]';
  if (type === 'text') return 'text-[var(--clr-primary)]';
  if (type === 'badge') return 'bg-[var(--clr-primary)] border-[var(--clr-primary-dark)] text-white shadow-[0_0_15px_rgba(var(--clr-primary-rgb),0.2)]';
  if (type === 'button') return 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white shadow-lg hover:shadow-[0_0_15px_rgba(var(--clr-primary-rgb),0.25)]';
  if (type === 'ring') return 'stroke-[var(--clr-primary)]';
  return 'bg-[var(--clr-primary-tint)] border-[var(--clr-primary)]/20 text-[var(--clr-primary)] dark:bg-[var(--clr-primary-tint)] dark:border-[var(--clr-primary)]/20 dark:text-[var(--clr-primary)]';
};

const getHexColor = (colorId: string) => {
  if (colorId && colorId.startsWith('#')) return colorId;
  switch (colorId) {
    case 'emerald': return '#10B981';
    case 'purple': return '#8B5CF6';
    case 'amber': return '#F59E0B';
    case 'rose': return '#F43F5E';
    case 'orange': return '#F97316';
    case 'teal': return '#14B8A6';
    case 'indigo': return '#6366F1';
    case 'blue':
    default: return '#7075F4';
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

const tabVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabTransition = {
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1] as const,
};

const podiumContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const podiumCardVariants = {
  initial: { opacity: 0, y: 35, scale: 0.96 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 14
    }
  }
};

const tableContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

const tableRowVariants = {
  initial: { opacity: 0, x: -15 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 15
    }
  }
};

const rightSidebarVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const rightCardVariants = {
  initial: { opacity: 0, x: 20, scale: 0.97 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 110,
      damping: 15
    }
  }
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
      if (tabParam) {
        if (tabParam === 'conceptHub' || tabParam === 'practice') {
          setActiveSidebarTab('domains');
        } else if (tabParam === 'studyPlanner') {
          router.replace('/student/study-planner');
        } else if (['dashboard', 'domains', 'learning', 'mockTests', 'careerHub', 'leaderboards', 'profile', 'settings', 'badges'].includes(tabParam)) {
          setActiveSidebarTab(tabParam as any);
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setThemeMode(nextTheme);
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Syllabus Milestone Reached! 🎓', message: 'You completed the Arithmetic & Algebra core challenges.', time: '2 hours ago', read: false },
    { id: 2, title: 'New Badge Earned! 🎖️', message: "Prestige Badge 'Solving Streak' has been added to your credentials.", time: '1 day ago', read: false },
    { id: 3, title: 'Weekly Performance Sync 📊', message: 'Your curriculum readiness index improved by +5.4%.', time: '3 days ago', read: true }
  ]);
  const [streak, setStreak] = useState(14); // Simulated active streak
  const [bookmarks, setBookmarks] = useState<string[]>(['Q-8029-X']);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'domains' | 'learning' | 'studyPlanner' | 'mockTests' | 'careerHub' | 'leaderboards' | 'profile' | 'settings' | 'badges'>('dashboard');
  const [activeCompanyHub, setActiveCompanyHub] = useState<string>('tcs');
  const [answeredFeedQuestions, setAnsweredFeedQuestions] = useState<Record<string, number>>({});
  const [selectedHubInsightTab, setSelectedHubInsightTab] = useState<'breakdown' | 'pattern'>('breakdown');
  const [roadmapFilter, setRoadmapFilter] = useState<'all' | 'quant' | 'logical' | 'verbal' | 'coding'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

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
  const currentHub = useMemo(() => {
    return COMPANY_PREP_HUBS[activeCompanyHub] || COMPANY_PREP_HUBS.tcs;
  }, [activeCompanyHub]);
  // Increment practice time spent
  useEffect(() => {
    if ((activeSidebarTab as string) !== 'practice') return;
    const interval = setInterval(() => {
      setPracticeTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSidebarTab]);

  // Sticky video player scroll checker
  useEffect(() => {
    if ((activeSidebarTab as string) !== 'practice' || !activeQuestion) {
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
    // 800px vertical S-curve for the perfect isometric Mario-Kart track look
    const y = 100 + (index * 80);
    let x = 50;
    if (index % 4 === 1) x = 75;
    if (index % 4 === 3) x = 25;
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
  const [dayBadgesToShow, setDayBadgesToShow] = useState<any[] | null>(null);
  const [badgesToShowDateStr, setBadgesToShowDateStr] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, 5 is June
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(9);
  const [todayDay, setTodayDay] = useState<number | null>(null);
  const [earnedBadgesHistory, setEarnedBadgesHistory] = useState<any[]>([]);

  // Update calendar to actual current date on mount to handle hydration safely
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    setCurrentYear(year);
    setCurrentMonth(month);
    setTodayDay(day);
    setSelectedCalendarDay(day);
  }, []);

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // First day of week calculation (mapped to Mon-Sun)
  const paddingDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Sunday in JS is 0, we want it to be index 6. Monday is 1 -> 0, Tuesday is 2 -> 1, etc.
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [currentYear, currentMonth]);

  const monthYearName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    return `${month} ${currentYear}`;
  }, [currentYear, currentMonth]);

  const selectedMonthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long' });
  }, [currentYear, currentMonth]);

  // Compute active study days dynamically from history
  const streakDaysFromHistory = useMemo(() => {
    const days = new Set<number>();
    earnedBadgesHistory.forEach(item => {
      if (!item.earned_at) return;
      const d = new Date(item.earned_at);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        days.add(d.getDate());
      }
    });
    return Array.from(days);
  }, [earnedBadgesHistory, currentYear, currentMonth]);

  // Compute badges earned on each day of the current month
  const badgesByDay: Record<number, Array<{ badge: any; count: number }>> = useMemo(() => {
    const map: Record<number, Array<{ badge: any; count: number }>> = {};
    for (let d = 1; d <= 31; d++) {
      map[d] = [];
    }

    earnedBadgesHistory.forEach(item => {
      if (!item.earned_at) return;
      const dateObj = new Date(item.earned_at);
      if (dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth) {
        const dayNum = dateObj.getDate();
        const badgeDetail = badges.find(b => b.id === item.badge_id) || MOCK_BADGES_DATA.find(b => b.id === item.badge_id);
        if (badgeDetail) {
          const existing = map[dayNum]?.find(x => x.badge.id === badgeDetail.id);
          if (existing) {
            existing.count += 1;
          } else {
            if (!map[dayNum]) {
              map[dayNum] = [];
            }
            map[dayNum].push({ badge: badgeDetail, count: 1 });
          }
        }
      }
    });
    return map;
  }, [earnedBadgesHistory, badges, currentYear, currentMonth]);

  // Compute badges earned on selected calendar day with multipliers for duplicate earnings
  const badgesEarnedOnSelectedDay: Array<{ badge: any; count: number }> = useMemo(() => {
    return badgesByDay[selectedCalendarDay] || [];
  }, [badgesByDay, selectedCalendarDay]);

  // Custom Settings States
  const [dailyXpGoal, setDailyXpGoal] = useState<number>(100);
  const [tiltEnabled, setTiltEnabled] = useState<boolean>(true);
  const [confettiStyle, setConfettiStyle] = useState<'confetti' | 'fireworks' | 'none'>('confetti');
  const [soundWaveActive, setSoundWaveActive] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>('default');
  const [customColor, setCustomColor] = useState<string>('default');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('dark');
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);

  const isCustomActive = customColor !== 'default';

  // Time Tracker State (Reference 1 style)
  const [timeTrackerSeconds, setTimeTrackerSeconds] = useState<number>(5048); // Start at 01:24:08 (5048 seconds)
  const [timeTrackerIsRunning, setTimeTrackerIsRunning] = useState<boolean>(false);
  const [timerCollapsed, setTimerCollapsed] = useState<boolean>(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Sync stopwatch to localStorage
  useEffect(() => {
    let interval = null;
    if (timeTrackerIsRunning) {
      interval = setInterval(() => {
        setTimeTrackerSeconds((prev) => {
          const nextVal = prev + 1;
          localStorage.setItem('aptitude_stopwatch_seconds', nextVal.toString());
          localStorage.setItem('aptitude_stopwatch_last_time', Date.now().toString());
          return nextVal;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    localStorage.setItem('aptitude_stopwatch_running', timeTrackerIsRunning ? 'true' : 'false');
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTrackerIsRunning]);

  // Load stopwatch state from localStorage on mount
  useEffect(() => {
    const savedSeconds = localStorage.getItem('aptitude_stopwatch_seconds');
    const savedRunning = localStorage.getItem('aptitude_stopwatch_running');
    const savedLastTime = localStorage.getItem('aptitude_stopwatch_last_time');

    let initialSeconds = 5048;
    if (savedSeconds) {
      initialSeconds = parseInt(savedSeconds, 10);
    }

    if (savedRunning === 'true' && savedLastTime) {
      const elapsedMs = Date.now() - parseInt(savedLastTime, 10);
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setTimeTrackerSeconds(initialSeconds + Math.max(0, elapsedSec));
      setTimeTrackerIsRunning(true);
    } else {
      setTimeTrackerSeconds(initialSeconds);
      setTimeTrackerIsRunning(savedRunning === 'true');
    }
  }, []);

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
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'global' | 'friends'>('global');
  const [activeLeaderboardPeriod, setActiveLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'global'>('weekly');

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
    if (color === 'default') {
      setAccentColor('default');
      setCustomColor('default');
      applyBrandColor('default');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aptitude_accent_color');
        localStorage.removeItem('aptitude_custom_brand_color');
      }
    } else if (color.startsWith('#')) {
      setCustomColor(color);
      applyBrandColor(color);
      setAccentColor('custom');
      localStorage.setItem('aptitude_accent_color', 'custom');
      localStorage.setItem('aptitude_custom_brand_color', color);
    } else {
      const presetHex = getHexColor(color);
      setAccentColor(color);
      setCustomColor(presetHex);
      applyBrandColor(presetHex);
      localStorage.setItem('aptitude_accent_color', color);
      localStorage.setItem('aptitude_custom_brand_color', presetHex);
    }
  };

  const changeCustomColor = (color: string) => {
    handleAccentColorChange(color);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
      if (mode === 'system') {
        localStorage.removeItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark');
          setTheme('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setTheme('light');
        }
      } else {
        localStorage.setItem('theme', mode);
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
          setTheme('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setTheme('light');
        }
      }
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 500);
    }
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
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    } else {
      setAccentColor('default');
    }

    const savedCustomColor = localStorage.getItem('aptitude_custom_brand_color');
    if (savedCustomColor) {
      setCustomColor(savedCustomColor);
      applyBrandColor(savedCustomColor);
    } else {
      setCustomColor('default');
      applyBrandColor('default');
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeMode(storedTheme);
    } else {
      setThemeMode('system');
    }

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
          // Local storage fallback with self-healing auto-merge
          const stored = localStorage.getItem('aptitude_questions');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const parsedIds = new Set(parsed.map((q: any) => q.id));
              const missing = SAMPLE_QUESTIONS.filter(q => !parsedIds.has(q.id));
              if (missing.length > 0) {
                const merged = [...parsed, ...missing];
                localStorage.setItem('aptitude_questions', JSON.stringify(merged));
                setQuestions(merged);
              } else {
                setQuestions(parsed);
              }
            } catch (e) {
              setQuestions(SAMPLE_QUESTIONS);
            }
          } else {
            setQuestions(SAMPLE_QUESTIONS);
            localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
          }
        }
      } catch (err) {
        console.warn('Student Dashboard Supabase Sync error:', err);
        const stored = localStorage.getItem('aptitude_questions');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const parsedIds = new Set(parsed.map((q: any) => q.id));
            const missing = SAMPLE_QUESTIONS.filter(q => !parsedIds.has(q.id));
            if (missing.length > 0) {
              const merged = [...parsed, ...missing];
              localStorage.setItem('aptitude_questions', JSON.stringify(merged));
              setQuestions(merged);
            } else {
              setQuestions(parsed);
            }
          } catch (e) {
            setQuestions(SAMPLE_QUESTIONS);
          }
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

  interface SidebarTab {
    id: 'dashboard' | 'domains' | 'learning' | 'studyPlanner' | 'mockTests' | 'careerHub' | 'leaderboards' | 'badges';
    label: string;
    icon: any;
    action: 'tab' | 'nav';
    route?: string;
    subAction?: () => void;
  }

  const sidebarTabs: SidebarTab[] = [
    { id: 'domains', label: 'Domains', icon: LayoutGrid, action: 'tab' },
    { id: 'learning', label: 'Progress', icon: BookOpen, action: 'tab' },
    { id: 'studyPlanner', label: 'Study Plan', icon: Calendar, action: 'nav', route: '/student/study-planner' },
    { id: 'mockTests', label: 'Mock Tests', icon: Award, action: 'tab' },
    { id: 'careerHub', label: 'Placement Hub', icon: Briefcase, action: 'tab' },
    { id: 'leaderboards', label: 'Leaderboard Rankings', icon: Trophy, action: 'tab' },
    { id: 'badges', label: 'Badges & Achievements', icon: Sparkles, action: 'tab' }
  ];

  return (
    <div ref={mainContainerRef} className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">

      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--clr-primary)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[var(--clr-primary-dark)]/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar (Reference 2 style) */}
      <aside className="w-[76px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col items-center py-6 h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300">
        {/* Top Logo Button / Dashboard Trigger */}
        <button
          onClick={() => setActiveSidebarTab('dashboard')}
          className={`w-12 h-12 rounded-full bg-[var(--clr-primary)] text-white flex items-center justify-center shadow-md mb-8 cursor-pointer hover:scale-105 transition-all duration-300 relative group/logo border-0 outline-none`}
          title="Dashboard"
          type="button"
        >
          {activeSidebarTab === 'dashboard' && (
            <motion.div
              layoutId="activeLogoGlow"
              className="absolute -inset-1 rounded-full border-2 border-[var(--clr-primary)] opacity-40 blur-xs"
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )}
          <Layers className="w-5 h-5 relative z-10" />
        </button>

        {/* Sidebar Tabs */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full overflow-y-auto scrollbar-none py-2">
          {sidebarTabs.map((tab) => {
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

          {/* Admin Tools Section */}
          {themeMounted && currentRole?.role === 'admin' && (
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

      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-30">

        {/* Top Header (Reference 2 style) */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0 select-none">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex flex-col items-start text-left">
              <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white flex items-center gap-2">
                {activeSidebarTab === 'dashboard' ? (
                  <>Welcome back, {profile.username.split(' ')[0]} 👋</>
                ) : activeSidebarTab === 'domains' ? (
                  <>Learning Domains 🌐</>
                ) : activeSidebarTab === 'learning' ? (
                  <>Progress 🗺️</>
                ) : activeSidebarTab === 'mockTests' ? (
                  <>Placement Mock Arena 🏆</>
                ) : activeSidebarTab === 'careerHub' ? (
                  <>Company-Specific Placement Hub 🎯</>
                ) : activeSidebarTab === 'leaderboards' ? (
                  <>Placement Leaderboard 📊</>
                ) : activeSidebarTab === 'badges' ? (
                  <>Achievements & Credentials 🏅</>
                ) : activeSidebarTab === 'profile' ? (
                  <>Student Credentials ⚙️</>
                ) : (
                  <>Settings Hub ⚙️</>
                )}
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-505 font-medium mt-0.5">
                {activeSidebarTab === 'dashboard' ? (
                  'Here is your activities overview for today.'
                ) : activeSidebarTab === 'domains' ? (
                  'Select a syllabus domain to view lessons and progress.'
                ) : activeSidebarTab === 'learning' ? (
                  'Personalized step-by-step preparation path.'
                ) : activeSidebarTab === 'mockTests' ? (
                  'Prepare under simulated company timeline checks.'
                ) : activeSidebarTab === 'careerHub' ? (
                  'Interactive dashboards, exam blueprint weights, focus questions, and direct practice tests.'
                ) : activeSidebarTab === 'leaderboards' ? (
                  'Compare progress, metrics, and speeds with peers globally.'
                ) : activeSidebarTab === 'badges' ? (
                  'Celebrate preparation milestones and dynamic digital badges.'
                ) : activeSidebarTab === 'profile' ? (
                  'Review onboarding selections and active prep goals.'
                ) : (
                  'Configure advanced dashboard properties, themes, and animations.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-5">

              {/* Daily Streak Badge */}
              {activeSidebarTab === 'domains' && (
                <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/25 px-4 py-2 rounded-2xl shadow-[0_4px_12px_rgba(99,102,241,0.03)] select-none shrink-0 animate-fadeIn">
                  <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2 leading-none">
                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif" alt="flame" className="w-6 h-6 object-contain" />
                    {streak}
                  </span>
                </div>
              )}

              {/* Search Input Box */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={activeSidebarTab === 'leaderboards' ? "Search topics, questions, or concepts..." : "Search something..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-60 md:w-80 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-400"
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
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${(!themeMounted || currentRole?.role !== 'admin')
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
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${(themeMounted && currentRole?.role === 'admin')
                      ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  Edit / Admin
                </button>
              </div>

              {/* Notification & Avatar profile access */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="System Notifications"
                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-550 dark:text-slate-400 relative hover:scale-105 active:scale-95 transition-all cursor-pointer ${showNotifications ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                      >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</span>
                          {notifications.some(n => !n.read) && (
                            <button
                              onClick={() => {
                                setNotifications(notifications.map(n => ({ ...n, read: true })));
                              }}
                              className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer border-0 bg-transparent p-0"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-[10px] font-medium">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                                }}
                                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-left relative ${!n.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}
                              >
                                {!n.read && (
                                  <span className="absolute top-4.5 left-2.5 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                                )}
                                <div className="pl-3.5 space-y-1">
                                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{n.title}</h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">{n.message}</p>
                                  <span className="text-[8px] text-slate-450 dark:text-slate-500 font-semibold block">{n.time}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setActiveSidebarTab('profile')}
                  title="View Student Profile"
                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {profile.avatar && profile.avatar !== 'initial' ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>
          </div>
        </header>

        <div ref={scrollablePanelRef} className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between ${
          layoutDensity === 'compact' ? 'p-4' : layoutDensity === 'spacious' ? 'p-10' : 'p-6 sm:p-8'
        }`}>


          {/* ====================================================================
              1. TAB: DASHBOARD (Duolingo Redesign Layout)
              ==================================================================== */}
          <AnimatePresence mode="wait">
            {activeSidebarTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabTransition}
                className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 dark:text-slate-200"
              >

              {/* Admin Banner Alert */}
              {themeMounted && currentRole?.role === 'admin' && (
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

                      {/* Card 1: Quantitative Aptitude */}
                      <div className={isCustomActive
                        ? "bg-[var(--clr-primary)]/10 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-48 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl transition-all duration-355 ease-out group"
                        : "bg-[#E6F4F8] dark:bg-[#0B303E]/30 border border-[#CDE5EE] dark:border-[#1E4E5D]/30 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-48 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl transition-all duration-355 ease-out group"
                      }>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight font-heading leading-tight">
                            Quantitative<br />Aptitude
                          </h3>
                          {/* Diagonal Arrow button */}
                          <button
                            onClick={() => {
                              setActiveSidebarTab('domains');
                              setSelectedDomain('quant');
                            }}
                            className="w-10 h-10 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-600 -rotate-45" />
                          </button>
                        </div>

                        <div className="flex justify-start items-end mt-auto">
                          <button
                            onClick={() => {
                              setActiveSidebarTab('domains');
                              setSelectedDomain('quant');
                            }}
                            className={isCustomActive
                              ? "px-4 py-2 bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                              : "px-4 py-2 bg-[#1E4E5D] hover:bg-[#153A45] text-white dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] dark:text-[#0B303E] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                            }
                          >
                            Continue Last Topic
                          </button>
                        </div>
                      </div>

                      {/* Card 2: Logical Reasoning */}
                      <div className={isCustomActive
                        ? "bg-[var(--clr-primary)]/8 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/15 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-48 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl transition-all duration-355 ease-out group"
                        : "bg-[#FDF2F8] dark:bg-[#3B1229]/20 border border-[#FBCFE8] dark:border-[#652047]/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-48 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl transition-all duration-355 ease-out group"
                      }>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight font-heading leading-tight">
                            Logical<br />Reasoning
                          </h3>
                          <button
                            onClick={() => {
                              setActiveSidebarTab('domains');
                              setSelectedDomain('logical');
                            }}
                            className="w-10 h-10 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-600 -rotate-45" />
                          </button>
                        </div>

                        <div className="flex justify-start items-end mt-auto">
                          <button
                            onClick={() => {
                              setActiveSidebarTab('domains');
                              setSelectedDomain('logical');
                            }}
                            className={isCustomActive
                              ? "px-4 py-2 bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                              : "px-4 py-2 bg-[#9D174D] hover:bg-[#83103F] text-white dark:bg-[#F472B6] dark:hover:bg-[#EC4899] dark:text-[#500724] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                            }
                          >
                            Continue Last Topic
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* "Learning progress" Section (Reference 2 style) */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">Learning progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* Completed Stat */}
                      <div className={isCustomActive
                        ? "bg-[var(--clr-primary)]/10 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/20 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                        : "bg-[#E6F4F1] dark:bg-[#112F28]/30 border border-[#C7E9E1] dark:border-[#205D4F]/30 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                      }>
                        <div className="space-y-1.5 text-left">
                          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Completed</span>
                          <span className={isCustomActive ? "text-2xl font-black text-[var(--clr-primary)] font-mono leading-none" : "text-2xl font-black text-[#065F46] dark:text-[#34D399] font-mono leading-none"}>{solvedCount} Modules</span>
                        </div>
                        <div className={isCustomActive
                          ? "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[var(--clr-primary)]/20 flex items-center justify-center text-[var(--clr-primary)] -rotate-45 group-hover:scale-105 transition-transform"
                          : "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#C7E9E1] dark:border-[#205D4F]/30 flex items-center justify-center text-[#065F46] dark:text-[#34D399] -rotate-45 group-hover:scale-105 transition-transform"
                        }>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Your Streak Stat */}
                      <div className={isCustomActive
                        ? "bg-[var(--clr-primary)]/8 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/15 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                        : "bg-[#FEF3C7] dark:bg-[#3D2C08]/20 border border-[#FDE68A] dark:border-[#6B4E0E]/20 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                      }>
                        <div className="space-y-1.5 text-left">
                          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Your Streak</span>
                          <span className={isCustomActive ? "text-2xl font-black text-[var(--clr-primary)] font-mono leading-none" : "text-2xl font-black text-[#92400E] dark:text-[#FBBF24] font-mono leading-none"}>{streak} Days</span>
                        </div>
                        <div className={isCustomActive
                          ? "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[var(--clr-primary)]/15 flex items-center justify-center text-[var(--clr-primary)] -rotate-45 group-hover:scale-105 transition-transform"
                          : "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#FDE68A] dark:border-[#6B4E0E]/20 flex items-center justify-center text-[#92400E] dark:text-[#FBBF24] -rotate-45 group-hover:scale-105 transition-transform"
                        }>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Active Stat */}
                      <div className={isCustomActive
                        ? "bg-[var(--clr-primary)]/5 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/10 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                        : "bg-[#F3E8FF] dark:bg-[#2A154D]/20 border border-[#E9D5FF] dark:border-[#53289E]/20 p-8 h-36 rounded-2xl flex items-center justify-between hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group"
                      }>
                        <div className="space-y-1.5 text-left">
                          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Active Level</span>
                          <span className={isCustomActive ? "text-2xl font-black text-[var(--clr-primary)] font-mono leading-none" : "text-2xl font-black text-[#6B21A8] dark:text-[#C084FC] font-mono leading-none"}>Lvl 12 (#14)</span>
                        </div>
                        <div className={isCustomActive
                          ? "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[var(--clr-primary)]/10 flex items-center justify-center text-[var(--clr-primary)] -rotate-45 group-hover:scale-105 transition-transform"
                          : "w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#E9D5FF] dark:border-[#53289E]/20 flex items-center justify-center text-[#6B21A8] dark:text-[#C084FC] -rotate-45 group-hover:scale-105 transition-transform"
                        }>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>

                    </div>

                    {/* Large Yellow Active concept banner (Reference 2 style) */}
                    <div 
                      className={isCustomActive
                        ? "bg-[var(--clr-primary)]/5 dark:bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/15 rounded-3xl p-8 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-355 ease-out cursor-pointer"
                        : "bg-[#FFFBEB] dark:bg-[#251E0E]/40 border border-[#FEF3C7] dark:border-[#4B3B18]/30 rounded-3xl p-8 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-355 ease-out cursor-pointer"
                      }
                      onClick={() => setActiveSidebarTab('domains')}
                    >
                      <div className="space-y-3 text-left flex-1 w-full">
                        <div className="flex items-center gap-2">
                          <span className={isCustomActive
                            ? "bg-[var(--clr-primary)]/10 dark:bg-[var(--clr-primary)]/10 border border-[var(--clr-primary)]/20 text-[var(--clr-primary)] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                            : "bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                          }>
                            Active Track Unit
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">QUANTITATIVE APTITUDE</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase leading-snug">
                          Percentages → Profit & Loss
                        </h3>
 
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <span>Concept Completion</span>
                            <span className="font-mono">{challengeCompletedCount} / 15 solved lessons</span>
                          </div>
                          <div className="w-full bg-slate-200/60 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={isCustomActive ? "bg-[var(--clr-primary)] h-full rounded-full transition-all duration-500" : "bg-amber-500 h-full rounded-full transition-all duration-500"}
                              style={{ width: `${(challengeCompletedCount / 15) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
 
                      {/* Large diagonal arrow button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSidebarTab('domains');
                        }}
                        className={isCustomActive
                          ? "w-12 h-12 rounded-full bg-[var(--clr-primary)] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer self-end md:self-center"
                          : "w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer self-end md:self-center"
                        }
                      >
                        <ChevronRight className="w-6 h-6 text-white -rotate-45" />
                      </button>
                    </div>

                  </div>

                </div>

                {/* Right Column (4 cols): Activity Calendar, Opportunities & Time Tracker */}
                <div className="lg:col-span-4 space-y-8">

                  {/* 1. Activity Calendar Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-7 shadow-xs text-left">
                    <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-100 dark:border-slate-900/60">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Activity Calendar</h3>
                      <span className="text-xs font-bold text-slate-500">{monthYearName}</span>
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

                      {/* Dates grid for current month/year */}
                      <div className="grid grid-cols-7 gap-y-3.5 gap-x-2 text-center text-xs font-bold text-slate-700 dark:text-slate-400">
                        {/* Padding days */}
                        {[...Array(paddingDays)].map((_, i) => (
                          <div key={`pad-${i}`} className="w-10 h-10" />
                        ))}
                        {/* Actual days */}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const dateNum = i + 1;

                          // Streak/active study dates from dynamic history
                          const isStreakDay = streakDaysFromHistory.includes(dateNum);
                          const isToday = dateNum === todayDay;
                          const isSelected = selectedCalendarDay === dateNum;

                          let dateStyles = "w-10 h-10 flex items-center justify-center mx-auto rounded-full transition-all cursor-pointer focus:outline-none ";

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

                          const dayBadges = badgesByDay[dateNum] || [];
                          const distinctBadgeCount = dayBadges.length;

                          const hasBadges = distinctBadgeCount > 0;
                          return (
                            <button
                              key={dateNum}
                              suppressHydrationWarning
                              onClick={() => {
                                setSelectedCalendarDay(dateNum);
                                if (hasBadges) {
                                  setDayBadgesToShow(dayBadges);
                                  setBadgesToShowDateStr(`${monthYearName} ${dateNum}`);
                                }
                              }}
                              title={hasBadges 
                                ? `${monthYearName} ${dateNum}: ${dayBadges.map(db => db.badge.name).join(', ')}`
                                : `${monthYearName} ${dateNum}${isStreakDay ? ' (Practice Completed)' : ''}`
                              }
                              className="relative focus:outline-none w-10 h-10 mx-auto flex items-center justify-center cursor-pointer group"
                              type="button"
                            >
                              <span suppressHydrationWarning className={`${dateStyles} relative overflow-hidden flex items-center justify-center`}>
                                {hasBadges ? (
                                  dayBadges[0].badge.image_url ? (
                                    <TransparentBadgeImage 
                                      src={dayBadges[0].badge.image_url} 
                                      alt="" 
                                      className="w-8 h-8 object-contain rounded-full" 
                                    />
                                  ) : (
                                    <span className="text-xl">{getCategoryEmoji(dayBadges[0].badge.category)}</span>
                                  )
                                ) : (
                                  dateNum
                                )}
                              </span>
                              {isStreakDay && !hasBadges && (
                                <span suppressHydrationWarning className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              )}
                              {hasBadges && distinctBadgeCount > 1 && (
                                <span suppressHydrationWarning className="absolute -bottom-1 -right-1.5 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-full text-[7.5px] font-black px-1.5 h-3.5 shadow-md border border-white dark:border-slate-900 select-none">
                                  x{distinctBadgeCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>



                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {activeSidebarTab === 'domains' && (
            <motion.div
              key="domains"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full"
            >
              <DomainsTab searchQuery={searchQuery} customColor={customColor} />
            </motion.div>
          )}



          {activeSidebarTab === 'learning' && (
            <motion.div
              key="learning"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full relative py-12 px-4 sm:px-8 rounded-[2.5rem] bg-white border border-slate-200 dark:bg-[#0A0F1C] dark:border-[#1E293B] shadow-2xl transition-all duration-300"
            >

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



              {/* Stats Panel Widget (Circular Progress Ring & XP Counter) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8 relative z-10">
                {/* Progress Ring Card */}
                <div className="p-4 flex items-center gap-4 justify-center">
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
                <div className="p-4 flex items-center gap-4 justify-center">
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
                <div className="p-4 flex items-center justify-center">
                  <div className="flex items-center gap-2 select-none shrink-0">
                    <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2 leading-none">
                      <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif" alt="flame" className="w-6 h-6 object-contain" />
                      {streak}
                    </span>
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



                const rawSegmentPaths = [];
                for (let i = 0; i < nodesList.length - 1; i++) {
                  const start = getNodeCoords(i);
                  const end = getNodeCoords(i + 1);

                  // Scale x by 10 for the 1000px SVG coordinate space
                  const sx = start.x * 10;
                  const ex = end.x * 10;

                  // Calculate control points for a smooth top-to-bottom S-curve
                  const cp1x = sx;
                  const cp1y = start.y + 40;
                  const cp2x = ex;
                  const cp2y = end.y - 40;

                  rawSegmentPaths.push(`M ${sx},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${end.y}`);
                }

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

                // Construct motion path for the orb by joining the exact Bezier segments
                const activeIndex = nodesList.findIndex((n: any) => n.status === 'active');
                const pathEndIndex = activeIndex !== -1 ? activeIndex : 0;
                const completedSegments = rawSegmentPaths.slice(0, pathEndIndex);
                
                const startCoords = getNodeCoords(0);
                const startX = startCoords.x * 10;
                const motionPath = completedSegments.length > 0
                  ? completedSegments.join(' ')
                  : `M ${startX},${startCoords.y} L ${startX},${startCoords.y}`;

                return (
                  <div
                    className="relative w-full max-w-4xl mx-auto h-[800px] select-none mt-8 mb-24 transition-all duration-500 ease-out"
                  >

                    {/* SVG Curve Canvas */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(var(--clr-primary-rgb),0.3)]" viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="completed-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="active-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="var(--clr-primary)" />
                        </linearGradient>
                        <linearGradient id="active-flow-grad" x1="0" y1="0" x2="100%" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="50%" stopColor="var(--clr-primary)" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                        <filter id="active-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="var(--clr-primary)" floodOpacity="0.5" />
                        </filter>
                        <filter id="completed-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.35" />
                        </filter>
                      </defs>



                      {/* 3D Road Side Extrusion (Thick Depth Edge) */}
                      {segments.map((seg, i) => (
                        <path
                          key={`extrusion-${i}`}
                          d={seg.d}
                          strokeWidth="28"
                          strokeLinecap="round"
                          className="stroke-slate-200 dark:stroke-[#0B1221]/80 translate-y-4"
                        />
                      ))}

                      {/* Main Base Shadow below the road */}
                      {segments.map((seg, i) => (
                        <path
                          key={`shadow-${i}`}
                          d={seg.d}
                          strokeWidth="34"
                          strokeLinecap="round"
                          className="stroke-black/50 blur-sm translate-y-6"
                        />
                      ))}

                      {/* Base Inactive Track - Always visible */}
                      {segments.map((seg, i) => (
                        <path
                          key={`base-path-${i}`}
                          d={seg.d}
                          fill="none"
                          stroke={theme === 'light' ? '#CBD5E1' : '#1E293B'}
                          strokeWidth="28"
                          strokeLinecap="round"
                        />
                      ))}

                      {/* Main Surface Path - Animated Drawing Overlay */}
                      {segments.map((seg, i) => {
                        if (seg.status === 'locked') return null;

                        let strokeColor = "url(#completed-grad)";
                        let filter = "url(#completed-glow)";

                        if (seg.status === 'active-transition') {
                          strokeColor = "url(#active-flow-grad)";
                          filter = "url(#active-glow)";
                        }

                        return (
                          <motion.path
                            key={`path-${i}`}
                            d={seg.d}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="28"
                            strokeLinecap="round"
                            filter={filter}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.8, ease: "easeInOut" }}
                          />
                        );
                      })}

                      {/* SVG Animations */}
                      <style>{`
                        @keyframes flowDash {
                          to { stroke-dashoffset: -20; }
                        }
                        .animate-dash-flow {
                          animation: flowDash 1s linear infinite;
                        }
                      `}</style>

                      {/* White Dashed Center Line (Mario-Kart style) */}
                      {segments.map((seg, i) => {
                        const isLocked = seg.status === 'locked';
                        
                        if (isLocked) {
                          return (
                            <path
                              key={`dash-${i}`}
                              d={seg.d}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray="8 12"
                              className="opacity-20"
                            />
                          );
                        }

                        return (
                          <motion.path
                            key={`dash-${i}`}
                            d={seg.d}
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="8 12"
                            className="animate-dash-flow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ duration: 0.5, delay: (i * 0.8) + 0.2 }}
                          />
                        );
                      })}



                      {/* Animated Traveling Glow Orb along the completed path */}
                      {completedSegments.length > 0 && (
                        <circle r="6" fill="var(--clr-primary)" className="filter drop-shadow-[0_0_8px_rgba(var(--clr-primary-rgb),0.8)]">
                          <animateMotion
                             dur="5s"
                             repeatCount="indefinite"
                             path={motionPath}
                           />
                         </circle>
                       )}
                    </svg>



                    {/* HTML Nodes overlay */}
                    {nodesList.map((node: any, index: number) => {
                      const { x, y } = getNodeCoords(index);
                      const isCompleted = node.status === 'completed';
                      const isActive = node.status === 'active';
                      const isLocked = node.status === 'locked';
                      const isJustUnlocked = justUnlockedNodeId === node.id;

                      const zElevation = isActive ? 35 : isCompleted ? 20 : 5;
                      const cardPlacement = index === 2 || index === 4 || index === 6 ? 'top' : (index % 4 === 1 || index === 8) ? 'right' : 'left';

                      return (
                        <div
                          key={node.id}
                          className="absolute flex flex-col items-center z-10 group"
                          style={{
                            left: `${x}%`,
                            top: `${y}px`,
                            transform: `translate(-50%, -50%)`,
                            zIndex: zElevation,
                          }}
                        >

                          {/* Pulsing Active glow */}
                          {isActive && (
                            <motion.div
                              className="absolute w-20 h-20 rounded-full bg-[var(--clr-primary)]/30 dark:bg-[var(--clr-primary)]/20 blur-md pointer-events-none"
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
                              boxShadow: "0px 10px 25px rgba(var(--clr-primary-rgb), 0.3)"
                            } : {}}
                            initial={isJustUnlocked ? { scale: 0.8 } : false}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none cursor-pointer ${isCompleted
                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-b-4 border-emerald-700 text-white shadow-[0_4px_0_#047857,0_6px_12px_rgba(16,185,129,0.15)] hover:border-b-[6px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2'
                                : isActive
                                  ? 'bg-gradient-to-tr from-[var(--clr-primary)] to-[var(--clr-primary-dark)] border-b-[6px] border-[var(--clr-primary-dark)] text-white shadow-[0_6px_0_var(--clr-primary-dark),0_8px_16px_rgba(var(--clr-primary-rgb),0.25)] hover:border-b-[8px] hover:brightness-110'
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

                          {/* Minimalist Dark Info Card matching Screenshot */}
                          <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center bg-white dark:bg-[#0B1221] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all text-center min-w-[140px] max-w-[160px] pointer-events-none ${
                            cardPlacement === 'top'
                              ? 'bottom-[calc(100%+12px)] lg:bottom-[calc(100%+16px)]'
                              : `top-[calc(100%+12px)] lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 ${
                                  cardPlacement === 'left'
                                    ? 'lg:right-[calc(100%+16px)] lg:left-auto'
                                    : 'lg:left-[calc(100%+16px)] lg:right-auto'
                                }`
                          } ${isActive ? 'ring-2 ring-[var(--clr-primary)]/50 shadow-[0_0_20px_rgba(var(--clr-primary-rgb),0.2)]' : ''}`}>
                            <span className="text-[10px] font-black text-slate-800 dark:text-white block uppercase tracking-wider leading-none mb-1">{node.title}</span>
                            <span className="text-[8px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight">{node.desc}</span>
                            {isActive && (
                              <span className="text-[7.5px] text-[var(--clr-primary)] font-black block mt-0.5">75% Complete</span>
                            )}
                          </div>

                          {/* Locked node warning tooltip */}
                          {isLocked && (
                            <div className="absolute top-16 text-center bg-white dark:bg-slate-950 text-slate-800 dark:text-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md w-36 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                              <span className="text-[9px] font-black block uppercase tracking-wide">Locked Unit</span>
                              <span className="text-[7.5px] text-slate-500 dark:text-slate-400 font-semibold block leading-tight mt-0.5">Complete previous unit to unlock</span>
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

            </motion.div>
          )}



          {/* ====================================================================
              4. TAB: MOCK TESTS (Assessments center)
              ==================================================================== */}
          {activeSidebarTab === 'mockTests' && (
            <motion.div
              key="mockTests"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full space-y-8"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">Available Mock Assessments</span>
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
            </motion.div>
          )}

          {activeSidebarTab === 'careerHub' && (
            <motion.div
                key="careerHub"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={tabTransition}
                className="w-full space-y-8 select-none text-left"
              >
                {/* Header row & selector */}
                <div className="flex justify-start gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-widest shrink-0">Select Target:</span>
                    <select
                      value={activeCompanyHub}
                      onChange={(e) => {
                        setActiveCompanyHub(e.target.value);
                        playPreviewChime();
                        setToastMsg(`Switched target hub to ${e.target.value.toUpperCase()}! 🎯`);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--clr-primary)] cursor-pointer shadow-sm"
                      style={{ colorScheme: theme }}
                    >
                      <option value="tcs">TCS NQT Prep Hub</option>
                      <option value="infosys">Infosys SP/DSE Prep Hub</option>
                      <option value="accenture">Accenture Masterclass</option>
                      <option value="amazon">Amazon AWS/SDE Prep Hub</option>
                    </select>
                  </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT WIDE PANEL (8 cols) */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* HUB HERO BLOCK */}
                    <div className="bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-xl shadow-slate-950/20 text-left border border-slate-800">
                      {/* Background design elements */}
                      <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-tr from-[var(--clr-primary)]/10 to-[var(--clr-primary)]/20 blur-2xl rounded-full pointer-events-none" />
                      <div className="space-y-4 relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                          {currentHub.title}
                        </h3>

                        <div className="pt-2 flex flex-wrap items-center gap-6 text-slate-350 font-mono text-[10.5px]">
                          <span>Duration: <strong className="text-white font-extrabold">{currentHub.metrics.duration}</strong></span>
                          <span>•</span>
                          <span>Total Items: <strong className="text-white font-extrabold">{currentHub.metrics.questionsCount} Qs</strong></span>
                          <span>•</span>
                          <span>Difficulty: <strong className="text-white font-extrabold">{currentHub.metrics.difficulty}</strong></span>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button
                            onClick={() => {
                              playPreviewChime();
                              setToastMsg("Resuming preparation checkpoints!");
                            }}
                            className="py-3 px-6 bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[var(--clr-primary-tint)]/25 cursor-pointer border-0"
                          >
                            Resume Preparation
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PATTERN BREAKDOWN & EXAM INSIGHTS */}
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 backdrop-blur-md space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-4 gap-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                          Exam Blueprint & Metrics
                        </h4>
                        
                        {/* Selector Toggles */}
                        <div className="inline-flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-900/60 relative">
                          <button
                            onClick={() => setSelectedHubInsightTab('breakdown')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                              selectedHubInsightTab === 'breakdown'
                                ? 'bg-slate-800 text-white dark:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                            }`}
                          >
                            Syllabus Breakdown
                          </button>
                          <button
                            onClick={() => setSelectedHubInsightTab('pattern')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                              selectedHubInsightTab === 'pattern'
                                ? 'bg-slate-800 text-white dark:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                            }`}
                          >
                            Exam Pattern Insights
                          </button>
                        </div>
                      </div>

                      {selectedHubInsightTab === 'breakdown' ? (
                        <div className="space-y-4">
                          {currentHub.insights.weightage.map((item) => (
                            <div key={item.category} className="space-y-1.5 text-left">
                              <div className="flex justify-between items-center text-[10.5px] font-bold">
                                <span className="text-slate-700 dark:text-slate-355">{item.category}</span>
                                <span className="text-slate-900 dark:text-white font-extrabold">{item.value}% Focus Weightage</span>
                              </div>
                              <div className="w-full bg-slate-50 dark:bg-slate-955 h-2.5 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900/60 p-0.5">
                                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                          
                          {/* Weightage Distribution */}
                          <div className="space-y-4">
                            <span className="text-[9px] font-black font-mono text-slate-405 dark:text-slate-500 uppercase tracking-widest block animate-fadeIn">Question Weightage Distribution</span>
                            <div className="h-6 w-full flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                              <div className="bg-blue-500 flex items-center justify-center text-[8.5px] font-black text-white" style={{ width: '50%' }}>50% ARITHMETIC</div>
                              <div className="bg-emerald-500 flex items-center justify-center text-[8.5px] font-black text-white" style={{ width: '20%' }}>20% VERBAL</div>
                              <div className="bg-amber-500 flex items-center justify-center text-[8.5px] font-black text-white" style={{ width: '30%' }}>30% LOGICAL</div>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono">
                              <span>Arithmetic</span>
                              <span>Verbal Ability</span>
                              <span>Logical Reasoning</span>
                            </div>
                          </div>

                          {/* Difficulty Distribution */}
                          <div className="space-y-4">
                            <span className="text-[9px] font-black font-mono text-slate-405 dark:text-slate-500 uppercase tracking-widest block">Difficulty Spread</span>
                            <div className="h-6 w-full flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                              {currentHub.insights.difficulty.map((d) => (
                                <div key={d.level} className={`${d.color} flex items-center justify-center text-[8.5px] font-black text-white`} style={{ width: `${d.value}%` }}>
                                  {d.value}% {d.level.toUpperCase()}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-455 font-mono">
                              <span>Easy</span>
                              <span>Medium</span>
                              <span>Hard</span>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* CURATED FOCUS FEED */}
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 backdrop-blur-md space-y-6">
                      <div className="border-b border-slate-100 dark:border-slate-900/60 pb-3 text-left">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                          Curated Focus Feed
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Solve dynamic questions tailored precisely to your selected target's pattern.
                        </p>
                      </div>

                      <div className="space-y-6 text-left">
                        {currentHub.focusFeed.map((q) => {
                          const userAns = answeredFeedQuestions[q.id];
                          const hasAnswered = userAns !== undefined;
                          
                          return (
                            <div key={q.id} className="p-5 bg-slate-50/50 dark:bg-slate-955/30 border border-slate-200/60 dark:border-slate-850 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[8px] font-black font-mono border px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
                                  {q.category}
                                </span>
                                {hasAnswered && (
                                  <span className={`text-[8.5px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                                    userAns === q.correctIndex
                                      ? 'bg-emerald-500/10 text-emerald-500'
                                      : 'bg-red-500/10 text-red-500'
                                  }`}>
                                    {userAns === q.correctIndex ? 'Correct' : 'Incorrect'}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-slate-850 dark:text-white leading-normal">
                                {q.question}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = userAns === oIdx;
                                  const isCorrect = oIdx === q.correctIndex;
                                  
                                  let buttonStyle = 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-100/50 dark:hover:bg-slate-800/50';
                                  if (hasAnswered) {
                                    if (isCorrect) {
                                      buttonStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-450';
                                    } else if (isSelected) {
                                      buttonStyle = 'bg-red-500/15 border-red-500 text-red-650 dark:text-red-400';
                                    } else {
                                      buttonStyle = 'bg-white dark:bg-slate-900 border-slate-200/30 dark:border-slate-800/40 text-slate-400 opacity-60';
                                    }
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={hasAnswered}
                                      onClick={() => {
                                        setAnsweredFeedQuestions({
                                          ...answeredFeedQuestions,
                                          [q.id]: oIdx
                                        });
                                        if (oIdx === q.correctIndex) {
                                          playPreviewChime();
                                          setSolvedCount(prev => prev + 1);
                                          setToastMsg("Correct answer! Heatmap activity registered. 🏆");
                                        } else {
                                          setToastMsg("Incorrect. Review the solution details below.");
                                        }
                                      }}
                                      className={`py-2.5 px-4 rounded-xl border text-[11px] font-bold text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 ${buttonStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {hasAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                      {hasAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {hasAnswered && q.solution && (
                                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[10.5px] text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-955/20 p-3 rounded-xl leading-relaxed animate-fadeIn">
                                  <strong className="text-slate-700 dark:text-slate-350">Solution:</strong> {q.solution}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT PANEL (4 cols) */}
                  <div className="lg:col-span-4 space-y-8">
                    
                    {/* SUCCESS PROBABILITY Radial gauge card */}
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-md">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono text-left">
                        Success Probability
                      </span>

                      {/* Radial Gauge */}
                      <div className="relative flex items-center justify-center py-2">
                        <svg className="w-36 h-36 transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="56"
                            className="stroke-slate-100 dark:stroke-slate-800"
                            strokeWidth="9"
                            fill="transparent"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="56"
                            className="stroke-[var(--clr-primary)]"
                            strokeWidth="9"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 56}
                            strokeDashoffset={2 * Math.PI * 56 * (1 - currentHub.probability / 100)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
                            {currentHub.probability}%
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-[var(--clr-primary)] uppercase mt-1 leading-none">
                            {currentHub.probabilityLabel}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block uppercase">Probability Score</span>
                        <span className="text-[9px] font-mono text-slate-450 dark:text-slate-500 block leading-tight">{currentHub.probabilitySub}</span>
                      </div>

                      <button
                        onClick={() => {
                          playPreviewChime();
                          setToastMsg("Success probabilities boosted! Focus stats updated.");
                        }}
                        className="w-full py-3 px-4 bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[var(--clr-primary-tint)]/25 cursor-pointer border-0"
                      >
                        Boost Score
                      </button>
                    </div>

                    {/* DIRECT MOCKS */}
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[2rem] p-6 md:p-8 text-left space-y-4">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest block font-mono">
                        Direct Mocks
                      </span>

                      <div className="space-y-3.5">
                        {currentHub.directMocks.map((mock) => {
                          const isLocked = mock.status === 'Locked';
                          return (
                            <div key={mock.id} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-3 relative group">
                              <div className="space-y-0.5 text-left truncate flex-1">
                                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase truncate flex items-center gap-1.5">
                                  {isLocked && <Lock className="w-3 h-3 text-slate-400" />} {mock.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-505 truncate font-semibold leading-tight">{mock.desc}</p>
                                <p className="text-[8px] text-slate-455 font-mono uppercase tracking-wider">{mock.questions} Qs · {mock.duration} Mins</p>
                              </div>
                              <button
                                disabled={isLocked}
                                onClick={() => {
                                  playPreviewChime();
                                  setToastMsg(`Starting simulator: ${mock.title}!`);
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg shrink-0 border-0 ${
                                  isLocked
                                    ? 'bg-slate-205 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white cursor-pointer shadow-sm shadow-[var(--clr-primary-tint)]/20'
                                }`}
                              >
                                {isLocked ? 'Locked' : 'Take'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>

              </motion.div>
          )}

          {/* ====================================================================
              5. TAB: LEADERBOARDS
              ==================================================================== */}
          {activeSidebarTab === 'leaderboards' && (
            <motion.div
              key="leaderboards"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full text-left"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Columns (8 of 12) - Main Podium & Rankings List */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Period Sub-tabs Selector */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 w-fit">
                    {(['weekly', 'monthly', 'global'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setActiveLeaderboardPeriod(period)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          activeLeaderboardPeriod === period
                            ? isCustomActive
                              ? 'bg-[var(--clr-primary)] text-white shadow-md shadow-[var(--clr-primary)]/10'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Podium Section (Rank 2, 1, 3) */}
                  <motion.div 
                    variants={podiumContainerVariants}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-3 gap-4 items-end pt-6"
                  >
                    
                    {/* Rank 2 */}
                    <motion.div 
                      variants={podiumCardVariants}
                      className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 text-center flex flex-col items-center relative shadow-xs min-h-[220px] hover:-translate-y-1 hover:shadow-md transition-all duration-300 group/podium2"
                    >
                      <span className="absolute -top-3.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-850 font-mono">
                        Rank 2
                      </span>
                      <div className="relative w-16 h-16 rounded-full border-2 border-slate-350 dark:border-slate-700 p-0.5 mt-2 transition-transform duration-300 group-hover/podium2:scale-105">
                        <img
                           src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].avatarSeed}`}
                          alt={LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].name}
                          className="w-full h-full rounded-full object-cover bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-3 truncate w-full">
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].name}
                      </span>
                      <span className="text-[11px] font-black text-emerald-500 font-mono mt-0.5">
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].xp} XP
                      </span>
                      <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-slate-105 dark:border-slate-900/60 text-[10px]">
                        <div>
                          <div className="text-slate-400 dark:text-slate-505 font-bold uppercase text-[8px]">ACC.</div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].accuracy}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 dark:text-slate-505 font-bold uppercase text-[8px]">STREAK</div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[1].streak}</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Rank 1 - Center Elevated & Glowing */}
                    <motion.div 
                      variants={podiumCardVariants}
                      className={`bg-white dark:bg-slate-900/60 rounded-3xl p-5 text-center flex flex-col items-center relative shadow-lg min-h-[250px] scale-[1.05] z-10 hover:-translate-y-1.5 transition-all duration-300 group/podium1 ${
                        isCustomActive
                          ? 'border border-[var(--clr-primary)]/40 shadow-[var(--clr-primary)]/5 dark:shadow-[var(--clr-primary)]/30'
                          : 'border border-purple-200 dark:border-purple-900/40 shadow-purple-500/5 dark:shadow-purple-950/30'
                      }`}
                    >
                      {/* Floating sparkles graphics */}
                      <div className="absolute top-2.5 left-2.5 text-xs opacity-50 select-none animate-pulse">✨</div>
                      <div className="absolute top-4 right-3 text-[9px] opacity-40 select-none animate-bounce delay-100">⭐</div>
                      <div className="absolute bottom-6 left-3 text-[9px] opacity-40 select-none animate-bounce">⭐</div>
                      <div className="absolute bottom-3 right-4.5 text-xs opacity-50 select-none animate-pulse">✨</div>
                      
                      {/* Purple background glow */}
                      <div className={`absolute -inset-1 rounded-[28px] opacity-[0.06] blur-xl group-hover/podium1:opacity-15 transition duration-500 pointer-events-none ${
                        isCustomActive
                          ? 'bg-[var(--clr-primary)]'
                          : 'bg-gradient-to-tr from-purple-600 via-indigo-650 to-pink-500'
                      }`} />

                      <span className={`absolute -top-3.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono ${
                        isCustomActive
                          ? 'bg-[var(--clr-primary)] text-white border border-[var(--clr-primary)]/20 shadow-[0_0_12px_rgba(var(--clr-primary-rgb),0.3)]'
                          : 'bg-gradient-to-r from-purple-600 via-pink-550 to-indigo-600 text-white border border-purple-400/20 shadow-[0_0_12px_rgba(147,51,234,0.3)]'
                      }`}>
                        Rank 1
                      </span>
                      
                      <div className="relative mt-2">
                        {/* Rotating dynamic color halo */}
                        <span className={`absolute -inset-1.5 rounded-full animate-[spin_8s_linear_infinite] opacity-65 blur-xs group-hover/podium1:opacity-85 ${
                          isCustomActive
                            ? 'bg-[var(--clr-primary)]'
                            : 'bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600'
                        }`} />
                        <div className={`relative w-20 h-20 rounded-full p-0.5 bg-slate-900 dark:bg-slate-950 overflow-hidden ${
                          isCustomActive
                            ? 'border-2 border-[var(--clr-primary)]'
                            : 'border-2 border-purple-400 dark:border-purple-450'
                        }`}>
                          <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].avatarSeed}`}
                            alt={LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].name}
                            className="w-full h-full rounded-full object-cover bg-slate-50 dark:bg-slate-950"
                          />
                        </div>
                      </div>

                      <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white mt-3 truncate w-full">
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].name}
                      </span>
                      <span className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                        isCustomActive
                          ? 'text-[var(--clr-primary)]'
                          : 'text-purple-650 dark:text-purple-400'
                      }`}>
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].xp} XP
                      </span>
                      <div className={`grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t text-[10px] ${
                        isCustomActive
                          ? 'border-[var(--clr-primary)]/20'
                          : 'border-purple-100 dark:border-purple-950/30'
                      }`}>
                        <div>
                          <div className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[8px]">ACC.</div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].accuracy}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[8px]">STREAK</div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[0].streak}</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Rank 3 */}
                    <motion.div 
                      variants={podiumCardVariants}
                      className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 text-center flex flex-col items-center relative shadow-xs min-h-[220px] hover:-translate-y-1 hover:shadow-md transition-all duration-300 group/podium3"
                    >
                      <span className="absolute -top-3.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30 font-mono">
                        Rank 3
                      </span>
                      <div className="relative w-16 h-16 rounded-full border-2 border-orange-350 dark:border-orange-800/50 p-0.5 mt-2 transition-transform duration-300 group-hover/podium3:scale-105">
                        <img
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].avatarSeed}`}
                          alt={LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].name}
                          className="w-full h-full rounded-full object-cover bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-3 truncate w-full">
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].name}
                      </span>
                      <span className="text-[11px] font-black text-orange-650 dark:text-orange-400 font-mono mt-0.5">
                        {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].xp} XP
                      </span>
                      <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-slate-105 dark:border-slate-900/60 text-[10px]">
                        <div>
                          <div className="text-slate-400 dark:text-slate-505 font-bold uppercase text-[8px]">ACC.</div>
                          <div className="font-extrabold text-slate-805 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].accuracy}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 dark:text-slate-505 font-bold uppercase text-[8px]">STREAK</div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].podium[2].streak}</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Rankings Table */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left min-w-[500px]">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-900/60 text-[10px] text-slate-450 dark:text-slate-500 uppercase font-black font-mono">
                            <th className="py-3.5 px-4 w-20">Rank</th>
                            <th className="py-3.5 px-4">Name</th>
                            <th className="py-3.5 px-4 text-center">XP Score</th>
                            <th className="py-3.5 px-4 text-center">Accuracy</th>
                            <th className="py-3.5 px-4 text-center">Streak</th>
                          </tr>
                        </thead>
                        <motion.tbody 
                          variants={tableContainerVariants}
                          initial="initial"
                          animate="animate"
                          className="divide-y divide-slate-100/50 dark:divide-slate-900/30 text-xs"
                        >
                          {LEADERBOARD_PERIOD_DATA[activeLeaderboardPeriod].list.map((row, idx) => {
                            if (row.isSelf) {
                              return (
                                <motion.tr 
                                  key={idx} 
                                  variants={tableRowVariants}
                                  className={isCustomActive
                                    ? "bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/25 dark:bg-[var(--clr-primary)]/10 dark:border-[var(--clr-primary)]/30 text-[var(--clr-primary)] font-extrabold relative shadow-inner"
                                    : "bg-purple-500/5 border border-purple-500/25 dark:bg-purple-950/10 dark:border-purple-900/30 text-purple-900 dark:text-purple-300 font-extrabold relative shadow-inner"
                                  }
                                >
                                  <td className={isCustomActive ? "py-4 px-4 font-mono font-black text-[var(--clr-primary)]" : "py-4 px-4 font-mono font-black text-purple-600 dark:text-purple-400"}>
                                    {row.rank}
                                  </td>
                                  <td className="py-4 px-4 flex items-center gap-3">
                                    <div className={isCustomActive ? "w-7 h-7 rounded-full bg-[var(--clr-primary)]/10 flex items-center justify-center border border-[var(--clr-primary)]/20 shrink-0 overflow-hidden relative" : "w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/45 flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0 overflow-hidden relative"}>
                                      {profile.avatar && profile.avatar !== 'initial' ? (
                                        <img src={profile.avatar} alt="You" className="w-full h-full object-cover" />
                                      ) : (
                                        <User className={isCustomActive ? "w-4 h-4 text-[var(--clr-primary)]" : "w-4 h-4 text-purple-600 dark:text-purple-400"} />
                                      )}
                                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-950" />
                                    </div>
                                    <span className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                      {profile.username}
                                      <span className={isCustomActive ? "text-[9px] font-black uppercase tracking-wider bg-[var(--clr-primary)] text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse" : "text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse"}>
                                        YOU
                                      </span>
                                    </span>
                                  </td>
                                  <td className={isCustomActive ? "py-4 px-4 text-center font-mono font-black text-[var(--clr-primary)]" : "py-4 px-4 text-center font-mono font-black text-purple-600 dark:text-purple-400"}>
                                    {animatedXp > 0 ? animatedXp.toLocaleString() : row.xp}
                                  </td>
                                  <td className="py-4 px-4 text-center font-mono font-black text-emerald-505">
                                    {row.accuracy}
                                  </td>
                                  <td className={isCustomActive ? "py-4 px-4 text-center font-mono font-black text-[var(--clr-primary)]" : "py-4 px-4 text-center font-mono font-black text-purple-500"}>
                                    {streak}d
                                  </td>
                                </motion.tr>
                              );
                            }
                            
                            return (
                              <motion.tr 
                                key={idx} 
                                variants={tableRowVariants}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                              >
                                <td className="py-4 px-4 font-mono font-bold text-slate-450 dark:text-slate-500">
                                  {row.rank}
                                </td>
                                <td className="py-4 px-4 font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                    <img
                                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${row.avatarSeed}`}
                                      alt={row.name}
                                      className="w-full h-full object-cover bg-slate-50 dark:bg-slate-950"
                                    />
                                  </div>
                                  {row.name}
                                </td>
                                <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-350">
                                  {row.xp}
                                </td>
                                <td className="py-4 px-4 text-center font-mono font-extrabold text-emerald-500">
                                  {row.accuracy}
                                </td>
                                <td className="py-4 px-4 text-center font-mono font-bold text-slate-500">
                                  {row.streak}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </motion.tbody>
                      </table>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-900/60 text-center">
                      <button className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer tracking-wider">
                        View More Rankings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column (4 of 12) - Sidebar statistics */}
                <motion.div 
                  variants={rightSidebarVariants}
                  initial="initial"
                  animate="animate"
                  className="lg:col-span-4 space-y-6"
                >
                  
                  {/* Tier promotion Card */}
                  <motion.div 
                    variants={rightCardVariants}
                    className={`border rounded-3xl p-5 shadow-xs text-left relative overflow-hidden space-y-4 group/promocard ${
                      isCustomActive
                        ? 'bg-gradient-to-br from-[var(--clr-primary)]/20 via-slate-950/90 to-slate-950 border-[var(--clr-primary)]/30'
                        : 'bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-950 border border-indigo-900/50'
                    }`}
                  >
                    {/* Glowing effect behind promotion card */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl pointer-events-none group-hover/promocard:scale-110 transition-transform ${
                      isCustomActive
                        ? 'bg-[var(--clr-primary)]/20'
                        : 'bg-purple-500/15'
                    }`} />
                    
                    <div className={`absolute right-4 top-4 w-7 h-7 rounded-lg flex items-center justify-center text-xs group-hover/promocard:rotate-12 transition-transform duration-300 ${
                      isCustomActive
                        ? 'bg-[var(--clr-primary)]/10 border border-[var(--clr-primary)]/30'
                        : 'bg-indigo-500/15 border border-indigo-500/35'
                    }`}>
                      🏆
                    </div>
                    
                    <div className="space-y-1.5 max-w-[85%]">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        Keep it up, {profile.username.split(' ')[0]}!
                      </h4>
                      <p className={`text-[10px] leading-relaxed font-semibold ${
                        isCustomActive
                          ? 'text-slate-300'
                          : 'text-indigo-205'
                      }`}>
                        You're in the <span className="text-white font-black">top 5%</span> this week! 1,200 more XP to reach the next tier.
                      </p>
                    </div>

                    <button
                      onClick={() => alert("Keep leveling up to advance tier standing!")}
                      className={`w-full py-2.5 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer text-center active:scale-98 ${
                        isCustomActive
                          ? 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)]'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      }`}
                    >
                      View Progress Detail
                    </button>
                  </motion.div>

                  {/* Friends Activity Card */}
                  <motion.div 
                    variants={rightCardVariants}
                    className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs space-y-4 text-left"
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono block">
                      Friends Activity
                    </span>
                    
                    <div className="space-y-4 mt-3">
                      {/* Friend 1 */}
                      <div className="flex gap-3 text-left group/friend1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono font-black text-[9px] text-slate-655 dark:text-slate-350 shrink-0 relative">
                          ST
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-950 animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-snug">
                            <span className="font-extrabold text-slate-900 dark:text-white transition-colors duration-250 group-hover/friend1:text-blue-500">S. Taylor</span> just climbed 5 spots
                          </p>
                          <span className="text-[9px] text-slate-405 font-medium block">2 mins ago</span>
                        </div>
                      </div>

                      {/* Friend 2 */}
                      <div className="flex gap-3 text-left group/friend2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono font-black text-[9px] text-slate-655 dark:text-slate-350 shrink-0 relative">
                          JW
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-950" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-snug">
                            <span className="font-extrabold text-slate-900 dark:text-white transition-colors duration-250 group-hover/friend2:text-purple-500">J. Wu</span> earned 500 XP in <span className="font-extrabold text-slate-900 dark:text-white">'Logic'</span>
                          </p>
                          <span className="text-[9px] text-slate-405 font-medium block">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ====================================================================
              7. TAB: PROFILE (Editable settings form)
              ==================================================================== */}
          {activeSidebarTab === 'profile' && (
            <motion.div
              key="profile"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full"
            >
              <PlacementProfile
                profile={profile}
                setProfile={setProfile}
                handleProfileSave={handleProfileSave}
                saveSuccess={saveSuccess}
                setSaveSuccess={setSaveSuccess}
                customColor={customColor}
                changeCustomColor={changeCustomColor}
                themeMode={themeMode}
                handleThemeChange={handleThemeChange}
              />
            </motion.div>
          )}

          {/* ====================================================================
              7.5. TAB: ACHIEVEMENTS & BADGES
              ==================================================================== */}
          {activeSidebarTab === 'badges' && (
            <motion.div
              key="badges"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full space-y-8 text-slate-800 dark:text-slate-200"
            >
              <div className="space-y-6">
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
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====================================================================
              8. TAB: SETTINGS (Theme configuration & credentials)
              ==================================================================== */}
          {activeSidebarTab === 'settings' && (
            <motion.div
              key="settings"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
              className="w-full space-y-8 text-slate-800 dark:text-slate-200"
            >



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

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {([
                          { id: 'default', label: 'Default', bg: 'bg-gradient-to-tr from-[#3B82F6] via-[#8B5CF6] to-[#10B981]', activeClass: 'border-slate-300 dark:border-slate-700' },
                          { id: 'emerald', label: 'Emerald', bg: 'bg-[#10B981]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'purple', label: 'Cyberpunk', bg: 'bg-[#8B5CF6]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'amber', label: 'Amber', bg: 'bg-[#F59E0B]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'rose', label: 'Crimson', bg: 'bg-[#F43F5E]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'orange', label: 'Sunset', bg: 'bg-[#F97316]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'teal', label: 'Teal', bg: 'bg-[#14B8A6]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' },
                          { id: 'indigo', label: 'Indigo', bg: 'bg-[#6366F1]', activeClass: 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)]' }
                        ]).map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleAccentColorChange(color.id)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer justify-center ${accentColor === color.id
                                ? `${color.activeClass} shadow-md`
                                : 'bg-transparent border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                              }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${color.bg} shrink-0`} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{color.label}</span>
                          </button>
                        ))}

                        {/* Custom Color Picker Swatch */}
                        <div className={`relative flex items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer justify-center ${accentColor === 'custom'
                            ? 'border-[var(--clr-primary)]/50 bg-[var(--clr-primary-tint)] text-[var(--clr-primary)] shadow-md'
                            : 'bg-transparent border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                          }`} title="Choose custom color">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-wider">Custom</span>
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => handleAccentColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
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

            </motion.div>
          )}
        </AnimatePresence>



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
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-heading leading-tight">
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
                    {!isSelectedUnlocked && (
                      <div className="max-w-xl md:mx-auto w-full mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => {
                            setSelectedBadge(null);
                            setActiveSidebarTab('learning');
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
                        >
                          Start Learning
                        </button>
                      </div>
                    )}
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

                    {/* Lock Status / Unlocked Card pill badge removed */}
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

          {/* Calendar Day Badges List Modal */}
          <AnimatePresence>
            {dayBadgesToShow && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setDayBadgesToShow(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 30 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setDayBadgesToShow(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Activity Calendar</span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mt-1">Badges Earned</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono uppercase">{badgesToShowDateStr}</p>
                  </div>

                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {dayBadgesToShow.map(({ badge, count }) => (
                      <div
                        key={badge.id}
                        onClick={() => {
                          setSelectedBadge(badge);
                          setDayBadgesToShow(null);
                        }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-2xl cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            {badge.image_url ? (
                              <img src={badge.image_url} alt="" className="w-6 h-6 object-contain rounded-lg" />
                            ) : (
                              <span className="text-lg">{getCategoryEmoji(badge.category)}</span>
                            )}
                          </div>
                          <div className="text-left leading-tight">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                              {badge.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{badge.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-extrabold group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Celebration graphics canvas overlay */}
          {celebrationActive && <CanvasCelebration confettiStyle={confettiStyle} />}

        </div>
      </div>

      {/* Floating Time Tracker */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={mainContainerRef}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50 flex items-center bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-700/40 dark:border-slate-800/40 text-white shadow-2xl select-none"
        style={{ borderRadius: '9999px' }}
      >
        {timerCollapsed ? (
          // Collapsed state: simple round icon
          <button
            onClick={() => setTimerCollapsed(false)}
            className="w-12 h-12 flex items-center justify-center relative rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
            title="Expand Time Tracker"
            type="button"
          >
            <Clock className="w-5 h-5 text-white" />
            <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-slate-900 dark:border-slate-950 ${
              timeTrackerIsRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`} />
          </button>
        ) : (
          // Expanded state: pill container
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-350 p-0.5 transition-colors">
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Status Dot */}
            <span className={`w-2 h-2 rounded-full ${
              timeTrackerIsRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`} />

            {/* Time Readout */}
            <div className="flex flex-col text-left">
              <span className="font-mono text-xs font-black tracking-tight leading-none text-white">
                {formatTimeTracker(timeTrackerSeconds)}
              </span>
              <span className="text-[7.5px] text-slate-400 uppercase font-black tracking-wider mt-0.5 leading-none">
                {timeTrackerIsRunning ? "Studying" : "Paused"}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 ml-1 border-l border-slate-700/50 pl-2">
              <button
                onClick={() => setTimeTrackerIsRunning(!timeTrackerIsRunning)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  timeTrackerIsRunning
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
                title={timeTrackerIsRunning ? "Pause Session" : "Start Study"}
                type="button"
              >
                {timeTrackerIsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  setTimeTrackerIsRunning(false);
                  setTimeTrackerSeconds(0);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer text-slate-300 hover:text-white"
                title="Reset Session"
                type="button"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {/* Collapse Button */}
              <button
                onClick={() => setTimerCollapsed(true)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer text-slate-400 hover:text-white"
                title="Minimize"
                type="button"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dynamic Toast Feedback alerts */}
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