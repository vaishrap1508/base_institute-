'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Sparkles, 
  BookOpen, 
  Play, 
  Zap, 
  X, 
  Brain, 
  Code2, 
  Calculator, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  Video
} from 'lucide-react';

// Extract YouTube ID helper
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Concept data interfaces
interface Concept {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  formulasCount: number;
  progress: number;
  cheatsheet: string[];
  formulas: { label: string; equation: string }[];
  example: { question: string; solution: string[] };
  video?: {
    title: string;
    duration: string;
    videoUrl: string;
  };
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
  bgGlow: string;
  btnColor: string;
  subTopics: SubTopic[];
}

// Domain taxonomy matching project domains
const DOMAINS_CONCEPTS: DomainData[] = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    icon: '🔢',
    color: 'var(--clr-primary)',
    bgGlow: 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]',
    btnColor: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]',
    subTopics: [
      {
        id: 'arithmetic',
        name: 'Arithmetic Foundations',
        concepts: [
          {
            id: 'percentages',
            name: 'Percentages & Applications',
            difficulty: 'Beginner',
            formulasCount: 4,
            progress: 75,
            cheatsheet: [
              "Fraction conversions are essential for speed (e.g., 1/6 = 16.67%, 1/8 = 12.5%, 1/12 = 8.33%).",
              "A% of B is equal to B% of A: (A * B) / 100.",
              "Successive percentage changes of x% and y% result in a net change of: x + y + (xy / 100) %.",
              "If A's salary is x% more than B's, B's salary is [x / (100 + x)] * 100% less than A's."
            ],
            formulas: [
              { label: 'Basic Percentage', equation: '\\text{Percentage} = \\left( \\frac{\\text{Value}}{\\text{Total}} \\right) \\times 100' },
              { label: 'Percentage Increase', equation: '\\% \\text{ Increase} = \\left( \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\right) \\times 100' },
              { label: 'Successive Percentage', equation: '\\text{Net Change} = x + y + \\frac{xy}{100}' }
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
            }
          },
          {
            id: 'profit-loss',
            name: 'Profit & Loss Metrics',
            difficulty: 'Intermediate',
            formulasCount: 5,
            progress: 40,
            cheatsheet: [
              "Profit or Loss is always calculated on the Cost Price (CP) unless specified otherwise.",
              "Selling Price (SP) = CP * (1 + Profit/100) or CP * (1 - Loss/100).",
              "If the cost price of x articles equals the selling price of y articles, the profit percentage is: [(x - y) / y] * 100 %.",
              "Equivalent discount of successive discounts of d1% and d2% is: d1 + d2 - (d1 * d2 / 100) %."
            ],
            formulas: [
              { label: 'Profit Percentage', equation: '\\text{Profit \\%} = \\left( \\frac{\\text{SP} - \\text{CP}}{\\text{CP}} \\right) \\times 100' },
              { label: 'Cost Price Formula', equation: '\\text{CP} = \\frac{\\text{SP}}{1 + \\frac{\\text{Profit \\%}}{100}}' },
              { label: 'Successive Discounts', equation: '\\text{Net Discount} = d_1 + d_2 - \\frac{d_1 d_2}{100}' }
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
            }
          },
          {
            id: 'simple-interest',
            name: 'Simple & Compound Interest',
            difficulty: 'Intermediate',
            formulasCount: 4,
            progress: 20,
            cheatsheet: [
              "Simple Interest (SI) remains constant every year, while Compound Interest (CI) grows exponentially.",
              "For 2 years, the difference between CI and SI is: P * (R / 100)^2.",
              "Rule of 72: A principal doubles in approximately 72 / R years under compound interest.",
              "If a sum triples under SI in T years, the rate is: R = 200 / T %."
            ],
            formulas: [
              { label: 'Simple Interest', equation: '\\text{SI} = \\frac{P \\times R \\times T}{100}' },
              { label: 'Compound Amount', equation: '\\text{Amount} = P \\left( 1 + \\frac{R}{100} \\right)^T' },
              { label: 'Interest Difference (2 yrs)', equation: '\\text{CI} - \\text{SI} = P \\left( \\frac{R}{100} \\right)^2' }
            ],
            example: {
              question: "Find the compound interest on $10,000 at 10% per annum for 2 years.",
              solution: [
                "Principal (P) = $10,000, Rate (R) = 10%, Time (T) = 2 years",
                "Amount = 10,000 * (1 + 10/100)^2",
                "Amount = 10,000 * (1.1)^2 = 10,000 * 1.21 = $12,100",
                "Interest = Amount - Principal = 12,100 - 10,000 = $2,100"
              ]
            },
            video: {
              title: "Simple & Compound Interest: Formula Derivations and Practice",
              duration: "22:10",
              videoUrl: "https://www.youtube.com/watch?v=M5yG2_XwOOk"
            }
          },
          {
            id: 'time-work',
            name: 'Time & Work Rates',
            difficulty: 'Intermediate',
            formulasCount: 3,
            progress: 85,
            cheatsheet: [
              "Work = Rate * Time. Rate of work is inversely proportional to the time taken.",
              "If A takes x days and B takes y days individually, together they take (x * y) / (x + y) days.",
              "Chain Rule: M1 * D1 * H1 / W1 = M2 * D2 * H2 / W2 (Men, Days, Hours, Work)."
            ],
            formulas: [
              { label: 'Combined Rate', equation: '\\frac{1}{T_{\\text{together}}} = \\frac{1}{T_A} + \\frac{1}{T_B}' },
              { label: 'Work Chain Rule', equation: '\\frac{M_1 D_1 H_1}{W_1} = \\frac{M_2 D_2 H_2}{W_2}' }
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
            }
          },
          {
            id: 'time-speed',
            name: 'Time, Speed & Distance',
            difficulty: 'Advanced',
            formulasCount: 4,
            progress: 60,
            cheatsheet: [
              "Convert km/h to m/s by multiplying by 5/18; convert m/s to km/h by multiplying by 18/5.",
              "Average Speed for equal distances: 2 * s1 * s2 / (s1 + s2).",
              "Relative Speed: moving in same direction = s1 - s2, moving in opposite directions = s1 + s2.",
              "Time taken to cross a platform: Time = (Train Length + Platform Length) / Speed."
            ],
            formulas: [
              { label: 'Average Speed', equation: '\\text{Avg Speed} = \\frac{2 v_1 v_2}{v_1 + v_2}' },
              { label: 'Relative Speed (Opp)', equation: '\\text{Relative Speed} = v_1 + v_2' },
              { label: 'Relative Speed (Same)', equation: '\\text{Relative Speed} = v_1 - v_2' }
            ],
            example: {
              question: "Two trains of lengths 190m and 210m are running in opposite directions at 50 km/h and 30 km/h. In what time will they pass each other?",
              solution: [
                "Total Distance = 190m + 210m = 400m",
                "Relative Speed = 50 + 30 = 80 km/h",
                "Relative Speed in m/s = 80 * (5/18) = 200/9 m/s",
                "Time = Distance / Speed = 400 / (200/9) = 400 * 9 / 200 = 18 seconds"
              ]
            },
            video: {
              title: "Time, Speed & Distance: Relative Speed and Train Crossings",
              duration: "25:30",
              videoUrl: "https://www.youtube.com/watch?v=33K9iY1R4cQ"
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
              { label: 'Quadratic Roots', equation: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
              { label: 'Sum of Roots', equation: '\\alpha + \\beta = -\\frac{b}{a}' },
              { label: 'Product of Roots', equation: '\\alpha \\beta = \\frac{c}{a}' }
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
    color: 'var(--clr-primary)',
    bgGlow: 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]',
    btnColor: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]',
    subTopics: [
      {
        id: 'arrangements',
        name: 'Structural Arrangements',
        concepts: [
          {
            id: 'linear-arr',
            name: 'Linear Arrangements',
            difficulty: 'Intermediate',
            formulasCount: 2,
            progress: 60,
            cheatsheet: [
              "Draw slot representations to visualize relative coordinates.",
              "Always place elements with the most concrete/fixed constraints first.",
              "If 'A is adjacent to B', group them as 'AB' or 'BA' and treat them as a single entity.",
              "Identify the direction: 'facing North' (left is left, right is right) vs 'facing South' (left/right are reversed)."
            ],
            formulas: [
              { label: 'Linear Permutations', equation: '\\text{Ways to arrange N objects} = N!' }
            ],
            example: {
              question: "Five friends A, B, C, D, E are sitting in a row facing North. A is to the immediate right of B. C is between D and E. If D is at the left end, who is sitting next to D?",
              solution: [
                "Draw slots: _ _ _ _ _",
                "Constraint 1: D is at the left end. Slots: D _ _ _ _",
                "Constraint 2: C is between D and E. This places C at slot 2 and E at slot 3. Slots: D C E _ _",
                "Constraint 3: A is to the immediate right of B. Slots: D C E B A",
                "Hence, C is sitting next to D."
              ]
            },
            video: {
              title: "Linear Arrangements: Step-by-Step Arrangement Logic",
              duration: "16:40",
              videoUrl: "https://www.youtube.com/watch?v=Yf1R28rNnSg"
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
              "If clockwise and counter-clockwise arrangements are considered identical (like keyrings), the formula is (N - 1)! / 2.",
              "Facing center: left is clockwise, right is counter-clockwise.",
              "Facing outside: left is counter-clockwise, right is clockwise."
            ],
            formulas: [
              { label: 'Circular Permutations', equation: '\\text{Circular permutations} = (N - 1)!' },
              { label: 'Identical Circular Paths', equation: '\\text{Permutations (Symmetrical)} = \\frac{(N - 1)!}{2}' }
            ],
            example: {
              question: "In how many ways can 6 people sit around a circular table?",
              solution: [
                "Here N = 6",
                "Number of ways = (N - 1)!",
                "Ways = (6 - 1)! = 5! = 5 * 4 * 3 * 2 * 1 = 120 ways"
              ]
            },
            video: {
              title: "Circular Arrangements: Permutations and Direction Constraints",
              duration: "13:10",
              videoUrl: "https://www.youtube.com/watch?v=2e6i44XmF2M"
            }
          }
        ]
      },
      {
        id: 'deduction',
        name: 'Logical Deductions',
        concepts: [
          {
            id: 'basic-syll',
            name: 'Syllogisms & Truth Tables',
            difficulty: 'Intermediate',
            formulasCount: 3,
            progress: 15,
            cheatsheet: [
              "Use Venn Diagrams to represent statements visually.",
              "Understand standard representations: 'All A are B' (A is subset of B), 'Some A are B' (A intersects B).",
              "Analyze logical boundaries: 'No A is B' (disjoint sets), 'Some A are not B' (A is not completely inside B)."
            ],
            formulas: [
              { label: 'Universal Affirmative', equation: '\\text{All A are B} \\implies A \\subseteq B' },
              { label: 'Universal Negative', equation: '\\text{No A is B} \\implies A \\cap B = \\emptyset' }
            ],
            example: {
              question: "Statements: All stars are planets. Some planets are moons. Conclusion: Are some stars moons?",
              solution: [
                "Venn Diagram representation:",
                "- Draw a circle for Stars inside a circle for Planets.",
                "- Draw a circle for Moons that intersects the Planets circle.",
                "Verify connection: Moons circle may or may not intersect Stars.",
                "Conclusion: It is possible but not logically certain. Answer: Maybe, not certain."
              ]
            },
            video: {
              title: "Syllogisms & Truth Tables: Venn Diagram Deduction Rules",
              duration: "19:05",
              videoUrl: "https://www.youtube.com/watch?v=uK1XW1G9Xn0"
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
    color: 'var(--clr-primary)',
    bgGlow: 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]',
    btnColor: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]',
    subTopics: [
      {
        id: 'grammar',
        name: 'Grammar & Syntax',
        concepts: [
          {
            id: 'tenses',
            name: 'Tenses & Active/Passive Rules',
            difficulty: 'Beginner',
            formulasCount: 2,
            progress: 60,
            cheatsheet: [
              "Subject-Verb Agreement: A singular subject takes a singular verb, plural takes a plural verb.",
              "Active Voice emphasizes the doer: Subject + Verb + Object.",
              "Passive Voice emphasizes the action: Object + auxiliary verb + Past Participle (V3) + by + Subject.",
              "Present continuous 'is writing' becomes passive 'is being written'."
            ],
            formulas: [
              { label: 'Active Voice', equation: '\\text{Subject} + \\text{Verb} + \\text{Object}' },
              { label: 'Passive Voice', equation: '\\text{Object} + \\text{Auxiliary} + \\text{V3} + \\text{by } \\text{Subject}' }
            ],
            example: {
              question: "Convert to passive: 'The cat chased the mouse.'",
              solution: [
                "Identify components: Subject = The cat, Verb = chased (past tense), Object = the mouse",
                "Apply passive formula: Object + was/were + V3 + by + Subject",
                "Passive form: 'The mouse was chased by the cat.'"
              ]
            },
            video: {
              title: "English Grammar: Tenses and Active/Passive Voice Transformations",
              duration: "20:35",
              videoUrl: "https://www.youtube.com/watch?v=84jVz0D1yKM"
            }
          }
        ]
      }
    ]
  },
  {
    id: 'coding',
    name: 'Gaming Aptitude',
    icon: '🎮',
    color: 'var(--clr-primary)',
    bgGlow: 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]',
    btnColor: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]',
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
              "Sliding Window is used for contiguous subarray/substring optimization.",
              "Kadane's Algorithm computes maximum subarray sum in O(N) time and O(1) space."
            ],
            formulas: [
              { label: 'Linear Search Complexity', equation: '\\text{Time Complexity} = O(N)' },
              { label: 'Binary Search Complexity', equation: '\\text{Time Complexity} = O(\\log N)' }
            ],
            example: {
              question: "Given a sorted array, check if there exists a pair with sum K.",
              solution: [
                "Initialize left pointer at 0 and right pointer at N - 1.",
                "While left < right:",
                "- If arr[left] + arr[right] == K, return true.",
                "- If arr[left] + arr[right] < K, increment left.",
                "- If arr[left] + arr[right] > K, decrement right.",
                "Return false if no such pair is found."
              ]
            },
            video: {
              title: "DSA: Two-Pointer Technique & Array Sliding Window Guide",
              duration: "17:15",
              videoUrl: "https://www.youtube.com/watch?v=2wB11yAMDlE"
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
            formulasCount: 2,
            progress: 40,
            cheatsheet: [
              "Always define a clear base case to avoid stack overflow errors.",
              "Recursive calls utilize the system call stack. Recursion depth matches max call stack height.",
              "Divide and Conquer splits problems into subproblems (e.g., Merge Sort)."
            ],
            formulas: [
              { label: 'Master Theorem', equation: 'T(n) = a T\\left(\\frac{n}{b}\\right) + f(n)' }
            ],
            example: {
              question: "Explain the worst-case space complexity of recursive Fibonacci function F(n) = F(n-1) + F(n-2).",
              solution: [
                "Fibonacci recursion creates a binary recursion tree.",
                "Max recursion depth (call stack height) reaches size O(N).",
                "Therefore, auxiliary space complexity is O(N) even though time complexity is O(2^N)."
              ]
            },
            video: {
              title: "Recursion & Call Stacks: Stack Tracing and Visualizations",
              duration: "21:40",
              videoUrl: "https://www.youtube.com/watch?v=M2uOpmE0Av0"
            }
          }
        ]
      }
    ]
  }
];

