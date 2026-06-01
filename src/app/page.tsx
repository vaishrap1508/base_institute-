'use client';

import React, { useState, useEffect } from 'react';
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
  question: string;
  answer: string;
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
    { id: 'faq-1', question: 'What does "No-Compiler" speed mean?', answer: 'Our proprietary engine compiles mathematical stems and LaTeX formulas instantly without traditional server-side rendering, allowing students to iterate through solutions 10x faster.' },
    { id: 'faq-2', question: 'Is the platform neutral for all engineering branches?', answer: 'Yes, quantitative reasoning, analytical deduction, and reading comprehension are universal evaluation benchmarks required across all core technical fields.' },
    { id: 'faq-3', question: 'How does the college sync feature work?', answer: 'Colleges sync their student directories to administer live placement tests, track weekly progress, and analyze visual mock performance graphs in staging environments.' },
    { id: 'faq-4', question: 'Are there any seats involved for individual students?', answer: 'No, our sandbox environment is fully open to independent learners. You can register and begin testing immediately.' }
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
  curriculum_mock_4: 'assessment'
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


export default function LandingPage() {
  // ==========================================
  // GENERAL STATE
  // ==========================================
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_CONTENT);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'mentor' | 'bento' | 'curriculum' | 'stats' | 'faqs' | 'cta'>('hero');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  
  // Theme tracking state for unified glass dock
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
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
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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

  // Easing count-up effect for live statistics
  useEffect(() => {
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

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, []);


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
            hero_btn_primary: DEFAULT_CONTENT.hero_btn_primary,
            hero_btn_secondary: DEFAULT_CONTENT.hero_btn_secondary,
            cta_title: data.cta_title || DEFAULT_CONTENT.cta_title,
            cta_subtitle: data.cta_subtitle || DEFAULT_CONTENT.cta_subtitle,
            cta_btn_primary: DEFAULT_CONTENT.cta_btn_primary,
            cta_btn_secondary: DEFAULT_CONTENT.cta_btn_secondary,
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
          });
        } else {
          // Check Local Storage
          const localData = localStorage.getItem('aptitude_landing_page_settings');
          if (localData) {
            setContent(JSON.parse(localData));
          }
        }
      } catch (e) {
        console.warn("Supabase fetch failed. Falling back to local storage.", e);
        const localData = localStorage.getItem('aptitude_landing_page_settings');
        if (localData) setContent(JSON.parse(localData));
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
    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mt-2 space-y-3 relative overflow-hidden shadow-inner w-full min-h-[160px] flex flex-col justify-between group/mockup hover:border-slate-800 transition-all duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Cohort Scale Tracker</span>
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="text-[8px] font-bold text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">Live Sync</span>
        </div>
      </div>
      <div className="space-y-3 flex-1 flex flex-col justify-center relative z-10">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>Section A (Advanced maps)</span>
            <div className="relative w-14 h-3 flex items-center justify-end font-mono">
              <span className="absolute right-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:scale-75 text-blue-400">45% Done</span>
              <span className="absolute right-0 opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 text-blue-400 font-black group-hover:animate-text-glow">92% Done</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[45%] group-hover:w-[92%] transition-all duration-1000 ease-out relative overflow-hidden group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]">
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-reflection-sweep" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>Section B (Foundations)</span>
            <div className="relative w-14 h-3 flex items-center justify-end font-mono">
              <span className="absolute right-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:scale-75 text-indigo-400">30% Done</span>
              <span className="absolute right-0 opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 text-indigo-400 font-black group-hover:animate-text-glow">78% Done</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[30%] group-hover:w-[78%] transition-all duration-1000 ease-out relative overflow-hidden group-hover:shadow-[0_0_8px_rgba(124,58,237,0.6)]">
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-reflection-sweep" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10">
        <span>Target: 200k Cohorts</span>
        <span className="text-slate-450 font-mono transition-colors group-hover:text-blue-400">Rate: 1.2M req/s</span>
      </div>
    </div>
  );

  const renderQuestionWorkspace = () => (
    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[160px] flex flex-col justify-between group/mockup hover:border-slate-800 transition-all duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Question Workspace</span>
        <span className="text-[8px] font-bold text-indigo-400 font-mono bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">Active Solver</span>
      </div>
      <div className="space-y-1.5 flex-1 flex flex-col justify-center relative z-10">
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900/60 rounded-lg p-1.5 text-[9px] font-bold text-slate-300 hover:bg-slate-900/80 transition-all duration-300 group-hover:border-emerald-500/20 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.05)] group-hover:translate-x-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Linear Arrays & Ratios</span>
          </div>
          <span className="text-[8px] text-emerald-400 font-mono px-1 bg-emerald-950/40 rounded border border-emerald-900/30 group-hover:animate-text-glow">100% Correct</span>
        </div>
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900/60 rounded-lg p-1.5 text-[9px] font-bold text-slate-300 hover:bg-slate-900/80 transition-all duration-300 group-hover:border-indigo-500/20 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.05)] group-hover:translate-x-2">
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 transition-all duration-500 group-hover:bg-emerald-400"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500 transition-all duration-500 group-hover:bg-emerald-500 group-hover:scale-125"></span>
            </div>
            <span>Syllogisms & Logic</span>
          </div>
          <div className="relative w-16 h-4 flex items-center justify-end font-mono">
            <span className="absolute right-0 text-[8px] text-blue-400 px-1 bg-blue-950/40 rounded border border-blue-900/30 animate-pulse transition-all duration-500 group-hover:opacity-0 group-hover:scale-75">
              Solving...
            </span>
            <span className="absolute right-0 text-[8px] text-emerald-400 px-1 bg-emerald-950/40 rounded border border-emerald-900/30 opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 font-bold group-hover:animate-text-glow">
              Correct!
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10">
        <span>Accuracy: 84% avg</span>
        <span className="text-slate-400 font-mono transition-colors group-hover:text-indigo-400">Total Solved: 10.4k</span>
      </div>
    </div>
  );

  const renderSyllabusMilestones = () => (
    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[160px] flex flex-col justify-between group/mockup hover:border-slate-800 transition-all duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Syllabus Milestones</span>
        <span className="text-[8px] font-bold text-purple-400 font-mono bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-900/30">Core Banking</span>
      </div>
      <div className="flex items-center justify-between gap-1 flex-1 relative px-2 z-10">
        <svg className="absolute left-6 right-6 top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] h-[2px] z-0 overflow-visible">
          <line x1="0%" y1="50%" x2="100%" y2="50%" className="stroke-slate-800 stroke-[2px] animate-dotted-flow group-hover:stroke-purple-500/80 group-hover:animate-[dottedMove_0.4s_linear_infinite] transition-all duration-700" />
        </svg>
        <div className="flex flex-col items-center gap-1.5 z-10 transition-all duration-300 group-hover:-translate-y-1.5">
          <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800/80 flex items-center justify-center text-[9px] font-black text-blue-400 shadow-md group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-300 cursor-default">
            01
          </div>
          <span className="text-[8px] font-bold text-slate-400 tracking-tight transition-colors duration-300 group-hover:text-blue-400">Fintech</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 z-10 transition-all duration-300 group-hover:-translate-y-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-650 flex items-center justify-center text-[9px] font-black text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] animate-pulse-glow group-hover:scale-115 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-400 group-hover:shadow-[0_0_18px_rgba(99,102,241,0.8)] transition-all duration-300 delay-75 cursor-default relative">
            <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
            02
          </div>
          <span className="text-[8px] font-bold text-indigo-400 tracking-tight transition-colors duration-300 group-hover:text-indigo-400">Product</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 z-10 transition-all duration-300 group-hover:-translate-y-1.5">
          <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500 shadow-md group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-400 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all duration-300 delay-150 cursor-default">
            03
          </div>
          <span className="text-[8px] font-bold text-slate-500 tracking-tight transition-colors duration-300 group-hover:text-purple-400">Mock Staging</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10">
        <span>Curriculum Map: Active</span>
        <span className="text-slate-400 font-mono transition-colors group-hover:text-purple-400">Partnerships: 156+</span>
      </div>
    </div>
  );

  const renderAssessmentSim = () => (
    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mt-2 space-y-2.5 relative overflow-hidden shadow-inner w-full min-h-[160px] flex flex-col justify-between group/mockup hover:border-slate-800 transition-all duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Assessment Sim</span>
        <span className="text-[8px] font-bold text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">Active Session</span>
      </div>
      <div className="space-y-1 flex-1 flex flex-col justify-center relative z-10">
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
          <span>Goldman Sachs Mock</span>
          <span className="text-amber-400 font-mono flex items-center gap-1 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/20 group-hover:bg-emerald-950/30 group-hover:text-emerald-400 group-hover:border-emerald-900/40 transition-all duration-500">
            <span className="relative w-4 h-4 flex items-center justify-center">
              <span className="absolute opacity-100 group-hover:opacity-0 group-hover:scale-75 transition-all duration-500 inline-block animate-bounce">⏳</span>
              <span className="absolute opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-500 text-emerald-400 font-black">✓</span>
            </span>
            <span className="relative w-14 h-3 flex items-center justify-center font-mono">
              <span className="absolute left-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-[-3px]">14:32 left</span>
              <span className="absolute left-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[3px] text-emerald-400 font-bold group-hover:animate-text-glow">Passed</span>
            </span>
          </span>
        </div>
        <div className="space-y-1 mt-1">
          <div className="flex justify-between text-[8px] font-extrabold text-slate-500">
            <span>Progress</span>
            <div className="relative w-20 h-3 flex items-center justify-end font-mono">
              <span className="absolute right-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-[-5px]">80% Complete</span>
              <span className="absolute right-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-[5px] text-emerald-400 font-black group-hover:animate-text-glow">100% Complete</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 h-full rounded-full w-[80%] group-hover:w-[100%] transition-all duration-1000 ease-out relative overflow-hidden group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-gradient-shift">
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-reflection-sweep" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-500 relative z-10">
        <div className="relative w-24 h-4">
          <span className="absolute left-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-[-5px]">Score: 320/400</span>
          <span className="absolute left-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-[5px] text-emerald-400 font-bold group-hover:animate-text-glow">Score: 385/400</span>
        </div>
        <div className="relative w-24 h-4 text-right">
          <span className="absolute right-0 opacity-100 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-[-5px]">Status: Running</span>
          <span className="absolute right-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-[5px] text-emerald-400 font-bold group-hover:animate-text-glow">Status: Submitted</span>
        </div>
      </div>
    </div>
  );

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
  const filteredFaqs = content.faq_items.filter(
    item => 
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
      item.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

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
      <header className={`z-40 transition-all duration-500 ease-out flex items-center justify-between ${
        isScrolled 
          ? 'fixed top-[24px] left-1/2 w-[90%] md:w-[80%] max-w-[1400px] rounded-[24px] border border-white/[0.08] bg-slate-950/75 backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] px-6 md:px-10 py-3.5 -translate-x-1/2 opacity-100' 
          : 'absolute top-0 left-1/2 w-[90%] md:w-[80%] max-w-[1400px] rounded-none border-b border-slate-900/40 bg-transparent px-2 md:px-4 py-5 -translate-x-1/2 opacity-100'
      } ${navMounted ? 'translate-y-0' : '-translate-y-4 opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-sm text-slate-100">KINETIC PLATFORM</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Aptitude AI</span>
          </div>
        </div>

        {/* Navigation jump links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold">
          <a 
            href="#empowering-campuses" 
            className={`relative py-1 transition-colors duration-200 group/link ${
              activeSection === 'empowering-campuses' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Empowering Campuses</span>
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-500 transform transition-transform duration-300 origin-left ${
              activeSection === 'empowering-campuses' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </a>
          <a 
            href="#curriculum" 
            className={`relative py-1 transition-colors duration-200 group/link ${
              activeSection === 'curriculum' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Curriculum</span>
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-500 transform transition-transform duration-300 origin-left ${
              activeSection === 'curriculum' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </a>
          <a 
            href="#coach" 
            className={`relative py-1 transition-colors duration-200 group/link ${
              activeSection === 'coach' ? 'text-white' : 'text-slate-400 hover:text-white'
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
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer select-none"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Sun className="w-[18px] h-[18px] text-amber-400 animate-fadeIn" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-indigo-400 animate-fadeIn" />
            )}
          </button>

          <Link
            href="/login"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Join for Free
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            {content.hero_title.split('KINETIC PLATFORM')[0]}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              KINETIC PLATFORM
            </span>
            {content.hero_title.split('KINETIC PLATFORM')[1] || ''}
          </h1>

          {/* Paragraph explanation */}
          <p className="text-sm md:text-base text-slate-400 max-w-xl leading-relaxed">
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
              onClick={() => showNotice("Platform Staging sandbox environment is active. Standard compiler demo running on visual panel.", "info")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-800/80 transition-all duration-200"
            >
              <Play className="w-4 h-4 text-slate-500 shrink-0 fill-current" />
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
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted border-slate-750/20 dark:border-slate-800/30 pointer-events-none"
                style={{
                  width: 'var(--orbit-outer-size)',
                  height: 'var(--orbit-outer-size)',
                }}
              />
            </div>

            {/* Inner Orbit Wrapper */}
            <div className="absolute inset-0 w-0 h-0">
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted border-slate-750/20 dark:border-slate-800/30 pointer-events-none"
                style={{
                  width: 'var(--orbit-inner-size)',
                  height: 'var(--orbit-inner-size)',
                }}
              />
            </div>

          </div>

          {/* Centered Origin Anchor for Orbiting Badges (z-20, floats on top) */}
          <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none z-20">
            
            {/* Outer Orbit Wrapper 1 */}
            <div className="absolute inset-0 w-0 h-0 animate-orbit-outer-1">
              {/* Badge 1: 🏢 Company Prep */}
              <div 
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-max flex items-center gap-2 glassmorphism px-3 py-2 rounded-xl border border-slate-800/85 shadow-lg select-none transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:border-blue-500/35 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.22)] pointer-events-auto cursor-pointer"
                title="SaaS Placement Focus Mode active"
              >
                <span className="text-xs">🏢</span>
                <div className="flex flex-col text-left">
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">Placement Focus</span>
                  <span className="text-[9px] font-extrabold text-slate-200 tracking-tight leading-none mt-0.5">
                    {DEMO_QUESTIONS[activeQuestionIdx].company} Prep
                  </span>
                </div>
              </div>
            </div>

            {/* Outer Orbit Wrapper 2 */}
            <div className="absolute inset-0 w-0 h-0 animate-orbit-outer-2">
              {/* Badge 2: 📊 Question Bank */}
              <div 
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-max flex items-center gap-2 glassmorphism px-3 py-2 rounded-xl border border-slate-800/85 shadow-lg select-none transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:border-indigo-500/35 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.22)] pointer-events-auto cursor-pointer"
                title="Platform resources matrix"
              >
                <span className="text-xs">📊</span>
                <div className="flex flex-col text-left">
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">10K+ Questions</span>
                  <span className="text-[9px] font-extrabold text-slate-200 tracking-tight leading-none mt-0.5">
                    Question Bank
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Orbit Wrapper 1 */}
            <div className="absolute inset-0 w-0 h-0 animate-orbit-inner-1">
              {/* Badge 3: 🟢 Live Stage */}
              <div 
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-max flex items-center gap-2 glassmorphism px-3 py-2 rounded-xl border border-slate-800/85 shadow-lg select-none transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:border-emerald-500/35 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.22)] pointer-events-auto cursor-pointer"
                title="Simulated staging room live state"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">Live Learning</span>
                  <span className="text-[9px] font-extrabold text-slate-200 tracking-tight leading-none mt-0.5">
                    Live Stage
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Orbit Wrapper 2 */}
            <div className="absolute inset-0 w-0 h-0 animate-orbit-inner-2">
              {/* Badge 4: 📖 Verbal Ability */}
              <div 
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-max flex items-center gap-2 glassmorphism px-3 py-2 rounded-xl border border-slate-800/85 shadow-lg select-none transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:border-amber-500/35 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.22)] pointer-events-auto cursor-pointer"
                title="Grammar • Vocabulary • Reading"
              >
                <span className="text-xs">📖</span>
                <div className="flex flex-col text-left">
                  <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">Grammar • Vocab • Reading</span>
                  <span className="text-[9px] font-extrabold text-slate-200 tracking-tight leading-none mt-0.5">
                    Verbal Ability
                  </span>
                </div>
              </div>
            </div>

          </div>


          <div className="w-full rounded-2xl glassmorphism border border-slate-800/60 p-5 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.01] group-hover:shadow-[0_25px_60px_rgba(37,99,235,0.15)] select-none z-10">
            
            {/* Visual shine gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent pointer-events-none" />

            {/* Subtle reflection sweep */}
            <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 animate-reflection-sweep" />

            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600/80 animate-glow-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600/80 animate-glow-amber" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/80 animate-glow-green" />
              </div>
              <div className="text-[9px] font-bold text-slate-600 font-mono tracking-widest uppercase">
                kinetic-staging-v2.0
              </div>
            </div>

            {/* Active Math Problem */}
            <div className={`bg-slate-950/80 rounded-xl p-4 border border-slate-900/60 space-y-3 transition-all duration-700 ${
              solverPhase === 'loading' ? 'opacity-40 scale-[0.99] blur-[0.5px]' : 'opacity-100 scale-100'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/40 tracking-wider">
                  {DEMO_QUESTIONS[activeQuestionIdx].topic}
                </span>
                <span className="text-[9px] font-bold text-slate-500 font-mono">
                  ID: {DEMO_QUESTIONS[activeQuestionIdx].id}
                </span>
              </div>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-300 min-h-[36px]">
                {DEMO_QUESTIONS[activeQuestionIdx].question}
              </p>
            </div>

            {/* Simulated Live Renderer Input Code area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Dynamic Equation input</span>
                <span className="text-[8px] font-bold text-blue-500/80 font-mono bg-blue-950/20 px-1.5 py-0.5 rounded">LaTeX Mode</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[11px] text-blue-400 space-y-2 min-h-[92px]">
                {/* Row 1 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase !== 'loading' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-700 select-none w-3 text-right">1</span>
                  <div className="flex-1 text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[0]}
                    {solverPhase === 'typing_1' && (
                      <span className="text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
                {/* Row 2 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase !== 'loading' && solverPhase !== 'typing_1' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-700 select-none w-3 text-right">2</span>
                  <div className="flex-1 text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[1]}
                    {solverPhase === 'typing_2' && (
                      <span className="text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
                {/* Row 3 */}
                <div className={`flex gap-3 transition-all duration-300 ${solverPhase === 'typing_3' || solverPhase === 'solved' ? 'opacity-100' : 'opacity-20'}`}>
                  <span className="text-slate-700 select-none w-3 text-right">3</span>
                  <div className="flex-1 text-slate-300 font-medium" style={{ textTransform: 'none' }}>
                    {typedLines[2]}
                    {solverPhase === 'typing_3' && (
                      <span className="text-blue-500 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                    {solverPhase === 'solved' && (
                      <span className="text-emerald-400 font-black animate-cursor-blink ml-[1px]">|</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Math outcome render */}
            <div className={`transition-all duration-700 bg-slate-950/60 rounded-xl border p-4 text-center space-y-2 relative overflow-hidden ${
              solverPhase === 'solved' 
                ? 'border-emerald-500/25 bg-emerald-950/5 shadow-lg shadow-emerald-500/5' 
                : 'border-slate-900/60'
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
                  <div className={`text-[12px] font-black text-white px-4 py-2 bg-slate-900/90 border rounded-xl shadow-md transition-all duration-700 ${
                    solverPhase === 'solved'
                      ? 'border-emerald-500/30 shadow-emerald-500/5 bg-slate-900'
                      : 'border-slate-800'
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
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5 text-center text-[10px] font-black text-emerald-400 shadow-inner tracking-wide uppercase">
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
            <div className="border-t border-slate-900 pt-4 grid grid-cols-3 gap-2 text-center select-none">
              <div className="space-y-1">
                <span className="text-[14px] font-black text-slate-100 tracking-tight block">
                  {questionsCount.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Questions</span>
              </div>
              <div className="space-y-1 border-l border-slate-900">
                <span className="text-[14px] font-black text-blue-400 tracking-tight block">
                  {companiesCount}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Company Tags</span>
              </div>
              <div className="space-y-1 border-l border-slate-900">
                <span className="text-[14px] font-black text-indigo-400 tracking-tight block">
                  {studentsCount}K
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Students</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ==========================================
          EMPOWERING CAMPUSES - BENTO GRID & DUAL MARQUEE
          ========================================== */}
      <section id="empowering-campuses" className="relative w-full py-20 px-6 sm:px-12 bg-slate-950/50">
        
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section title */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              {content.hero_btn_secondary ? 'Empowering Campuses' : 'Empowering Campuses'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Interactive workshops, dynamic learning roadmaps, and campus placements engineered to accelerate talent.
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
                    className="relative w-[300px] h-[360px] rounded-xl overflow-hidden shrink-0 border border-slate-800/80 group shine-hover cursor-pointer"
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
                    className="relative w-[300px] h-[360px] rounded-xl overflow-hidden shrink-0 border border-slate-800/80 group shine-hover cursor-pointer"
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
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-10" />
          </div>


          {/* CACHED REAL-TIME STATISTICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 px-2 relative">
            
            {/* Stat Item 1 */}
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stats ? `${Math.floor(stats.active_students / 1000)}k+` : '200k+'}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Students</span>
            </div>

            {/* Stat Item 2 */}
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <span className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">
                {stats ? `${Math.floor(stats.question_pool / 100) / 10}k+` : '10k+'}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Question Pool</span>
            </div>

            {/* Stat Item 3 */}
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stats ? `${stats.company_tags}+` : '500+'}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Company Tags</span>
            </div>

            {/* Stat Item 4 */}
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tight">
                {stats ? `${stats.college_partnerships}+` : '150+'}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College Partnerships</span>
            </div>

          </div>


        </div>

      </section>

      {/* ==========================================
          CURRICULUM (BENTO GRID DETAILS)
          ========================================== */}
      <section id="curriculum" className="relative w-full py-20 px-6 sm:px-12 bg-slate-950">
        
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section title */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              Curriculum
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Structured preparation syllabus, active workspace simulations, and mock assessments mapped to recruiting trends.
            </p>
          </div>

          {/* Bento Grid details layout (Symmetric 2x2 Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 divide-slate-700/60 md:relative pt-6">
            {/* Desktop Center Vertical separator line */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-700/60 -translate-x-1/2 z-10" />

            {/* Bento Section 1: Mass Impact */}
            <div className="pb-10 md:pb-12 md:pr-12 md:border-b-2 md:border-slate-700/60 flex flex-col gap-4 relative overflow-hidden group hover:bg-slate-900/10 p-4 sm:p-6 rounded-2xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.06)] border border-transparent hover:border-blue-500/10 transition-all duration-350 ease-out hover:-translate-y-1.5 hover:scale-[1.015]">
              {/* Theme-colored ambient backdrop glow */}
              <div className="absolute -right-16 -bottom-16 w-44 h-44 rounded-full bg-blue-500/0 group-hover:bg-blue-600/5 blur-[50px] transition-all duration-500 pointer-events-none" />
              {/* Card shine reflection sweep */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-0" />
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-650 group-hover:border-blue-700/50 transition-all duration-300 shadow-md">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 tracking-tight transition-colors group-hover:text-blue-400">{content.curriculum_title_1}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {content.curriculum_desc_1}
                </p>
              </div>

              {/* Visual Panel: Cohort benchmark map */}
              {renderMockup(content.curriculum_mock_1)}
            </div>

            {/* Bento Section 2: Student Interactions */}
            <div className="py-10 md:py-0 md:pb-12 md:pl-12 md:border-b-2 md:border-slate-700/60 flex flex-col gap-4 relative overflow-hidden group hover:bg-slate-900/10 p-4 sm:p-6 rounded-2xl hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] border border-transparent hover:border-indigo-500/10 transition-all duration-350 ease-out hover:-translate-y-1.5 hover:scale-[1.015]">
              {/* Theme-colored ambient backdrop glow */}
              <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-indigo-500/0 group-hover:bg-indigo-600/5 blur-[50px] transition-all duration-500 pointer-events-none" />
              {/* Card shine reflection sweep */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-0" />
              <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-900/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-650 group-hover:border-indigo-700/50 transition-all duration-300 shadow-md">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 tracking-tight transition-colors group-hover:text-indigo-400">{content.curriculum_title_2}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {content.curriculum_desc_2}
                </p>
              </div>

              {/* Visual Panel: Interactive Question Set list */}
              {renderMockup(content.curriculum_mock_2)}
            </div>

            {/* Bento Section 3: Live Workshops */}
            <div className="py-10 md:py-12 md:pr-12 flex flex-col gap-4 relative overflow-hidden group hover:bg-slate-900/10 p-4 sm:p-6 rounded-2xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.06)] border border-transparent hover:border-purple-500/10 transition-all duration-350 ease-out hover:-translate-y-1.5 hover:scale-[1.015]">
              {/* Theme-colored ambient backdrop glow */}
              <div className="absolute -right-16 -bottom-16 w-44 h-44 rounded-full bg-purple-500/0 group-hover:bg-purple-600/5 blur-[50px] transition-all duration-500 pointer-events-none" />
              {/* Card shine reflection sweep */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-0" />
              <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-900/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-650 group-hover:border-purple-700/50 transition-all duration-300 shadow-md">
                <Code2 className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 tracking-tight transition-colors group-hover:text-purple-400">{content.curriculum_title_3}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {content.curriculum_desc_3}
                </p>
              </div>

              {/* Visual Panel: Structured Syllabus Pipeline */}
              {renderMockup(content.curriculum_mock_3)}
            </div>

            {/* Bento Section 4: Mock Assessments */}
            <div className="pt-10 md:pt-12 md:pl-12 flex flex-col gap-4 relative overflow-hidden group hover:bg-slate-900/10 p-4 sm:p-6 rounded-2xl hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)] border border-transparent hover:border-emerald-500/10 transition-all duration-350 ease-out hover:-translate-y-1.5 hover:scale-[1.015]">
              {/* Theme-colored ambient backdrop glow */}
              <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-emerald-500/0 group-hover:bg-emerald-600/5 blur-[50px] transition-all duration-500 pointer-events-none" />
              {/* Card shine reflection sweep */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none -skew-x-25 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-0" />
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-650 group-hover:border-emerald-700/50 transition-all duration-300 shadow-md">
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 tracking-tight transition-colors group-hover:text-emerald-400">{content.curriculum_title_4}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {content.curriculum_desc_4}
                </p>
              </div>

              {/* Visual Panel: Interactive Testing Interface Mockup */}
              {renderMockup(content.curriculum_mock_4)}
            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          MEET YOUR MENTOR SECTION
          ========================================== */}
      <section id="coach" className="relative w-full py-24 pl-6 sm:pl-12 lg:pl-[calc((100vw-1280px)/2)] pr-0 bg-slate-950 overflow-hidden">
        {/* Glowing visual backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
          
          {/* Left Panel: Content (55%) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left pr-6 sm:pr-12 lg:pr-16">
            


            {/* Main Title Heading & Mentor Identity info */}
            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight">
                Your Mentor, Not Just A <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Platform Owner</span>
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs pt-1">
                <span className="font-extrabold text-slate-100 uppercase tracking-widest text-sm">{content.mentor_name}</span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="font-bold text-blue-400 uppercase tracking-wider">{content.mentor_designation}</span>
              </div>
            </div>

            {/* Paragraph Biography (CMS Dynamic Multi-line Support) */}
            <div className="text-slate-400 text-sm md:text-base leading-relaxed space-y-4 font-medium">
              {content.mentor_bio.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Personal Quote Message Box */}
            <div className="relative mt-2 p-5 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              <Quote className="absolute right-4 top-4 w-12 h-12 text-slate-800/20 rotate-180 pointer-events-none" />
              <div className="text-xs sm:text-sm font-semibold italic text-slate-200 leading-relaxed whitespace-pre-line">
                {content.mentor_message}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Live Guidance Channel</span>
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
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10" />

              {/* Bottom blending gradient overlay mask to fade bottom edge */}
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
            </div>

              {/* Floating Achievement Badges (CMS Dynamic and editable) */}
              
              {/* Badge 1 (Top-Left) */}
              {content.mentor_badge_1 && (
                <div className="absolute top-4 -left-6 md:-left-10 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-1 hover:border-slate-700/80 transition-all cursor-default">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_1}</span>
                </div>
              )}

              {/* Badge 2 (Top-Right) */}
              {content.mentor_badge_2 && (
                <div className="absolute top-1/3 -right-6 md:-right-10 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-2 hover:border-slate-700/80 transition-all cursor-default">
                  <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_2}</span>
                </div>
              )}

              {/* Badge 3 (Bottom-Left) */}
              {content.mentor_badge_3 && (
                <div className="absolute bottom-1/3 -left-6 md:-left-8 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-3 hover:border-slate-700/80 transition-all cursor-default">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_3}</span>
                </div>
              )}

              {/* Badge 4 (Bottom-Right) */}
              {content.mentor_badge_4 && (
                <div className="absolute bottom-4 -right-4 md:-right-8 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-xl px-3 py-2 rounded-xl flex items-center gap-1.5 animate-float-badge-4 hover:border-slate-700/80 transition-all cursor-default">
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-200 tracking-tight whitespace-nowrap">{content.mentor_badge_4}</span>
                </div>
              )}

          </div>
        </div>
      </section>


      {/* ==========================================
          FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================== */}
      <section id="faq" className="relative w-full py-20 px-6 sm:px-12 bg-slate-950">
        
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Frequently Asked</h2>
            <p className="text-xs font-semibold text-slate-500">
              Clear answers to technical details about the platform architecture and usage.
            </p>
          </div>

          {/* Accordion Search filter input */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search platform questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Accordion Items List */}
          <div className="space-y-3.5">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-200 hover:text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                No matching answers found in database directory.
              </div>
            )}
          </div>

        </div>

      </section>

      {/* ==========================================
          CALL TO ACTION (CTA) SECTION
          ========================================== */}
      <section className="relative w-full border-t border-slate-900 py-16 px-6 sm:px-12 bg-slate-950/50">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-gradient-to-br from-blue-900/30 via-indigo-950/20 to-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {content.cta_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
              {content.cta_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3.5 max-w-md mx-auto">
              <Link 
                href="/login"
                className="w-full sm:flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                {content.cta_btn_primary}
              </Link>
              <button 
                onClick={() => showNotice("Connecting to support sandbox queue...", "info")}
                className="w-full sm:flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs border border-slate-800 rounded-xl transition-all"
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
          <span>Operational Clearance: Sandbox Encrypted</span>
        </div>
        <span>© 2026 Aptitude AI platform. All rights reserved.</span>
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
              <div className="flex border-b border-slate-800 text-[10px] font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
                {(['hero', 'mentor', 'bento', 'curriculum', 'stats', 'faqs', 'cta'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2.5 text-center border-b-2 uppercase tracking-wide cursor-pointer transition-colors ${
                      activeTab === tab 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

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
                </div>
              )}

              {/* TAB: MENTOR CONFIG */}
              {activeTab === 'mentor' && (
                <div className="space-y-4 pt-2">
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
