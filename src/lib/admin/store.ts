import { Domain, Question, SidebarItem, UserRole } from './types';

export const DOMAINS_DATA: Domain[] = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    subTopics: [
      {
        id: 'arithmetic',
        name: 'Arithmetic',
        concepts: [
          { id: 'percentages', name: 'Percentages' },
          { id: 'profit-loss', name: 'Profit & Loss' },
          { id: 'ratios', name: 'Ratios & Proportions' },
          { id: 'simple-interest', name: 'Simple & Compound Interest' },
          { id: 'time-work', name: 'Time & Work' },
          { id: 'time-speed', name: 'Time, Speed & Distance' }
        ]
      },
      {
        id: 'algebra',
        name: 'Algebra',
        concepts: [
          { id: 'linear-eq', name: 'Linear Equations' },
          { id: 'quadratic-eq', name: 'Quadratic Equations' },
          { id: 'progressions', name: 'AP, GP & HP' },
          { id: 'functions', name: 'Functions & Graphs' }
        ]
      },
      {
        id: 'geometry',
        name: 'Geometry & Mensuration',
        concepts: [
          { id: 'triangles', name: 'Triangles & Properties' },
          { id: 'circles', name: 'Circles & Tangents' },
          { id: 'volumes', name: 'Surface Areas & Volumes' }
        ]
      }
    ]
  },
  {
    id: 'logical',
    name: 'Logical Reasoning',
    subTopics: [
      {
        id: 'arrangements',
        name: 'Arrangements',
        concepts: [
          { id: 'linear-arr', name: 'Linear Arrangements' },
          { id: 'circular-arr', name: 'Circular Arrangements' }
        ]
      },
      {
        id: 'syllogisms',
        name: 'Syllogisms',
        concepts: [
          { id: 'basic-syll', name: 'Basic Syllogisms' },
          { id: 'conditional-syll', name: 'Conditional Syllogisms' }
        ]
      }
    ]
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    subTopics: [
      {
        id: 'grammar',
        name: 'Grammar & Usage',
        concepts: [
          { id: 'tenses', name: 'Tenses & Active/Passive' },
          { id: 'prepositions', name: 'Prepositions & Conjunctions' }
        ]
      },
      {
        id: 'comprehension',
        name: 'Reading Comprehension',
        concepts: [
          { id: 'inference', name: 'Inference-based questions' },
          { id: 'vocabulary', name: 'Contextual Vocabulary' }
        ]
      }
    ]
  }
];

export const COMPANY_POOL: string[] = [
  'TCS',
  'Infosys',
  'Amazon',
  'Google',
  'Microsoft',
  'Wipro',
  'Cognizant',
  'Capgemini',
  'Goldman Sachs',
  'Morgan Stanley',
  'Netflix',
  'Meta',
  'Adobe',
  'Uber'
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/admin/dashboard' },
  { id: 'editor', label: 'Content Studio', icon: 'PenTool', href: '/admin/editor' },
  { id: 'directory', label: 'Directory', icon: 'BookOpen', href: '/admin/directory' },
  { id: 'users', label: 'Users & Roles', icon: 'Users', href: '/admin/users' },
  { id: 'analytics', label: 'Performance Analytics', icon: 'BarChart3', href: '/admin/analytics' },
  { id: 'settings', label: 'System Settings', icon: 'Settings', href: '/admin/settings' },
  { id: 'documentation', label: 'API Documentation', icon: 'FileCode', href: '/admin/docs' },
  { id: 'logout', label: 'Log Out', icon: 'LogOut', href: '/' }
];

