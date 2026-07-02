'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Video,
  Calculator,
  FileText,
  Code2,
  Check,
  RotateCcw,
  Copy,
  Sparkles,
  Laptop,
  Sun,
  Moon,
  Terminal,
  Plus,
  Trophy,
  BookOpen,
  Briefcase,
  Award,
  LayoutGrid,
  Search,
  MessageSquare,
  Sparkle,
  BookmarkCheck,
  CheckCircle,
  HelpCircle,
  Bell,
  TrendingUp,
  AlertTriangle,
  Info,
  Target,
  Settings as SettingsIcon,
  BookOpenCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
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
  RadarPoint,
  SmartInsight as InsightInfo,
  ContinueLearning as ContinueLearningInfo,
  TopicProgress as TopicGridItem
} from '@/lib/services/domain.service';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------
// Taxonomies and Mock Questions Data
// ---------------------------------------------------------
interface Formula {
  label: string;
  equation: string;
}

interface VideoInfo {
  title: string;
  duration: string;
  videoUrl: string;
}

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface CodingQuestion {
  statement: string;
  templateCode: Record<string, string>;
  correctCode: Record<string, string>;
  testCases: { input: string; expected: string }[];
}

interface Concept {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  formulasCount: number;
  progress: number;
  cheatsheet: string[];
  formulas: Formula[];
  example: { question: string; solution: string[] };
  video?: VideoInfo;
  mcq?: MCQQuestion;
  coding?: CodingQuestion;
}

interface SubTopic {
  id: string;
  name: string;
  concepts: Concept[];
}

interface DomainData {
  id: string;
  name: string;
  icon: string;
  color: string;
  subTopics: SubTopic[];
}

