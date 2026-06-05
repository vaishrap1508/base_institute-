'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Users, 
  FileCheck, 
  ChevronDown, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  X,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink,
  Briefcase,
  Target,
  Check,
  CheckCircle2,
  Award,
  Zap,
  Flame,
  BookOpen,
  BarChart3,
  Trophy,
  Quote,
  Sun,
  Moon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLandingStats, recalculateLandingStats, LandingStats } from '@/lib/admin/landingStats';

// ==========================================
// TYPES FOR DYNAMIC CONTENT
// ==========================================
interface FAQItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
  tag?: string;
}

interface MarqueeImage {
  url: string;
  caption: string;
  category: string;
}

interface LandingPageContent {
  hero_title: string;
  hero_subtitle: string;
  hero_paragraph: string;
  hero_btn_primary: string;
  hero_btn_secondary: string;
  cta_title: string;
  cta_subtitle: string;
  cta_btn_primary: string;
  cta_btn_secondary: string;
  faq_items: FAQItem[];
  marquee_images_row1: MarqueeImage[];
  marquee_images_row2: MarqueeImage[];
  mentor_name: string;
  mentor_designation: string;
  mentor_bio: string;
  mentor_message: string;
  mentor_image: string;
  mentor_badge_1: string;
  mentor_badge_2: string;
  mentor_badge_3: string;
  mentor_badge_4: string;
  curriculum_title_1: string;
  curriculum_desc_1: string;
  curriculum_mock_1: 'scale' | 'workspace' | 'milestones' | 'assessment' | 'none';
  curriculum_title_2: string;
  curriculum_desc_2: string;
  curriculum_mock_2: 'scale' | 'workspace' | 'milestones' | 'assessment' | 'none';
  curriculum_title_3: string;
  curriculum_desc_3: string;
  curriculum_mock_3: 'scale' | 'workspace' | 'milestones' | 'assessment' | 'none';
  curriculum_title_4: string;
  curriculum_desc_4: string;
  curriculum_mock_4: 'scale' | 'workspace' | 'milestones' | 'assessment' | 'none';
  
  // New Dynamic Content Fields
  header_logo_text: string;
  header_logo_subtext: string;
  header_btn_text: string;
  bento_title: string;
  bento_desc: string;
  curriculum_title: string;
  curriculum_desc: string;
  mentor_heading: string;
  faq_title: string;
  faq_desc: string;
  footer_badge_text: string;
  footer_copyright: string;
}