export const USER_ROLES: UserRole[] = [
  {
    role: 'admin',
    name: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    email: 'sarah.c@aptitude-ai.com'
  },
  {
    role: 'editor',
    name: 'Marcus Wright',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    email: 'marcus.w@aptitude-ai.com'
  }
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'Q-8029-X',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'percentages',
    difficulty: 'EASY',
    companyTags: ['TCS', 'Amazon'],
    shuffleOptions: true,
    questionStem: `A merchant sells an item at a profit of 20%. If he had bought it at 20% less and sold it for $10 less, he would have gained 25%. Find the cost price.

### Step-by-Step Solution:
1. Let the original Cost Price (CP) be $100x$.
2. The original Selling Price (SP) is $120x$ (since profit is 20%).
3. The new CP is $80x$ (20% less).
4. The new SP is $120x - 10$ ($10 less).
5. The profit gained is 25% on the new CP:
   $$\\text{New SP} = 1.25 \\times \\text{New CP}$$
   $$120x - 10 = 1.25 \\times 80x$$
   $$120x - 10 = 100x$$
   $$20x = 10 \\implies x = 0.5$$
6. Therefore, the original CP is:
   $$100x = 100 \\times 0.5 = \\$50$$`,
    hintText: 'Express the New Selling Price in terms of the initial CP $x$.',
    options: [
      { id: 'A', text: '$50 (CP = 100x)', isCorrect: true, metadata: '33.33%' },
      { id: 'B', text: '$60 (CP = 120x)', isCorrect: false, metadata: '25.00%' },
      { id: 'C', text: '$45 (CP = 90x)', isCorrect: false, metadata: '40.00%' },
      { id: 'D', text: 'None of these', isCorrect: false, metadata: '1.67%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'MASTERING ARITHMETIC PERCENTAGES',
    videoDuration: '12:45',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 12, 2023'
  },
  {
    id: 'Q-7142-M',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'time-speed',
    difficulty: 'MEDIUM',
    companyTags: ['Wipro'],
    shuffleOptions: true,
    questionStem: `Two trains of lengths 190m and 210m are running in opposite directions at 50 km/h and 30 km/h respectively. In what time will they pass each other?

### Step-by-Step Solution:
1. Relative speed when moving in opposite directions:
   $$\\text{Relative Speed} = 50 + 30 = 80 \\text{ km/h}$$
2. Convert speed to m/s:
   $$80 \\times \\frac{5}{18} = \\frac{200}{9} \\text{ m/s}$$
3. Total distance to cover:
   $$\\text{Distance} = 190 + 210 = 400 \\text{ meters}$$
4. Time taken to pass:
   $$\\text{Time} = \\frac{\\text{Distance}}{\\text{Speed}} = \\frac{400}{\\frac{200}{9}} = 400 \\times \\frac{9}{200} = 18 \\text{ seconds}$$`,
    hintText: 'Add their speeds for relative velocity and convert km/h to m/s by multiplying by 5/18.',
    options: [
      { id: 'A', text: '18 seconds', isCorrect: true, metadata: '72.00%' },
      { id: 'B', text: '15 seconds', isCorrect: false, metadata: '14.50%' },
      { id: 'C', text: '20 seconds', isCorrect: false, metadata: '10.00%' },
      { id: 'D', text: '22 seconds', isCorrect: false, metadata: '3.50%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'RELATIVE SPEED RUNNING TRAINS',
    videoDuration: '09:15',
    videoThumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600',
    status: 'Published',
    createdAt: 'Oct 10, 2023'
  },
  {
    id: 'Q-6201-H',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: ' quadratic-eq',
    difficulty: 'HARD',
    companyTags: ['Google', 'Microsoft'],
    shuffleOptions: true,
    questionStem: `Find the remainder when 3^202 is divided by 10.

### Step-by-Step Solution:
1. We need to find $3^{202} \\pmod{10}$.
2. Analyze the power cycle of 3:
   - $3^1 \\equiv 3 \\pmod{10}$
   - $3^2 \\equiv 9 \\pmod{10}$
   - $3^3 \\equiv 7 \\pmod{10}$
   - $3^4 \\equiv 1 \\pmod{10}$ (The cycle repeats every 4 powers).
3. Divide the exponent 202 by the cycle length 4:
   $$202 \\div 4 = 50 \\text{ with a remainder of } 2$$
4. Therefore:
   $$3^{202} \\equiv 3^2 \\equiv 9 \\pmod{10}$$
5. The remainder is 9.`,
    hintText: 'Find the cyclicity of the unit digit for number 3.',
    options: [
      { id: 'A', text: '9', isCorrect: true, metadata: '45.80%' },
      { id: 'B', text: '3', isCorrect: false, metadata: '28.10%' },
      { id: 'C', text: '1', isCorrect: false, metadata: '19.40%' },
      { id: 'D', text: '7', isCorrect: false, metadata: '6.70%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'EXPONENT REMAINDERS & CYCLICITY',
    videoDuration: '11:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600',
    status: 'Draft',
    createdAt: 'Oct 08, 2023'
  },
  {
    id: 'V-4432-E',
    domainId: 'verbal',
    subTopicId: 'comprehension',
    conceptId: 'vocabulary',
    difficulty: 'EASY',
    companyTags: ['Infosys'],
    shuffleOptions: false,
    questionStem: `Select the synonym of the word 'Prolific'.

### Step-by-Step Solution:
1. Prolific means producing much fruit, or foliage, or many offspring; highly productive.
2. Synonyms include: productive, creative, fertile, abundant.
3. Therefore, 'productive' is the correct option.`,
    hintText: 'A prolific writer is one who publishes a large number of books or articles.',
    options: [
      { id: 'A', text: 'Productive', isCorrect: true, metadata: '89.20%' },
      { id: 'B', text: 'Barren', isCorrect: false, metadata: '4.30%' },
      { id: 'C', text: 'Scarce', isCorrect: false, metadata: '3.50%' },
      { id: 'D', text: 'Dull', isCorrect: false, metadata: '3.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'COMPREHENSIVE VOCABULARY CRASH COURSE',
    videoDuration: '06:50',
    videoThumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
    status: 'Published',
    createdAt: 'Oct 05, 2023'
  }
];