const DOMAINS_CONCEPTS: DomainData[] = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    icon: '🔢',
    color: '#3B82F6',
    subTopics: [
      {
        id: 'arithmetic',
        name: 'Arithmetic Foundations',
        concepts: [
          {
            id: 'percentages',
            name: 'Percentages & Applications',
            difficulty: 'Beginner',
            formulasCount: 3,
            progress: 75,
            cheatsheet: [
              "Fraction conversions are essential for speed (e.g., 1/6 = 16.67%, 1/8 = 12.5%, 1/12 = 8.33%).",
              "A% of B is equal to B% of A: (A * B) / 100.",
              "Successive percentage changes of x% and y% result in a net change of: x + y + (xy / 100) %."
            ],
            formulas: [
              { label: 'Basic Percentage', equation: 'Percentage = (Value / Total) * 100' },
              { label: 'Percentage Increase', equation: '% Increase = ((New - Old) / Old) * 100' },
              { label: 'Successive Percentage', equation: 'Net Change = x + y + (xy / 100)' }
            ],
            example: {
              question: "A's salary is 20% less than B's salary. By how much percent is B's salary more than A's?",
              solution: [
                "Let B's salary = 100",
                "A's salary = 100 - 20 = 80",
                "Difference = 100 - 80 = 20",
                "B's salary is more than A's by: (20 / 80) * 100 = 25%"
              ]
            },
            video: {
              title: "Percentages: Core Concepts and Fast Calculations",
              duration: "15:20",
              videoUrl: "https://www.youtube.com/watch?v=kCOm3SjG1x0"
            },
            mcq: {
              question: "A's salary is 20% less than B's salary. By how much percent is B's salary more than A's?",
              options: ["15%", "20%", "25%", "30%"],
              correctAnswer: "25%",
              explanation: "Let B = 100. Then A = 80. Difference = 20. Percent increase = (20 / 80) * 100 = 25%."
            }
          },
          {
            id: 'profit-loss',
            name: 'Profit & Loss Metrics',
            difficulty: 'Intermediate',
            formulasCount: 3,
            progress: 40,
            cheatsheet: [
              "Profit or Loss is always calculated on the Cost Price (CP) unless specified otherwise.",
              "Selling Price (SP) = CP * (1 + Profit/100) or CP * (1 - Loss/100).",
              "Equivalent discount of successive discounts of d1% and d2% is: d1 + d2 - (d1 * d2 / 100) %."
            ],
            formulas: [
              { label: 'Profit Percentage', equation: 'Profit % = ((SP - CP) / CP) * 100' },
              { label: 'Cost Price Formula', equation: 'CP = SP / (1 + Profit % / 100)' },
              { label: 'Successive Discounts', equation: 'Net Discount = d1 + d2 - (d1 * d2 / 100)' }
            ],
            example: {
              question: "By selling an item for $600, a merchant makes a profit of 20%. What is the cost price?",
              solution: [
                "Selling Price (SP) = $600",
                "Profit = 20%",
                "Using formula: CP = SP / (1 + Profit%)",
                "CP = 600 / 1.20 = $500"
              ]
            },
            video: {
              title: "Profit & Loss: Formulations and Percentage Tricks",
              duration: "18:45",
              videoUrl: "https://www.youtube.com/watch?v=0kG2j8y28oY"
            },
            mcq: {
              question: "By selling an item for $600, a merchant makes a profit of 20%. What is the cost price?",
              options: ["$450", "$480", "$500", "$520"],
              correctAnswer: "$500",
              explanation: "CP = SP / (1 + Profit%) = 600 / 1.20 = $500."
            }
          },
          {
            id: 'time-work',
            name: 'Time & Work Rates',
            difficulty: 'Intermediate',
            formulasCount: 2,
            progress: 85,
            cheatsheet: [
              "Work = Rate * Time. Rate of work is inversely proportional to the time taken.",
              "If A takes x days and B takes y days individually, together they take (x * y) / (x + y) days.",
              "Chain Rule: M1 * D1 * H1 / W1 = M2 * D2 * H2 / W2 (Men, Days, Hours, Work)."
            ],
            formulas: [
              { label: 'Combined Rate', equation: '1 / T_together = 1 / T_A + 1 / T_B' },
              { label: 'Work Chain Rule', equation: '(M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2' }
            ],
            example: {
              question: "A can do a work in 10 days and B in 15 days. Working together, in how many days will they finish?",
              solution: [
                "A's daily work rate = 1/10",
                "B's daily work rate = 1/15",
                "Combined daily rate = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6",
                "Total time taken together = 6 days"
              ]
            },
            video: {
              title: "Time & Work: Efficient Rates and Chain Rule Applications",
              duration: "14:15",
              videoUrl: "https://www.youtube.com/watch?v=R9K2tP4G3B4"
            },
            mcq: {
              question: "A can do a work in 10 days and B in 15 days. Working together, in how many days will they finish?",
              options: ["4 days", "5 days", "6 days", "8 days"],
              correctAnswer: "6 days",
              explanation: "Combined rate = 1/10 + 1/15 = 1/6. Therefore, together they take 6 days."
            }
          }
        ]
      },
      {
        id: 'algebra',
        name: 'Algebraic Stems',
        concepts: [
          {
            id: 'quadratic-eq',
            name: 'Quadratic Equations',
            difficulty: 'Intermediate',
            formulasCount: 3,
            progress: 30,
            cheatsheet: [
              "Roots of ax^2 + bx + c = 0 are calculated using the quadratic formula.",
              "Discriminant (D) = b^2 - 4ac determines root nature: D > 0 (real/distinct), D = 0 (real/equal), D < 0 (imaginary).",
              "Sum of roots = -b/a; Product of roots = c/a."
            ],
            formulas: [
              { label: 'Quadratic Roots', equation: 'x = (-b ± √(b^2 - 4ac)) / 2a' },
              { label: 'Sum of Roots', equation: 'Sum = -b / a' },
              { label: 'Product of Roots', equation: 'Product = c / a' }
            ],
            example: {
              question: "Find the roots of x^2 - 5x + 6 = 0.",
              solution: [
                "Here a = 1, b = -5, c = 6",
                "Using factorization: (x - 2)(x - 3) = 0",
                "Roots are x = 2 and x = 3"
              ]
            },
            video: {
              title: "Quadratic Equations: Finding Roots and Analysing Discriminants",
              duration: "11:50",
              videoUrl: "https://www.youtube.com/watch?v=KP0eCqg38l8"
            },
            mcq: {
              question: "Find the roots of x^2 - 5x + 6 = 0.",
              options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, -6"],
              correctAnswer: "x = 2, 3",
              explanation: "The equation factors as (x - 2)(x - 3) = 0, giving roots 2 and 3."
            }
          }
        ]
      }
    ]
  },
  {
    id: 'logical',
    name: 'Logical Reasoning',
    icon: '🧩',
    color: '#8B5CF6',
    subTopics: [
      {
        id: 'arrangements',
        name: 'Structural Arrangements',
        concepts: [
          {
            id: 'linear-arr',
            name: 'Linear Arrangements',
            difficulty: 'Intermediate',
            formulasCount: 1,
            progress: 60,
            cheatsheet: [
              "Always place elements with the most concrete/fixed constraints first.",
              "If 'A is adjacent to B', group them as 'AB' or 'BA' and treat them as a single entity."
            ],
            formulas: [
              { label: 'Linear Permutations', equation: 'Ways to arrange N objects = N!' }
            ],
            example: {
              question: "Five friends A, B, C, D, E are sitting in a row facing North. A is to the immediate right of B. C is between D and E. If D is at the left end, who is sitting next to D?",
              solution: [
                "Draw slots: _ _ _ _ _",
                "D is at the left end. Slots: D _ _ _ _",
                "C is between D and E. Slots: D C E _ _",
                "A is to the immediate right of B. Slots: D C E B A",
                "Hence, C is sitting next to D."
              ]
            },
            video: {
              title: "Linear Arrangements: Step-by-Step Arrangement Logic",
              duration: "16:40",
              videoUrl: "https://www.youtube.com/watch?v=Yf1R28rNnSg"
            },
            mcq: {
              question: "Five friends A, B, C, D, E are sitting in a row facing North. A is to the immediate right of B. C is between D and E. If D is at the left end, who is sitting next to D?",
              options: ["A", "B", "C", "E"],
              correctAnswer: "C",
              explanation: "Left end starts with D. C is between D and E, which puts C in slot 2. So C is next to D."
            }
          },
          {
            id: 'circular-arr',
            name: 'Circular Arrangements',
            difficulty: 'Advanced',
            formulasCount: 2,
            progress: 80,
            cheatsheet: [
              "For N elements in a circle, the number of arrangements is (N - 1)!.",
              "Clockwise and counter-clockwise are identical: (N - 1)! / 2."
            ],
            formulas: [
              { label: 'Circular Permutations', equation: 'Circular Permutations = (N - 1)!' },
              { label: 'Symmetrical Circular Permutations', equation: 'Permutations = (N - 1)! / 2' }
            ],
            example: {
              question: "In how many ways can 6 people sit around a circular table?",
              solution: [
                "Here N = 6",
                "Number of ways = (N - 1)! = 5! = 120 ways"
              ]
            },
            video: {
              title: "Circular Arrangements: Permutations and Direction Constraints",
              duration: "13:10",
              videoUrl: "https://www.youtube.com/watch?v=2e6i44XmF2M"
            },
            mcq: {
              question: "In how many ways can 6 people sit around a circular table?",
              options: ["60 ways", "120 ways", "360 ways", "720 ways"],
              correctAnswer: "120 ways",
              explanation: "Circular permutations = (6 - 1)! = 5! = 120."
            }
          }
        ]
      }
    ]
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    icon: '📖',
    color: '#10B981',
    subTopics: [
      {
        id: 'grammar',
        name: 'Grammar & Syntax',
        concepts: [
          {
            id: 'tenses',
            name: 'Tenses & Voice Rules',
            difficulty: 'Beginner',
            formulasCount: 2,
            progress: 60,
            cheatsheet: [
              "Subject-Verb Agreement: A singular subject takes a singular verb, plural takes plural.",
              "Passive Voice formula: Object + auxiliary verb + Past Participle (V3) + by + Subject."
            ],
            formulas: [
              { label: 'Active Voice Pattern', equation: 'Subject + Verb + Object' },
              { label: 'Passive Voice Pattern', equation: 'Object + Aux + V3 + by + Subject' }
            ],
            example: {
              question: "Convert to passive: 'The cat chased the mouse.'",
              solution: [
                "Subject = The cat, Verb = chased, Object = the mouse",
                "Passive form: 'The mouse was chased by the cat.'"
              ]
            },
            video: {
              title: "English Grammar: Tenses and Active/Passive Voice Transformations",
              duration: "20:35",
              videoUrl: "https://www.youtube.com/watch?v=84jVz0D1yKM"
            },
            mcq: {
              question: "Convert to passive: 'The cat chased the mouse.'",
              options: [
                "The mouse is chased by the cat.",
                "The mouse was chased by the cat.",
                "The mouse had chased the cat.",
                "The cat was chased by the mouse."
              ],
              correctAnswer: "The mouse was chased by the cat.",
              explanation: "Chased is simple past. In passive it becomes 'was chased'."
            }
          }
        ]
      }
    ]
  },
  {
    id: 'coding',
    name: 'Coding & DSA',
    icon: '💻',
    color: '#F97316',
    subTopics: [
      {
        id: 'structures',
        name: 'Data Structures',
        concepts: [
          {
            id: 'arrays',
            name: 'Arrays & Two-Pointer Problems',
            difficulty: 'Beginner',
            formulasCount: 2,
            progress: 70,
            cheatsheet: [
              "Two-pointer technique reduces nested loops O(N^2) to linear time O(N) for sorted arrays.",
              "Sliding Window is used for contiguous subarray/substring optimization."
            ],
            formulas: [
              { label: 'Linear Search Complexity', equation: 'Time Complexity = O(N)' },
              { label: 'Binary Search Complexity', equation: 'Time Complexity = O(log N)' }
            ],
            example: {
              question: "Given a sorted array, check if there exists a pair with sum K.",
              solution: [
                "Initialize left at 0 and right at N - 1.",
                "While left < right: sum = arr[left] + arr[right]",
                "- If sum == K, return true.",
                "- If sum < K, increment left.",
                "- If sum > K, decrement right.",
                "Return false if no pair."
              ]
            },
            video: {
              title: "DSA: Two-Pointer Technique & Array Sliding Window Guide",
              duration: "17:15",
              videoUrl: "https://www.youtube.com/watch?v=2wB11yAMDlE"
            },
            coding: {
              statement: "Given a binary array nums, return the maximum number of consecutive 1s in the array.",
              templateCode: {
                python: "class Solution:\n    def findMaxConsecutiveOnes(self, nums: list[int]) -> int:\n        # Write Python code here\n        pass",
                javascript: "class Solution {\n    findMaxConsecutiveOnes(nums) {\n        // Write JavaScript code here\n        return 0;\n    }\n}",
                cpp: "class Solution {\npublic:\n    int findMaxConsecutiveOnes(vector<int>& nums) {\n        // Write C++ code here\n        return 0;\n    }\n};"
              },
              correctCode: {
                python: "class Solution:\n    def findMaxConsecutiveOnes(self, nums: list[int]) -> int:\n        count = 0\n        max_count = 0\n        for num in nums:\n            if num == 1:\n                count += 1\n                if count > max_count:\n                    max_count = count\n            else:\n                count = 0\n        return max_count",
                javascript: "class Solution {\n    findMaxConsecutiveOnes(nums) {\n        let count = 0, max = 0;\n        for (let num of nums) {\n            if (num === 1) {\n                count++;\n                if (count > max) max = count;\n            } else {\n                count = 0;\n            }\n        }\n        return max;\n    }\n}",
                cpp: "class Solution {\npublic:\n    int findMaxConsecutiveOnes(vector<int>& nums) {\n        int count = 0, max_c = 0;\n        for (int num : nums) {\n            if (num == 1) {\n                count++;\n                max_c = max(max_c, count);\n            } else {\n                count = 0;\n            }\n        }\n        return max_c;\n    }\n};"
              },
              testCases: [
                { input: "[1, 1, 0, 1, 1, 1]", expected: "3" },
                { input: "[1, 0, 1, 1, 0, 1]", expected: "2" }
              ]
            }
          }
        ]
      },
      {
        id: 'algorithms',
        name: 'Algorithmic Complexity',
        concepts: [
          {
            id: 'recursion',
            name: 'Recursion & Call Stacks',
            difficulty: 'Intermediate',
            formulasCount: 1,
            progress: 40,
            cheatsheet: [
              "Always define a clear base case to avoid stack overflow errors.",
              "Recursive calls utilize the system call stack. Recursion depth matches max call stack height."
            ],
            formulas: [
              { label: 'Master Theorem', equation: 'T(n) = a T(n/b) + f(n)' }
            ],
            example: {
              question: "Explain the worst-case space complexity of recursive Fibonacci function F(n) = F(n-1) + F(n-2).",
              solution: [
                "Fibonacci recursion creates a binary recursion tree.",
                "Max recursion depth (call stack height) reaches size O(N).",
                "Therefore, auxiliary space complexity is O(N)."
              ]
            },
            video: {
              title: "Recursion & Call Stacks: Stack Tracing and Visualizations",
              duration: "21:40",
              videoUrl: "https://www.youtube.com/watch?v=M2uOpmE0Av0"
            },
            coding: {
              statement: "Given a non-negative integer n, return the n-th Fibonacci number using recursion. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).",
              templateCode: {
                python: "class Solution:\n    def fib(self, n: int) -> int:\n        # Write Python code here\n        pass",
                javascript: "class Solution {\n    fib(n) {\n        // Write JavaScript code here\n        return 0;\n    }\n}",
                cpp: "class Solution {\npublic:\n    int fib(int n) {\n        // Write C++ code here\n        return 0;\n    }\n};"
              },
              correctCode: {
                python: "class Solution:\n    def fib(self, n: int) -> int:\n        if n <= 1:\n            return n\n        return self.fib(n-1) + self.fib(n-2)",
                javascript: "class Solution {\n    fib(n) {\n        if (n <= 1) return n;\n        return this.fib(n - 1) + this.fib(n - 2);\n    }\n}",
                cpp: "class Solution {\npublic:\n    int fib(int n) {\n        if (n <= 1) return n;\n        return fib(n - 1) + fib(n - 2);\n    }\n};"
              },
              testCases: [
                { input: "2", expected: "1" },
                { input: "4", expected: "3" }
              ]
            }
          }
        ]
      }
    ]
  }
];

