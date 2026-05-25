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
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'content', label: 'Content Management', icon: 'BookOpen', badge: 'Active' },
  { id: 'users', label: 'Users & Roles', icon: 'Users' },
  { id: 'analytics', label: 'Performance Analytics', icon: 'BarChart3' },
  { id: 'settings', label: 'System Settings', icon: 'Settings' },
  { id: 'documentation', label: 'API Documentation', icon: 'FileText' },
  { id: 'logout', label: 'Log Out', icon: 'LogOut' }
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
  },
  {
    role: 'reviewer',
    name: 'John Connor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'john.c@aptitude-ai.com'
  }
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'Q-8829-X',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'percentages',
    difficulty: 'MEDIUM',
    companyTags: ['TCS', 'Infosys', 'Amazon'],
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
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'
  },
  {
    id: 'Q-4491-A',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: 'quadratic-eq',
    difficulty: 'EASY',
    companyTags: ['Microsoft', 'Google'],
    shuffleOptions: false,
    questionStem: `Find the roots of the quadratic equation for $x$:

$$ x^2 + 5x + 6 = 0 $$

### Step-by-Step Solution:
1. We factorize the quadratic equation by splitting the middle term:
   $$x^2 + 3x + 2x + 6 = 0$$
   $$x(x + 3) + 2(x + 3) = 0$$
   $$(x + 2)(x + 3) = 0$$
2. Solving for $x$ gives:
   $$x = -2 \\quad \\text{or} \\quad x = -3$$
3. These are the roots of the equation.`,
    hintText: 'Split the middle term $5x$ into two numbers that multiply to $6$ and add up to $5$.',
    options: [
      { id: 'A', text: 'x = -2 or x = -3', isCorrect: true, metadata: '68.50%' },
      { id: 'B', text: 'x = 2 or x = 3', isCorrect: false, metadata: '18.20%' },
      { id: 'C', text: 'x = -1 or x = -6', isCorrect: false, metadata: '10.30%' },
      { id: 'D', text: 'x = 1 or x = 6', isCorrect: false, metadata: '3.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'QUADRATIC FACTORIZATION 101',
    videoDuration: '08:20',
    videoThumbnail: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?w=600'
  },
  {
    id: 'Q-9902-B',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'time-work',
    difficulty: 'HARD',
    companyTags: ['Goldman Sachs', 'Uber', 'Meta'],
    shuffleOptions: true,
    questionStem: `A and B can complete a piece of work in 12 days and 18 days respectively. They begin working together, but A leaves 3 days before the completion of the work. In how many days was the total work completed?

### Step-by-Step Solution:
1. Let the total work be represented as $36 \\text{ units}$ (LCM of 12 and 18).
2. The efficiency of A:
   $$\\text{Eff}_A = \\frac{36}{12} = 3 \\text{ units/day}$$
3. The efficiency of B:
   $$\\text{Eff}_B = \\frac{36}{18} = 2 \\text{ units/day}$$
4. Let the work be completed in $t$ days.
5. A worked for $(t-3)$ days, and B worked for all $t$ days.
6. The equation for total work:
   $$3(t - 3) + 2t = 36$$
   $$3t - 9 + 2t = 36$$
   $$5t = 45 \\implies t = 9 \\text{ days}$$
7. The total work was completed in $9$ days.`,
    hintText: 'Work done by B in the last 3 days was done alone, as A left 3 days early.',
    options: [
      { id: 'A', text: '9 days', isCorrect: true, metadata: '55.00%' },
      { id: 'B', text: '8 days', isCorrect: false, metadata: '25.00%' },
      { id: 'C', text: '10 days', isCorrect: false, metadata: '15.00%' },
      { id: 'D', text: '7 days', isCorrect: false, metadata: '5.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'ADVANCED TIME AND WORK TRICKS',
    videoDuration: '15:10',
    videoThumbnail: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600'
  }
];
