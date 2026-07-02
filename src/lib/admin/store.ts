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
  },
  {
    id: 'coding',
    name: 'Coding & DSA',
    subTopics: [
      {
        id: 'arrays',
        name: 'Arrays & Strings',
        concepts: [
          { id: 'two-pointer', name: 'Two-Pointer Technique' },
          { id: 'sliding-window', name: 'Sliding Window' }
        ]
      },
      {
        id: 'recursion',
        name: 'Recursion',
        concepts: [
          { id: 'backtracking', name: 'Backtracking' }
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
  { id: 'badges', label: 'Badge Management', icon: 'Award', href: '/admin/badges' },
  { id: 'settings', label: 'System Settings', icon: 'Settings', href: '/admin/settings' },
  { id: 'email', label: 'Email Management', icon: 'Mail', href: '/admin/email' },
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
    id: 'Q-8030-P',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'profit-loss',
    difficulty: 'EASY',
    companyTags: ['Infosys', 'Capgemini'],
    shuffleOptions: true,
    questionStem: `A person sells an article for $1190 at a loss of 15%. What was the cost price of the article?

### Step-by-Step Solution:
1. Let the Cost Price (CP) be $x$.
2. A loss of 15% means the Selling Price (SP) is 85% of the Cost Price:
   $$\\text{SP} = 0.85 \\times \\text{CP}$$
3. Substitute the values:
   $$1190 = 0.85 \\times x$$
4. Solve for $x$:
   $$x = \\frac{1190}{0.85} = 1400$$
5. Therefore, the Cost Price of the article is $1400.`,
    hintText: 'Selling Price is equal to Cost Price minus Loss. Calculate 85% of the CP.',
    options: [
      { id: 'A', text: '$1400', isCorrect: true, metadata: '85.00%' },
      { id: 'B', text: '$1350', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: '$1500', isCorrect: false, metadata: '4.00%' },
      { id: 'D', text: '$1200', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'PROFIT & LOSS BASICS',
    videoDuration: '08:20',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 11, 2023'
  },
  {
    id: 'Q-8031-R',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'ratios',
    difficulty: 'EASY',
    companyTags: ['Wipro', 'TCS'],
    shuffleOptions: true,
    questionStem: `If $A:B = 2:3$ and $B:C = 4:5$, what is the combined ratio $A:B:C$?

### Step-by-Step Solution:
1. We are given:
   $$A:B = 2:3$$
   $$B:C = 4:5$$
2. To combine, make the $B$ term equal. The LCM of 3 and 4 is 12.
3. Multiply $A:B$ by 4:
   $$A:B = (2 \\times 4) : (3 \\times 4) = 8 : 12$$
4. Multiply $B:C$ by 3:
   $$B:C = (4 \\times 3) : (5 \\times 3) = 12 : 15$$
5. Therefore, the ratio $A:B:C$ is $8:12:15$.`,
    hintText: 'Find the Least Common Multiple (LCM) of the common term B (3 and 4) to normalize.',
    options: [
      { id: 'A', text: '8:12:15', isCorrect: true, metadata: '90.00%' },
      { id: 'B', text: '2:4:5', isCorrect: false, metadata: '6.00%' },
      { id: 'C', text: '8:10:15', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: '6:9:15', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'RATIOS & PROPORTIONS Normalization',
    videoDuration: '05:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 09, 2023'
  },
  {
    id: 'Q-8032-I',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'simple-interest',
    difficulty: 'MEDIUM',
    companyTags: ['Goldman Sachs', 'Cognizant'],
    shuffleOptions: true,
    questionStem: `A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. What is the principal sum?

### Step-by-Step Solution:
1. Simple Interest (SI) is constant for each year.
2. Interest for 1 year is the difference between the amount in 4 years and the amount in 3 years:
   $$\\text{SI for 1 year} = 854 - 815 = \\$39$$
3. Interest for 3 years is:
   $$\\text{SI for 3 years} = 3 \\times 39 = \\$117$$
4. The principal sum (P) is the amount at 3 years minus the interest of 3 years:
   $$P = 815 - 117 = \\$698$$`,
    hintText: 'Subtract the 3-year amount from the 4-year amount to get the yearly interest value.',
    options: [
      { id: 'A', text: '$698', isCorrect: true, metadata: '78.00%' },
      { id: 'B', text: '$700', isCorrect: false, metadata: '12.00%' },
      { id: 'C', text: '$650', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: '$690', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'SIMPLE INTEREST CONCEPTS',
    videoDuration: '09:50',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 07, 2023'
  },
  {
    id: 'Q-8033-W',
    domainId: 'quant',
    subTopicId: 'arithmetic',
    conceptId: 'time-work',
    difficulty: 'MEDIUM',
    companyTags: ['Infosys', 'Wipro'],
    shuffleOptions: true,
    questionStem: `A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, what fraction of the work is left?

### Step-by-Step Solution:
1. Work done by A in 1 day = $\\frac{1}{15}$.
2. Work done by B in 1 day = $\\frac{1}{20}$.
3. Work done by both A and B in 1 day:
   $$\\frac{1}{15} + \\frac{1}{20} = \\frac{4 + 3}{60} = \\frac{7}{60}$$
4. Work done by both in 4 days:
   $$4 \\times \\frac{7}{60} = \\frac{7}{15}$$
5. Remaining work is:
   $$1 - \\frac{7}{15} = \\frac{8}{15}$$`,
    hintText: 'Calculate their individual one-day capacities, sum them up, and scale for 4 days.',
    options: [
      { id: 'A', text: '8/15', isCorrect: true, metadata: '81.00%' },
      { id: 'B', text: '7/15', isCorrect: false, metadata: '15.00%' },
      { id: 'C', text: '1/4', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: '1/10', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'TIME & WORK FRACTIONAL CAPACITIES',
    videoDuration: '10:10',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 06, 2023'
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
    id: 'Q-8034-L',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: 'linear-eq',
    difficulty: 'EASY',
    companyTags: ['Capgemini'],
    shuffleOptions: true,
    questionStem: `Solve the equation for $x$:
$$5x - 7 = 3x + 9$$

### Step-by-Step Solution:
1. Bring variable terms to one side by subtracting $3x$ from both sides:
   $$5x - 3x - 7 = 9 \\implies 2x - 7 = 9$$
2. Add 7 to both sides to isolate the variable term:
   $$2x = 9 + 7 \\implies 2x = 16$$
3. Divide by 2:
   $$x = 8$$`,
    hintText: 'Isolate variable terms on the left side and constants on the right side of the equation.',
    options: [
      { id: 'A', text: '8', isCorrect: true, metadata: '95.00%' },
      { id: 'B', text: '2', isCorrect: false, metadata: '3.00%' },
      { id: 'C', text: '16', isCorrect: false, metadata: '1.00%' },
      { id: 'D', text: '1', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'BASIC LINEAR EQUATIONS',
    videoDuration: '04:30',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 03, 2023'
  },
  {
    id: 'Q-6201-H',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: 'quadratic-eq',
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
    status: 'Published',
    createdAt: 'Oct 08, 2023'
  },
  {
    id: 'Q-8035-A',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: 'progressions',
    difficulty: 'MEDIUM',
    companyTags: ['TCS', 'Amazon'],
    shuffleOptions: true,
    questionStem: `Find the 15th term of the arithmetic progression: $3, 7, 11, 15, \\dots$

### Step-by-Step Solution:
1. In an Arithmetic Progression (AP), the $n$-th term is given by:
   $$a_n = a + (n-1)d$$
2. Here, the first term $a = 3$.
3. The common difference $d = 7 - 3 = 4$.
4. We need the 15th term ($n = 15$):
   $$a_{15} = 3 + (15 - 1) \\times 4$$
   $$a_{15} = 3 + 14 \\times 4 = 3 + 56 = 59$$`,
    hintText: 'Identify the first term $a$, common difference $d$, and use the standard AP formula.',
    options: [
      { id: 'A', text: '59', isCorrect: true, metadata: '83.00%' },
      { id: 'B', text: '63', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: '55', isCorrect: false, metadata: '5.00%' },
      { id: 'D', text: '60', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'ARITHMETIC PROGRESSION FORMULAS',
    videoDuration: '07:15',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 02, 2023'
  },
  {
    id: 'Q-8036-F',
    domainId: 'quant',
    subTopicId: 'algebra',
    conceptId: 'functions',
    difficulty: 'HARD',
    companyTags: ['Google', 'Microsoft'],
    shuffleOptions: true,
    questionStem: `If $f(x) = x^2 - 3x + 2$, evaluate the nested function value $f(f(3))$.

### Step-by-Step Solution:
1. First, find $f(3)$:
   $$f(3) = 3^2 - 3(3) + 2 = 9 - 9 + 2 = 2$$
2. Next, calculate $f(f(3))$ by replacing the inner value with 2:
   $$f(2) = 2^2 - 3(2) + 2 = 4 - 6 + 2 = 0$$
3. Therefore, $f(f(3)) = 0$.`,
    hintText: 'Evaluate the inner function first to find the input for the outer function.',
    options: [
      { id: 'A', text: '0', isCorrect: true, metadata: '68.00%' },
      { id: 'B', text: '2', isCorrect: false, metadata: '20.00%' },
      { id: 'C', text: '4', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: '-2', isCorrect: false, metadata: '4.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'NESTED FUNCTIONS EVALUATION',
    videoDuration: '08:45',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 01, 2023'
  },
  {
    id: 'Q-8037-T',
    domainId: 'quant',
    subTopicId: 'geometry',
    conceptId: 'triangles',
    difficulty: 'EASY',
    companyTags: ['Wipro', 'TCS'],
    shuffleOptions: true,
    questionStem: `In $\\triangle ABC$, if $\\angle A = 60^\\circ$ and the side lengths $b$ and $c$ are equal ($b = c$), what is the measure of $\\angle B$?

### Step-by-Step Solution:
1. Since side $b = c$, the angles opposite to them are also equal. Thus, $\\angle B = \\angle C$.
2. The sum of angles in a triangle is always $180^\\circ$:
   $$\\angle A + \\angle B + \\angle C = 180^\\circ$$
3. Substitute $\\angle A = 60^\\circ$ and $\\angle B = \\angle C$:
   $$60^\\circ + 2\\angle B = 180^\\circ$$
   $$2\\angle B = 120^\\circ \\implies \\angle B = 60^\\circ$$`,
    hintText: 'Isosceles triangles have equal angles opposite to equal sides. Equilateral triangles have three 60-degree angles.',
    options: [
      { id: 'A', text: '60°', isCorrect: true, metadata: '91.00%' },
      { id: 'B', text: '45°', isCorrect: false, metadata: '5.00%' },
      { id: 'C', text: '90°', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: '30°', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'TRIANGLE ANGLE PROPERTIES',
    videoDuration: '05:10',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 30, 2023'
  },
  {
    id: 'Q-8038-C',
    domainId: 'quant',
    subTopicId: 'geometry',
    conceptId: 'circles',
    difficulty: 'MEDIUM',
    companyTags: ['Amazon', 'Goldman Sachs'],
    shuffleOptions: true,
    questionStem: `What is the equation of a circle centered at $(3, -2)$ with a radius of $4$?

### Step-by-Step Solution:
1. The standard equation of a circle centered at $(h, k)$ with radius $r$ is:
   $$(x-h)^2 + (y-k)^2 = r^2$$
2. Substitute $h = 3$, $k = -2$, and $r = 4$:
   $$(x-3)^2 + (y - (-2))^2 = 4^2$$
3. Simplify terms:
   $$(x-3)^2 + (y+2)^2 = 16$$`,
    hintText: 'Use the standard circle equation $(x-h)^2 + (y-k)^2 = r^2$ and remember to invert signs correctly.',
    options: [
      { id: 'A', text: '(x - 3)² + (y + 2)² = 16', isCorrect: true, metadata: '80.00%' },
      { id: 'B', text: '(x + 3)² + (y - 2)² = 16', isCorrect: false, metadata: '12.00%' },
      { id: 'C', text: '(x - 3)² + (y + 2)² = 4', isCorrect: false, metadata: '6.00%' },
      { id: 'D', text: '(x + 3)² + (y - 2)² = 4', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'STANDARD CIRCLE EQUATIONS',
    videoDuration: '06:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 28, 2023'
  },
  {
    id: 'Q-8039-V',
    domainId: 'quant',
    subTopicId: 'geometry',
    conceptId: 'volumes',
    difficulty: 'MEDIUM',
    companyTags: ['Cognizant', 'Infosys'],
    shuffleOptions: true,
    questionStem: `Find the volume of a sphere with a radius of $3\\text{ cm}$.

### Step-by-Step Solution:
1. The volume ($V$) of a sphere is given by the formula:
   $$V = \\frac{4}{3}\\pi r^3$$
2. Here, the radius $r = 3\\text{ cm}$.
3. Substitute the radius value:
   $$V = \\frac{4}{3} \\times \\pi \\times (3)^3$$
   $$V = \\frac{4}{3} \\times \\pi \\times 27$$
   $$V = 4 \\times \\pi \\times 9 = 36\\pi\\text{ cm}^3$$`,
    hintText: 'Use the volume of a sphere formula: 4/3 * pi * r^3.',
    options: [
      { id: 'A', text: '36π cm³', isCorrect: true, metadata: '85.00%' },
      { id: 'B', text: '12π cm³', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: '108π cm³', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: '18π cm³', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'VOLUMES OF SPHERES & CYLINDERS',
    videoDuration: '07:30',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 26, 2023'
  },
  {
    id: 'L-201-LA',
    domainId: 'logical',
    subTopicId: 'arrangements',
    conceptId: 'linear-arr',
    difficulty: 'MEDIUM',
    companyTags: ['TCS', 'Infosys'],
    shuffleOptions: true,
    questionStem: `Five friends A, B, C, D, and E are sitting in a row facing North.
1. A is to the immediate left of B.
2. C is to the immediate left of D.
3. E is in the middle seat.
4. A and D sit at the extremes.

Who is sitting to the immediate right of E?

### Step-by-Step Solution:
1. Since there are 5 seats, let's represent them as: _ _ _ _ _.
2. E is in the middle: _ _ E _ _.
3. A and D are at the extremes. A must sit on the left extreme or right extreme.
4. Since A is to the left of B, A cannot be at the right extreme. Thus, A is at the left extreme: A _ E _ _.
5. This means B must sit next to A: A B E _ _.
6. Since D must sit at the other extreme (right): A B E _ D.
7. C is to the immediate left of D, which fits the remaining seat: A B E C D.
8. The sequence is A, B, E, C, D.
9. Therefore, the person to the immediate right of E is C.`,
    hintText: 'Draw the 5 positions. Place E in the center first, then evaluate the extremes.',
    options: [
      { id: 'A', text: 'C', isCorrect: true, metadata: '75.00%' },
      { id: 'B', text: 'B', isCorrect: false, metadata: '15.00%' },
      { id: 'C', text: 'A', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: 'D', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'LINEAR ARRANGEMENTS STRATEGIES',
    videoDuration: '09:10',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 24, 2023'
  },
  {
    id: 'L-202-CA',
    domainId: 'logical',
    subTopicId: 'arrangements',
    conceptId: 'circular-arr',
    difficulty: 'HARD',
    companyTags: ['Amazon', 'Uber'],
    shuffleOptions: true,
    questionStem: `Six people P, Q, R, S, T, and U are sitting around a circular table facing the center.
- P is sitting directly opposite Q.
- R is sitting to the immediate right of P.
- S is sitting between Q and R.
- T is sitting to the immediate left of P.

Who is sitting directly opposite S?

### Step-by-Step Solution:
1. Place P at the bottom position of the circular layout.
2. Q is directly opposite P, so Q is at the top position.
3. R is to the immediate right of P (counter-clockwise). Place R at the bottom-right.
4. S is sitting between Q and R. Place S at the top-right.
5. T is to the immediate left of P. Place T at the bottom-left.
6. The remaining person U must occupy the seat at the top-left (between Q and T).
7. The positions clockwise around the table are: P -> T -> U -> Q -> S -> R.
8. The person opposite S (top-right) is T (bottom-left).
9. Therefore, T is sitting directly opposite S.`,
    hintText: 'Draw a circle with 6 marks. Anchor P first, then place Q directly opposite P.',
    options: [
      { id: 'A', text: 'T', isCorrect: true, metadata: '64.00%' },
      { id: 'B', text: 'U', isCorrect: false, metadata: '22.00%' },
      { id: 'C', text: 'R', isCorrect: false, metadata: '10.00%' },
      { id: 'D', text: 'P', isCorrect: false, metadata: '4.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'CIRCULAR ARRANGEMENTS BASICS',
    videoDuration: '11:20',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 22, 2023'
  },
  {
    id: 'L-203-BS',
    domainId: 'logical',
    subTopicId: 'syllogisms',
    conceptId: 'basic-syll',
    difficulty: 'EASY',
    companyTags: ['Capgemini', 'Wipro'],
    shuffleOptions: true,
    questionStem: `Statements:
- All cats are dogs.
- All dogs are mammals.

Conclusions:
- I. All cats are mammals.
- II. Some mammals are cats.

Choose the correct option:`,
    hintText: 'Draw Venn diagrams representing the nesting of sets: Cats inside Dogs, and Dogs inside Mammals.',
    options: [
      { id: 'A', text: 'Both I and II follow', isCorrect: true, metadata: '88.00%' },
      { id: 'B', text: 'Only Conclusion I follows', isCorrect: false, metadata: '8.00%' },
      { id: 'C', text: 'Only Conclusion II follows', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: 'Neither I nor II follows', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'VENN DIAGRAMS FOR SYLLOGISMS',
    videoDuration: '06:10',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 20, 2023'
  },
  {
    id: 'L-204-CS',
    domainId: 'logical',
    subTopicId: 'syllogisms',
    conceptId: 'conditional-syll',
    difficulty: 'MEDIUM',
    companyTags: ['Goldman Sachs', 'Meta'],
    shuffleOptions: true,
    questionStem: `Statements:
- If it rains, the grass gets wet.
- The grass is not wet.

Conclusions:
- I. It did not rain.
- II. It rained but the grass was protected.

Choose the correct logical conclusion:

### Step-by-Step Solution:
1. This represents a conditional statement: $P \\implies Q$.
   - $P$: It rains.
   - $Q$: The grass gets wet.
2. The second premise states that the grass is not wet: $\\neg Q$.
3. By the law of contraposition (Modus Tollens), if $P \\implies Q$ is true, then $\\neg Q \\implies \\neg P$ must be true.
4. Since $\\neg Q$ is true, $\\neg P$ (It did not rain) must be true.
5. Therefore, Conclusion I follows logically.`,
    hintText: 'Apply Modus Tollens: if P implies Q, and Q is false, then P must also be false.',
    options: [
      { id: 'A', text: 'Only Conclusion I follows', isCorrect: true, metadata: '82.00%' },
      { id: 'B', text: 'Only Conclusion II follows', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: 'Both I and II follow', isCorrect: false, metadata: '5.00%' },
      { id: 'D', text: 'Neither I nor II follows', isCorrect: false, metadata: '3.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'MODUS TOLLENS AND CONDITIONAL LOGIC',
    videoDuration: '08:50',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 18, 2023'
  },
  {
    id: 'V-4433-T',
    domainId: 'verbal',
    subTopicId: 'grammar',
    conceptId: 'tenses',
    difficulty: 'EASY',
    companyTags: ['Infosys', 'TCS'],
    shuffleOptions: true,
    questionStem: `Identify the correct verb form to complete the sentence:
"By the time we arrived at the venue, the play ________ (already start)."`,
    hintText: 'When two past events occur in sequence, the earlier event takes the past perfect tense.',
    options: [
      { id: 'A', text: 'had already started', isCorrect: true, metadata: '89.00%' },
      { id: 'B', text: 'has already started', isCorrect: false, metadata: '7.00%' },
      { id: 'C', text: 'already started', isCorrect: false, metadata: '3.00%' },
      { id: 'D', text: 'was already starting', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'PAST PERFECT TENSE RELATIONSHIPS',
    videoDuration: '05:30',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 16, 2023'
  },
  {
    id: 'V-4434-P',
    domainId: 'verbal',
    subTopicId: 'grammar',
    conceptId: 'prepositions',
    difficulty: 'EASY',
    companyTags: ['Cognizant', 'Capgemini'],
    shuffleOptions: true,
    questionStem: `Fill in the blank with the correct preposition:
"He is proficient ________ mathematics, but struggles with history."`,
    hintText: 'Certain adjectives take fixed prepositions. Look up the standard preposition pairing for proficient.',
    options: [
      { id: 'A', text: 'in', isCorrect: true, metadata: '91.00%' },
      { id: 'B', text: 'at', isCorrect: false, metadata: '6.00%' },
      { id: 'C', text: 'with', isCorrect: false, metadata: '2.00%' },
      { id: 'D', text: 'on', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'FIXED PREPOSITIONS IN ENGLISH',
    videoDuration: '06:20',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 14, 2023'
  },
  {
    id: 'V-4435-I',
    domainId: 'verbal',
    subTopicId: 'comprehension',
    conceptId: 'inference',
    difficulty: 'HARD',
    companyTags: ['Google', 'Morgan Stanley'],
    shuffleOptions: true,
    questionStem: `Read the passage below:
"The rapid deployment of automated systems has reduced operational delays across logistics networks. However, critics point out that the reliance on algorithms limits a system's ability to handle outlier scenarios, where human intuition and adaptability remain critical."

What can be inferred from the passage?`,
    hintText: 'Look for a conclusion that must be true based on the constraints of the text without over-generalizing.',
    options: [
      { id: 'A', text: 'Automated systems still require human intervention for outliers', isCorrect: true, metadata: '76.00%' },
      { id: 'B', text: 'Automation has caused more delays than efficiency gains', isCorrect: false, metadata: '14.00%' },
      { id: 'C', text: 'Algorithms will soon match human intuition in outliers', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: 'Logistics networks are fully autonomous', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'INFERENCE VS ASSUMPTION IN RC',
    videoDuration: '09:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 12, 2023'
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
  },
  {
    id: 'C-101',
    domainId: 'coding',
    subTopicId: 'arrays',
    conceptId: 'two-pointer',
    difficulty: 'EASY',
    companyTags: ['Amazon', 'Google', 'Meta'],
    shuffleOptions: false,
    questionStem: `### Maximum Consecutive Ones

Given a binary array \`nums\`, return the maximum number of consecutive \`1\`s in the array.

### Constraints:
- \`1 <= nums.length <= 10^5\`
- \`nums[i]\` is either \`0\` or \`1\`.

### Examples:
**Example 1:**
\`\`\`
Input: nums = [1,1,0,1,1,1]
Output: 3
Explanation: The first two digits or the last three digits are consecutive 1s. The maximum number of consecutive 1s is 3.
\`\`\`
`,
    hintText: 'Keep track of a running count of 1s and update the maximum count whenever you encounter a 0.',
    options: [],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'MAX CONSECUTIVE ONES WALKTHROUGH',
    videoDuration: '08:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Oct 04, 2023'
  },
  {
    id: 'C-102',
    domainId: 'coding',
    subTopicId: 'arrays',
    conceptId: 'sliding-window',
    difficulty: 'MEDIUM',
    companyTags: ['Amazon', 'Microsoft', 'Google'],
    shuffleOptions: false,
    questionStem: `### Maximum Sum Subarray of Size K

Given an array of integers \`nums\` and a positive integer \`k\`, find the maximum sum of any contiguous subarray of size \`k\`.

### Constraints:
- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\`
- \`1 <= k <= nums.length\`

### Examples:
**Example 1:**
\`\`\`
Input: nums = [2, 1, 5, 1, 3, 2], k = 3
Output: 9
Explanation: The subarray [5, 1, 3] has the maximum sum of 9.
\`\`\`
`,
    hintText: 'Maintain the sum of the current window of size k. Slide the window by adding the next element and subtracting the leftmost element.',
    options: [],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'SLIDING WINDOW MAXIMUM SUM SUBARRAY',
    videoDuration: '10:45',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 10, 2023'
  },
  {
    id: 'C-103',
    domainId: 'coding',
    subTopicId: 'recursion',
    conceptId: 'backtracking',
    difficulty: 'HARD',
    companyTags: ['Google', 'Netflix', 'Meta'],
    shuffleOptions: false,
    questionStem: `### Generate Parentheses

Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

### Constraints:
- \`1 <= n <= 8\`

### Examples:
**Example 1:**
\`\`\`
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]
\`\`\`
`,
    hintText: 'Use backtracking to add opening and closing parentheses. You can add an opening parenthesis if you have remaining opening parentheses, and a closing parenthesis if the number of closing parentheses is less than opening parentheses.',
    options: [],
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'BACKTRACKING GENERATING PARENTHESES',
    videoDuration: '12:15',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Sep 08, 2023'
  }
];