// ==========================================
// DEFAULT HIGH-FIDELITY PRESETS
// ==========================================
const DEFAULT_CONTENT: LandingPageContent = {
  hero_title: 'MASTER APTITUDE WITH THE KINETIC PLATFORM',
  hero_subtitle: 'TRUSTED BY 100K+ STUDENTS AND EMPLOYEES',
  hero_paragraph: "Experience 'No-Compiler' learning speed. A structured roadmap designed to take you from fundamentals to company-specific readiness in record time.",
  hero_btn_primary: 'Start Preparing for Free',
  hero_btn_secondary: 'Watch Platform Demo',
  cta_title: 'Ready to bridge the gap to your dream offer?',
  cta_subtitle: 'Join 2 lakh students who have already transformed their preparation journey.',
  cta_btn_primary: 'Get Free Access Now',
  cta_btn_secondary: 'Contact Support',
  faq_items: [
    // General
    { id: 'faq-1', category: 'general', tag: 'Technology', question: 'What does "No-Compiler" speed mean?', answer: 'Our proprietary engine compiles mathematical stems and LaTeX formulas instantly without traditional server-side rendering, allowing students to iterate through solutions 10x faster.' },
    { id: 'faq-2', category: 'general', tag: 'Eligibility', question: 'Is the platform neutral for all engineering branches?', answer: 'Yes, quantitative reasoning, analytical deduction, and reading comprehension are universal evaluation benchmarks required across all core technical fields.' },
    { id: 'faq-3', category: 'general', tag: 'Registration', question: 'Are there any seats involved for individual students?', answer: 'No, our sandbox environment is fully open to independent learners. You can register and begin testing immediately.' },
    { id: 'faq-11', category: 'general', tag: 'Placements', question: 'What companies hire candidates using this platform?', answer: 'Top product engineering giants (like Amazon, Goldman Sachs) and service-based recruitment firms (like TCS, Accenture, Capgemini) validate mock scores and syllabi from our platform.' },
    { id: 'faq-12', category: 'general', tag: 'Security', question: 'How secure is my academic performance data?', answer: 'All test telemetry, dashboard metrics, and onboarding profiles are encrypted and stored securely using Supabase Auth and strict database Row-Level Security (RLS) policies.' },
    
    // Course & Curriculum
    { id: 'faq-4', category: 'curriculum', tag: 'Roadmap', question: 'How does the adaptive learning roadmap work?', answer: 'The roadmap tracks your strengths and weaknesses across Quant, Logical, and Verbal topics, automatically serving questions matching your target timeline and commitment level.' },
    { id: 'faq-5', category: 'curriculum', tag: 'Syllabus', question: 'What topics are covered in the quantitative syllabus?', answer: 'We cover all key placement topics including Percentages, Time & Work, Time & Distance, Profit & Loss, Permutations & Combinations, and Data Interpretation.' },
    { id: 'faq-6', category: 'curriculum', tag: 'Core Feature', question: 'Can I bookmark questions for offline review?', answer: 'Yes, you can bookmark any question and add custom notes. Bookmarks are saved to your profile and synchronized across all your devices.' },
    { id: 'faq-13', category: 'curriculum', tag: 'Explanations', question: 'Are there detailed explanations for complex math questions?', answer: 'Yes, each brainteaser is backed by step-by-step mathematical breakdowns and visual logic workflows created by our lead instructors.' },
    { id: 'faq-14', category: 'curriculum', tag: 'Coding', question: 'Does the platform support programming and coding preparation?', answer: 'Yes, while the primary focus is on core quantitative reasoning, the advanced syllabus includes data structures, algorithmic design questions, and pseudocode challenges.' },

    // Campus Sync
    { id: 'faq-7', category: 'sync', tag: 'Institutional', question: 'How does the college sync feature work?', answer: 'Colleges sync their student directories to administer live placement tests, track weekly progress, and analyze visual mock performance graphs in staging environments.' },
    { id: 'faq-8', category: 'sync', tag: 'Administration', question: 'Can administrators schedule custom placement tests?', answer: 'Yes, college placement cells and administrators can select topics, set timers, and deploy tests to specific cohorts with instant reporting.' },
    { id: 'faq-15', category: 'sync', tag: 'Integrity', question: 'How does the live proctoring sandbox function?', answer: 'Our proctoring sandbox monitors tab switching, browser focus loss, and completion speeds to ensure high assessment integrity for institutional placement drives.' },
    { id: 'faq-16', category: 'sync', tag: 'Reports', question: 'Is there a way to export student test scores to CSV/Excel?', answer: 'Yes, administrators can download comprehensive performance reports, including speed, accuracy, and ranking statistics, directly from their dashboard.' },

    // Account & Support
    { id: 'faq-9', category: 'support', tag: 'Updates', question: 'Will I get access to new features and content in the future?', answer: 'Absolutely. We regularly update the question catalog and release new interactive modules. All future updates are included.' },
    { id: 'faq-10', category: 'support', tag: 'Helpdesk', question: 'How do I contact technical support?', answer: 'You can contact support directly from your dashboard or click the "Contact Support" CTA in the footer area to open a direct ticket channel.' },
    { id: 'faq-17', category: 'support', tag: 'Account', question: 'Can I change my registered email or account profile?', answer: 'Account emails are managed securely via Supabase Auth. Profile details, such as full name and university, can be modified inside the Onboarding / Settings tab.' },
    { id: 'faq-18', category: 'support', tag: 'Pricing', question: 'Is there a subscription fee or corporate trial?', answer: 'Independent learners get free access. Colleges and institutions can contact our team to set up a dedicated workspace for their student cohorts.' }
  ],
  marquee_images_row1: [
    { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80', caption: 'Interactive Seminar', category: 'Student Interactions' },
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80', caption: 'Live Hackathon', category: 'Workshops' },
    { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', caption: 'Classroom Activity', category: 'Empowering Campuses' },
    { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80', caption: 'Placement Success', category: 'Mass Impact' }
  ],
  marquee_images_row2: [
    { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80', caption: 'Campus Mentorship', category: 'Empowering Campuses' },
    { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80', caption: 'Technical Placement Training', category: 'Workshops' },
    { url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80', caption: 'Corporate Board Meeting', category: 'Corporate Ties' },
    { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80', caption: 'Big Tech Conference', category: 'Placement Drives' }
  ],
  mentor_name: 'Vaibhav Sharma',
  mentor_designation: 'Founder & CEO, Kinetic Platform',
  mentor_bio: "Hello, I'm Vaibhav Sharma.\nFounder and creator of Kinetic Platform.\nI built this platform to simplify aptitude, verbal ability, and placement preparation through structured learning paths and practical problem solving.\nWhether you're preparing for placements, competitive exams, or simply improving your aptitude skills, this platform is designed to guide you step by step.",
  mentor_message: 'Remember:\nConsistency beats intensity.\nSmall daily improvements create long-term success.',
  mentor_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  mentor_badge_1: '🏆 Founder',
  mentor_badge_2: '🎯 Placement Mentor',
  mentor_badge_3: '📚 Aptitude Trainer',
  mentor_badge_4: '⭐ Industry Experience',
  curriculum_title_1: 'Mass Impact',
  curriculum_desc_1: 'Personalized technical learning maps configured to benchmark and scale performance across large cohorts of students simultaneously.',
  curriculum_mock_1: 'scale',
  curriculum_title_2: 'Student Interactions',
  curriculum_desc_2: 'Engaging campuses across standard learning metrics to elevate logical aptitude via interactive question sets and solution analytics.',
  curriculum_mock_2: 'workspace',
  curriculum_title_3: 'Live Workshops',
  curriculum_desc_3: 'Structured syllabus mapping targeted at real-time recruitment paradigms for core banking, services, and product-focused placement rounds.',
  curriculum_mock_3: 'milestones',
  curriculum_title_4: 'Mock Assessments',
  curriculum_desc_4: 'Evaluate readiness with adaptive timing evaluations that simulate actual company workflows, validating speed constraints under high pressure.',
  curriculum_mock_4: 'assessment',
  
  // Dynamic Logo & Global Copy Defaults
  header_logo_text: 'KINETIC PLATFORM',
  header_logo_subtext: 'APTITUDE AI',
  header_btn_text: 'Join for Free',
  bento_title: 'EMPOWERING CAMPUSES',
  bento_desc: 'Interactive workshops, dynamic learning roadmaps, and campus placements engineered to accelerate talent.',
  curriculum_title: 'Curriculum Roadmap',
  curriculum_desc: 'Experience the structured syllabus pathway. Drag sliders, solve sample logic equations, select milestones, and trigger staging mocks in real time.',
  mentor_heading: 'Your Mentor, Not Just A Platform Owner',
  faq_title: 'Frequently Asked Questions',
  faq_desc: 'Have questions about our syllabus, adaptive mock tests, or sandbox staging environments? Find answers below.',
  footer_badge_text: 'Operational Clearance: Sandbox Encrypted',
  footer_copyright: '© 2026 Aptitude AI platform. All rights reserved.'
};

const DEFAULT_UNIVERSITIES = [
  'Vellore Institute of Technology',
  'SRM University',
  'BITS Pilani',
  'Amity University',
  'KIIT Bhubaneswar'
];

interface DemoQuestion {
  topic: string;
  id: string;
  question: string;
  steps: string[];
  resultPreview: string;
  resultExtra: string;
  answerCard: string;
  company: string;
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    topic: 'QUANT • TIME & DISTANCE',
    id: 'Q-7142-M',
    question: 'Two trains of lengths 190m and 210m are running in opposite directions at 50 km/h and 30 km/h respectively.',
    steps: [
      '\\text{Relative Speed} = V_1 + V_2',
      '\\text{Relative Speed} = 50 + 30 = 80 \\text{ km/h}',
      '80 \\times \\frac{5}{18} = \\frac{200}{9} \\text{ m/s}'
    ],
    resultPreview: 'Relative Speed = 50 + 30 = 80 km/h',
    resultExtra: '80 × 5/18 = 200/9 m/s',
    answerCard: 'Time to cross = (190 + 210) / (200/9) = 18 seconds',
    company: 'Accenture'
  },
  {
    topic: 'QUANT • PERCENTAGES',
    id: 'Q-1049-E',
    question: "A's salary is 20% less than B's salary. By how much percent is B's salary more than A's?",
    steps: [
      '\\text{Let B\'s Salary} = 100',
      '\\text{A\'s Salary} = 100 - 20 = 80',
      '\\text{Increase \\%} = \\frac{20}{80} \\times 100 = 25\\%'
    ],
    resultPreview: 'A = 80, B = 100',
    resultExtra: 'Difference = 20',
    answerCard: "B's salary is 25% more than A's",
    company: 'TCS'
  },
  {
    topic: 'QUANT • PROFIT & LOSS',
    id: 'Q-3829-H',
    question: 'An article is sold for $300 at a profit of 25%. What was the cost price of the article?',
    steps: [
      '\\text{Selling Price (SP)} = \\$300',
      '\\text{SP} = \\text{CP} \\times (1 + \\text{Profit \\%})',
      '\\text{CP} = \\frac{300}{1.25} = \\$240'
    ],
    resultPreview: 'Profit = 25%',
    resultExtra: 'SP = 1.25 × CP',
    answerCard: 'Cost Price (CP) = $240',
    company: 'Capgemini'
  },
  {
    topic: 'QUANT • TIME & WORK',
    id: 'Q-5210-M',
    question: 'A can do a work in 10 days and B in 15 days. If they work together, in how many days will they finish the work?',
    steps: [
      '\\text{Work Rate} = R_A + R_B',
      'R_{total} = \\frac{1}{10} + \\frac{1}{15} = \\frac{5}{30} = \\frac{1}{6}',
      '\\text{Days} = \\frac{1}{R_{total}} = 6 \\text{ days}'
    ],
    resultPreview: 'Rates: 1/10 & 1/15',
    resultExtra: 'Combined Rate = 1/6 per day',
    answerCard: 'Total Time = 6 days',
    company: 'Infosys'
  },
  {
    topic: 'QUANT • PROBABILITY',
    id: 'Q-9481-H',
    question: 'A bag contains 5 red and 3 blue balls. If two balls are drawn at random, what is the probability that both are red?',
    steps: [
      'n(S) = \\binom{8}{2} = 28',
      'n(E) = \\binom{5}{2} = 10',
      'P(E) = \\frac{10}{28} = \\frac{5}{14}'
    ],
    resultPreview: 'Total: 8 balls, Select 2',
    resultExtra: 'Red: 5, Blue: 3',
    answerCard: 'Probability = 5/14 ≈ 35.7%',
    company: 'Wipro'
  },
  {
    topic: 'QUANT • AVERAGES',
    id: 'Q-2041-E',
    question: 'The average age of 24 students and their teacher is 16 years. If the teacher age is excluded, average decreases by 1 year.',
    steps: [
      '\\text{Total Sum} = 25 \\times 16 = 400',
      '\\text{Excluded Sum} = 24 \\times 15 = 360',
      '\\text{Teacher\'s Age} = 400 - 360 = 40'
    ],
    resultPreview: 'Total Age = 400, Excluded = 360',
    resultExtra: 'Average drops from 16 to 15',
    answerCard: "Teacher's Age = 40 years",
    company: 'Accenture'
  }
];
const FIRST_NAMES = ['Kushagra', 'Anusha', 'Rohan', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Nisha', 'Siddharth', 'Ananya', 'Rahul', 'Divya', 'Aditya', 'Tanvi', 'Abhishek', 'Kirti', 'Manish', 'Neha', 'Sanjay', 'Pooja', 'Arjun', 'Shruti', 'Rishi', 'Meera'];
const LAST_NAMES = ['Sahay', 'Jha', 'Mehta', 'Sharma', 'Patel', 'Reddy', 'Malhotra', 'Gupta', 'Rao', 'Verma', 'Kumar', 'Teja', 'Joshi', 'Choudhury', 'Singh', 'Nair', 'Mishra', 'Sen', 'Garg', 'Bose', 'Kapoor', 'Deshmukh', 'Pillai', 'Rani'];

const ACTIONS = [
  { text: 'Solved 50+ Quant Stems', platform: 'Quantitative', icon: 'quant' },
  { text: 'Completed Profit & Loss', platform: 'Quantitative', icon: 'quant' },
  { text: 'Scored 98% in Mock Test', platform: 'Assessment', icon: 'mock' },
  { text: 'Completed Averages Topic', platform: 'Quantitative', icon: 'quant' },
  { text: 'Earned Speed Master Badge', platform: 'Speed Test', icon: 'speed' },
  { text: 'Solved 100+ Logical Stems', platform: 'Logical', icon: 'logical' },
  { text: 'Completed Time & Work Path', platform: 'Quantitative', icon: 'quant' },
  { text: 'Scored 95% in Verbal Mock', platform: 'Verbal', icon: 'verbal' },
  { text: 'Completed Logical Reasoning', platform: 'Logical', icon: 'logical' },
  { text: 'Solved Daily Aptitude Streak', platform: 'Streak', icon: 'streak' },
  { text: 'Unlocked Permutations Topic', platform: 'Quantitative', icon: 'quant' },
  { text: 'Earned Data Interpretation', platform: 'Data Interpret', icon: 'data' },
  { text: 'Completed Probability Path', platform: 'Quantitative', icon: 'quant' },
  { text: 'Scored 100% in Ratios', platform: 'Quantitative', icon: 'quant' },
  { text: 'Solved 200+ Practice Questions', platform: 'Practice', icon: 'practice' },
  { text: 'Preparing for TCS Ninja', platform: 'Placement Prep', icon: 'placement' },
  { text: 'Preparing for Accenture Prep', platform: 'Placement Prep', icon: 'placement' },
  { text: 'Preparing for Infosys Prep', platform: 'Placement Prep', icon: 'placement' },
  { text: 'Preparing for Wipro Elite', platform: 'Placement Prep', icon: 'placement' }
];

const SUBJECT_ICONS = [
  { name: 'Quantitative', color: '#3b82f6', icon: '🔢' },
  { name: 'Logical Reasoning', color: '#10b981', icon: '🧩' },
  { name: 'Verbal Ability', color: '#f59e0b', icon: '📖' },
  { name: 'Data Interpretation', color: '#8b5cf6', icon: '📊' },
  { name: 'Speed Formulas', color: '#ef4444', icon: '⚡' },
  { name: 'Daily Streak', color: '#f97316', icon: '🔥' },
  { name: 'Mock Test', color: '#06b6d4', icon: '📝' },
  { name: 'Logical Puzzles', color: '#ec4899', icon: '🧠' }
];

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
];

const generateRandomAptitude = () => {
  const categories = ['QUANT', 'LOGICAL', 'VERBAL', 'DI'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  if (category === 'QUANT') {
    const quantTemplates = [
      () => {
        const speed = Math.floor(Math.random() * 60) + 40;
        return {
          title: `SPEED: ${speed} KM/H`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const profit = [10, 15, 20, 25, 30, 50][Math.floor(Math.random() * 6)];
        return {
          title: `PROFIT: +${profit}%`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const loss = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
        return {
          title: `LOSS: -${loss}%`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const p = Math.floor(Math.random() * 900) + 100;
        return {
          title: `SI: $${p}`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const combined = (Math.random() * 8 + 2).toFixed(1);
        return {
          title: `WORK: ${combined} DAYS`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const avg = (Math.random() * 40 + 10).toFixed(1);
        return {
          title: `AVG = ${avg}`,
          icon: '🔢',
          color: '#60a5fa'
        };
      },
      () => {
        const d = Math.floor(Math.random() * 8) + 2;
        return {
          title: `AP DIFF (d) = ${d}`,
          icon: '🔢',
          color: '#60a5fa'
        };
      }
    ];
    return quantTemplates[Math.floor(Math.random() * quantTemplates.length)]();
  } else if (category === 'LOGICAL') {
    const logicalTemplates = [
      () => {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = [2, 3][Math.floor(Math.random() * 2)];
        const next = start * ratio * ratio * ratio;
        return {
          title: `NEXT: ${start}, ${start * ratio}, ${start * ratio * ratio}, [${next}]`,
          icon: '🧩',
          color: '#a78bfa'
        };
      },
      () => {
        const hours = Math.floor(Math.random() * 11) + 1;
        const mins = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const angle = Math.abs(30 * hours - 5.5 * mins);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;
        return {
          title: `CLOCK: ${normalizedAngle.toFixed(0)}° AT ${hours}:${mins.toString().padStart(2, '0')}`,
          icon: '🧩',
          color: '#a78bfa'
        };
      },
      () => {
        const relations = ['A is B\'s Cousin', 'X is Y\'s Uncle', 'M is N\'s Sister', 'P is Q\'s Mother'];
        return {
          title: relations[Math.floor(Math.random() * relations.length)].toUpperCase(),
          icon: '🧩',
          color: '#a78bfa'
        };
      },
      () => {
        const pattern = Math.floor(Math.random() * 90) + 10;
        return {
          title: `PATTERN CODE: ${pattern}`,
          icon: '🧩',
          color: '#a78bfa'
        };
      }
    ];
    return logicalTemplates[Math.floor(Math.random() * logicalTemplates.length)]();
  } else if (category === 'VERBAL') {
    const verbalPool = [
      { title: 'ACUMEN = KEENNESS', color: '#f59e0b' },
      { title: 'ZENITH ≠ NADIR', color: '#f59e0b' },
      { title: 'EPHEMERAL = FLEETING', color: '#f59e0b' },
      { title: 'LOQUACIOUS ≠ TACITURN', color: '#f59e0b' },
      { title: 'LIGHT : DARK :: JOY : GRIEF', color: '#f59e0b' },
      { title: 'SPILL THE BEANS = REVEAL', color: '#f59e0b' },
      { title: 'HIT THE SACK = SLEEP', color: '#f59e0b' }
    ];
    return {
      ...verbalPool[Math.floor(Math.random() * verbalPool.length)],
      icon: '📖'
    };
  } else {
    const diTemplates = [
      () => {
        const percent = (Math.random() * 40 + 5).toFixed(1);
        return {
          title: `GROWTH: +${percent}%`,
          icon: '📊',
          color: '#a78bfa'
        };
      },
      () => {
        const deg = (Math.random() * 120 + 20).toFixed(1);
        return {
          title: `SECTOR: ${deg}°`,
          icon: '📊',
          color: '#a78bfa'
        };
      },
      () => {
        const total = [500, 1000, 2000][Math.floor(Math.random() * 3)];
        return {
          title: `TOTAL COHORT: ${total}`,
          icon: '📊',
          color: '#a78bfa'
        };
      }
    ];
    return diTemplates[Math.floor(Math.random() * diTemplates.length)]();
  }
};

const AptitudeCategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'quant':
      return (
        <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center p-0.5 shadow-md border border-blue-400/30 text-[8px]" title="Quantitative Aptitude">
          🔢
        </span>
      );
    case 'logical':
      return (
        <span className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center p-0.5 shadow-md border border-emerald-400/30 text-[8px]" title="Logical Reasoning">
          🧩
        </span>
      );
    case 'verbal':
      return (
        <span className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center p-0.5 shadow-md border border-amber-400/30 text-[8px]" title="Verbal Ability">
          📖
        </span>
      );
    case 'data':
      return (
        <span className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center p-0.5 shadow-md border border-purple-400/30 text-[8px]" title="Data Interpretation">
          📊
        </span>
      );
    case 'speed':
      return (
        <span className="w-4 h-4 bg-red-600 rounded flex items-center justify-center p-0.5 shadow-md border border-red-400/30 text-[8px]" title="Speed Test">
          ⚡
        </span>
      );
    case 'streak':
      return (
        <span className="w-4 h-4 bg-orange-600 rounded flex items-center justify-center p-0.5 shadow-md border border-orange-400/30 text-[8px]" title="Daily Streak">
          🔥
        </span>
      );
    case 'mock':
      return (
        <span className="w-4 h-4 bg-cyan-600 rounded flex items-center justify-center p-0.5 shadow-md border border-cyan-400/30 text-[8px]" title="Mock Test">
          📝
        </span>
      );
    case 'placement':
      return (
        <span className="w-4 h-4 bg-slate-855 rounded flex items-center justify-center p-0.5 shadow-md border border-slate-600 text-[8px]" title="Placement Focus">
          💼
        </span>
      );
    case 'practice':
      return (
        <span className="w-4 h-4 bg-pink-600 rounded flex items-center justify-center p-0.5 shadow-md border border-pink-400/30 text-[8px]" title="Aptitude Practice">
          🎯
        </span>
      );
    default:
      return (
        <span className="w-4 h-4 bg-slate-800 rounded flex items-center justify-center p-0.5 shadow-md border border-slate-700 text-[8px]">
          🧠
        </span>
      );
  }
};

const YouTubeIcon = () => (
  <svg className="w-5 h-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);


const getCategoryDetails = (catId: string) => {
  switch (catId) {
    case 'curriculum':
      return { border: 'border-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-950/20', shadow: 'shadow-indigo-500/5', color: '#6366f1' };
    case 'sync':
      return { border: 'border-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-950/20', shadow: 'shadow-purple-500/5', color: '#a855f7' };
    case 'support':
      return { border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-950/20', shadow: 'shadow-amber-500/5', color: '#f59e0b' };
    default:
      return { border: 'border-blue-500/20', text: 'text-blue-400', bg: 'bg-blue-950/20', shadow: 'shadow-blue-500/5', color: '#3b82f6' };
  }
};

export default function LandingPage() {
  // ==========================================
  // GENERAL STATE
  // ==========================================
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_CONTENT);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'hero' | 'mentor' | 'bento' | 'curriculum' | 'stats' | 'faqs' | 'cta' | 'footer'>('global');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [activeFaqCategory, setActiveFaqCategory] = useState('general');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'yes' | 'no' | null>>({});
  
  // Theme tracking state for unified glass dock
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    setMounted(true);
    // Sync active theme state based on document class
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Sync admin status with active localStorage role
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        setIsAdmin(parsed.role === 'admin');
      } catch (e) {
        console.warn(e);
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

  // Dynamic Orbit State Variables
  const [badge1Content, setBadge1Content] = useState<any>({
    tag: 'QUANT • SPEED',
    title: 'Speed-Time-Distance',
    detail: 'Speed = Distance / Time',
    icon: '🔢',
    color: '#60a5fa'
  });
  const [badge2Content, setBadge2Content] = useState<any>({
    tag: 'QUANT • WORK',
    title: 'Time & Work',
    detail: 'Together: (A*B)/(A+B) Days',
    icon: '🔢',
    color: '#60a5fa'
  });
  const [badge3Content, setBadge3Content] = useState<any>({
    tag: 'LOGICAL • SERIES',
    title: 'Geometric Progress',
    detail: 'Pattern: 2, 4, 8, 16, [32]',
    icon: '🧩',
    color: '#a78bfa'
  });
  const [badge4Content, setBadge4Content] = useState<any>({
    tag: 'VERBAL • VOCAB',
    title: 'Synonyms',
    detail: 'Acumen = Keenness / Insight',
    icon: '📖',
    color: '#f59e0b'
  });

  const [badge1Fade, setBadge1Fade] = useState(false);
  const [badge2Fade, setBadge2Fade] = useState(false);
  const [badge3Fade, setBadge3Fade] = useState(false);
  const [badge4Fade, setBadge4Fade] = useState(false);

  // Helper to swap contents smoothly with fading
  const swapBadgeContent = (badgeNum: number) => {
    if (badgeNum === 1) {
      setBadge1Fade(true);
      setTimeout(() => {
        setBadge1Content(generateRandomAptitude());
        setBadge1Fade(false);
      }, 350);
    } else if (badgeNum === 2) {
      setBadge2Fade(true);
      setTimeout(() => {
        setBadge2Content(generateRandomAptitude());
        setBadge2Fade(false);
      }, 350);
    } else if (badgeNum === 3) {
      setBadge3Fade(true);
      setTimeout(() => {
        setBadge3Content(generateRandomAptitude());
        setBadge3Fade(false);
      }, 350);
    } else if (badgeNum === 4) {
      setBadge4Fade(true);
      setTimeout(() => {
        setBadge4Content(generateRandomAptitude());
        setBadge4Fade(false);
      }, 350);
    }
  };

  // Swap badge content at precise intervals when they are hidden behind the card (orbital duration 45s)
  useEffect(() => {
    // Initial swap for Badge 4 which starts behind the card at t=0
    swapBadgeContent(4);

    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      if (count === 1) {
        // t = 11.25s -> Badge 2 is behind
        swapBadgeContent(2);
      } else if (count === 2) {
        // t = 22.5s -> Badge 3 is behind
        swapBadgeContent(3);
      } else if (count === 3) {
        // t = 33.75s -> Badge 1 is behind
        swapBadgeContent(1);
      } else if (count === 0) {
        // t = 45s (0s) -> Badge 4 is behind
        swapBadgeContent(4);
      }
    }, 11250);

    return () => clearInterval(interval);
  }, []);

  // Notification states
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  // Custom Simulator state (interactive visual compiler on the right of Hero)
  const [compilerInput, setCompilerInput] = useState('\\text{Relative Speed} = V_1 + V_2');
  const [compilerActiveRow, setCompilerActiveRow] = useState(1);

  // Premium Interactive Preview States
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>(['', '', '']);
  const [solverPhase, setSolverPhase] = useState<'loading' | 'typing_1' | 'typing_2' | 'typing_3' | 'solved'>('loading');
  const [activeCursor, setActiveCursor] = useState<{ line: number; col: number }>({ line: 1, col: 0 });
  const [celebrateSolved, setCelebrateSolved] = useState(false);
  const [companiesFade, setCompaniesFade] = useState(true);

  // Animated Live counters
  const [questionsCount, setQuestionsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [liveStudentCount, setLiveStudentCount] = useState(0);
  const [isTickAnimating, setIsTickAnimating] = useState(false);
  const [isCountAnimationDone, setIsCountAnimationDone] = useState(false);

  // Scroll visibility trigger for entry animation
  const [isCountAnimationStarted, setIsCountAnimationStarted] = useState(false);
  const liveCountSectionRef = useRef<HTMLDivElement>(null);

  // Dynamic 3D Tilt Card States & Handlers
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (from -0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Calculate rotation angles (max tilt of 12 degrees)
    const rotateX = -normalizedY * 12;
    const rotateY = normalizedX * 12;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    });
  };


  // Curriculum Interactive States
  const [activeCurriculumPhase, setActiveCurriculumPhase] = useState<number>(0);
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [scrolledActiveIdx, setScrolledActiveIdx] = useState<number>(0);
  const [cohortScale, setCohortScale] = useState<number>(200);
  const [activeMilestone, setActiveMilestone] = useState<number>(2);
  const [selectedWorkspaceAns, setSelectedWorkspaceAns] = useState<number | null>(null);
  const [workspaceShaking, setWorkspaceShaking] = useState<boolean>(false);
  const [workspaceSuccessPop, setWorkspaceSuccessPop] = useState<boolean>(false);
  const [assessmentStatus, setAssessmentStatus] = useState<'idle' | 'running' | 'submitted'>('idle');
  const [assessmentProgress, setAssessmentProgress] = useState<number>(80);

  const handleWorkspaceAnswer = (num: number) => {
    setSelectedWorkspaceAns(num);
    if (num !== 30) {
      setWorkspaceShaking(true);
      setWorkspaceSuccessPop(false);
      setTimeout(() => setWorkspaceShaking(false), 450);
    } else {
      setWorkspaceShaking(false);
      setWorkspaceSuccessPop(true);
      setTimeout(() => setWorkspaceSuccessPop(false), 450);
    }
  };

  // State machine loop for simulated student solver
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const runSolver = async () => {
      if (!isMounted) return;

      const currentQuestion = DEMO_QUESTIONS[activeQuestionIdx];

      // 1. Loading Phase
      setSolverPhase('loading');
      setTypedLines(['', '', '']);
      setActiveCursor({ line: 1, col: 0 });
      setCelebrateSolved(false);

      // Wait for loading transition
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 1200);
      });
      if (!isMounted) return;

      // 2. Typing Line 1
      setSolverPhase('typing_1');
      setActiveCursor({ line: 1, col: 0 });
      const step1Text = currentQuestion.steps[0];
      for (let i = 0; i <= step1Text.length; i++) {
        await new Promise((resolve) => {
          timer = setTimeout(resolve, 20 + Math.random() * 20);
        });
        if (!isMounted) return;
        setTypedLines([step1Text.slice(0, i), '', '']);
        setActiveCursor({ line: 1, col: i });
      }

      // Pause at end of line 1
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 500);
      });
      if (!isMounted) return;

      // 3. Typing Line 2
      setSolverPhase('typing_2');
      setActiveCursor({ line: 2, col: 0 });
      const step2Text = currentQuestion.steps[1];
      for (let i = 0; i <= step2Text.length; i++) {
        await new Promise((resolve) => {
          timer = setTimeout(resolve, 15 + Math.random() * 15);
        });
        if (!isMounted) return;
        setTypedLines([step1Text, step2Text.slice(0, i), '']);
        setActiveCursor({ line: 2, col: i });
      }

      // Pause at end of line 2
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 550);
      });
      if (!isMounted) return;

      // 4. Typing Line 3
      setSolverPhase('typing_3');
      setActiveCursor({ line: 3, col: 0 });
      const step3Text = currentQuestion.steps[2];
      for (let i = 0; i <= step3Text.length; i++) {
        await new Promise((resolve) => {
          timer = setTimeout(resolve, 20 + Math.random() * 20);
        });
        if (!isMounted) return;
        setTypedLines([step1Text, step2Text, step3Text.slice(0, i)]);
        setActiveCursor({ line: 3, col: i });
      }

      // Pause at end of line 3
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 600);
      });
      if (!isMounted) return;

      // 5. Solved & Celebration
      setSolverPhase('solved');
      setCelebrateSolved(true);
      setActiveCursor({ line: 3, col: step3Text.length });

      // Keep showing the solved state for 4.5 seconds
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 4500);
      });
      if (!isMounted) return;

      // Smoothly advance to next question
      setCompaniesFade(false);
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 500);
      });
      if (!isMounted) return;

      setCompaniesFade(true);
      setActiveQuestionIdx((prev) => (prev + 1) % DEMO_QUESTIONS.length);
    };

    runSolver();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [activeQuestionIdx]);

  // Intersection Observer to start statistics count entry animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isCountAnimationStarted) {
            setIsCountAnimationStarted(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = liveCountSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isCountAnimationStarted]);

  // Easing count-up effect for live statistics
  useEffect(() => {
    if (!isCountAnimationStarted) return;

    let startTimestamp: number | null = null;
    const duration = 2000; // 2 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setQuestionsCount(Math.floor(easeProgress * 10432));
      setCompaniesCount(Math.floor(easeProgress * 523));
      setStudentsCount(Math.floor(easeProgress * 204));
      setLiveStudentCount(Math.floor(easeProgress * 1592688));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setIsCountAnimationDone(true);
      }
    };

    window.requestAnimationFrame(step);
  }, [isCountAnimationStarted]);

  useEffect(() => {
    if (!isCountAnimationDone) return;

    const interval = setInterval(() => {
      setLiveStudentCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setIsTickAnimating(true);
      setTimeout(() => setIsTickAnimating(false), 450);
    }, 1800);
    return () => clearInterval(interval);
  }, [isCountAnimationDone]);


  // Floating navbar mount animation hook
  const [navMounted, setNavMounted] = useState(false);
  useEffect(() => {
    setNavMounted(true);
  }, []);

  // Active section tracking state
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set scroll tracking state for dynamic header transformation
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const sections = ['empowering-campuses', 'curriculum', 'coach'];
      const scrollPosition = window.scrollY + 250; // Offset to trigger before section fully hits top

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      
      // If scroll is near top, clear active section
      if (window.scrollY < 100) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initially
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for scroll-triggered premium reveal animations
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const revealId = entry.target.getAttribute('data-reveal-id');
          if (revealId) {
            setVisibleItems((prev) => ({ ...prev, [revealId]: true }));
          } else {
            entry.target.classList.add('reveal-visible');
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver to detect which card index is active based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const idx = parseInt(id.replace('curriculum-card-', ''));
            if (!isNaN(idx)) {
              setScrolledActiveIdx(idx);
            }
          }
        });
      },
      {
        rootMargin: '-25% 0px -35% 0px',
        threshold: 0.2
      }
    );

    [0, 1, 2, 3].forEach((idx) => {
      const el = document.getElementById(`curriculum-card-${idx}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Sync scroll-based active state with timeline active phase when not hovered
  useEffect(() => {
    if (hoveredCardIdx === null) {
      setActiveCurriculumPhase(scrolledActiveIdx);
    }
  }, [scrolledActiveIdx, hoveredCardIdx]);

  // Trigger temporary floating system notices
  const showNotice = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // MOUNT EFFECTS & DB SYNC
  // ==========================================
  useEffect(() => {
    // 1. Sync Landing Page Copy
    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_page_settings')
          .select('*')
          .eq('id', 'current')
          .single();

        if (data && !error) {
          setContent({
            hero_title: data.hero_title || DEFAULT_CONTENT.hero_title,
            hero_subtitle: data.hero_subtitle || DEFAULT_CONTENT.hero_subtitle,
            hero_paragraph: data.hero_paragraph || DEFAULT_CONTENT.hero_paragraph,
            hero_btn_primary: data.hero_btn_primary || DEFAULT_CONTENT.hero_btn_primary,
            hero_btn_secondary: data.hero_btn_secondary || DEFAULT_CONTENT.hero_btn_secondary,
            cta_title: data.cta_title || DEFAULT_CONTENT.cta_title,
            cta_subtitle: data.cta_subtitle || DEFAULT_CONTENT.cta_subtitle,
            cta_btn_primary: data.cta_btn_primary || DEFAULT_CONTENT.cta_btn_primary,
            cta_btn_secondary: data.cta_btn_secondary || DEFAULT_CONTENT.cta_btn_secondary,
            faq_items: Array.isArray(data.faq_items) ? data.faq_items : DEFAULT_CONTENT.faq_items,
            marquee_images_row1: Array.isArray(data.marquee_images) 
              ? data.marquee_images.slice(0, 4) 
              : DEFAULT_CONTENT.marquee_images_row1,
            marquee_images_row2: Array.isArray(data.marquee_images) 
              ? data.marquee_images.slice(4, 8) 
              : DEFAULT_CONTENT.marquee_images_row2,
            mentor_name: data.mentor_name || DEFAULT_CONTENT.mentor_name,
            mentor_designation: data.mentor_designation || DEFAULT_CONTENT.mentor_designation,
            mentor_bio: data.mentor_bio || DEFAULT_CONTENT.mentor_bio,
            mentor_message: data.mentor_message || DEFAULT_CONTENT.mentor_message,
            mentor_image: data.mentor_image || DEFAULT_CONTENT.mentor_image,
            mentor_badge_1: data.mentor_badge_1 || DEFAULT_CONTENT.mentor_badge_1,
            mentor_badge_2: data.mentor_badge_2 || DEFAULT_CONTENT.mentor_badge_2,
            mentor_badge_3: data.mentor_badge_3 || DEFAULT_CONTENT.mentor_badge_3,
            mentor_badge_4: data.mentor_badge_4 || DEFAULT_CONTENT.mentor_badge_4,
            curriculum_title_1: data.curriculum_title_1 || DEFAULT_CONTENT.curriculum_title_1,
            curriculum_desc_1: data.curriculum_desc_1 || DEFAULT_CONTENT.curriculum_desc_1,
            curriculum_mock_1: data.curriculum_mock_1 || DEFAULT_CONTENT.curriculum_mock_1,
            curriculum_title_2: data.curriculum_title_2 || DEFAULT_CONTENT.curriculum_title_2,
            curriculum_desc_2: data.curriculum_desc_2 || DEFAULT_CONTENT.curriculum_desc_2,
            curriculum_mock_2: data.curriculum_mock_2 || DEFAULT_CONTENT.curriculum_mock_2,
            curriculum_title_3: data.curriculum_title_3 || DEFAULT_CONTENT.curriculum_title_3,
            curriculum_desc_3: data.curriculum_desc_3 || DEFAULT_CONTENT.curriculum_desc_3,
            curriculum_mock_3: data.curriculum_mock_3 || DEFAULT_CONTENT.curriculum_mock_3,
            curriculum_title_4: data.curriculum_title_4 || DEFAULT_CONTENT.curriculum_title_4,
            curriculum_desc_4: data.curriculum_desc_4 || DEFAULT_CONTENT.curriculum_desc_4,
            curriculum_mock_4: data.curriculum_mock_4 || DEFAULT_CONTENT.curriculum_mock_4,
            header_logo_text: data.header_logo_text || DEFAULT_CONTENT.header_logo_text,
            header_logo_subtext: data.header_logo_subtext || DEFAULT_CONTENT.header_logo_subtext,
            header_btn_text: data.header_btn_text || DEFAULT_CONTENT.header_btn_text,
            bento_title: data.bento_title || DEFAULT_CONTENT.bento_title,
            bento_desc: data.bento_desc || DEFAULT_CONTENT.bento_desc,
            curriculum_title: data.curriculum_title || DEFAULT_CONTENT.curriculum_title,
            curriculum_desc: data.curriculum_desc || DEFAULT_CONTENT.curriculum_desc,
            mentor_heading: data.mentor_heading || DEFAULT_CONTENT.mentor_heading,
            faq_title: data.faq_title || DEFAULT_CONTENT.faq_title,
            faq_desc: data.faq_desc || DEFAULT_CONTENT.faq_desc,
            footer_badge_text: data.footer_badge_text || DEFAULT_CONTENT.footer_badge_text,
            footer_copyright: data.footer_copyright || DEFAULT_CONTENT.footer_copyright,
          });
        } else {
          // Check Local Storage
          const localData = localStorage.getItem('aptitude_landing_page_settings');
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed.faq_items) && parsed.faq_items.length < 12) {
                localStorage.removeItem('aptitude_landing_page_settings');
              } else {
                setContent(parsed);
              }
            } catch (_) {}
          }
        }
      } catch (e) {
        console.warn("Supabase fetch failed. Falling back to local storage.", e);
        const localData = localStorage.getItem('aptitude_landing_page_settings');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed.faq_items) && parsed.faq_items.length < 12) {
              localStorage.removeItem('aptitude_landing_page_settings');
            } else {
              setContent(parsed);
            }
          } catch (_) {}
        }
      }
    };

    // 2. Sync Statistics Caching
    const loadStats = async () => {
      const computedStats = await getLandingStats();
      setStats(computedStats);
    };

    // 3. Authenticate Staging Role Clearance
    const checkRoleClearance = () => {
      const storedRole = localStorage.getItem('aptitude_current_role');
      if (storedRole) {
        try {
          const parsed = JSON.parse(storedRole);
          if (parsed.role === 'admin') {
            setIsAdmin(true);
            showNotice("Clearance Verified: Admin Access Granted. Visual Editor Unlocked.", "info");
          }
        } catch (e) {
          console.warn(e);
        }
      }
    };

    loadContent();
    loadStats();
    checkRoleClearance();
  }, []);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  
  // Force 3AM Cron Job simulation
  const handleRecalculateStats = async () => {
    setLoadingStats(true);
    showNotice("Starting 3AM Cron Job Simulation: Re-aggregating DB counts...", "info");
    try {
      const freshStats = await recalculateLandingStats();
      setStats(freshStats);
      showNotice("Cron complete! Stats recompiled successfully and cached for 24h.", "success");
    } catch (e) {
      showNotice("Cron simulation failed. Served cached counts.", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  // Save modified content
  const handleSaveContent = async (updatedContent: LandingPageContent) => {
    setSavingContent(true);
    try {
      // Structure all marquee images together for DB row compatibility
      const allMarqueeImages = [
        ...updatedContent.marquee_images_row1,
        ...updatedContent.marquee_images_row2
      ];

      const payload = {
        id: 'current',
        hero_title: updatedContent.hero_title,
        hero_subtitle: updatedContent.hero_subtitle,
        hero_paragraph: updatedContent.hero_paragraph,
        cta_title: updatedContent.cta_title,
        cta_subtitle: updatedContent.cta_subtitle,
        faq_items: updatedContent.faq_items,
        marquee_images: allMarqueeImages,
        mentor_name: updatedContent.mentor_name,
        mentor_designation: updatedContent.mentor_designation,
        mentor_bio: updatedContent.mentor_bio,
        mentor_message: updatedContent.mentor_message,
        mentor_image: updatedContent.mentor_image,
        mentor_badge_1: updatedContent.mentor_badge_1,
        mentor_badge_2: updatedContent.mentor_badge_2,
        mentor_badge_3: updatedContent.mentor_badge_3,
        mentor_badge_4: updatedContent.mentor_badge_4,
        curriculum_title_1: updatedContent.curriculum_title_1,
        curriculum_desc_1: updatedContent.curriculum_desc_1,
        curriculum_mock_1: updatedContent.curriculum_mock_1,
        curriculum_title_2: updatedContent.curriculum_title_2,
        curriculum_desc_2: updatedContent.curriculum_desc_2,
        curriculum_mock_2: updatedContent.curriculum_mock_2,
        curriculum_title_3: updatedContent.curriculum_title_3,
        curriculum_desc_3: updatedContent.curriculum_desc_3,
        curriculum_mock_3: updatedContent.curriculum_mock_3,
        curriculum_title_4: updatedContent.curriculum_title_4,
        curriculum_desc_4: updatedContent.curriculum_desc_4,
        curriculum_mock_4: updatedContent.curriculum_mock_4,
        
        // New Dynamic Fields
        header_logo_text: updatedContent.header_logo_text,
        header_logo_subtext: updatedContent.header_logo_subtext,
        header_btn_text: updatedContent.header_btn_text,
        bento_title: updatedContent.bento_title,
        bento_desc: updatedContent.bento_desc,
        curriculum_title: updatedContent.curriculum_title,
        curriculum_desc: updatedContent.curriculum_desc,
        mentor_heading: updatedContent.mentor_heading,
        faq_title: updatedContent.faq_title,
        faq_desc: updatedContent.faq_desc,
        footer_badge_text: updatedContent.footer_badge_text,
        footer_copyright: updatedContent.footer_copyright,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('landing_page_settings')
        .upsert(payload);

      if (error) throw error;

      // Update Local State & Fallback Storage
      setContent(updatedContent);
      localStorage.setItem('aptitude_landing_page_settings', JSON.stringify(updatedContent));
      showNotice("Staging Sandbox Saved: Content synchronized with database.", "success");
      setIsEditorOpen(false);
    } catch (err) {
      console.warn("Failed database save. Saving locally to Staging Sandbox local storage.", err);
      setContent(updatedContent);
      localStorage.setItem('aptitude_landing_page_settings', JSON.stringify(updatedContent));
      showNotice("Staging Sandbox Saved (Staging Offline: Saved to Local Storage Cache).", "info");
      setIsEditorOpen(false);
    } finally {
      setSavingContent(false);
    }
  };

  // Bento grid mockup visual render helpers
  const renderScaleTracker = () => (
    <div className="bg-white border border-slate-200 dark:bg-slate-950/60 dark:border-slate-900 rounded-xl p-4 mt-2 space-y-3 relative overflow-hidden shadow-inner w-full min-h-[180px] flex flex-col justify-between group/mockup hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Cohort Scale Tracker</span>
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/30 px-1.5 py-0.5 rounded transition-colors duration-300">Live Sync</span>
        </div>
      </div>
      
      {/* Interactive Scale progress display */}
      <div className="space-y-3 flex-1 flex flex-col justify-center relative z-10">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">
            <span>Section A (Advanced maps)</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">{Math.min(98, Math.floor((cohortScale / 500) * 100))}% Done</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden relative transition-colors duration-300">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-350 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(98, Math.floor((cohortScale / 500) * 100))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-reflection-sweep" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-colors duration-300">
            <span>Section B (Foundations)</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{Math.min(90, Math.floor((cohortScale / 500) * 80))}% Done</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden relative transition-colors duration-300">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-350 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(90, Math.floor((cohortScale / 500) * 80))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-reflection-sweep" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Slider Selector input */}
      <div className="relative z-10 pt-1">
        <input 
          type="range" 
          min="20" 
          max="500" 
          value={cohortScale} 
          onChange={(e) => setCohortScale(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none transition-colors duration-300"
        />
      </div>

      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-900/60 transition-colors duration-300">
        <span>Target: {cohortScale}k Cohorts</span>
        <span className="text-blue-600 dark:text-blue-400 font-mono">Rate: {(cohortScale * 6).toFixed(1)}k req/s</span>
      </div>
    </div>
  );

  const renderQuestionWorkspace = () => (
    <div className={`bg-white border border-slate-200 dark:bg-slate-950/60 dark:border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[180px] flex flex-col justify-between group/mockup hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300 ${
      workspaceShaking ? 'animate-shake border-rose-900/60 shadow-[0_0_25px_rgba(244,63,94,0.15)]' : ''
    } ${workspaceSuccessPop ? 'border-emerald-900/60 shadow-[0_0_25px_rgba(16,185,129,0.15)]' : ''}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Question Workspace</span>
        <span className="text-[8px] font-bold text-indigo-750 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-900/30 px-1.5 py-0.5 rounded transition-colors duration-300">Active Brainteaser</span>
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-center relative z-10 text-left">
        <div className="text-[10px] font-extrabold text-slate-800 dark:text-slate-300 transition-colors duration-300">
          Find the missing number: 2, 6, 12, 20, ?
        </div>
        
        <div className="grid grid-cols-4 gap-1.5">
          {[24, 28, 30, 32].map((num) => {
            const isCorrect = num === 30;
            const isSelected = selectedWorkspaceAns === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleWorkspaceAnswer(num)}
                className={`py-1 rounded text-[10px] font-black font-mono transition-all border ${
                  isSelected 
                    ? isCorrect 
                      ? `bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.15)] dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-400 dark:shadow-[0_0_12px_rgba(16,185,129,0.25)] ${workspaceSuccessPop ? 'animate-success-pop' : ''}`
                      : 'bg-rose-50 border-rose-500 text-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.15)] dark:bg-rose-950/60 dark:border-rose-500 dark:text-rose-400 dark:shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {selectedWorkspaceAns !== null && (
          <div className="text-[8px] font-bold text-center transition-all animate-fadeIn">
            {selectedWorkspaceAns === 30 ? (
              <span className="text-emerald-600 dark:text-emerald-400 animate-pulse transition-colors duration-300">✓ Correct! Logic: n*(n+1) or differences +4, +6, +8, +10.</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 transition-colors duration-300">✗ Wrong! Hint: Look at differences (+4, +6, +8...).</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-900/60 transition-colors duration-300">
        <span>Accuracy: {selectedWorkspaceAns === 30 ? '100%' : '84%'} avg</span>
        <span className="text-indigo-650 dark:text-indigo-400 font-mono">Topic: Sequences</span>
      </div>
    </div>
  );

  const renderSyllabusMilestones = () => {
    const topics = {
      1: { title: 'Fintech Systems', desc: 'Transaction Ledgers, Distributed Databases, API Gateways.' },
      2: { title: 'Product Scale', desc: 'Microservices, Caching Matrices, Staging deployment pipelines.' },
      3: { title: 'Placement Mock', desc: 'Staging placement rounds, live coding evaluations, company mocks.' }
    };

    return (
      <div className="bg-white border border-slate-200 dark:bg-slate-950/60 dark:border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[180px] flex flex-col justify-between group/mockup hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Syllabus Milestones</span>
          <span className="text-[8px] font-bold text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-900/30 px-1.5 py-0.5 rounded transition-colors duration-300">Interactive Roadmap</span>
        </div>

        <div className="flex items-center justify-between gap-1 relative px-2 z-10">
          <svg className="absolute left-6 right-6 top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] h-[2px] z-0 overflow-visible">
            <line 
              x1="0%" 
              y1="50%" 
              x2="100%" 
              y2="50%" 
              className={`stroke-[2px] transition-all duration-700 ${
                activeMilestone === 1 ? 'stroke-blue-500/50' : activeMilestone === 2 ? 'stroke-indigo-500/80' : 'stroke-purple-500'
              }`} 
            />
          </svg>
          
          {[1, 2, 3].map((num) => {
            const labels = ['Fintech', 'Product', 'Mock Staging'];
            const isActive = activeMilestone === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setActiveMilestone(num)}
                className="flex flex-col items-center gap-1.5 z-10 transition-all duration-300 transform hover:scale-105"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shadow-md transition-all duration-300 border ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-110'
                    : 'bg-slate-50 border-slate-200 text-slate-450 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
                }`}>
                  0{num}
                </div>
                <span className={`text-[8px] font-bold tracking-tight transition-colors duration-300 ${
                  isActive ? 'text-indigo-650 dark:text-indigo-400 font-black' : 'text-slate-500'
                }`}>
                  {labels[num - 1]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Milestone details box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-left animate-fadeIn dark:bg-slate-900/40 dark:border-slate-900/80 transition-colors duration-300">
          <span className="text-[7px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Milestone Topic</span>
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5 transition-colors duration-300">{topics[activeMilestone as 1 | 2 | 3].title}</span>
          <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 block leading-tight mt-0.5 transition-colors duration-300">{topics[activeMilestone as 1 | 2 | 3].desc}</span>
        </div>

        <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-900/60 transition-colors duration-300">
          <span>Curriculum Map: Active</span>
          <span className="text-purple-650 dark:text-purple-400 font-mono">Partnerships: 156+</span>
        </div>
      </div>
    );
  };

  const renderAssessmentSim = () => {
    // A function to trigger the simulated test loading
    const startAssessmentSim = () => {
      if (assessmentStatus === 'running') return;
      setAssessmentStatus('running');
      setAssessmentProgress(0);

      // Increment progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setAssessmentProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setAssessmentStatus('submitted');
          showNotice("Staging Assessment Submitted successfully!", "success");
        }
      }, 100);
    };

    const getTerminalLogs = () => {
      if (assessmentStatus === 'idle') {
        return [
          '> Terminal idle. Ready for triggers...',
          '  Status: Listening on port 8080'
        ];
      }
      if (assessmentStatus === 'running') {
        if (assessmentProgress < 25) {
          return [
            '> CONNECTING SECURE SANDBOX...',
            '  System: Spawning container v18.2'
          ];
        } else if (assessmentProgress < 50) {
          return [
            '> PULLING ADAPTIVE ALGORITHMS...',
            '  Sandbox: Loading 40 randomized cases'
          ];
        } else if (assessmentProgress < 75) {
          return [
            '> RUNNING HEURISTIC DIAGNOSTICS...',
            `  Unit Tests: ${Math.floor(assessmentProgress / 2.5)}/40 passing [Thread: 8]`
          ];
        } else {
          return [
            '> VERIFYING INTEGRITY LIMITS (O(N))...',
            '  Security: Checking memory leak vectors'
          ];
        }
      }
      return [
        '✓ SUBMITTED SUCCESSFULLY TO COHORT ENGINE',
        '  RATING: GOLD STAGING STATUS (96.25%)'
      ];
    };

    return (
      <div className="bg-white border border-slate-200 dark:bg-slate-950/60 dark:border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[180px] flex flex-col justify-between group/mockup hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Goldman Sachs Mock Sandbox</span>
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/30 px-1.5 py-0.5 rounded transition-colors duration-300">Staging Mode</span>
        </div>

        <div className="space-y-2 flex-1 flex flex-col justify-center relative z-10">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 dark:text-slate-350 transition-colors duration-300">
            <span>Standard Mock Test</span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold uppercase transition-all duration-300 ${
              assessmentStatus === 'idle' ? 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-450 dark:border-slate-800' :
              assessmentStatus === 'running' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40' :
              'bg-emerald-50 text-emerald-700 border-emerald-200 font-black animate-text-glow dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
             }`}>
              {assessmentStatus}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden relative transition-colors duration-300">
            <div 
              className={`h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden ${
                assessmentStatus === 'submitted' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${assessmentProgress}%` }}
            />
          </div>

          {/* Mini Monospace Terminal Log */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[8px] leading-tight text-left min-h-[42px] flex flex-col justify-center relative overflow-hidden dark:bg-black/95 dark:border-slate-900 transition-colors duration-300">
            {getTerminalLogs().map((line, lIdx) => (
              <div key={lIdx} className="flex items-center justify-between">
                <span className={lIdx === 0 && assessmentStatus !== 'idle' ? (assessmentStatus === 'submitted' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-blue-600 dark:text-blue-400 font-semibold') : 'text-slate-500'}>
                  {line}
                </span>
                {lIdx === 0 && assessmentStatus === 'running' && (
                  <span className="w-[3px] h-[7px] bg-blue-600 dark:bg-blue-400 animate-cursor-blink inline-block shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Interactive Button */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={startAssessmentSim}
              disabled={assessmentStatus === 'running'}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-500 text-[10px] font-black uppercase rounded-lg shadow-md transition-all duration-200 cursor-pointer active:scale-95 border border-transparent disabled:border-slate-200 dark:disabled:border-slate-800"
            >
              {assessmentStatus === 'idle' ? '⚡ Execute Staging Mock' :
               assessmentStatus === 'running' ? `Running Test ${assessmentProgress}%` :
               '✓ Re-run Mock Test'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-900/60 font-sans transition-colors duration-300">
          <span>Score: {assessmentStatus === 'submitted' ? '385/400' : '0/400'}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono transition-colors duration-300">Status: {assessmentStatus === 'submitted' ? 'Submitted' : 'Running'}</span>
        </div>
      </div>
    );
  };

  const renderMockup = (type: 'scale' | 'workspace' | 'milestones' | 'assessment' | 'none') => {
    switch (type) {
      case 'scale': return renderScaleTracker();
      case 'workspace': return renderQuestionWorkspace();
      case 'milestones': return renderSyllabusMilestones();
      case 'assessment': return renderAssessmentSim();
      default: return null;
    }
  };

  // Accordion list filter
  const filteredFaqs = content.faq_items.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    
    if (faqSearch) {
      return matchesSearch;
    } else {
      const itemCategory = item.category || 'general';
      return itemCategory === activeFaqCategory;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden antialiased transition-colors duration-300">
      
      {/* Floating System Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 max-w-sm animate-scaleUp ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' 
            : notification.type === 'error'
            ? 'bg-rose-950/80 border-rose-800/60 text-rose-300'
            : 'bg-blue-950/80 border-blue-800/60 text-blue-300'
        }`}>
          <div className="p-1 rounded-md bg-white/10 shrink-0">
            {notification.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          </div>
          <span className="text-xs font-bold leading-normal">{notification.text}</span>
        </div>
      )}

      {/* Decorative background grid and glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/800 blur-[150px] pointer-events-none opacity-10" />

      {/* ==========================================
          HEADER SECTION
          ========================================== */}
      <header className={`z-40 fixed left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-[1400px] transition-all duration-500 ease-in-out flex items-center justify-between ${
        isScrolled 
          ? 'top-[24px] rounded-[24px] border border-slate-200/80 dark:border-white/[0.08] bg-white/75 dark:bg-slate-950/75 backdrop-blur-[20px] shadow-lg dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] px-6 md:px-10 py-3.5' 
          : 'top-0 rounded-none border-b border-slate-200/50 dark:border-slate-900/40 bg-transparent px-2 md:px-4 py-5'
      } ${navMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-slate-100 transition-colors duration-300">{content.header_logo_text}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">{content.header_logo_subtext}</span>
          </div>
        </div>

        {/* Navigation jump links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold">
          <a 
            href="#empowering-campuses" 
            className={`relative py-1 transition-colors duration-300 group/link ${
              activeSection === 'empowering-campuses' 
                ? 'text-blue-600 dark:text-white' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>Empowering Campuses</span>
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-500 transform transition-transform duration-300 origin-left ${
              activeSection === 'empowering-campuses' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </a>
          <a 
            href="#curriculum" 
            className={`relative py-1 transition-colors duration-300 group/link ${
              activeSection === 'curriculum' 
                ? 'text-blue-600 dark:text-white' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>Curriculum</span>
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-500 transform transition-transform duration-300 origin-left ${
              activeSection === 'curriculum' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </a>
          <a 
            href="#coach" 
            className={`relative py-1 transition-colors duration-300 group/link ${
              activeSection === 'coach' 
                ? 'text-blue-600 dark:text-white' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>Coach</span>
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-500 transform transition-transform duration-300 origin-left ${
              activeSection === 'coach' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </a>
        </nav>

        {/* Clearance Sync Dashboard CTA */}
        <div className="flex items-center gap-6">
          {/* Theme Toggle Button (Icon-Only Circular Button) */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-650 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer select-none"
            title="Toggle theme"
            suppressHydrationWarning
          >
            {mounted && theme === 'light' ? (
              <Sun className="w-[18px] h-[18px] text-amber-400 animate-fadeIn" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-indigo-400 animate-fadeIn" />
            )}
          </button>

          <Link
            href="/login"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {content.header_btn_text}
          </Link>
        </div>
      </header>

      {/* Spacer to prevent content from jumping under fixed header */}
      <div className="h-24 pointer-events-none" />

      {/* ==========================================
          HERO & LIVE COMPILER SIMULATOR
          ========================================== */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Copy Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          


          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            {content.hero_title.split('KINETIC PLATFORM')[0]}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              KINETIC PLATFORM
            </span>
            {content.hero_title.split('KINETIC PLATFORM')[1] || ''}
          </h1>

          {/* Paragraph explanation */}
          <p className="text-sm md:text-base text-slate-650 dark:text-slate-400 max-w-xl leading-relaxed">
            {content.hero_paragraph}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span>{content.hero_btn_primary}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              suppressHydrationWarning
              onClick={() => showNotice("Platform Staging sandbox environment is active. Standard compiler demo running on visual panel.", "info")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:hover:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800/80 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 fill-current" />
              <span>{content.hero_btn_secondary}</span>
            </button>
          </div>

        </div>

        {/* Right Visual Panel: Simulated Staging Compiler */}
        <div className="lg:col-span-5 w-full relative group">
          
          {/* Background Concentric Dotted Orbit Lines (z-0, behind card) */}
          <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none z-0">
            
            {/* Outer Orbit Wrapper */}
            <div className="absolute inset-0 w-0 h-0">
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.75px] border-dotted border-slate-300/30 dark:border-white/5 pointer-events-none"
                style={{
                  width: 'var(--orbit-outer-w)',
                  height: 'var(--orbit-outer-h)',
                }}
              />
            </div>

            {/* Inner Orbit Wrapper */}
            <div className="absolute inset-0 w-0 h-0">
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.75px] border-dotted border-slate-300/30 dark:border-white/5 pointer-events-none"
                style={{
                  width: 'var(--orbit-inner-w)',
                  height: 'var(--orbit-inner-h)',
                }}
              />
            </div>

          </div>




          <div className="w-full rounded-2xl glassmorphism-light dark:glassmorphism border border-slate-200 dark:border-slate-800/60 p-5 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.01] group-hover:shadow-[0_25px_60px_rgba(37,99,235,0.15)] select-none z-10">
            
            {/* Visual shine gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent pointer-events-none" />

            {/* Subtle reflection sweep */}
            <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 animate-reflection-sweep" />

            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600/80 animate-glow-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600/80 animate-glow-amber" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/80 animate-glow-green" />
              </div>
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600 font-mono tracking-widest uppercase">
                kinetic-staging-v2.0
              </div>
            </div>

            {/* Active Math Problem */}
            <div className={`bg-slate-50 dark:bg-slate-950/80 rounded-xl p-4 border border-slate-200 dark:border-slate-900/60 space-y-3 transition-all duration-700 ${
              solverPhase === 'loading' ? 'opacity-40 scale-[0.99] blur-[0.5px]' : 'opacity-100 scale-100'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/40 tracking-wider">
                  {DEMO_QUESTIONS[activeQuestionIdx].topic}
                </span>
                <span className="text-[9px] font-bold text-slate-500 font-mono">
                  ID: {DEMO_QUESTIONS[activeQuestionIdx].id}
                </span>
              </div>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-700 dark:text-slate-300 min-h-[50px]">
                {DEMO_QUESTIONS[activeQuestionIdx].question}
              </p>
            </div>

            {/* Simulated Live Renderer Input Code area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Dynamic Equation input</span>
                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 dark:text-blue-500/80 dark:bg-blue-950/20 px-1.5 py-0.5 rounded">LaTeX Mode</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-900 font-mono text-[11px] text-blue-650 dark:text-blue-400 space-y-2 min-h-[92px]">
                {/* Row 1 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase !== 'loading' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-400 dark:text-slate-700 select-none w-3 text-right">1</span>
                  <div className="flex-1 text-slate-700 dark:text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[0]}
                    {solverPhase === 'typing_1' && (
                      <span className="text-blue-600 dark:text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
                {/* Row 2 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase !== 'loading' && solverPhase !== 'typing_1' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-400 dark:text-slate-700 select-none w-3 text-right">2</span>
                  <div className="flex-1 text-slate-700 dark:text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[1]}
                    {solverPhase === 'typing_2' && (
                      <span className="text-blue-600 dark:text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
                {/* Row 3 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase === 'typing_3' || solverPhase === 'solved' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-400 dark:text-slate-700 select-none w-3 text-right">3</span>
                  <div className="flex-1 text-slate-700 dark:text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[2]}
                    {solverPhase === 'typing_3' && (
                      <span className="text-blue-600 dark:text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                    {solverPhase === 'solved' && (
                      <span className="text-emerald-500 dark:text-emerald-400 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Math outcome render */}
            <div className={`transition-all duration-700 bg-slate-50/60 dark:bg-slate-950/60 rounded-xl border p-4 text-center space-y-2 relative overflow-hidden h-[175px] ${
              solverPhase === 'solved' 
                ? 'border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/5 shadow-lg shadow-emerald-500/5' 
                : 'border-slate-200 dark:border-slate-900/60'
            }`}>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block text-left">
                Live Student Render Preview
              </span>
              <div className="py-1.5 flex flex-col items-center justify-center gap-2">
                <div className={`transition-all duration-700 transform flex flex-col gap-1.5 w-full items-center ${
                  solverPhase === 'solved' 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-30 blur-[0.5px] pointer-events-none'
                }`}>
                  <div className={`text-[12px] font-black text-slate-800 dark:text-white px-4 py-2 bg-white dark:bg-slate-900/90 border rounded-xl shadow-md transition-all duration-700 ${
                    solverPhase === 'solved'
                      ? 'border-emerald-500/30 dark:border-emerald-500/30 shadow-emerald-500/5 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    {DEMO_QUESTIONS[activeQuestionIdx].resultPreview}
                  </div>
                  
                  <div className={`text-[10px] text-blue-400 font-mono transition-all duration-1000 delay-300 ${
                    solverPhase === 'solved' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                  }`}>
                    {DEMO_QUESTIONS[activeQuestionIdx].resultExtra}
                  </div>

                  <div className={`transition-all duration-[800ms] ease-out overflow-hidden w-full ${
                    solverPhase === 'solved' ? 'max-h-[80px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/20 rounded-xl p-2.5 text-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 shadow-inner tracking-wide uppercase">
                      ✅ {DEMO_QUESTIONS[activeQuestionIdx].answerCard}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle success confetti particles bloom */}
              {celebrateSolved && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute left-[20%] bottom-[10px] w-1.5 h-1.5 rounded-full bg-emerald-400 particle-p1" />
                  <span className="absolute left-[40%] bottom-[10px] w-2 h-2 rounded-full bg-teal-400 particle-p2" />
                  <span className="absolute left-[55%] bottom-[10px] w-1 h-1 rounded-full bg-emerald-300 particle-p3" />
                  <span className="absolute left-[30%] bottom-[10px] w-2.5 h-2.5 rounded-full bg-emerald-500/60 particle-p4" />
                  <span className="absolute left-[48%] bottom-[10px] w-1.5 h-1.5 rounded-full bg-green-400 particle-p5" />
                  <span className="absolute left-[70%] bottom-[10px] w-2 h-2 rounded-full bg-teal-300 particle-p6" />
                </div>
              )}
            </div>

            {/* Live Data Elements */}
            <div className="border-t border-slate-100 dark:border-slate-900 pt-4 grid grid-cols-3 gap-2 text-center select-none">
              <div className="space-y-1">
                <span className="text-[14px] font-black text-slate-800 dark:text-slate-100 tracking-tight block">
                  {questionsCount.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Questions</span>
              </div>
              <div className="space-y-1 border-l border-slate-100 dark:border-l border-slate-900">
                <span className="text-[14px] font-black text-blue-600 dark:text-blue-400 tracking-tight block">
                  {companiesCount}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Company Tags</span>
              </div>
              <div className="space-y-1 border-l border-slate-100 dark:border-l border-slate-900">
                <span className="text-[14px] font-black text-indigo-650 dark:text-indigo-400 tracking-tight block">
                  {studentsCount}K
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Students</span>
              </div>
            </div>

          </div>

          {/* Centered Origin Anchor for Orbiting Badges (Dynamic 3D z-layer stack) */}
          <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none">
            
            {/* Outer Orbit Wrapper 1 */}
            <div 
              className="absolute inset-0 w-0 h-0 pointer-events-none flex items-center justify-center animate-orbit-outer-1"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {badge1Content && (
                <div 
                  className={`w-max flex items-center gap-2 glassmorphism-light dark:glassmorphism px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-880/90 shadow-md select-none transition-all duration-500 group-hover:border-blue-500/40 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] pointer-events-auto cursor-pointer ${
                    badge1Fade ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
                  }`}
                  style={{ transition: 'opacity 0.3s ease-out, transform 0.3s ease-out, filter 0.3s ease-out' }}
                >
                  <span className="text-xs select-none shrink-0">{badge1Content.icon}</span>
                  <span className="text-[9px] font-black tracking-wide leading-none select-none" style={{ color: badge1Content.color }}>
                    {badge1Content.title}
                  </span>
                </div>
              )}
            </div>

            {/* Outer Orbit Wrapper 2 */}
            <div 
              className="absolute inset-0 w-0 h-0 pointer-events-none flex items-center justify-center animate-orbit-outer-2"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {badge2Content && (
                <div 
                  className={`w-max flex items-center gap-2 glassmorphism-light dark:glassmorphism px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-880/90 shadow-md select-none transition-all duration-500 group-hover:border-indigo-500/40 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] pointer-events-auto cursor-pointer ${
                    badge2Fade ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
                  }`}
                  style={{ transition: 'opacity 0.3s ease-out, transform 0.3s ease-out, filter 0.3s ease-out' }}
                >
                  <span className="text-xs select-none shrink-0">{badge2Content.icon}</span>
                  <span className="text-[9px] font-black tracking-wide leading-none select-none" style={{ color: badge2Content.color }}>
                    {badge2Content.title}
                  </span>
                </div>
              )}
            </div>

            {/* Inner Orbit Wrapper 1 */}
            <div 
              className="absolute inset-0 w-0 h-0 pointer-events-none flex items-center justify-center animate-orbit-inner-1"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {badge3Content && (
                <div 
                  className={`w-max flex items-center gap-2 glassmorphism-light dark:glassmorphism px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-880/90 shadow-md select-none transition-all duration-500 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] pointer-events-auto cursor-pointer ${
                    badge3Fade ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
                  }`}
                  style={{ transition: 'opacity 0.3s ease-out, transform 0.3s ease-out, filter 0.3s ease-out' }}
                >
                  <span className="text-xs select-none shrink-0">{badge3Content.icon}</span>
                  <span className="text-[9px] font-black tracking-wide leading-none select-none" style={{ color: badge3Content.color }}>
                    {badge3Content.title}
                  </span>
                </div>
              )}
            </div>

            {/* Inner Orbit Wrapper 2 */}
            <div 
              className="absolute inset-0 w-0 h-0 pointer-events-none flex items-center justify-center animate-orbit-inner-2"
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {badge4Content && (
                <div 
                  className={`w-max flex items-center gap-2 glassmorphism-light dark:glassmorphism px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-880/90 shadow-md select-none transition-all duration-500 group-hover:border-amber-500/40 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] pointer-events-auto cursor-pointer ${
                    badge4Fade ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
                  }`}
                  style={{ transition: 'opacity 0.3s ease-out, transform 0.3s ease-out, filter 0.3s ease-out' }}
                >
                  <span className="text-xs select-none shrink-0">{badge4Content.icon}</span>
                  <span className="text-[9px] font-black tracking-wide leading-none select-none" style={{ color: badge4Content.color }}>
                    {badge4Content.title}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

      </section>

      {/* ==========================================
          EMPOWERING CAMPUSES - BENTO GRID & DUAL MARQUEE
          ========================================== */}
      <section id="empowering-campuses" className="relative w-full py-20 px-6 sm:px-12 bg-white dark:bg-slate-950/50">
        
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section title */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {content.bento_title}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-500">
              {content.bento_desc}
            </p>
          </div>

          {/* DOUBLE ROW BI-DIRECTIONAL MARQUEE (Focus Point #1) */}
          <div className="relative w-full space-y-6 overflow-hidden py-4 bg-transparent">
            
            {/* Row 1: Left-to-Right Scrolling Marquee */}
            <div className="relative flex overflow-x-hidden">
              <div className="animate-marquee-left flex gap-4 pr-4">
                {[...content.marquee_images_row1, ...content.marquee_images_row1].map((img, idx) => (
                  <div 
                    key={`r1-${idx}`} 
                    className="relative w-[300px] h-[360px] rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800/80 group shine-hover cursor-pointer"
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent flex flex-col justify-end p-4">
                      <span className="text-xs font-black text-white tracking-tight leading-none group-hover:translate-x-1 transition-transform">{img.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Right-to-Left Scrolling Marquee */}
            <div className="relative flex overflow-x-hidden">
              <div className="animate-marquee-right flex gap-4 pr-4">
                {[...content.marquee_images_row2, ...content.marquee_images_row2].map((img, idx) => (
                  <div 
                    key={`r2-${idx}`} 
                    className="relative w-[300px] h-[360px] rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800/80 group shine-hover cursor-pointer"
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent flex flex-col justify-end p-4">
                      <span className="text-xs font-black text-white tracking-tight leading-none group-hover:translate-x-1 transition-transform">{img.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fade gradients to mask marquee edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 dark:to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 dark:to-transparent pointer-events-none z-10" />
          </div>


          {/* LIVE COUNT SECTION WITH VIDEO BACKGROUND */}
          <div 
            ref={liveCountSectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-white dark:from-slate-950/80 dark:via-transparent dark:to-slate-950/80 shadow-2xl py-16 px-6 sm:px-12 flex flex-col items-center justify-center text-center group/livecount min-h-[380px] mt-6 transition-all duration-300 [transform-style:preserve-3d] select-none"
          >
            
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden [transform:translateZ(-10px)]">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&auto=format&fit=crop&q=80"
                className="w-full h-full object-cover opacity-[0.12] dark:opacity-[0.35] transition-all duration-1000 group-hover/livecount:scale-[1.03]"
              >
                <source src="/live_count_bg.mp4" type="video/mp4" />
              </video>
              {/* Dark overlay gradient to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-white/85 dark:from-slate-950/80 dark:via-slate-950/20 dark:to-slate-950/80" />
            </div>

            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 space-y-5 max-w-2xl flex flex-col items-center [transform:translateZ(40px)]">
              
              {/* Dynamic Ticking Count */}
              <div 
                className={`text-5xl sm:text-6xl md:text-7xl font-black text-[#ff5a00] tracking-tight drop-shadow-[0_4px_25px_rgba(255,90,0,0.4)] select-none tabular-nums transition-all duration-300 ${
                  isTickAnimating ? 'scale-[1.04] brightness-110' : 'scale-100'
                }`}
              >
                {liveStudentCount.toLocaleString('en-IN')}+
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight uppercase drop-shadow-sm dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Engineers learning on our platform
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 max-w-lg leading-relaxed font-semibold dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                From YouTube to LinkedIn, our global community keeps growing every day. We are the go-to place for engineers preparing for their placement exams.
              </p>

              {/* Social Channels / Achievements */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 border-t border-slate-200 dark:border-slate-900/60 w-full max-w-lg">
                
                {/* YouTube Badge */}
                <div className="flex items-center gap-3 select-none transition-all duration-350 hover:scale-[1.04] cursor-pointer group/yt">
                  <div className="w-10 h-10 rounded-full bg-red-600/15 flex items-center justify-center text-red-500 group-hover/yt:bg-red-600/25 group-hover/yt:text-red-400 transition-all duration-300">
                    <YouTubeIcon />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-tight dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">100k+ subscribers</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 tracking-wide dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">@aptitude_arena</span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-900" />

                {/* LinkedIn Badge */}
                <div className="flex items-center gap-3 select-none transition-all duration-350 hover:scale-[1.04] cursor-pointer group/li">
                  <div className="w-10 h-10 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-500 group-hover/li:bg-blue-600/25 group-hover/li:text-blue-400 transition-all duration-300">
                    <LinkedInIcon />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-tight dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">100k+ followers</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 tracking-wide dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Aptitude Arena</span>
                  </div>
                </div>

              </div>

            </div>

          </div>


        </div>

      </section>

      {/* ==========================================
          CURRICULUM (BENTO GRID DETAILS)
          ========================================== */}
      {/* ==========================================
          CURRICULUM (INTERACTIVE ROADMAP & BENTO DETAILS)
          ========================================== */}
      <section id="curriculum" className="relative w-full py-28 px-6 sm:px-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        
        {/* Soft background ambient gradient lights */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[130px] pointer-events-none" />

        {/* Floating abstract decorative nodes */}
        <div className="absolute top-12 left-[10%] w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/10 blur-[1px] animate-float-particle-1" />
        <div className="absolute top-1/3 right-[8%] w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/10 blur-[2px] animate-float-particle-2" />
        <div className="absolute bottom-20 left-[15%] w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-500/10 blur-[1px] animate-float-particle-3" />

        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section title */}
          <div 
            data-reveal-id="curriculum-title"
            className={`text-center space-y-4 max-w-2xl mx-auto reveal-on-scroll ${
              visibleItems['curriculum-title'] ? 'reveal-visible' : ''
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {content.curriculum_title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {content.curriculum_desc}
            </p>
          </div>

          {/* Timeline Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 relative">
            
            {/* LEFT COLUMN: Animated Vertical Connector Timeline Rail (Desktop only) */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-between relative py-12 select-none h-full min-h-[900px]">
              {/* Central flow path rail */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-200 dark:bg-slate-900/60 -translate-x-1/2 z-0" />
              <svg className="absolute top-0 bottom-0 left-1/2 w-[6px] h-full bg-transparent -translate-x-1/2 z-10 overflow-visible pointer-events-none">
                {/* Glowing progress line matching active phase */}
                <line 
                  x1="50%" 
                  y1="0%" 
                  x2="50%" 
                  y2={`${(activeCurriculumPhase + 1) * 25}%`} 
                  className="transition-all duration-700 ease-out animate-roadmap-flow" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  stroke={activeCurriculumPhase === 0 ? '#3b82f6' : activeCurriculumPhase === 1 ? '#6366f1' : activeCurriculumPhase === 2 ? '#a855f7' : '#10b981'}
                  style={{
                    filter: `drop-shadow(0 0 6px ${
                      activeCurriculumPhase === 0 ? 'rgba(59, 130, 246, 0.8)' : 
                      activeCurriculumPhase === 1 ? 'rgba(99, 102, 241, 0.8)' : 
                      activeCurriculumPhase === 2 ? 'rgba(168, 85, 247, 0.8)' : 
                      'rgba(16, 185, 129, 0.8)'
                    })`,
                    transition: 'stroke 0.7s ease, y2 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease'
                  }}
                />
                {/* Flowing Energy Pulse Oracle */}
                <circle
                  cx="50%"
                  cy={`${(activeCurriculumPhase + 1) * 25}%`}
                  r="5"
                  className="transition-all duration-700 ease-out animate-ping"
                  fill={activeCurriculumPhase === 0 ? '#3b82f6' : activeCurriculumPhase === 1 ? '#6366f1' : activeCurriculumPhase === 2 ? '#a855f7' : '#10b981'}
                  style={{
                    transition: 'cy 0.7s cubic-bezier(0.16, 1, 0.3, 1), fill 0.7s ease'
                  }}
                />
                <circle
                  cx="50%"
                  cy={`${(activeCurriculumPhase + 1) * 25}%`}
                  r="3.5"
                  className="transition-all duration-700 ease-out"
                  fill="#ffffff"
                  style={{
                    transition: 'cy 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))'
                  }}
                />
              </svg>

              {/* Phase Nodes */}
              {[0, 1, 2, 3].map((idx) => {
                const isActive = activeCurriculumPhase === idx;
                const nodeColors = [
                  'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
                  'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 shadow-[0_0_15px_rgba(99,102,241,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]',
                  'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 shadow-[0_0_15px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.5)]',
                  'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                ];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCurriculumPhase(idx)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-[10px] font-black z-20 relative transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? nodeColors[idx] + ' scale-125' 
                        : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700 dark:border-slate-800 dark:text-slate-500 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    0{idx + 1}
                    {isActive && (
                      <span className="animate-radar-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* RIGHT COLUMN: The Curriculum Cards (11 cols on desktop) */}
            <div className="lg:col-span-11 space-y-8">
              {[
                {
                  title: content.curriculum_title_1,
                  desc: content.curriculum_desc_1,
                  mock: content.curriculum_mock_1,
                  icon: Users,
                  color: 'hover:border-blue-500/20 hover:shadow-[0_20px_50px_rgba(59,130,246,0.08)] bg-transparent hover:bg-blue-50/20 dark:hover:bg-blue-950/5',
                  glow: 'bg-blue-600/5',
                  accentColor: 'text-blue-600 dark:text-blue-400',
                  syllabus: [
                    'Cohort Management & Staging Directories',
                    'Real-Time Speed Benchmark Metrics',
                    'Group Statistics & Visual Scoring Reports',
                    'Institutional Syllabus Distribution Sync'
                  ]
                },
                {
                  title: content.curriculum_title_2,
                  desc: content.curriculum_desc_2,
                  mock: content.curriculum_mock_2,
                  icon: Layers,
                  color: 'hover:border-indigo-500/20 hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] bg-transparent hover:bg-indigo-50/20 dark:hover:bg-indigo-950/5',
                  glow: 'bg-indigo-600/5',
                  accentColor: 'text-indigo-600 dark:text-indigo-400',
                  syllabus: [
                    'Quantitative Aptitude & Number Logic',
                    'Verbal Comprehension & Grammar Diagnostics',
                    'Logical Reasoning Puzzle Banks',
                    'Instant Result Analysis & Hints Engine'
                  ]
                },
                {
                  title: content.curriculum_title_3,
                  desc: content.curriculum_desc_3,
                  mock: content.curriculum_mock_3,
                  icon: Code2,
                  color: 'hover:border-purple-500/20 hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] bg-transparent hover:bg-purple-50/20 dark:hover:bg-purple-950/5',
                  glow: 'bg-purple-600/5',
                  accentColor: 'text-purple-600 dark:text-purple-400',
                  syllabus: [
                    'Core Services placement curriculum mapping',
                    'Fintech System Architectures & Mock interviews',
                    'Product company preparation milestones',
                    'College Partnerships placement syllabus sync'
                  ]
                },
                {
                  title: content.curriculum_title_4,
                  desc: content.curriculum_desc_4,
                  mock: content.curriculum_mock_4,
                  icon: Trophy,
                  color: 'hover:border-emerald-500/20 hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] bg-transparent hover:bg-emerald-50/20 dark:hover:bg-emerald-950/5',
                  glow: 'bg-emerald-600/5',
                  accentColor: 'text-emerald-600 dark:text-emerald-400',
                  syllabus: [
                    'Adaptive timing mock tests under pressure',
                    'Goldman Sachs, TCS, Accenture company mocks',
                    'Live Staging sandbox simulated assessment',
                    'Historical mock scores comparison dashboard'
                  ]
                }
              ].map((card, idx) => {
                const isSelected = activeCurriculumPhase === idx;
                const isExpanded = expandedCardIdx === idx;
                const CardIcon = card.icon;
                const isCardVisible = idx === 0 || scrolledActiveIdx >= idx || hoveredCardIdx === idx;

                return (
                  <div
                    key={idx}
                    data-reveal-id={`curriculum-card-${idx}`}
                    className={`reveal-on-scroll delay-stagger-${idx + 1} ${
                      visibleItems[`curriculum-card-${idx}`] ? 'reveal-visible' : ''
                    }`}
                    onMouseEnter={() => {
                      setActiveCurriculumPhase(idx);
                      setHoveredCardIdx(idx);
                    }}
                    onMouseLeave={() => {
                      setHoveredCardIdx(null);
                    }}
                  >
                    <div
                      id={`curriculum-card-${idx}`}
                      className={`border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group transition-all duration-700 ease-in-out ${
                        isCardVisible
                          ? 'opacity-100 blur-none scale-100 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl'
                          : 'opacity-25 blur-[12px] scale-[0.98] pointer-events-none select-none'
                      } ${
                        isSelected 
                          ? `curriculum-card-active-${idx}`
                          : `border-slate-200 dark:border-slate-900/60 bg-transparent curriculum-card-hover-${idx}`
                      }`}
                      style={{
                        perspective: '1200px'
                      }}
                    >
                      {/* Holographic Left Accent Glow bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-500 origin-top z-20 ${
                        isSelected ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-75'
                      } ${
                        idx === 0 ? 'bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                        idx === 1 ? 'bg-gradient-to-b from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                        idx === 2 ? 'bg-gradient-to-b from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                        'bg-gradient-to-b from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      }`} />

                      {/* Cyber-grid background layer */}
                      <div className={`absolute inset-0 bg-cyber-grid opacity-0 transition-opacity duration-500 pointer-events-none z-0 ${
                        isSelected ? 'opacity-100' : 'group-hover:opacity-30'
                      }`} />

                      {/* Glowing card background hover indicator */}
                      <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent pointer-events-none`} />
                      <div className={`absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${card.glow}`} />

                      {/* Card shine sweep */}
                      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none -skew-x-25 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-0" />

                      {/* Content Section (Left side in card flex) */}
                      <div className="flex-1 space-y-4 z-10 relative text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center shadow-md dark:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-50 dark:group-hover:bg-slate-950 ${card.accentColor}`}>
                            <CardIcon className={`w-5 h-5 ${
                              idx === 0 ? 'group-hover:animate-pulse-slow' :
                              idx === 1 ? 'group-hover:animate-bounce-subtle' :
                              idx === 2 ? 'group-hover:animate-spin-once' :
                              'group-hover:animate-wiggle'
                            }`} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className={`text-lg sm:text-xl font-black tracking-tight transition-colors duration-300 group-hover:${card.accentColor}`}>
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                            {card.desc}
                          </p>
                        </div>

                        {/* Expand / Collapse Actions */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedCardIdx(isExpanded ? null : idx)}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer group/btn animate-pulse-glow"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'Expand Syllabus Details'}</span>
                            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`}>▼</span>
                          </button>
                        </div>

                        {/* Expanded Content Panel */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isExpanded ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900/60 rounded-2xl p-4 space-y-3">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-550 dark:text-slate-500 block">Syllabus Overview</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-semibold text-slate-650 dark:text-slate-350">
                              {card.syllabus.map((item, key) => (
                                <div 
                                  key={key} 
                                  className={`flex items-center gap-2 ${
                                    isExpanded ? 'reveal-syllabus-item' : 'opacity-0'
                                  }`}
                                  style={{
                                    animationDelay: isExpanded ? `${key * 75}ms` : '0ms'
                                  }}
                                >
                                  <span className={`w-1 h-1 rounded-full group-hover:scale-125 transition-transform ${
                                    idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : idx === 2 ? 'bg-purple-500' : 'bg-emerald-500'
                                  }`} />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Panel Mockup Section (Right side in card flex) */}
                      <div className="w-full md:w-[280px] shrink-0 z-10 relative transition-transform duration-700 ease-out group-hover:translate-x-2 group-hover:[transform:rotateY(-12deg)_rotateX(6deg)]">
                        {renderMockup(card.mock)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      <section id="coach" className="relative w-full py-24 px-6 sm:px-12 bg-white dark:bg-slate-950 overflow-hidden">
        {/* Glowing visual backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10 w-full">
          
          {/* Left Panel: Content (55%) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left w-full">
            



            {/* Main Title Heading & Mentor Identity info */}
            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {content.mentor_heading.includes('Platform Owner') ? (
                  <>
                    {content.mentor_heading.split('Platform Owner')[0]}
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Platform Owner</span>
                    {content.mentor_heading.split('Platform Owner')[1] || ''}
                  </>
                ) : (
                  content.mentor_heading
                )}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs pt-1">
                <span className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">{content.mentor_name}</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{content.mentor_designation}</span>
              </div>
            </div>

            {/* Paragraph Biography (CMS Dynamic Multi-line Support) */}
            <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed space-y-4 font-medium">
              {content.mentor_bio.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Personal Quote Message Box */}
            <div className="relative mt-2 p-5 rounded-2xl border border-slate-205 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-900/30 backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              <Quote className="absolute right-4 top-4 w-12 h-12 text-slate-300 dark:text-slate-800/20 rotate-180 pointer-events-none" />
              <div className="text-xs sm:text-sm font-semibold italic text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {content.mentor_message}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-550 dark:text-slate-500">Live Guidance Channel</span>
              </div>
            </div>

          </div>

          {/* Right Panel: Portrait Spotlight (45%) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-end relative w-full mt-10 lg:mt-0 h-[480px] md:h-[620px] overflow-visible">
            <div className="relative h-full w-full flex justify-center lg:justify-end items-end animate-float-mentor">
              
              {/* Borderless Mentor photo with dynamic radial vignette masking */}
              <img 
                src={content.mentor_image} 
                alt={content.mentor_name} 
                className="h-full w-full object-cover lg:object-right-bottom select-none pointer-events-none z-0" 
                style={{
                  maskImage: 'radial-gradient(circle at 60% 45%, black 25%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(circle at 60% 45%, black 25%, transparent 75%)'
                }}
              />
              
              {/* Left blending gradient overlay mask */}
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent pointer-events-none z-10" />

              {/* Bottom blending gradient overlay mask to fade bottom edge */}
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white to-transparent dark:from-slate-950 dark:to-transparent pointer-events-none z-10" />

              {/* Floating Achievement Badges (CMS Dynamic and editable) stacked on the Left side */}
              
              {/* Badge 1 (Top-Left) */}
              {content.mentor_badge_1 && (
                <div className="absolute top-[8%] left-[-15px] sm:left-[-35px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-1 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all cursor-default z-20">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_1}</span>
                </div>
              )}

              {/* Badge 2 (Upper Middle-Left) */}
              {content.mentor_badge_2 && (
                <div className="absolute top-[33%] left-[-25px] sm:left-[-55px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-2 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all cursor-default z-20">
                  <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_2}</span>
                </div>
              )}

              {/* Badge 3 (Lower Middle-Left) */}
              {content.mentor_badge_3 && (
                <div className="absolute top-[58%] left-[-15px] sm:left-[-35px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all cursor-default z-20">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_3}</span>
                </div>
              )}

              {/* Badge 4 (Bottom-Left) */}
              {content.mentor_badge_4 && (
                <div className="absolute top-[83%] left-[-20px] sm:left-[-45px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all cursor-default z-20">
                  <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_4}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>


      {/* ==========================================
          FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================== */}
      <section id="faq" className="relative w-full py-24 px-6 sm:px-12 bg-slate-50 dark:bg-slate-950">
        
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center lg:text-left space-y-3 border-b border-slate-200 dark:border-slate-900 pb-8 relative">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-600/5 blur-[35px] pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{content.faq_title}</h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-xl">
              {content.faq_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Categories Command Center & Direct Assistance (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Category Command Center Card */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Category Navigator</h3>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                    Filter questions by topic area
                  </p>
                </div>
                
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none select-none">
                  {[
                    { id: 'general', name: 'General & Platform', icon: Cpu, color: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500 to-indigo-500' },
                    { id: 'curriculum', name: 'Course & Curriculum', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', glow: 'from-indigo-500 to-purple-500' },
                    { id: 'sync', name: 'Campus Sync & Tests', icon: Users, color: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500 to-pink-500' },
                    { id: 'support', name: 'Account & Support', icon: Settings, color: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500 to-orange-500' }
                  ].map((cat) => {
                    const isActive = activeFaqCategory === cat.id;
                    const IconComponent = cat.icon;
                    const categoryCount = content.faq_items.filter(item => (item.category || 'general') === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveFaqCategory(cat.id);
                          setFaqSearch(''); // clear search when switching categories
                        }}
                        className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 text-left cursor-pointer shrink-0 border w-full group/cat ${
                          isActive 
                            ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-md relative overflow-hidden font-black scale-[1.02] dark:bg-slate-900 dark:border-slate-800 dark:text-white' 
                            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:bg-slate-950/40 dark:border-slate-900/40 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/40'
                        }`}
                      >
                        {isActive && (
                          <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${cat.glow}`} />
                        )}
                        <div className="flex items-center gap-2.5">
                          <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover/cat:scale-110 ${isActive ? cat.color : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{cat.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border transition-all ${
                          isActive 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-blue-400' 
                            : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950/80 dark:border-slate-900/60 dark:text-slate-500 dark:group-hover/cat:border-slate-800 dark:group-hover/cat:text-slate-350'
                        }`}>
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Futuristic Interactive Assistance Card */}
              <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-slate-100/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 space-y-4 relative overflow-hidden group/help shadow-lg select-none">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 rounded-full bg-blue-600/5 blur-[40px] pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/60 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/help:scale-105 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Still have questions?</span>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">1-on-1 Helpdesk</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-650 dark:text-slate-400 leading-relaxed font-semibold text-left">
                  Can't find the answers you're looking for? Reach out to our placement support cell for customized guidance.
                </p>
                <button
                  type="button"
                  onClick={() => showNotice("Support ticketing queue loading... Connect with an agent at support@aptitudearena.com", "info")}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg shadow-md cursor-pointer transition-all duration-200 active:scale-95 border border-transparent"
                >
                  Open Support Ticket
                </button>
              </div>

            </div>

            {/* Right Column: Search + Accordion Questions (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Sleek Search bar + suggestions */}
              <div className="space-y-3">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search questions across all categories..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-850 focus:border-blue-600 rounded-xl py-3.5 pl-11 pr-24 text-xs text-slate-800 dark:text-slate-200 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {faqSearch && (
                      <button 
                        onClick={() => setFaqSearch('')}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-350 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-[8px] font-mono font-bold text-slate-550 dark:text-slate-600 uppercase tracking-widest">
                      {filteredFaqs.length} Result{filteredFaqs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Search Suggestions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold text-slate-500 select-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-600">Quick filter:</span>
                  {['Technology', 'Roadmap', 'Proctoring', 'Reports', 'Pricing'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFaqSearch(tag)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-900 dark:hover:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer text-[10px] font-semibold"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion Questions List */}
              <div className="space-y-3.5">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    const catDetails = getCategoryDetails(faq.category || 'general');
                    const hasVoted = helpfulVotes[faq.id];
                    return (
                      <div 
                        key={faq.id} 
                        className={`rounded-2xl border transition-all duration-500 overflow-hidden relative ${
                          isOpen 
                            ? 'bg-white dark:bg-slate-900/60 shadow-xl border-slate-200 dark:border-slate-900' 
                            : 'bg-white/80 dark:bg-slate-900/20 border-slate-200 dark:border-slate-900/60 hover:border-slate-300 dark:hover:border-slate-850 hover:bg-white dark:hover:bg-slate-900/40'
                        }`}
                        style={{
                          borderColor: isOpen ? `${catDetails.color}35` : '',
                          boxShadow: isOpen ? `0 10px 30px -10px ${catDetails.color}15` : ''
                        }}
                      >
                        {/* Colored left indicator pill */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-500 origin-top"
                          style={{
                            backgroundColor: catDetails.color,
                            transform: isOpen ? 'scale-y-100' : 'scale-y-0',
                            opacity: isOpen ? 1 : 0
                          }}
                        />

                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full text-left px-6 py-4.5 flex items-center justify-between font-extrabold text-xs sm:text-sm text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white group/faq-btn select-none cursor-pointer"
                        >
                          <span className="pr-6 leading-tight">{faq.question}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            {faq.tag && (
                              <span className="hidden sm:inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 dark:bg-slate-950/60 dark:border-slate-800/45 dark:text-slate-400 tracking-wider">
                                #{faq.tag}
                              </span>
                            )}
                            <div className={`p-1 rounded-md bg-slate-100 border border-slate-250 text-slate-500 dark:bg-slate-950/65 dark:border-slate-900 transition-all duration-300 ${
                              isOpen ? 'rotate-180 border-slate-800' : 'group-hover/faq-btn:border-slate-300'
                            }`}
                            style={{
                              borderColor: isOpen ? `${catDetails.color}40` : '',
                              color: isOpen ? catDetails.color : ''
                            }}>
                              <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                            </div>
                          </div>
                        </button>
                        
                        <div 
                          className="transition-all duration-500 ease-in-out overflow-hidden"
                          style={{
                            maxHeight: isOpen ? '280px' : '0px',
                            opacity: isOpen ? 1 : 0
                          }}
                        >
                          <div className="px-6 pb-5 text-xs text-slate-650 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-900/50 pt-4.5 font-medium space-y-4">
                            <p className="whitespace-pre-line text-slate-700 dark:text-slate-350">{faq.answer}</p>
                            
                            {/* Helpful vote component (Focus Point #3) */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-slate-100 dark:border-slate-900/50 select-none">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                                Was this information helpful?
                              </span>
                              <div className="flex items-center gap-2">
                                {hasVoted ? (
                                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg animate-scaleUp dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{hasVoted === 'yes' ? 'Thanks for the feedback!' : 'Feedback recorded!'}</span>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setHelpfulVotes(prev => ({ ...prev, [faq.id]: 'yes' }))}
                                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 text-[10px] font-black text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:hover:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                    >
                                      <span>Yes</span>
                                      <span>👍</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setHelpfulVotes(prev => ({ ...prev, [faq.id]: 'no' }))}
                                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 hover:border-slate-300 text-[10px] font-black text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:hover:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                    >
                                      <span>No</span>
                                      <span>👎</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-900 rounded-xl text-xs text-slate-500 font-bold uppercase tracking-wider animate-fadeIn">
                    No matching answers found. Try clearing your search filter.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          CALL TO ACTION (CTA) SECTION
          ========================================== */}
      <section className="relative w-full border-t border-slate-205 dark:border-slate-900 py-16 px-6 sm:px-12 bg-white dark:bg-slate-950/50">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-slate-105/50 dark:from-blue-900/30 dark:via-indigo-950/20 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {content.cta_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
              {content.cta_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3.5 max-w-md mx-auto">
              <Link 
                href="/login"
                className="w-full sm:flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all text-center"
              >
                {content.cta_btn_primary}
              </Link>
              <button 
                onClick={() => showNotice("Connecting to support sandbox queue...", "info")}
                className="w-full sm:flex-1 py-3 px-6 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                {content.cta_btn_secondary}
              </button>
            </div>

          </div>
        </div>
      </section>

             {/* ==========================================
          FOOTER
          ========================================== */}
      <footer className="border-t border-slate-200 dark:border-slate-900/60 pt-10 pb-52 w-[90%] md:w-[80%] max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-600 gap-4 bg-transparent">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          <span>{content.footer_badge_text}</span>
        </div>
        <span>{content.footer_copyright}</span>
      </footer>

      {/* ==========================================
          VISUAL IN-PAGE ADMIN EDITOR WIDGET
          ========================================== */}
      {/* ==========================================
          VISUAL IN-PAGE ADMIN EDITOR WIDGET & THEME TOGGLE
          ========================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] cursor-pointer text-xs font-black transition-all active:scale-95 animate-pulse hover:animate-none"
          >
            <Settings className="w-4 h-4 spin-hover" />
            <span className="hidden sm:inline">Visual Content Editor</span>
          </button>
        )}
      </div>

      {/* ADMIN DRAWER EDITOR WINDOW */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1.5 custom-scrollbar">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Visual Page Editor Suite</h3>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Staging warning badge */}
              <div className="bg-blue-950/40 border border-blue-900/30 rounded-xl p-3.5 text-[10px] text-blue-300 leading-normal">
                ✍️ Edits are stored dynamically in the <code>landing_page_settings</code> table and synchronized across all active users immediately.
              </div>

              {/* Tabs selector */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-4 text-[10px] font-bold">
                {(['global', 'hero', 'mentor', 'bento', 'curriculum', 'stats', 'faqs', 'cta', 'footer'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer transition-all duration-200 border text-[9px] sm:text-[10px] font-extrabold ${
                      activeTab === tab 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.03]' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 0: GLOBAL SETTINGS CONFIG */}
              {activeTab === 'global' && (
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-800 pb-1.5">Header & Branding Settings</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Logo text</label>
                    <input 
                      type="text"
                      value={content.header_logo_text}
                      onChange={(e) => setContent({ ...content, header_logo_text: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Logo subtext</label>
                    <input 
                      type="text"
                      value={content.header_logo_subtext}
                      onChange={(e) => setContent({ ...content, header_logo_subtext: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Header Button label</label>
                    <input 
                      type="text"
                      value={content.header_btn_text}
                      onChange={(e) => setContent({ ...content, header_btn_text: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>

                </div>
              )}

              {/* TAB 8: FOOTER CONFIG */}
              {activeTab === 'footer' && (
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-800 pb-1.5">Footer Settings</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Footer Badge clearance text</label>
                    <input 
                      type="text"
                      value={content.footer_badge_text}
                      onChange={(e) => setContent({ ...content, footer_badge_text: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Footer Copyright text</label>
                    <input 
                      type="text"
                      value={content.footer_copyright}
                      onChange={(e) => setContent({ ...content, footer_copyright: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 1: HERO CONFIG */}
              {activeTab === 'hero' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Subheading Banner</label>
                    <input 
                      type="text"
                      value={content.hero_subtitle}
                      onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Main Title Headline</label>
                    <textarea 
                      rows={2}
                      value={content.hero_title}
                      onChange={(e) => setContent({ ...content, hero_title: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-black uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Paragraph Copy</label>
                    <textarea 
                      rows={3}
                      value={content.hero_paragraph}
                      onChange={(e) => setContent({ ...content, hero_paragraph: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Button Label</label>
                      <input 
                        type="text"
                        value={content.hero_btn_primary}
                        onChange={(e) => setContent({ ...content, hero_btn_primary: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Secondary Button Label</label>
                      <input 
                        type="text"
                        value={content.hero_btn_secondary}
                        onChange={(e) => setContent({ ...content, hero_btn_secondary: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MENTOR CONFIG */}
              {activeTab === 'mentor' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Heading Title</label>
                    <input 
                      type="text"
                      value={content.mentor_heading}
                      onChange={(e) => setContent({ ...content, mentor_heading: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Mentor Name</label>
                    <input 
                      type="text"
                      value={content.mentor_name}
                      onChange={(e) => setContent({ ...content, mentor_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Mentor Designation</label>
                    <input 
                      type="text"
                      value={content.mentor_designation}
                      onChange={(e) => setContent({ ...content, mentor_designation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Mentor Image Link</label>
                    <input 
                      type="text"
                      value={content.mentor_image}
                      onChange={(e) => setContent({ ...content, mentor_image: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-mono text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Mentor Biography (Bio)</label>
                    <textarea 
                      rows={4}
                      value={content.mentor_bio}
                      onChange={(e) => setContent({ ...content, mentor_bio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Mentor Quote / Message</label>
                    <textarea 
                      rows={3}
                      value={content.mentor_message}
                      onChange={(e) => setContent({ ...content, mentor_message: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-850 pb-1">Floating Badge Names</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Badge 1</label>
                        <input 
                          type="text"
                          value={content.mentor_badge_1}
                          onChange={(e) => setContent({ ...content, mentor_badge_1: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Badge 2</label>
                        <input 
                          type="text"
                          value={content.mentor_badge_2}
                          onChange={(e) => setContent({ ...content, mentor_badge_2: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Badge 3</label>
                        <input 
                          type="text"
                          value={content.mentor_badge_3}
                          onChange={(e) => setContent({ ...content, mentor_badge_3: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Badge 4</label>
                        <input 
                          type="text"
                          value={content.mentor_badge_4}
                          onChange={(e) => setContent({ ...content, mentor_badge_4: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BENTO & DUAL MARQUEE IMAGES */}
              {activeTab === 'bento' && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Heading Title</label>
                    <input 
                      type="text"
                      value={content.bento_title}
                      onChange={(e) => setContent({ ...content, bento_title: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-black uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Description</label>
                    <textarea 
                      rows={2}
                      value={content.bento_desc}
                      onChange={(e) => setContent({ ...content, bento_desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  
                  {/* Row 1 image management */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-800 pb-1.5">Row 1 Marquee Photos (Left-To-Right)</span>
                    {content.marquee_images_row1.map((img, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold">Category</label>
                            <input 
                              type="text"
                              value={img.category}
                              onChange={(e) => {
                                const list = [...content.marquee_images_row1];
                                list[idx].category = e.target.value;
                                setContent({ ...content, marquee_images_row1: list });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold">Caption</label>
                            <input 
                              type="text"
                              value={img.caption}
                              onChange={(e) => {
                                const list = [...content.marquee_images_row1];
                                list[idx].caption = e.target.value;
                                setContent({ ...content, marquee_images_row1: list });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 text-[10px]">
                          <label className="text-slate-500 font-bold block">Image Link</label>
                          <input 
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const list = [...content.marquee_images_row1];
                              list[idx].url = e.target.value;
                              setContent({ ...content, marquee_images_row1: list });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 outline-none font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Row 2 image management */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-800 pb-1.5">Row 2 Marquee Photos (Right-To-Left)</span>
                    {content.marquee_images_row2.map((img, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold">Category</label>
                            <input 
                              type="text"
                              value={img.category}
                              onChange={(e) => {
                                const list = [...content.marquee_images_row2];
                                list[idx].category = e.target.value;
                                setContent({ ...content, marquee_images_row2: list });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold">Caption</label>
                            <input 
                              type="text"
                              value={img.caption}
                              onChange={(e) => {
                                const list = [...content.marquee_images_row2];
                                list[idx].caption = e.target.value;
                                setContent({ ...content, marquee_images_row2: list });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 text-[10px]">
                          <label className="text-slate-500 font-bold block">Image Link</label>
                          <input 
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const list = [...content.marquee_images_row2];
                              list[idx].url = e.target.value;
                              setContent({ ...content, marquee_images_row2: list });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-400 outline-none font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB: CURRICULUM CONFIG */}
              {activeTab === 'curriculum' && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Heading Title</label>
                    <input 
                      type="text"
                      value={content.curriculum_title}
                      onChange={(e) => setContent({ ...content, curriculum_title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Description</label>
                    <textarea 
                      rows={2}
                      value={content.curriculum_desc}
                      onChange={(e) => setContent({ ...content, curriculum_desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 text-[10px] text-slate-400 leading-normal">
                    💡 Here you can customize the titles, descriptions, and choose which interactive mockup panel is shown under each curriculum card. You can even choose "None" to keep only text!
                  </div>

                  {/* Card 1 Config */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase block border-b border-slate-900 pb-1.5">Card 1 (Mass Impact Grid cell)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Heading Title</label>
                        <input 
                          type="text"
                          value={content.curriculum_title_1}
                          onChange={(e) => setContent({ ...content, curriculum_title_1: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Description</label>
                        <textarea 
                          rows={2}
                          value={content.curriculum_desc_1}
                          onChange={(e) => setContent({ ...content, curriculum_desc_1: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Mockup Panel Choice</label>
                        <select 
                          value={content.curriculum_mock_1}
                          onChange={(e) => setContent({ ...content, curriculum_mock_1: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 cursor-pointer font-medium"
                        >
                          <option value="scale">Cohort Scale Tracker (Progress Bars)</option>
                          <option value="workspace">Question Workspace (Active Solvers)</option>
                          <option value="milestones">Syllabus Milestones (Fintech Roadmap)</option>
                          <option value="assessment">Assessment Sim (Countdown & Stats)</option>
                          <option value="none">None (Text-only card)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 Config */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase block border-b border-slate-900 pb-1.5">Card 2 (Student Interactions Grid cell)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Heading Title</label>
                        <input 
                          type="text"
                          value={content.curriculum_title_2}
                          onChange={(e) => setContent({ ...content, curriculum_title_2: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Description</label>
                        <textarea 
                          rows={2}
                          value={content.curriculum_desc_2}
                          onChange={(e) => setContent({ ...content, curriculum_desc_2: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Mockup Panel Choice</label>
                        <select 
                          value={content.curriculum_mock_2}
                          onChange={(e) => setContent({ ...content, curriculum_mock_2: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 cursor-pointer font-medium"
                        >
                          <option value="scale">Cohort Scale Tracker (Progress Bars)</option>
                          <option value="workspace">Question Workspace (Active Solvers)</option>
                          <option value="milestones">Syllabus Milestones (Fintech Roadmap)</option>
                          <option value="assessment">Assessment Sim (Countdown & Stats)</option>
                          <option value="none">None (Text-only card)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 Config */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase block border-b border-slate-900 pb-1.5">Card 3 (Live Workshops Grid cell)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Heading Title</label>
                        <input 
                          type="text"
                          value={content.curriculum_title_3}
                          onChange={(e) => setContent({ ...content, curriculum_title_3: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Description</label>
                        <textarea 
                          rows={2}
                          value={content.curriculum_desc_3}
                          onChange={(e) => setContent({ ...content, curriculum_desc_3: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Mockup Panel Choice</label>
                        <select 
                          value={content.curriculum_mock_3}
                          onChange={(e) => setContent({ ...content, curriculum_mock_3: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 cursor-pointer font-medium"
                        >
                          <option value="scale">Cohort Scale Tracker (Progress Bars)</option>
                          <option value="workspace">Question Workspace (Active Solvers)</option>
                          <option value="milestones">Syllabus Milestones (Fintech Roadmap)</option>
                          <option value="assessment">Assessment Sim (Countdown & Stats)</option>
                          <option value="none">None (Text-only card)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 4 Config */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase block border-b border-slate-900 pb-1.5">Card 4 (Mock Assessments Grid cell)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Heading Title</label>
                        <input 
                          type="text"
                          value={content.curriculum_title_4}
                          onChange={(e) => setContent({ ...content, curriculum_title_4: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Card Description</label>
                        <textarea 
                          rows={2}
                          value={content.curriculum_desc_4}
                          onChange={(e) => setContent({ ...content, curriculum_desc_4: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Mockup Panel Choice</label>
                        <select 
                          value={content.curriculum_mock_4}
                          onChange={(e) => setContent({ ...content, curriculum_mock_4: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-blue-600 cursor-pointer font-medium"
                        >
                          <option value="scale">Cohort Scale Tracker (Progress Bars)</option>
                          <option value="workspace">Question Workspace (Active Solvers)</option>
                          <option value="milestones">Syllabus Milestones (Fintech Roadmap)</option>
                          <option value="assessment">Assessment Sim (Countdown & Stats)</option>
                          <option value="none">None (Text-only card)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STATS OVERRIDE & CRON JOBS */}
              {activeTab === 'stats' && (
                <div className="space-y-6 pt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block border-b border-slate-900 pb-1.5">3AM Cron Cache Simulation</span>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      Platform statistics are computed from real-time records inside Supabase and cached for 24h. Recalculate on-demand to test the database aggregation logic:
                    </p>

                    <button
                      onClick={handleRecalculateStats}
                      disabled={loadingStats}
                      className="w-full py-2.5 px-4 bg-blue-900/60 hover:bg-blue-800/60 disabled:bg-blue-950/40 text-blue-200 hover:text-white rounded-lg border border-blue-800/40 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 shrink-0 ${loadingStats ? 'animate-spin' : ''}`} />
                      <span>{loadingStats ? 'Aggregating counts...' : 'Simulate 3AM Stats Cron Job'}</span>
                    </button>
                  </div>

                  {stats && (
                    <div className="space-y-3.5 text-xs">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Active Cache values</span>
                      <div className="grid grid-cols-2 gap-3.5 font-bold font-mono">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="text-[9px] text-slate-500 block uppercase">Students (Raw + Offset)</span>
                          <span className="text-white mt-1 block">{stats.active_students}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="text-[9px] text-slate-500 block uppercase">Questions (Raw + Offset)</span>
                          <span className="text-white mt-1 block">{stats.question_pool}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="text-[9px] text-slate-500 block uppercase">Companies (Raw + Offset)</span>
                          <span className="text-white mt-1 block">{stats.company_tags}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                          <span className="text-[9px] text-slate-500 block uppercase">Colleges (Raw + Offset)</span>
                          <span className="text-white mt-1 block">{stats.college_partnerships}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FAQS CRUD */}
              {activeTab === 'faqs' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Heading Title</label>
                    <input 
                      type="text"
                      value={content.faq_title}
                      onChange={(e) => setContent({ ...content, faq_title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5 pb-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Description</label>
                    <textarea 
                      rows={2}
                      value={content.faq_desc}
                      onChange={(e) => setContent({ ...content, faq_desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Frequently Asked Questions list</span>
                    <button
                      onClick={() => {
                        const newId = `faq-${Date.now()}`;
                        setContent({
                          ...content,
                          faq_items: [
                            ...content.faq_items,
                            { id: newId, question: 'New Question Item?', answer: 'Answer content details.' }
                          ]
                        });
                        setOpenFaqId(newId);
                      }}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 text-[10px] font-black text-blue-400 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD ITEM</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {content.faq_items.map((item, index) => (
                      <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-3 relative">
                        <button
                          onClick={() => {
                            const list = content.faq_items.filter((f) => f.id !== item.id);
                            setContent({ ...content, faq_items: list });
                          }}
                          className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="space-y-1 pr-6">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Question {index + 1}</label>
                          <input 
                            type="text"
                            value={item.question}
                            onChange={(e) => {
                              const list = [...content.faq_items];
                              list[index].question = e.target.value;
                              setContent({ ...content, faq_items: list });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 outline-none focus:border-blue-600 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Answer description</label>
                          <textarea 
                            rows={2}
                            value={item.answer}
                            onChange={(e) => {
                              const list = [...content.faq_items];
                              list[index].answer = e.target.value;
                              setContent({ ...content, faq_items: list });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-400 outline-none focus:border-blue-600 leading-normal"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CTA OPTIONS */}
              {activeTab === 'cta' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">CTA Box Title</label>
                    <textarea 
                      rows={2}
                      value={content.cta_title}
                      onChange={(e) => setContent({ ...content, cta_title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">CTA Box Description Subtitle</label>
                    <textarea 
                      rows={2}
                      value={content.cta_subtitle}
                      onChange={(e) => setContent({ ...content, cta_subtitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Button Label</label>
                      <input 
                        type="text"
                        value={content.cta_btn_primary}
                        onChange={(e) => setContent({ ...content, cta_btn_primary: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase">Secondary Button Label</label>
                      <input 
                        type="text"
                        value={content.cta_btn_secondary}
                        onChange={(e) => setContent({ ...content, cta_btn_secondary: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-800 pt-4 flex gap-3">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveContent(content)}
                disabled={savingContent}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{savingContent ? 'Synchronizing...' : 'Save Staging Changes'}</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