interface ConceptHubTabProps {
  searchQuery: string;
  setActiveSidebarTab: (tab: 'dashboard' | 'domains' | 'learning' | 'practice' | 'mockTests' | 'careerHub' | 'leaderboards' | 'profile' | 'settings' | 'badges') => void;
  setSelectedDomain: (domain: string) => void;
  setActiveQuestion?: (question: any) => void;
  customColor?: string;
}

export default function ConceptHubTab({ 
  searchQuery, 
  setActiveSidebarTab, 
  setSelectedDomain, 
  setActiveQuestion,
  customColor = 'default'
}: ConceptHubTabProps) {
  
  const isCustomActive = customColor !== 'default';

  const domainsWithColors = useMemo(() => {
    return DOMAINS_CONCEPTS.map(domain => {
      if (isCustomActive) {
        return {
          ...domain,
          color: 'var(--clr-primary)',
          bgGlow: 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]',
          btnColor: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]',
        };
      } else {
        const defaults: Record<string, { color: string; bgGlow: string; btnColor: string }> = {
          quant: {
            color: '#3B82F6',
            bgGlow: 'hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:border-blue-200/80 dark:hover:border-blue-900/60 dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)]',
            btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-400',
          },
          logical: {
            color: '#8B5CF6',
            bgGlow: 'hover:shadow-[0_20px_40px_rgba(139,92,246,0.08)] hover:border-purple-200/80 dark:hover:border-purple-900/60 dark:hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)]',
            btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 dark:bg-purple-500 dark:hover:bg-purple-400',
          },
          verbal: {
            color: '#10B981',
            bgGlow: 'hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200/80 dark:hover:border-emerald-900/60 dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)]',
            btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 dark:bg-emerald-500 dark:hover:bg-emerald-400',
          },
          coding: {
            color: '#F97316',
            bgGlow: 'hover:shadow-[0_20px_40px_rgba(249,115,22,0.08)] hover:border-orange-200/80 dark:hover:border-orange-900/60 dark:hover:shadow-[0_20px_40px_rgba(249,115,22,0.12)]',
            btnColor: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20 dark:bg-orange-500 dark:hover:bg-orange-400',
          }
        };
        return {
          ...domain,
          ...(defaults[domain.id] || defaults.quant)
        };
      }
    });
  }, [isCustomActive]);
  
  const [activeDomainId, setActiveDomainId] = useState<string>('quant');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  const activeDomain = useMemo(() => {
    return domainsWithColors.find(d => d.id === activeDomainId) || domainsWithColors[0];
  }, [activeDomainId, domainsWithColors]);

  // Search filter logic
  const filteredSubTopics = useMemo(() => {
    if (!searchQuery.trim()) return activeDomain.subTopics;

    const query = searchQuery.toLowerCase();
    return activeDomain.subTopics.map(subTopic => {
      const matchingConcepts = subTopic.concepts.filter(concept => 
        concept.name.toLowerCase().includes(query) ||
        concept.cheatsheet.some(point => point.toLowerCase().includes(query))
      );
      return {
        ...subTopic,
        concepts: matchingConcepts
      };
    }).filter(subTopic => subTopic.concepts.length > 0);
  }, [activeDomain, searchQuery]);

  return (
    <div className="w-full space-y-6 text-slate-800 dark:text-slate-200 animate-fadeIn">
      {/* 2. Top Domain Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-900 overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
        {domainsWithColors.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDomainId(d.id);
              setSelectedDomain(d.id);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeDomainId === d.id
                ? 'bg-[#111827] dark:bg-white text-white dark:text-slate-900 shadow-md scale-102'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-base leading-none">{d.icon}</span>
            <span>{d.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Concepts Grid */}
      <div className="space-y-8">
        {filteredSubTopics.length > 0 ? (
          filteredSubTopics.map((subTopic) => (
            <div key={subTopic.id} className="space-y-4 text-left">
              {/* Subtopic Header */}
              <div className="flex items-center gap-3 select-none">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: activeDomain.color }} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                  {subTopic.name}
                </h3>
                <div className="flex-grow h-px bg-slate-200/60 dark:bg-slate-900/60" />
              </div>

              {/* Concepts Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subTopic.concepts.map((concept) => {
                  const difficultyColor = 
                    concept.difficulty === 'Beginner' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                    concept.difficulty === 'Intermediate' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                    'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';

                  return (
                    <div
                      key={concept.id}
                      onClick={() => {
                        setSelectedConcept(concept);
                        setIsVideoPlaying(false);
                      }}
                      className={`group bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[20px] p-5 flex flex-col justify-between gap-5 transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.01)] ${activeDomain.bgGlow}`}
                    >
                      {/* Top Header info */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${difficultyColor}`}>
                            {concept.difficulty}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                            <Calculator className="w-3.5 h-3.5" />
                            {concept.formulasCount} Formulas
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug tracking-tight">
                            {concept.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold line-clamp-2">
                            {concept.cheatsheet[0]}
                          </p>
                        </div>
                      </div>

                      {/* Bottom progress bar & Button */}
                      <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3.5 space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            <span>Syllabus Progress</span>
                            <span>{concept.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${concept.progress}%`,
                                backgroundColor: activeDomain.color 
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider select-none text-slate-500 dark:text-slate-400">
                          <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                            Quick Revision →
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                            Explore Sheet
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-3xl p-8 space-y-3 select-none">
            <Brain className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No matching concepts found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">We couldn't find any concepts matching "{searchQuery}" under {activeDomain.name}.</p>
          </div>
        )}
      </div>

      {/* 4. Interactive Quick Revision Full-Screen Panel */}
      <AnimatePresence>
        {selectedConcept && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed inset-0 w-full h-full bg-white dark:bg-[#070b13] z-50 flex flex-col justify-between overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="h-20 border-b border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 select-none">
              <div className="max-w-6xl mx-auto w-full h-full px-6 md:px-10 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none font-mono">
                    Revision Sheet
                  </span>
                  <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider leading-none mt-2">
                    {selectedConcept.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedConcept(null);
                    setIsVideoPlaying(false);
                  }}
                  className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-50/30 dark:bg-slate-950/10">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Video & Solved Example) */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  {/* Section 1.5: Video explanation */}
                  {selectedConcept.video && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-5 h-5 text-rose-500" />
                        Video Explanation
                      </h4>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-md group">
                        {isVideoPlaying ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(selectedConcept.video.videoUrl)}?autoplay=1&rel=0`}
                            title={selectedConcept.video.title}
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
                              src={`https://img.youtube.com/vi/${getYouTubeId(selectedConcept.video.videoUrl)}/hqdefault.jpg`}
                              alt={selectedConcept.video.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors duration-300 flex flex-col justify-between p-5" />
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:bg-rose-500 group-hover:scale-110 active:scale-95 transition-all duration-300 relative">
                                <div className="absolute inset-0 rounded-full bg-rose-600/30 animate-ping opacity-75" />
                                <Play className="w-6 h-6 fill-current translate-x-0.5" />
                              </div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 z-10">
                              <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md">
                                {selectedConcept.video.title}
                              </p>
                              <span className="shrink-0 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] font-mono text-slate-200 border border-white/10 font-bold uppercase tracking-wider">
                                {selectedConcept.video.duration}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Solved Example */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      Step-by-Step Example
                    </h4>
                    <div className="bg-amber-50/15 dark:bg-amber-950/5 border border-amber-200/30 dark:border-amber-900/30 p-5 rounded-3xl space-y-4">
                      <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase leading-snug">
                        Question: {selectedConcept.example.question}
                      </div>
                      <div className="space-y-2.5 border-t border-amber-200/20 dark:border-amber-900/25 pt-4">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1 font-mono">
                          Solution steps
                        </span>
                        {selectedConcept.example.solution.map((step, sIdx) => (
                          <div key={sIdx} className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                            {sIdx + 1}. {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Cheatsheet & Formulas) */}
                <div className="lg:col-span-5 space-y-8 text-left">
                  {/* Section 1: Concept summary list */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5" style={{ color: activeDomain.color }} />
                      Core Cheatsheet Points
                    </h4>
                    <ul className="space-y-3">
                      {selectedConcept.cheatsheet.map((point, index) => (
                        <li key={index} className="flex gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                          <span className="shrink-0 mt-1 select-none">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 2: Mathematical formulas */}
                  {selectedConcept.formulas.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Calculator className="w-5 h-5" style={{ color: activeDomain.color }} />
                        Key Rules & Formulas
                      </h4>
                      <div className="space-y-4">
                        {selectedConcept.formulas.map((formula, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-50 dark:bg-slate-950/60 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-900/60 flex flex-col gap-2 transition-colors"
                          >
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                              {formula.label}
                            </span>
                            {/* Pseudo LaTeX styled equation block */}
                            <div className="bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200/40 dark:border-slate-900/80 font-mono text-xs text-center select-all font-semibold overflow-x-auto" style={{ color: activeDomain.color }}>
                              {formula.equation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Action Footer */}
            <div className="h-24 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 select-none">
              <div className="max-w-6xl mx-auto w-full h-full px-6 md:px-10 flex items-center">
                <button
                  onClick={() => {
                    setSelectedConcept(null);
                    setIsVideoPlaying(false);
                    // Switch to Practice Arena tab
                    setActiveSidebarTab('practice');
                    // Automatically filter by active domain
                    setSelectedDomain(activeDomainId);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-md hover:brightness-110"
                  style={{ backgroundColor: activeDomain.color }}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Practice this concept</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