// Helper to extract Youtube ID
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const authSupabase = createAuthClient();

  const slug = (params?.domainId as string) || 'quantitative-aptitude';
  const slugMap: Record<string, string> = {
    'quantitative-aptitude': 'quant',
    'logical-reasoning': 'logical',
    'verbal-ability': 'verbal',
    'coding-dsa': 'coding'
  };
  const activeDomainId = slugMap[slug] || 'quant';

  // ---------------------------------------------------------
  // Original Domain Details Dashboard States
  // ---------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [progress, setProgress] = useState<DomainProgress | null>(null);
  const [weakest, setWeakest] = useState<{ name: string; accuracy: number } | null>(null);
  const [strongest, setStrongest] = useState<{ name: string; accuracy: number } | null>(null);
  const [radarData, setRadarData] = useState<RadarPoint[]>([]);
  const [insights, setInsights] = useState<InsightInfo[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearningInfo | null>(null);
  const [topics, setTopics] = useState<TopicGridItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // Concepts Workspace States
  // ---------------------------------------------------------
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [profile, setProfile] = useState<any>({
    username: 'Vaishnavi Raparthy',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    primary_goal: 'Campus Placements',
    avatar: 'initial'
  });
  const [streak, setStreak] = useState(14);
  const [customColor, setCustomColor] = useState<string>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [themeMounted, setThemeMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Syllabus Milestone Reached! 🎓', message: 'You completed the Arithmetic & Algebra core challenges.', time: '2 hours ago', read: false },
    { id: 2, title: 'New Badge Earned! 🎖️', message: "Prestige Badge 'Solving Streak' has been added to your credentials.", time: '1 day ago', read: false },
    { id: 3, title: 'Weekly Performance Sync 📊', message: 'Your curriculum readiness index improved by +5.4%.', time: '3 days ago', read: true }
  ]);

  // Collapsible Tree State
  const [difficultyTier, setDifficultyTier] = useState<'Basic' | 'Advanced'>('Basic');
  const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({
    'arithmetic': true,
    'arrangements': true,
    'grammar': true,
    'structures': true
  });
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');
  const [bookmarkedConceptIds, setBookmarkedConceptIds] = useState<string[]>(['profit-loss']);

  // Tabs states
  const [centerTab, setCenterTab] = useState<'description' | 'editorial' | 'submissions' | 'discussion'>('editorial');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isStudyView, setIsStudyView] = useState<boolean>(false);

  // Coding Pane State
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [codeEditorText, setCodeEditorText] = useState<string>('');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [codeRunnerStatus, setCodeRunnerStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [codeRunnerOutput, setCodeRunnerOutput] = useState<string>('');
  const [celebrateSubmit, setCelebrateSubmit] = useState<boolean>(false);

  // MCQ Solver State
  const [selectedMcqOption, setSelectedMcqOption] = useState<string>('');
  const [mcqCheckStatus, setMcqCheckStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Calculator Utility State
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');

  // ---------------------------------------------------------
  // Fetch active taxonomy domain and concepts
  // ---------------------------------------------------------
  const domainConceptsData = useMemo(() => {
    return DOMAINS_CONCEPTS.find(d => d.id === activeDomainId) || DOMAINS_CONCEPTS[0];
  }, [activeDomainId]);

  const activeConcept = useMemo(() => {
    if (selectedConceptId) {
      for (const st of domainConceptsData.subTopics) {
        const found = st.concepts.find(c => c.id === selectedConceptId);
        if (found) return found;
      }
    }
    return domainConceptsData.subTopics[0]?.concepts[0];
  }, [selectedConceptId, domainConceptsData]);

  // Set default active concept and code text on mount/domain change
  useEffect(() => {
    if (domainConceptsData.subTopics[0]?.concepts[0]) {
      const defaultConcept = domainConceptsData.subTopics[0].concepts[0];
      setSelectedConceptId(defaultConcept.id);
      if (defaultConcept.coding?.templateCode?.[selectedLanguage]) {
        setCodeEditorText(defaultConcept.coding.templateCode[selectedLanguage]);
      }
    }
  }, [domainConceptsData]);

  // Sync editor text when active concept or active language changes
  useEffect(() => {
    if (activeConcept?.coding?.templateCode?.[selectedLanguage]) {
      setCodeEditorText(activeConcept.coding.templateCode[selectedLanguage]);
      setCodeRunnerStatus('idle');
      setCodeRunnerOutput('');
    }
  }, [activeConcept, selectedLanguage]);

  // Sync telemetry from localStorage and fetch database details
  useEffect(() => {
    setThemeMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const onboardingStored = localStorage.getItem('aptitude_onboarding_data');
    if (onboardingStored) {
      try {
        const data = JSON.parse(onboardingStored);
        setProfile((prev: any) => ({ ...prev, ...data }));
      } catch (_) {}
    }

    const savedCustomColor = localStorage.getItem('aptitude_custom_brand_color');
    if (savedCustomColor && savedCustomColor !== 'default') {
      setCustomColor(savedCustomColor);
      applyBrandColor(savedCustomColor);
    }

    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        setCurrentRole(JSON.parse(storedRole));
      } catch (_) {}
    }

    // Load original domain overview metrics from service
    const loadSessionAndData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await authSupabase.auth.getSession();
        if (session?.user?.email) setUserEmail(session.user.email);
        const activeUserId = session?.user?.id || '00000000-0000-0000-0000-000000000000';
        setUserId(activeUserId);

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
          getDomainById(slug),
          getDomainProgress(activeUserId, slug),
          getWeakestTopic(activeUserId, slug),
          getStrongestTopic(activeUserId, slug),
          getRadarData(activeUserId, slug),
          getSmartInsights(activeUserId, slug),
          getContinueLearning(activeUserId, slug),
          getDomainTopicsGrid(activeUserId, slug)
        ]);

        setDomainInfo(infoRes);
        setProgress(progressRes);
        setWeakest(weakestRes);
        setStrongest(strongestRes);
        
        const initialRadar = radarRes.map((pt) => ({
          ...pt,
          accuracy: 0,
          mastery: 0,
          completion: 0
        }));
        setRadarData(initialRadar);
        setTimeout(() => {
          setRadarData(radarRes);
        }, 120);
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
  }, [slug]);

  const applyBrandColor = (color: string) => {
    if (color === 'default') {
      document.documentElement.style.removeProperty('--clr-primary');
      document.documentElement.style.removeProperty('--clr-primary-rgb');
      document.documentElement.style.removeProperty('--clr-primary-dark');
    } else {
      document.documentElement.style.setProperty('--clr-primary', color);
      document.documentElement.style.setProperty('--clr-primary-dark', color);
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      document.documentElement.style.setProperty('--clr-primary-rgb', `${r}, ${g}, ${b}`);
    }
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
  const filteredTopics = useMemo(() => {
    return topics.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  // Toggle Subtopic Tree Expansion
  const toggleSubtopic = (id: string) => {
    setExpandedSubtopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle Bookmark state
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedConceptIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Code Runner Actions
  const runMockCode = () => {
    if (!activeConcept?.coding) return;
    setCodeRunnerStatus('running');
    setTimeout(() => {
      if (!activeConcept?.coding) return;
      const codeTrimmed = codeEditorText.replace(/\s+/g, '');
      const isCorrect = codeTrimmed.length > 50 && (
        codeTrimmed.includes('max') || 
        codeTrimmed.includes('count') || 
        codeTrimmed.includes('fib') || 
        codeTrimmed.includes('return')
      );
      
      if (isCorrect) {
        setCodeRunnerStatus('success');
        setCodeRunnerOutput(`Running Case 1...\nInput: nums = ${activeConcept.coding.testCases[0].input}\nOutput: ${activeConcept.coding.testCases[0].expected}\nExpected: ${activeConcept.coding.testCases[0].expected}\n\nRunning Case 2...\nInput: nums = ${activeConcept.coding.testCases[1].input}\nOutput: ${activeConcept.coding.testCases[1].expected}\nExpected: ${activeConcept.coding.testCases[1].expected}\n\n✓ All test cases passed successfully!`);
      } else {
        setCodeRunnerStatus('failed');
        setCodeRunnerOutput(`Running Case 1...\nInput: nums = ${activeConcept.coding.testCases[0].input}\nOutput: None\nExpected: ${activeConcept.coding.testCases[0].expected}\n\nError: IndentationError or SyntaxError during interpretation.\nPlease check your solution syntax.`);
      }
    }, 1200);
  };

  const submitMockCode = () => {
    if (!activeConcept?.coding) return;
    setCodeRunnerStatus('running');
    setTimeout(() => {
      setCodeRunnerStatus('success');
      setCodeRunnerOutput(`✓ Submitted Successfully!\nPassed all 142 dynamic evaluation test cases.\nRuntime: 12ms (Beats 94.6% of Python submissions).`);
      setCelebrateSubmit(true);
      setTimeout(() => setCelebrateSubmit(false), 3000);
    }, 1500);
  };

  // MCQ Check Action
  const checkMcqAnswer = () => {
    if (!activeConcept?.mcq) return;
    if (selectedMcqOption === activeConcept.mcq.correctAnswer) {
      setMcqCheckStatus('correct');
    } else {
      setMcqCheckStatus('wrong');
    }
  };

  // Calculator Utility Input
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        const sanitized = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  // Listen to keyboard events for Scratch Calculator
  useEffect(() => {
    if (!isWorkspaceOpen || activeDomainId === 'coding') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard events if typing inside inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key;

      if (/[0-9\.\(\)\+\-\*\/]/.test(key)) {
        e.preventDefault();
        setCalcInput(prev => prev + key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalcBtn('=');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleCalcBtn('DEL');
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCalcBtn('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWorkspaceOpen, activeDomainId, calcInput]);

  // Render view depending on toggled workspace state
  if (isWorkspaceOpen) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
        
        {/* Background gradients */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-500/3 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

        {/* Main Container Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* 1. Header Navigation Utilities */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 select-none z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWorkspaceOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-550 dark:text-slate-400 hover:scale-105 active:scale-95 transition-all cursor-pointer border-0"
                title="Back to Overview"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-black uppercase text-slate-450 dark:text-slate-550 tracking-wider">
                {domainConceptsData.name} Concepts Workspace
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification bell dropdown list */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="System Notifications"
                  className={`w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-550 dark:text-slate-400 relative hover:scale-105 active:scale-95 transition-all cursor-pointer ${showNotifications ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-left"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</span>
                        {notifications.some(n => !n.read) && (
                          <button
                            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                            className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer border-0 bg-transparent p-0"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))}
                            className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-left relative ${!n.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}
                          >
                            {!n.read && <span className="absolute top-3.5 left-1.5 w-1 h-1 bg-blue-600 rounded-full" />}
                            <div className="pl-2 space-y-0.5">
                              <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400">{n.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* 2. Main 3-Pane Work Area */}
          <div className="flex-1 flex overflow-hidden animate-fadeIn">

            {/* COLUMN 1: Left Collapsible tree sidebar (24%) */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/60 backdrop-blur-lg flex flex-col justify-between shrink-0 overflow-y-auto z-10 select-none">
              <div className="p-4 space-y-4">
                
                {/* Basic / Advanced selector tab capsule */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                  {(['Basic', 'Advanced'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setDifficultyTier(tier)}
                      className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        difficultyTier === tier
                          ? 'bg-white dark:bg-slate-800 text-[var(--clr-primary)] shadow-xs border-transparent'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                {/* Collapsible Subtopics & Concepts Tree */}
                <div className="space-y-3">
                  {domainConceptsData.subTopics.map(sub => {
                    const isExpanded = expandedSubtopics[sub.id];
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        
                        {/* Subtopic Header */}
                        <button
                          onClick={() => toggleSubtopic(sub.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-800 dark:text-slate-200 font-black text-[10.5px] uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent text-left"
                        >
                          <span className="truncate">{sub.name}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {/* Nested Concepts */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-3 space-y-1"
                            >
                              {sub.concepts.map(concept => {
                                const isConceptActive = concept.id === activeConcept.id;
                                const isCompleted = concept.progress === 100;
                                const isBookmarked = bookmarkedConceptIds.includes(concept.id);
                                
                                return (
                                  <div
                                    key={concept.id}
                                    onClick={() => setSelectedConceptId(concept.id)}
                                    className={`w-full flex items-center justify-between pl-3 pr-2 py-2 rounded-xl text-left cursor-pointer transition-all duration-200 ${
                                      isConceptActive
                                        ? 'bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] border-l-4 border-[var(--clr-primary)] font-bold'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400 font-semibold'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="shrink-0">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                          <CheckCircle2 className="w-4 h-4 text-slate-350 dark:text-slate-600" />
                                        )}
                                      </span>
                                      <span className="text-[11.5px] truncate tracking-tight uppercase leading-none">
                                        {concept.name}
                                      </span>
                                    </div>
                                    
                                    <button
                                      onClick={(e) => toggleBookmark(concept.id, e)}
                                      className="p-1 rounded-md text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer border-0 bg-transparent"
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-[var(--clr-primary)] fill-current' : 'text-slate-400'}`} />
                                    </button>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Avatar Info Widget */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    {profile.avatar && profile.avatar !== 'initial' ? (
                      <img src={profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-400 font-mono">
                        {profile.username.substring(0,2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white truncate max-w-[100px] leading-tight">
                      {profile.username}
                    </h4>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                      Day 70/180
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => router.push('/student/dashboard?tab=badges')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer border-0 bg-transparent"
                    title="My Credentials"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>

            {/* COLUMN 2: Center Video & Details tab pane (38%) */}
            <main className="flex-1 border-r border-slate-200 dark:border-slate-900 flex flex-col justify-between bg-white dark:bg-slate-950/20 overflow-y-auto">
              
              {/* Top Workspace Tab switches */}
              <div className="h-11 border-b border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between px-6 shrink-0 select-none">
                <div className="flex gap-4">
                  {(['description', 'editorial', 'submissions', 'discussion'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setCenterTab(tab);
                        setIsVideoPlaying(false);
                      }}
                      className={`h-11 border-b-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        centerTab === tab
                          ? 'border-[var(--clr-primary)] text-[var(--clr-primary)]'
                          : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {centerTab === 'editorial' && (
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Study View</span>
                    <button
                      onClick={() => setIsStudyView(!isStudyView)}
                      className={`w-8 h-4 rounded-full transition-all relative border border-slate-355 dark:border-slate-700 ${isStudyView ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-900'}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0 transition-all ${isStudyView ? 'left-4' : 'left-0'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable pane details */}
              <div className="flex-1 p-6 space-y-6 text-left overflow-y-auto">
                <AnimatePresence mode="wait">
                  {centerTab === 'editorial' && (
                    <motion.div
                      key="editorial"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {activeConcept.video && (
                        <div className="space-y-3.5">
                          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md group">
                            {isVideoPlaying ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(activeConcept.video.videoUrl)}?autoplay=1&rel=0`}
                                title={activeConcept.video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full border-0 absolute inset-0"
                              />
                            ) : (
                              <div 
                                onClick={() => setIsVideoPlaying(true)}
                                className="relative w-full h-full cursor-pointer overflow-hidden group"
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${getYouTubeId(activeConcept.video.videoUrl)}/hqdefault.jpg`}
                                  alt={activeConcept.video.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/35 transition-colors duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:bg-rose-500 group-hover:scale-110 active:scale-95 transition-all duration-300 relative">
                                    <div className="absolute inset-0 rounded-full bg-rose-600/20 animate-ping opacity-75" />
                                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                                  </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 z-10">
                                  <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                                    {activeConcept.video.title}
                                  </p>
                                  <span className="shrink-0 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-mono text-slate-200 border border-white/10 font-bold uppercase tracking-wider">
                                    {activeConcept.video.duration}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          {activeConcept.name} Walkthrough
                        </h2>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                          Detailed editorial explanation & solution steps
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Intuition
                        </h3>
                        <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                          To resolve the primary questions of {activeConcept.name}, we construct a logical step-by-step framework to identify patterns. For instance:
                          {activeConcept.cheatsheet.map((point, index) => (
                            <span key={index} className="block mt-1 pl-3 border-l-2 border-[var(--clr-primary)]/45 font-semibold">
                              • {point}
                            </span>
                          ))}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Approach & Steps
                        </h3>
                        <div className="space-y-2 pl-3 border-l-2 border-emerald-500/40">
                          {activeConcept.example.solution.map((step, sIdx) => (
                            <div key={sIdx} className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                              <span className="text-emerald-500 font-bold font-mono mr-1">{sIdx + 1}.</span> {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {centerTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          Problem Statement
                        </h2>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                          Difficulty: {activeConcept.difficulty}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 text-xs sm:text-sm font-semibold text-slate-850 dark:text-slate-300 leading-relaxed">
                        {activeConcept.coding?.statement || activeConcept.mcq?.question}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Example Format
                        </h3>
                        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-355 space-y-1">
                          <div><strong>Example Question:</strong> {activeConcept.example.question}</div>
                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-900/50 mt-2">
                            <strong>Solution Sequence:</strong>
                            {activeConcept.example.solution.map((s, idx) => (
                              <div key={idx} className="pl-3 opacity-90">• {s}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {centerTab === 'submissions' && (
                    <motion.div
                      key="submissions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          Submission Registry
                        </h2>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                          Telemetry analysis of compiling evaluations
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                              <th className="py-2.5 pr-4">Timestamp</th>
                              <th className="py-2.5 px-4">Language</th>
                              <th className="py-2.5 px-4">Status</th>
                              <th className="py-2.5 pl-4">Runtime</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-semibold text-slate-655 dark:text-slate-350">
                            <tr>
                              <td className="py-3.5 pr-4 text-slate-400 font-mono text-[10px]">Just now</td>
                              <td className="py-3.5 px-4 uppercase font-mono">{selectedLanguage}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded bg-emerald-550 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-extrabold uppercase">Accepted</span>
                              </td>
                              <td className="py-3.5 pl-4 font-mono">14ms</td>
                            </tr>
                            <tr className="opacity-70">
                              <td className="py-3.5 pr-4 text-slate-400 font-mono text-[10px]">2 days ago</td>
                              <td className="py-3.5 px-4 uppercase font-mono">{selectedLanguage}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[9.5px] font-extrabold uppercase">Wrong Answer</span>
                              </td>
                              <td className="py-3.5 pl-4 font-mono">--</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {centerTab === 'discussion' && (
                    <motion.div
                      key="discussion"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          Discussion Forum
                        </h2>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">
                          Solve strategies shared by VIT candidates
                        </span>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-800 dark:text-slate-200 uppercase">Siddharth Sen (TCS Mock Top Ranker)</span>
                            <span className="text-slate-400 font-mono">3 hours ago</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-semibold">
                            "I found that optimizing fractions makes calculations for Percentages very fast. In the exam, remembering that 1/12 equals 8.33% saved me at least 40 seconds!"
                          </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-800 dark:text-slate-200 uppercase">Sneha Roy</span>
                            <span className="text-slate-400 font-mono">1 day ago</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-semibold">
                            "Did anyone solve Case 2 on array indices with recursion? Make sure to set n &lt; 0 check to prevent stack overflows."
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom action row */}
              <div className="h-16 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 px-6 flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest font-mono">
                  Curriculum v2.4 • Active
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allConcepts = domainConceptsData.subTopics.flatMap(s => s.concepts);
                      const idx = allConcepts.findIndex(c => c.id === activeConcept.id);
                      if (idx > 0) {
                        setSelectedConceptId(allConcepts[idx - 1].id);
                        setIsVideoPlaying(false);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 text-[10px] font-black uppercase text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      const allConcepts = domainConceptsData.subTopics.flatMap(s => s.concepts);
                      const idx = allConcepts.findIndex(c => c.id === activeConcept.id);
                      if (idx !== -1 && idx < allConcepts.length - 1) {
                        setSelectedConceptId(allConcepts[idx + 1].id);
                        setIsVideoPlaying(false);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 text-[10px] font-black uppercase text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </main>

            {/* COLUMN 3: Right Coding / Solver Workspace (38%) */}
            <aside className="w-96 border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/60 backdrop-blur-lg flex flex-col justify-between shrink-0 overflow-y-auto z-10">
              
              {activeDomainId === 'coding' ? (
                <div className="flex-grow flex flex-col justify-between h-full relative">
                  <AnimatePresence>
                    {celebrateSubmit && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-50 select-none"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                          <Check className="w-8 h-8 stroke-[3]" />
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">Accepted!</h3>
                        <p className="text-xs text-slate-350 leading-relaxed font-semibold mt-1">
                          All evaluate test cases passed successfully.<br />
                          +150 XP earned. Progress updated!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="h-11 border-b border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between px-4 shrink-0 select-none">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-[var(--clr-primary)]" />
                        <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white font-mono">Python Workspace</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value as any)}
                          className="py-1 px-2.5 rounded bg-slate-100 border border-slate-250 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-655 dark:text-slate-300 cursor-pointer focus:outline-none"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="cpp">C++</option>
                        </select>
                        <button
                          onClick={() => {
                            if (activeConcept?.coding?.templateCode?.[selectedLanguage]) {
                              setCodeEditorText(activeConcept.coding.templateCode[selectedLanguage]);
                            }
                            setCodeRunnerStatus('idle');
                            setCodeRunnerOutput('');
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-550 hover:text-slate-800 dark:hover:text-white cursor-pointer border-0"
                          title="Reset Code Template"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 font-mono text-[11px] leading-relaxed flex items-stretch bg-slate-950 border-b border-slate-900 overflow-y-auto">
                      <div className="w-10 bg-slate-950/80 border-r border-slate-900 text-right pr-2.5 py-4 text-slate-600 select-none">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div key={idx} className="h-5">{idx + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={codeEditorText}
                        onChange={(e) => setCodeEditorText(e.target.value)}
                        className="flex-1 bg-transparent border-0 outline-none text-slate-200 py-4 px-3 resize-none font-mono text-[11.5px] leading-relaxed h-full overflow-y-auto focus:ring-0 focus:ring-offset-0"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="h-64 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/40 select-none overflow-hidden shrink-0">
                    <div className="flex-grow flex flex-col justify-between overflow-hidden">
                      <div className="h-10 border-b border-slate-200 dark:border-slate-900 bg-slate-100/60 dark:bg-slate-900/20 flex items-center justify-between px-4 shrink-0">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-black uppercase text-slate-505 tracking-wider">Test Cases</span>
                        </div>
                        <div className="flex gap-1.5">
                          {activeConcept.coding?.testCases.map((tc, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTestCaseIdx(idx)}
                              className={`py-0.5 px-2 rounded-md text-[9px] font-bold font-mono transition-colors border cursor-pointer ${
                                selectedTestCaseIdx === idx
                                  ? 'bg-white border-slate-250 dark:bg-slate-900 dark:border-slate-800 text-[var(--clr-primary)]'
                                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-655'
                              }`}
                            >
                              Case {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex-grow p-4 bg-slate-950 font-mono text-[10px] text-slate-350 text-left overflow-y-auto leading-relaxed">
                        {codeRunnerStatus === 'idle' ? (
                          <div className="space-y-2">
                            <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest block font-mono">Input Parameter</span>
                            <div className="bg-slate-900/60 border border-slate-900 p-2.5 rounded-lg text-slate-300">
                              nums = {activeConcept.coding?.testCases[selectedTestCaseIdx].input}
                            </div>
                          </div>
                        ) : codeRunnerStatus === 'running' ? (
                          <div className="flex items-center gap-2 text-blue-400 py-4 justify-center">
                            <span className="w-4 h-4 rounded-full border border-blue-400 border-t-transparent animate-spin" />
                            <span>Compiling evaluation tests...</span>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap">{codeRunnerOutput}</pre>
                        )}
                      </div>
                    </div>

                    <div className="h-14 border-t border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-950/20 px-4 flex items-center justify-between gap-3 shrink-0">
                      <button
                        onClick={runMockCode}
                        className="flex-1 py-2 bg-slate-200 hover:bg-slate-250 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-xs border-0 cursor-pointer"
                      >
                        Run Code
                      </button>
                      <button
                        onClick={submitMockCode}
                        className="flex-1 py-2 bg-[var(--clr-primary)] hover:brightness-110 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md border-0 cursor-pointer"
                      >
                        Submit Code
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-between h-full select-none p-4 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-200/50 dark:border-slate-900 rounded-2xl text-left space-y-3.5">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-4.5 h-4.5 text-[var(--clr-primary)]" />
                      <span className="text-[10px] font-black text-slate-850 dark:text-white uppercase tracking-widest block leading-none font-mono">
                        Formulas & Rules
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {activeConcept.formulas.map((formula, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase block font-mono">
                            {formula.label}
                          </span>
                          <div className="bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200/40 dark:border-slate-900/80 font-mono text-[10px] text-center select-all font-semibold overflow-x-auto" style={{ color: domainConceptsData.color }}>
                            {formula.equation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeConcept.mcq && (
                    <div className="flex-1 flex flex-col justify-between border border-slate-200/50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/25 p-4 rounded-2xl text-left">
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4.5 h-4.5 text-[var(--clr-primary)]" />
                          <span className="text-[10px] font-black text-slate-850 dark:text-white uppercase tracking-widest block leading-none font-mono">
                            Concept Practice Challenge
                          </span>
                        </div>
                        
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-355 leading-relaxed">
                          {activeConcept.mcq.question}
                        </p>

                        <div className="space-y-2">
                          {activeConcept.mcq.options.map((opt, oIdx) => {
                            const isOptionSelected = selectedMcqOption === opt;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setSelectedMcqOption(opt);
                                  setMcqCheckStatus('idle');
                                }}
                                className={`w-full py-2.5 px-3.5 rounded-xl border text-[11px] font-bold text-left cursor-pointer transition-all duration-200 ${
                                  isOptionSelected
                                    ? 'bg-[var(--clr-primary)]/10 border-[var(--clr-primary)] text-[var(--clr-primary)]'
                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900 text-slate-655 dark:text-slate-355 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                                }`}
                              >
                                <span className="font-mono text-slate-400 mr-2 uppercase">{(String.fromCharCode(97 + oIdx))} .</span> {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        <AnimatePresence mode="wait">
                          {mcqCheckStatus !== 'idle' && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className={`p-3 rounded-xl text-[10px] font-semibold leading-relaxed border ${
                                mcqCheckStatus === 'correct'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {mcqCheckStatus === 'correct' ? (
                                <div>
                                  <span className="font-black uppercase tracking-wider block mb-0.5">✓ Correct!</span>
                                  {activeConcept.mcq.explanation}
                                </div>
                              ) : (
                                <div>
                                  <span className="font-black uppercase tracking-wider block mb-0.5">✗ Incorrect</span>
                                  Try reviewing the cheatsheet formulas and try again.
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={checkMcqAnswer}
                          disabled={!selectedMcqOption}
                          className={`w-full py-2 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md border-0 cursor-pointer ${
                            selectedMcqOption
                              ? 'bg-[var(--clr-primary)] hover:brightness-110'
                              : 'bg-slate-200 text-slate-450 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed shadow-none'
                          }`}
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 border border-slate-200/50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl text-left space-y-3 shrink-0">
                    <div className="flex items-center gap-1.5 select-none">
                      <Terminal className="w-4.5 h-4.5 text-[var(--clr-primary)]" />
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest block leading-none font-mono">
                        Scratch Calculator
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-right font-mono space-y-1 overflow-hidden min-h-[46px] flex flex-col justify-end">
                      <div className="text-[10px] text-slate-500 overflow-x-auto whitespace-nowrap">{calcInput || '0'}</div>
                      <div className="text-sm font-bold text-emerald-500 overflow-x-auto whitespace-nowrap">{calcResult || '0.00'}</div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold select-none">
                      {['C', 'DEL', '(', ')'].map(k => (
                        <button key={k} onClick={() => handleCalcBtn(k)} className="py-1 px-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-350 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer border-0">{k}</button>
                      ))}
                      {['7', '8', '9', '/'].map(k => (
                        <button key={k} onClick={() => handleCalcBtn(k)} className="py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">{k}</button>
                      ))}
                      {['4', '5', '6', '*'].map(k => (
                        <button key={k} onClick={() => handleCalcBtn(k)} className="py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">{k}</button>
                      ))}
                      {['1', '2', '3', '-'].map(k => (
                        <button key={k} onClick={() => handleCalcBtn(k)} className="py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">{k}</button>
                      ))}
                      {['0', '.', '=', '+'].map(k => (
                        <button 
                          key={k} 
                          onClick={() => handleCalcBtn(k)} 
                          className={`py-1 px-1.5 rounded-lg cursor-pointer border-0 ${
                            k === '='
                              ? 'bg-[var(--clr-primary)] hover:brightness-110 text-white font-black'
                              : 'bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>
      </div>
    );
  }

  // Default View: Original Domain Overview Dashboard
  return (
    <div ref={mainContainerRef} className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Background radial gradient meshes */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-500/3 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-[76px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col items-center py-6 h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300 select-none">
        {/* Top Logo Button */}
        <button
          onClick={() => router.push('/student/dashboard?tab=dashboard')}
          className="w-12 h-12 rounded-full bg-[var(--clr-primary)] text-white flex items-center justify-center shadow-md mb-8 cursor-pointer hover:scale-105 transition-all duration-300 border-0 outline-none"
          title="Dashboard"
          type="button"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Sidebar Navigation tabs */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full overflow-y-auto scrollbar-none py-2">
          {[
            { id: 'domains', label: 'Domains', icon: LayoutGrid, route: '/student/dashboard?tab=domains' },
            { id: 'learning', label: 'Learning Roadmap', route: '/student/dashboard?tab=learning', icon: BookOpen },
            { id: 'mockTests', label: 'Mock Tests', route: '/student/dashboard?tab=mockTests', icon: Award },
            { id: 'careerHub', label: 'Career Hub', route: '/student/dashboard?tab=careerHub', icon: Briefcase },
            { id: 'leaderboards', label: 'Leaderboard Rankings', route: '/student/dashboard?tab=leaderboards', icon: Trophy },
            { id: 'badges', label: 'Badges & Achievements', route: '/student/dashboard?tab=badges', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === 'domains';
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

          {currentRole?.role === 'admin' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-900 w-full flex flex-col gap-3 items-center">
              <button
                onClick={() => router.push('/admin/editor')}
                title="Content Creator (Admin)"
                className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-105 transition-all cursor-pointer border-0 bg-transparent"
              >
                <SettingsIcon className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                title="Admin Dashboard"
                className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105 transition-all cursor-pointer border-0 bg-transparent"
              >
                <Layers className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center justify-between bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0 select-none z-20">
          <div className="flex flex-col items-start text-left">
            <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-white flex items-center gap-2">
              {domainInfo?.name || 'Loading Domain...'} 🚀
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              LEARNING JOURNEY DETAIL AND ACCURACY METRICS
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Daily Streak Badge */}
            <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/25 px-4 py-2 rounded-2xl shadow-[0_4px_12px_rgba(99,102,241,0.03)] select-none shrink-0">
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2 leading-none">
                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif" alt="flame" className="w-6 h-6 object-contain animate-pulse" />
                {streak}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative w-64 sm:w-80 select-none">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-555" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter concepts..."
                className="w-full bg-white dark:bg-slate-900/10 border-2 border-slate-350 dark:border-white/60 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:dark:border-white focus:shadow-[0_0_15px_rgba(37,99,235,0.05)] shadow-[0_4px_15px_rgba(0,0,0,0.01)] transition-all"
              />
            </div>

            {/* User role badge */}
          </div>
        </header>

        {/* Scrollable Content Panel Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
          <div className="w-full flex-1 flex flex-col justify-between space-y-6">
            
            {/* Header Breadcrumbs Row */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900 pb-4 select-none">
              <button
                onClick={() => router.push('/student/dashboard?tab=domains')}
                className="group flex items-center gap-2 text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
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
                  <div className="space-y-3 flex-1 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Learning Journey Detail</span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                      {domainInfo?.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono font-extrabold text-slate-505 dark:text-slate-400 select-none">
                      <div className="flex items-center gap-1.5">
                        <BookOpenCheck className="w-4 h-4 text-[var(--clr-primary)]" />
                        <span>{progress?.solvedCount} / {progress?.totalCount} Problems Solved</span>
                      </div>
                      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 self-center" />
                      <div className="flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-655 dark:text-emerald-400" />
                        <span>{progress?.accuracy}% Accuracy</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular mastery circle */}
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
                        <span className="text-[7.5px] text-slate-400 dark:text-slate-505 font-extrabold uppercase tracking-widest mt-1 leading-none">
                          Mastery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Summary widgets row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                  {/* Accuracy Card */}
                  <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-[var(--clr-primary)]/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-[var(--clr-primary)]/10 flex items-center justify-center text-[var(--clr-primary)] shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        Overall Accuracy
                      </span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white font-mono block leading-none">
                        {progress?.accuracy}%
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-550 dark:text-slate-400 block">
                        Steady performance rate
                      </span>
                    </div>
                  </div>

                  {/* Weakest Focus Areas Card */}
                  <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-orange-200 dark:hover:border-orange-905 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-955/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5 max-w-[calc(100%-3.5rem)] text-left">
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        Weakest Focus Areas
                      </span>
                      <span className="text-sm font-black text-slate-800 dark:text-white truncate block leading-tight">
                        {weakest?.name}
                      </span>
                      <span className="text-[9.5px] font-extrabold text-orange-700 dark:text-orange-450 block font-mono">
                        Needs improvement ({weakest?.accuracy}% accuracy)
                      </span>
                    </div>
                  </div>

                  {/* Strongest Focus Areas Card */}
                  <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5 max-w-[calc(100%-3.5rem)] text-left">
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest block">
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

                {/* Bento layout summary grids */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* Radial Skills Profiler */}
                  <div className="lg:col-span-3 bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[24px] p-6 md:p-8 flex flex-col justify-between gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-300">
                    <div className="space-y-1 select-none text-left">
                      <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                        Dynamic Skill Profiler
                      </h2>
                      <p className="text-[10px] font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-widest">
                        Competence breakdown mapped across subtopic domains
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-4">
                      {radarData.length > 0 ? (
                        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
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
                                  <text
                                    x={cx}
                                    y={cy - r * (pct / 100) + 4}
                                    className="fill-slate-355 dark:fill-slate-600 font-mono text-[7.5px] text-center"
                                    textAnchor="middle"
                                  >
                                    {pct}%
                                  </text>
                                </g>
                              );
                            })}

                            {radarData.map((pt, i) => {
                              const N = radarData.length;
                              const cx = 150;
                              const cy = 150;
                              const r = 90;
                              const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                              const px = cx + r * Math.cos(angle);
                              const py = cy + r * Math.sin(angle);

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

                            <polygon
                              points={getRadarCoordinates(radarData, 'accuracy')}
                              className="fill-[var(--clr-primary)]/10 stroke-[var(--clr-primary)] transition-all duration-700"
                              strokeWidth="2.5"
                            />

                            <polygon
                              points={getRadarCoordinates(radarData, 'completion')}
                              className="fill-purple-500/10 stroke-purple-600 dark:stroke-purple-400 transition-all duration-700"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />

                            {radarData.map((pt, i) => {
                              const N = radarData.length;
                              const cx = 150;
                              const cy = 150;
                              const r = 90;
                              const angle = (i * 2 * Math.PI) / N - Math.PI / 2;

                              const ax = cx + r * (pt.accuracy / 100) * Math.cos(angle);
                              const ay = cy + r * (pt.accuracy / 100) * Math.sin(angle);
                              const cxCoord = cx + r * (pt.completion / 100) * Math.cos(angle);
                              const cyCoord = cy + r * (pt.completion / 100) * Math.sin(angle);

                              return (
                                <g key={i}>
                                  <circle
                                    cx={ax}
                                    cy={ay}
                                    r="4"
                                    className="fill-[var(--clr-primary)] stroke-white dark:stroke-slate-950 transition-all"
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

                    <div className="flex items-center justify-center gap-6 border-t border-slate-100 dark:border-slate-900/60 pt-4 text-[9.5px] font-extrabold uppercase tracking-widest select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3 bg-[var(--clr-primary)]/20 border border-[var(--clr-primary)] rounded-sm" />
                        <span className="text-slate-755 dark:text-slate-400">Accuracy (%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3 bg-purple-500/20 border border-dashed border-purple-600 dark:border-purple-400 rounded-sm" />
                        <span className="text-slate-755 dark:text-slate-400">Topic Completion (%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Column */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Continue Learning card */}
                    {continueLearning && (
                      <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--clr-primary)]/40 transition-all duration-300 text-left">
                        <div className="space-y-1 select-none">
                          <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">
                            Up Next Checklist
                          </span>
                          <span className="text-xs font-black text-[var(--clr-primary)] uppercase tracking-wider block">
                            Recommended Topic
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                            {continueLearning.name}
                          </h3>

                          <div className="space-y-1.5 select-none">
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 dark:text-slate-505">
                              <span>Completeness</span>
                              <span>{continueLearning.progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[var(--clr-primary)]"
                                style={{ width: `${continueLearning.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-extrabold text-slate-505 dark:text-slate-400 block pt-0.5">
                              Solved {continueLearning.solved} / {continueLearning.total} tasks
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const allConcepts = domainConceptsData.subTopics.flatMap(s => s.concepts);
                            const found = allConcepts.find(c => c.id === continueLearning?.topicId);
                            if (found) setSelectedConceptId(found.id);
                            else setSelectedConceptId(allConcepts[0]?.id || '');
                            setIsWorkspaceOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--clr-primary)] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-[var(--clr-primary)]/15 border-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>Resume Lesson</span>
                        </button>
                      </div>
                    )}

                    {/* AI Insights Card */}
                    <div className="bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-2xl p-5 flex flex-col justify-between gap-4 text-left">
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
                                  : 'bg-[var(--clr-primary)]/10 border-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)]/10 dark:border-[var(--clr-primary)]/20 text-[var(--clr-primary)]'
                              }`}
                            >
                              <span className="shrink-0 mt-0.5">
                                {isWarning ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-550 dark:text-amber-500" />
                                ) : isSuccess ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-555" />
                                ) : (
                                  <Info className="w-4 h-4 text-[var(--clr-primary)]" />
                                )}
                              </span>
                              <span className="text-[11px] font-medium leading-relaxed">
                                {ins.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 flex flex-wrap gap-2 select-none">
                        <button
                          onClick={() => router.push('/student/dashboard?tab=learning')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide cursor-pointer transition-colors"
                        >
                          Roadmap
                        </button>
                        <button
                          onClick={() => router.push('/student/dashboard?tab=mockTests')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide cursor-pointer transition-colors"
                        >
                          Speed Test
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Checklist Grid replacement table */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-3">
                    <div className="space-y-1 select-none text-left">
                      <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider font-heading">
                        Domain Concepts & Modules
                      </h2>
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-widest">
                        Detailed breakdown of syllabus completion status
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64 select-none">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter concepts..."
                        className="w-full bg-white dark:bg-slate-900/10 border border-slate-200/80 dark:border-slate-900/50 rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold placeholder-slate-400 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[var(--clr-primary)] transition-all"
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
                                ? 'hover:border-[var(--clr-primary)]/40'
                                : 'opacity-85 hover:border-slate-300 dark:hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 text-left">
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

                              <div className="shrink-0 select-none">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-100/50 dark:border-emerald-900/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Completed</span>
                                  </span>
                                ) : isInProgress ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] text-[9px] font-black uppercase tracking-wider border border-[var(--clr-primary)]/20">
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

                            <div className="space-y-1.5 select-none text-left">
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-950/50 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isCompleted
                                      ? 'bg-emerald-500'
                                      : isInProgress
                                      ? 'bg-[var(--clr-primary)]'
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

                            <div className="border-t border-slate-100 dark:border-slate-950/80 pt-3 select-none flex justify-end">
                              {isLocked ? (
                                <button
                                  disabled
                                  className="flex items-center gap-1 text-[9px] font-black text-slate-444 dark:text-slate-550 uppercase tracking-widest cursor-not-allowed border-0 bg-transparent"
                                >
                                  <span>Locked</span>
                                  <Lock className="w-3 h-3" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const allConcepts = domainConceptsData.subTopics.flatMap(s => s.concepts);
                                    const found = allConcepts.find(c => c.id === topic.id);
                                    if (found) setSelectedConceptId(found.id);
                                    else setSelectedConceptId(allConcepts[0]?.id || '');
                                    setIsWorkspaceOpen(true);
                                  }}
                                  className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer border-0 bg-transparent ${
                                    isCompleted
                                      ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                                      : 'text-[var(--clr-primary)] hover:opacity-85'
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
                        <HelpCircle className="w-8 h-8 text-slate-350 dark:text-slate-655 mx-auto" />
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          No Matching Concepts
                        </h3>
                        <p className="text-[11px] text-slate-505 dark:text-slate-400 font-medium">
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

    </div>
  );
}
