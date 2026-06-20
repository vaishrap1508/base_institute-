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
  },
  {
    id: 'arrays-linear-search',
    domainId: 'arrays',
    subTopicId: 'fundamentals',
    conceptId: 'linear-search',
    difficulty: 'EASY',
    companyTags: ['TCS', 'Wipro'],
    shuffleOptions: true,
    questionStem: `Linear Search

Given an array \`arr\` of size \`N\` and an integer \`x\`, find the index of element \`x\` in the array. Return -1 if not found.

### Step-by-Step Solution:
1. Iterate through the array from index 0 to N-1.
2. Compare each element with \`x\`.
3. If \`arr[i] == x\`, return \`i\`.
4. If loop completes, return -1.`,
    hintText: 'Use a simple for loop to iterate through each index.',
    options: [
      { id: 'A', text: 'Time: O(N), Space: O(1)', isCorrect: true, metadata: '75.00%' },
      { id: 'B', text: 'Time: O(log N), Space: O(1)', isCorrect: false, metadata: '15.00%' },
      { id: 'C', text: 'Time: O(N), Space: O(N)', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: 'Time: O(N^2), Space: O(1)', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'Linear Search Algorithm Walkthrough',
    videoDuration: '04:20',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Today'
  },
  {
    id: 'arrays-largest',
    domainId: 'arrays',
    subTopicId: 'fundamentals',
    conceptId: 'largest-element',
    difficulty: 'EASY',
    companyTags: ['Infosys', 'Accenture'],
    shuffleOptions: true,
    questionStem: `Largest Element

Find the largest element in an array of size \`N\`.

### Step-by-Step Solution:
1. Initialize \`max\` with the first element \`arr[0]\`.
2. Loop through the array from index 1 to N-1.
3. If \`arr[i] > max\`, update \`max = arr[i]\`.
4. Return \`max\`.`,
    hintText: 'Keep track of the maximum element seen so far.',
    options: [
      { id: 'A', text: 'Initialize max = arr[0] and iterate', isCorrect: true, metadata: '85.00%' },
      { id: 'B', text: 'Sort the array and return arr[0]', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: 'Iterate and use two variables', isCorrect: false, metadata: '4.00%' },
      { id: 'D', text: 'None of the above', isCorrect: false, metadata: '1.00%' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'Find Largest Element in Array',
    videoDuration: '03:15',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Today'
  },
  {
    id: 'arrays-second-largest',
    domainId: 'arrays',
    subTopicId: 'fundamentals',
    conceptId: 'second-largest',
    difficulty: 'MEDIUM',
    companyTags: ['Google', 'Amazon'],
    shuffleOptions: true,
    questionStem: `Second Largest Element

Find the second largest element in an array of size \`N\` without sorting.

### Step-by-Step Solution:
1. Keep track of \`largest\` and \`secondLargest\` elements.
2. Initialize both with \`-infinity\`.
3. If \`arr[i] > largest\`, update \`secondLargest = largest\` and \`largest = arr[i]\`.
4. Else if \`arr[i] > secondLargest\` and \`arr[i] != largest\`, update \`secondLargest = arr[i]\`.`,
    hintText: 'Update the second largest only when the current element is strictly between largest and second largest.',
    options: [
      { id: 'A', text: 'Update second largest alongside largest', isCorrect: true, metadata: '65.00%' },
      { id: 'B', text: 'Sort the array and return second index', isCorrect: false, metadata: '20.00%' },
      { id: 'C', text: 'Find maximum twice', isCorrect: false, metadata: '12.00%' },
      { id: 'D', text: 'None of the above', isCorrect: false, metadata: '3.00%' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'Second Largest Element in O(N)',
    videoDuration: '06:40',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Today'
  },
  {
    id: 'arrays-consec-ones',
    domainId: 'arrays',
    subTopicId: 'fundamentals',
    conceptId: 'consecutive-ones',
    difficulty: 'EASY',
    companyTags: ['Google', 'Yahoo'],
    shuffleOptions: true,
    questionStem: `Maximum Consecutive Ones

Given a binary array \`nums\`, return the maximum number of consecutive 1's in the array.

### Example 1:
- **Input**: nums = [1,1,0,1,1,1]
- **Output**: 3
- **Explanation**: The first two digits or the last three digits are consecutive 1s. The maximum number of consecutive 1s is 3.

### Example 2:
- **Input**: nums = [1,0,1,1,0,1]
- **Output**: 2

### Step-by-Step Solution:
1. Initialize \`count = 0\` and \`maxCount = 0\`.
2. Iterate through the binary array \`nums\`:
   - If \`nums[i] == 1\`, increment \`count\` and update \`maxCount = max(maxCount, count)\`.
   - If \`nums[i] == 0\`, reset \`count = 0\`.
3. Return \`maxCount\`.`,
    hintText: 'Use a single pointer to scan the array, incrementing a counter on 1 and resetting on 0.',
    options: [
      { id: 'A', text: 'Initialize a counter and reset on 0', isCorrect: true, metadata: '80.00%' },
      { id: 'B', text: 'Sort the array and count elements', isCorrect: false, metadata: '10.00%' },
      { id: 'C', text: 'Use a nested loop for every subsegment', isCorrect: false, metadata: '8.00%' },
      { id: 'D', text: 'Use a hash map to count occurrences', isCorrect: false, metadata: '2.00%' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'Maximum Consecutive Ones Solution',
    videoDuration: '05:30',
    videoThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    status: 'Published',
    createdAt: 'Today'
  }
];

