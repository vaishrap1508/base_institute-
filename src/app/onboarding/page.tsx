'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Layers, 
  User, 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  Check,
  Info,
  ChevronDown,
  Shield,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { INDIAN_STATES, INDIAN_COLLEGES } from '@/data/indianColleges';
import ThemeToggle from '@/components/ThemeToggle';

// Option lists
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const INDIAN_STATES_DEFAULT = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const DEGREE_BRANCH_DATA: Record<string, string[]> = {
  'B.Tech / B.E.': [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
  ],
  'M.Tech / M.E.': [
    'Computer Science (Data Science)',
    'VLSI & Embedded Systems',
    'Software Engineering',
    'Power Systems',
    'Thermal Engineering'
  ],
  'MCA (Master of Computer Applications)': [
    'Computer Applications',
    'Cloud Computing & DevOps',
    'Cyber Security & Digital Forensics'
  ],
  'MBA (Master of Business Administration)': [
    'Finance & Business Analytics',
    'Marketing & Sales Management',
    'Human Resource Management',
    'Operations & Supply Chain Management',
    'International Business'
  ],
  'B.Sc (Bachelor of Science)': [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Statistics'
  ],
  'B.Com (Bachelor of Commerce)': [
    'Accounting & Finance',
    'Banking & Insurance',
    'General Commerce'
  ]
};

const GOAL_OPTIONS_DEFAULT = [
  { id: 'placements', label: 'Campus Placements', desc: 'Crack standard institutional service & product placement stems.' },
  { id: 'competitive', label: 'Competitive Exams', desc: 'Prepare for GRE, GATE, and general analytical exams.' },
  { id: 'government', label: 'Government Exams', desc: 'Solve logical aptitude matrices for public services.' },
  { id: 'mba', label: 'CAT / MBA Preparation', desc: 'Master advanced quantitative and reading comprehension metrics.' },
  { id: 'banking', label: 'Banking Exams', desc: 'Boost rapid speed math calculations and logical sequences.' },
  { id: 'skills', label: 'Improve Aptitude Skills', desc: 'Hone analytical reasoning, formulas, and visual logic.' },
  { id: 'english', label: 'Improve English Communication', desc: 'Master active verbal comprehension and grammatical syntax.' },
  { id: 'others', label: 'Others', desc: 'Specify your own custom primary learning or preparation goal.' }
];

const TIMELINE_OPTIONS_DEFAULT = [
  'Within 1 Month',
  'Within 3 Months',
  'Within 6 Months',
  'Within 1 Year',
  'Just Exploring'
];

const COMMITMENT_OPTIONS_DEFAULT = [
  'Less than 3 Hours',
  '3–5 Hours',
  '5–10 Hours',
  '10–15 Hours',
  '15+ Hours'
];

const PREFERENCE_OPTIONS_DEFAULT = [
  'Practice Questions Only',
  'Learn Concepts First',
  'Concept + Practice',
  'Mock Tests'
];

const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

const isUsernameTakenOrSimilar = (name: string) => {
  const clean = name.trim().toLowerCase();
  if (!clean) return { taken: false, reason: '' };
  
  const occupied = [
    'sarah_c', 'sarah',
    'marcus_w', 'marcus',
    'sriram_neppalli', 'sriram',
    'student',
    'admin', 'editor'
  ];
  
  if (occupied.includes(clean)) {
    return { taken: true, reason: 'Username not available. Try again.' };
  }
  
  for (const existing of occupied) {
    const distance = getLevenshteinDistance(clean, existing);
    if (distance <= 1) {
      return { taken: true, reason: 'Username not available. Try again.' };
    }
  }
  
  return { taken: false, reason: '' };
};

const generateUsernameSuggestions = (name: string): string[] => {
  const clean = name.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];
  
  const suffixes = ['_real', '_me', '_here', '_official', '_hub', '123', '_world'];
  const prefixes = ['its_', 'the_', 'iam_', 'hey_'];
  
  const candidates: string[] = [];
  
  // 1. Add suffixes
  for (const suffix of suffixes) {
    candidates.push(`${clean}${suffix}`);
  }
  
  // 2. Add prefixes
  for (const prefix of prefixes) {
    candidates.push(`${prefix}${clean}`);
  }
  
  // 3. Add random numbers
  for (let i = 0; i < 3; i++) {
    candidates.push(`${clean}${Math.floor(Math.random() * 900 + 100)}`);
  }
  
  // Filter candidates: must not be taken, similar, and must have length >= 3
  const validSuggestions: string[] = [];
  for (const cand of candidates) {
    if (cand.length >= 3 && !isUsernameTakenOrSimilar(cand).taken) {
      validSuggestions.push(cand);
      if (validSuggestions.length >= 4) break;
    }
  }
  
  // Fallback if none are valid
  if (validSuggestions.length < 3) {
    validSuggestions.push(`${clean}_pro`);
    validSuggestions.push(`${clean}_free`);
    validSuggestions.push(`${clean}_user`);
  }
  
  return validSuggestions.slice(0, 4);
};

export default function OnboardingPage() {
  const router = useRouter();
  const authSupabase = createAuthClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userType, setUserType] = useState<'student' | 'other' | ''>('');

  // Form states
  const [username, setUsername] = useState('');
  const [state, setState] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Searchable combobox input text and toggle hooks
  const [stateSearch, setStateSearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);

  const [stateHighlightIndex, setStateHighlightIndex] = useState(-1);
  const [isTypingState, setIsTypingState] = useState(false);
  const stateContainerRef = useRef<HTMLDivElement>(null);

  const stepsConfig = useMemo(() => [
    { id: 1, label: 'Profile', icon: User, title: 'Choose your username', desc: 'This will be your unique identity across the platform.' },
    { 
      id: 2, 
      label: userType === 'other' ? 'Professional' : 'Academic', 
      icon: userType === 'other' ? Briefcase : GraduationCap, 
      title: userType === 'other' ? 'Professional Details' : 'Education Information', 
      desc: userType === 'other' ? 'Add professional details to personalize your career journey.' : 'Add academic records to qualify for corresponding placement templates.' 
    },
    { id: 3, label: 'Goal', icon: Target, title: 'What is your primary goal?', desc: 'Select the target destination of your analytical preparations.' },
    { id: 4, label: 'Timeline', icon: Calendar, title: 'When do you want to achieve your goal?', desc: 'This aligns chronological milestone metrics in your planner.' },
    { id: 5, label: 'Commit', icon: Clock, title: 'How much time can you dedicate each week?', desc: 'We calibrate streak milestones and questions quotas accordingly.' },
    { id: 6, label: 'Preference', icon: BookOpen, title: 'How do you prefer to learn?', desc: 'Select your pedagogical preference for practicing aptitude.' }
  ], [userType]);

  // Sync scroll on highlight index change
  useEffect(() => {
    if (stateDropdownOpen && stateContainerRef.current && stateHighlightIndex >= 0) {
      const activeEl = stateContainerRef.current.querySelector(`[data-index="${stateHighlightIndex}"]`) as HTMLElement;
      if (activeEl) {
        const container = stateContainerRef.current;
        const activeTop = activeEl.offsetTop;
        const activeBottom = activeTop + activeEl.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        if (activeTop < containerTop) {
          container.scrollTop = activeTop;
        } else if (activeBottom > containerBottom) {
          container.scrollTop = activeBottom - container.clientHeight;
        }
      }
    }
  }, [stateHighlightIndex, stateDropdownOpen]);

  const selectState = (st: string) => {
    setState(st);
    setStateSearch(st);
    setStateDropdownOpen(false);
    setIsTypingState(false);
    setStateHighlightIndex(-1);
  };

  const handleStateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!stateDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setStateDropdownOpen(true);
        setIsTypingState(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setStateHighlightIndex(prev => {
          const nextIdx = prev + 1;
          if (nextIdx < filteredStates.length) {
            return nextIdx;
          }
          return prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setStateHighlightIndex(prev => {
          const nextIdx = prev - 1;
          if (nextIdx >= 0) {
            return nextIdx;
          }
          return -1;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (stateHighlightIndex >= 0 && stateHighlightIndex < filteredStates.length) {
          selectState(filteredStates[stateHighlightIndex]);
        } else if (filteredStates.length > 0) {
          selectState(filteredStates[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setStateDropdownOpen(false);
        setStateSearch(state);
        setIsTypingState(false);
        setStateHighlightIndex(-1);
        break;
      case 'Tab':
        if (stateHighlightIndex >= 0 && stateHighlightIndex < filteredStates.length) {
          selectState(filteredStates[stateHighlightIndex]);
        } else {
          setStateSearch(state);
          setStateDropdownOpen(false);
          setIsTypingState(false);
        }
        break;
      default:
        break;
    }
  };

  // Dynamic colleges dataset
  const [allColleges, setAllColleges] = useState<any[]>(INDIAN_COLLEGES);
  const [loadingColleges, setLoadingColleges] = useState(false);

  // Dynamic onboarding settings states
  const [goalOptions, setGoalOptions] = useState<any[]>(GOAL_OPTIONS_DEFAULT);
  const [timelineOptions, setTimelineOptions] = useState<string[]>(TIMELINE_OPTIONS_DEFAULT);
  const [commitmentOptions, setCommitmentOptions] = useState<string[]>(COMMITMENT_OPTIONS_DEFAULT);
  const [preferenceOptions, setPreferenceOptions] = useState<string[]>(PREFERENCE_OPTIONS_DEFAULT);
  const [indianStates, setIndianStates] = useState<string[]>(INDIAN_STATES);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch dynamic onboarding settings configurations on mount
  useEffect(() => {
    async function fetchOnboardingSettings() {
      try {
        const { data, error } = await supabase
          .from('onboarding_settings')
          .select('*')
          .eq('id', 'current')
          .single();

        if (data && !error) {
          if (Array.isArray(data.goal_options)) setGoalOptions(data.goal_options);
          if (Array.isArray(data.timeline_options)) setTimelineOptions(data.timeline_options);
          if (Array.isArray(data.commitment_options)) setCommitmentOptions(data.commitment_options);
          if (Array.isArray(data.preference_options)) setPreferenceOptions(data.preference_options);
          if (Array.isArray(data.indian_states)) setIndianStates(data.indian_states);
        }
      } catch (err) {
        console.warn('Failed to load dynamic onboarding options, using defaults:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchOnboardingSettings();
  }, []);

  // Sync state search and college search inputs when their values change
  useEffect(() => {
    setStateSearch(state);
  }, [state]);

  useEffect(() => {
    setCollegeSearch(college);
  }, [college]);

  // When state changes, clear college only if it does not belong to the selected state
  useEffect(() => {
    if (state && college) {
      const match = allColleges.find(c => c.college_name === college && c.state.toLowerCase() === state.toLowerCase());
      if (!match) {
        setCollege('');
        setCollegeSearch('');
      }
    } else if (!state) {
      setCollege('');
      setCollegeSearch('');
    }
  }, [state, allColleges]);

  // Filtered lists for autocomplete suggestions
  const filteredStates = useMemo(() => {
    const query = stateSearch.toLowerCase().trim();
    if (!query || !isTypingState) return indianStates;
    return indianStates.filter(s => s.toLowerCase().includes(query));
  }, [stateSearch, isTypingState, indianStates]);

  const filteredColleges = useMemo(() => {
    if (!state) return []; // College dropdown should be empty when no state is selected!
    
    const query = collegeSearch.toLowerCase().trim();
    
    // Filter colleges belonging strictly to the selected state
    const stateFilteredColleges = allColleges.filter(c => 
      c.state.toLowerCase() === state.toLowerCase()
    );

    const collegesMatched = stateFilteredColleges.filter(c => {
      if (!query || query === college.toLowerCase().trim()) return true;
      // Search in both name and type (e.g. CBIT, Osmania, Autonomous, Central, etc.)
      return (
        c.college_name.toLowerCase().includes(query) ||
        c.university_type.toLowerCase().includes(query)
      );
    });

    return collegesMatched.map(c => c.college_name).slice(0, 100);
  }, [state, college, allColleges, collegeSearch]);

  // Reset branch if it is not valid for the new degree selection
  useEffect(() => {
    if (DEGREE_BRANCH_DATA[degree]) {
      const branches = DEGREE_BRANCH_DATA[degree];
      if (branches.length > 0) {
        if (!branches.includes(branch)) {
          setBranch(branches[0]);
        }
      }
    }
  }, [degree]);

  const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('');
  const [weeklyCommitment, setWeeklyCommitment] = useState('');
  const [learningPreferences, setLearningPreferences] = useState<string[]>([]);

  // Validations & visual effects
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shakeField, setShakeField] = useState(false);

  // Floating notifications
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync profile details on mount
  useEffect(() => {
    const stored = localStorage.getItem('aptitude_current_role');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        // Pre-fill username if available
        if (parsed.name) {
          setUsername(parsed.name.toLowerCase().replace(/\s+/g, '_'));
        }
        if (parsed.userType) {
          setUserType(parsed.userType);
        }
        if (parsed.college) setCollege(parsed.college);
        if (parsed.branch) setBranch(parsed.branch);
      } catch (e) {
        console.warn(e);
      }
    }

    const loadSession = async () => {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0] || '';
        
        setUserProfile((prev: any) => ({
          ...prev,
          email,
          name: name.toUpperCase()
        }));

        if (!username) {
          setUsername(name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
        }
      }
    };
    loadSession();
  }, []);

  // Handle validations before moving to next step
  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!username.trim()) {
        setValidationError('Username is required.');
        setShakeField(true);
        setTimeout(() => setShakeField(false), 500);
        return;
      }
      if (username.trim().length < 3) {
        setValidationError('Username must be at least 3 characters.');
        setShakeField(true);
        setTimeout(() => setShakeField(false), 500);
        return;
      }
      const check = isUsernameTakenOrSimilar(username);
      if (check.taken) {
        setValidationError(check.reason);
        setShakeField(true);
        setTimeout(() => setShakeField(false), 500);
        return;
      }
    }

    if (currentStep === 2) {
      if (userType === '') {
        setValidationError('Please select whether you are a Student or Other.');
        return;
      }
      if (userType === 'student') {
        if (!state.trim() || !college.trim() || !degree.trim() || !branch.trim() || !graduationYear.trim()) {
          setValidationError('Please complete all required educational fields.');
          return;
        }
      }
    }

    if (currentStep === 3 && primaryGoals.length === 0) {
      setValidationError('Please select at least one learning goal to continue.');
      return;
    }

    if (currentStep === 4 && !targetTimeline) {
      setValidationError('Please select your target timeline.');
      return;
    }

    if (currentStep === 5 && !weeklyCommitment) {
      setValidationError('Please select your weekly commitment time.');
      return;
    }

    if (currentStep === 6) {
      if (learningPreferences.length === 0) {
        setValidationError('Please select at least one learning preference.');
        return;
      }
      handleOnboardingComplete();
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleBackStep = () => {
    setValidationError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const isContinueDisabled = () => {
    if (currentStep === 1) {
      return !username.trim();
    }
    if (currentStep === 2) {
      if (userType === '') return true;
      if (userType === 'student') {
        return !state.trim() || !college.trim() || !degree.trim() || !branch.trim() || !graduationYear.trim();
      }
      return false;
    }
    if (currentStep === 3) {
      return primaryGoals.length === 0;
    }
    if (currentStep === 4) {
      return !targetTimeline;
    }
    if (currentStep === 5) {
      return !weeklyCommitment;
    }
    if (currentStep === 6) {
      return learningPreferences.length === 0;
    }
    return false;
  };

  // Commit and save to Supabase + Local Storage
  const handleOnboardingComplete = async () => {
    setLoading(true);
    showNotice('Bootstrapping your adaptive curriculum...', 'info');

    const completedProfile = {
      username,
      user_type: userType,
      country: userType === 'student' ? 'India' : null,
      state: userType === 'student' ? state : null,
      college: userType === 'student' ? college : null,
      degree: userType === 'student' ? degree : null,
      branch: userType === 'student' ? branch : null,
      graduation_year: userType === 'student' && graduationYear ? parseInt(graduationYear, 10) : null,
      primary_goal: primaryGoals.map(g => g === 'Others' && customGoal.trim() ? `Others (${customGoal.trim()})` : g).join(', '),
      target_timeline: targetTimeline,
      weekly_commitment: weeklyCommitment,
      learning_preference: learningPreferences.join(', '),
      avatar: 'initial',
      onboarding_completed: true
    };

    // Save profile settings locally
    localStorage.setItem('aptitude_onboarding_completed', 'true');
    localStorage.setItem('aptitude_onboarding_data', JSON.stringify(completedProfile));
    
    // Set cookie for middleware access
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `aptitude_onboarding_completed=true;expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    
    // Set current active user details updated
    if (userProfile) {
      const updatedUser = {
        ...userProfile,
        name: username.toUpperCase(),
        college: college || userProfile.college,
        branch: branch || userProfile.branch
      };
      localStorage.setItem('aptitude_current_role', JSON.stringify(updatedUser));
    }

    // Attempt Supabase writes in the background to prevent blocking the UI
    (async () => {
      try {
        const { data: { session } } = await authSupabase.auth.getSession();
        let userId = session?.user?.id;

        if (!userId && userProfile?.email) {
          const { data: profileObj } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', userProfile.email)
            .maybeSingle();
          if (profileObj) userId = profileObj.id;
        }

        if (userId) {
          // Try upserting with state first
          const { error } = await supabase
            .from('onboarding_profile')
            .upsert({
              user_id: userId,
              ...completedProfile,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (error) {
            console.warn('Supabase onboarding profile upsert with state failed, retrying without state column...', error.message);
            
            // Fallback without state
            const { state: _, ...completedProfileWithoutState } = completedProfile;
            const { error: fallbackError } = await supabase
              .from('onboarding_profile')
              .upsert({
                user_id: userId,
                ...completedProfileWithoutState,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

            if (fallbackError) {
              console.warn('Supabase onboarding fallback upsert failed:', fallbackError.message);
            }
          }
        }
      } catch (err) {
        console.warn('Graceful database write fallback triggered:', err);
      }
    })();

    // Perform redirect instantly
    setLoading(false);
    showNotice('Personalized paths compiled successfully!', 'success');
    router.push('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden antialiased transition-colors duration-300">
      
      {/* SaaS background grid & glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] pointer-events-none opacity-20 dark:opacity-10" />
      
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 dark:bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />
      
      {/* Floating ambient elements (particles) */}
      <motion.div 
        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-blue-500/30 blur-xs pointer-events-none -z-10" 
      />
      <motion.div 
        animate={{ y: [0, -18, 0], x: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-purple-500/20 blur-xs pointer-events-none -z-10" 
      />
      <motion.div 
        animate={{ y: [0, -14, 0], x: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-1/4 left-16 w-2.5 h-2.5 rounded-full bg-indigo-500/25 blur-xs pointer-events-none -z-10" 
      />

      {/* System notices */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-sm ${
              notification.type === 'success' 
                ? 'bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-900/50 backdrop-blur-md' 
                : notification.type === 'error'
                ? 'bg-rose-50/90 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-200/80 dark:border-rose-900/50 backdrop-blur-md'
                : 'bg-blue-50/90 dark:bg-blue-950/90 text-blue-800 dark:text-blue-200 border-blue-200/80 dark:border-blue-900/50 backdrop-blur-md'
            }`}
          >
            <div className="p-1 rounded-lg bg-white/50 dark:bg-white/10 shrink-0">
              {notification.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <span className="text-xs font-semibold leading-normal">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 w-full h-[76px] backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 px-6 sm:px-12 flex items-center justify-between transition-colors duration-300">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-xs text-slate-900 dark:text-white">THE LUCID INTELLECTUAL</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Aptitude & Verbal Studio</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Wizard Main Content */}
      <main className="flex-1 w-full mx-auto px-4 py-8 flex flex-col justify-center items-center gap-2 z-10">
        
        {/* Hero Section */}
        {currentStep <= 6 && (
          <div className="relative text-center max-w-2xl mx-auto mb-6 mt-2">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-blue-500/10 dark:bg-blue-600/10 blur-2xl rounded-full -z-10 pointer-events-none" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 dark:from-white dark:via-slate-200 dark:to-white">
              Let's personalize your journey
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4 font-medium leading-relaxed">
              Tell us a little about yourself so we can tailor the experience to your goals.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 text-[10px] font-bold text-slate-500 dark:text-slate-400 backdrop-blur-sm shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
              <span>Step {currentStep} of 6</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Estimated time: {
                currentStep === 1 ? '2–3 mins' :
                currentStep === 2 ? '2 mins' :
                currentStep === 3 ? '1.5 mins' :
                currentStep === 4 ? '1 min' :
                currentStep === 5 ? '30 secs' : '10 secs'
              }</span>
            </div>
          </div>
        )}

        {/* Horizontal Stepper */}
        {currentStep <= 6 && (
          <div className="w-full max-w-[750px] bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 shadow-sm select-none text-[10px] uppercase tracking-wider mb-8">
            <div className="flex items-center justify-between relative">
              {stepsConfig.map((s, index) => {
                const StepIcon = s.icon;
                const isActive = s.id === currentStep;
                const isCompleted = s.id < currentStep;
                
                return (
                  <React.Fragment key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (s.id < currentStep) {
                          setValidationError(null);
                          setCurrentStep(s.id);
                        }
                      }}
                      disabled={!isCompleted && s.id !== currentStep}
                      className={`flex flex-col items-center gap-1.5 relative z-10 focus:outline-none transition-all duration-300 group ${
                        isCompleted ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] transition-all duration-300 relative ${
                        isCompleted 
                          ? 'border-blue-600 bg-blue-600 text-white font-black shadow-sm'
                          : isActive 
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold scale-110 shadow-[0_0_15px_rgba(37,99,235,0.25)]' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3.5]" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full border border-blue-600/30 animate-ping pointer-events-none" />
                        )}
                      </div>
                      <span className={`hidden md:inline font-bold text-[9px] transition-colors ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : isCompleted 
                          ? 'text-slate-700 dark:text-slate-300' 
                          : 'text-slate-500 dark:text-slate-500'
                      }`}>
                        {s.label}
                      </span>
                    </button>
                    {index < stepsConfig.length - 1 && (
                      <div className="h-[2px] flex-1 mx-2 relative bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                          style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Panel Card */}
        <div className="w-full max-w-[950px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-[24px] p-6 sm:p-8 min-h-[480px] flex flex-col justify-between gap-6 relative overflow-hidden transition-all duration-300">
          
          {/* Card Header Section */}
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 relative shrink-0 shadow-sm">
                {React.createElement(stepsConfig[currentStep - 1]?.icon || User, { className: "w-5.5 h-5.5" })}
                <div className="absolute inset-0 rounded-xl bg-blue-500/10 blur-md -z-10 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  {stepsConfig[currentStep - 1]?.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-1 truncate">
                  {stepsConfig[currentStep - 1]?.desc}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Secure & Private</span>
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 p-3.5 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-center gap-2.5 animate-fadeIn">
              <Info className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Animated content frame */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full"
              >
                {/* ==========================================
                    STEP 1: BASIC PROFILE
                    ========================================== */}
                {currentStep === 1 && (
                  <div className="space-y-4 max-w-xl mx-auto py-4">
                    <div className={`space-y-2.5 transition-transform duration-300 ${shakeField ? 'animate-shake' : ''}`}>
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Username *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="e.g. sriram_neppalli"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          style={{ textTransform: 'none' }}
                          className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-mono placeholder-slate-400"
                        />
                        {username && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            {isUsernameTakenOrSimilar(username).taken ? (
                              <Info className="w-5 h-5 text-rose-500 shrink-0" />
                            ) : username.length >= 3 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {username && isUsernameTakenOrSimilar(username).taken && (
                        <div className="space-y-2 mt-3 animate-fadeIn">
                          <span className="text-xs text-rose-500 font-bold block">
                            ⚠️ {isUsernameTakenOrSimilar(username).reason}
                          </span>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider select-none pt-1">
                            Try one of these suggestions:
                          </div>
                          <div className="flex flex-wrap gap-2 pt-0.5 select-none">
                            {generateUsernameSuggestions(username).map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => setUsername(suggestion)}
                                className="px-3.5 py-2 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/10 dark:hover:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-normal mt-1.5 font-medium">
                        This is how you will be identified in progress and performance tracking.
                      </span>
                    </div>
                  </div>
                )}

                {/* ==========================================
                    STEP 2: EDUCATION DETAILS OR PROFESSIONAL DETAILS
                    ========================================== */}
                {currentStep === 2 && (
                  <div className="space-y-6 py-2">
                    {/* User Type selector */}
                    <div className="space-y-3 max-w-xl mx-auto">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">I am a...</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setUserType('student')}
                          className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-300 flex flex-col gap-3 relative hover:-translate-y-0.5 ${
                            userType === 'student'
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-500/80 shadow-[0_0_20px_rgba(37,99,235,0.06)]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/60 dark:text-slate-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                            userType === 'student' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          }`}>
                            🎓
                          </div>
                          <div>
                            <span className="text-sm font-extrabold tracking-tight block">Student</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-snug block mt-0.5">High school or college student</span>
                          </div>
                          {userType === 'student' && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white animate-scaleUp shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserType('other');
                            setCollege('');
                            setDegree('');
                            setBranch('');
                            setGraduationYear('');
                          }}
                          className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-300 flex flex-col gap-3 relative hover:-translate-y-0.5 ${
                            userType === 'other'
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-500/80 shadow-[0_0_20px_rgba(37,99,235,0.06)]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900/60 dark:text-slate-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                            userType === 'other' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          }`}>
                            💼
                          </div>
                          <div>
                            <span className="text-sm font-extrabold tracking-tight block">Other</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-snug block mt-0.5">Professional or job seeker</span>
                          </div>
                          {userType === 'other' && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white animate-scaleUp shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Conditional Education Fields */}
                    {userType === 'student' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-6"
                      >
                        {/* State Selector */}
                        <div className="space-y-1.5 relative">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">State *</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search state/UT, e.g. Telangana"
                              value={stateSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStateSearch(val);
                                setIsTypingState(true);
                                setStateDropdownOpen(true);
                                setStateHighlightIndex(-1);
                              }}
                              onFocus={(e) => {
                                e.target.select();
                                setStateDropdownOpen(true);
                                setIsTypingState(false);
                                setStateHighlightIndex(-1);
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setStateDropdownOpen(false);
                                  setStateSearch(state);
                                  setIsTypingState(false);
                                  setStateHighlightIndex(-1);
                                }, 200);
                              }}
                              onKeyDown={handleStateKeyDown}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold"
                            />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            
                            <div 
                              ref={stateContainerRef}
                              className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-30 py-1.5 transition-all duration-200 origin-top ${
                                stateDropdownOpen 
                                  ? 'opacity-100 scale-y-100 pointer-events-auto' 
                                  : 'opacity-0 scale-y-95 pointer-events-none'
                              }`}
                            >
                              {filteredStates.length > 0 ? (
                                filteredStates.map((st, idx) => (
                                  <button
                                    key={st}
                                    type="button"
                                    data-index={idx}
                                    onMouseDown={() => {
                                      selectState(st);
                                    }}
                                    onMouseEnter={() => setStateHighlightIndex(idx)}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                                      idx === stateHighlightIndex
                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-xs font-semibold text-slate-400 dark:text-slate-500 text-center select-none">
                                  No states found
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Graduation Year */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Graduation Year *</label>
                          <div className="relative">
                            <select
                              value={graduationYear}
                              onChange={(e) => setGraduationYear(e.target.value)}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold appearance-none cursor-pointer"
                            >
                              {['2024', '2025', '2026', '2027', '2028', '2029', '2030'].map((yr) => (
                                <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                  {yr}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* College Selector */}
                        <div className="space-y-1.5 sm:col-span-2 relative">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">College / University *</label>
                          <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10 pointer-events-none" />
                            <input
                              type="text"
                              disabled={!state}
                              placeholder={!state ? "Select a state first" : "Search college, e.g. CBIT"}
                              value={collegeSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCollegeSearch(val);
                                setCollege(val);
                                setCollegeDropdownOpen(true);
                              }}
                              onFocus={() => setCollegeDropdownOpen(true)}
                              onBlur={() => {
                                setTimeout(() => setCollegeDropdownOpen(false), 200);
                              }}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {loadingColleges ? (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin pointer-events-none" />
                            ) : (
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            )}

                            {collegeDropdownOpen && filteredColleges.length > 0 && (
                              <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-30 py-1.5 scrollbar-thin">
                                {filteredColleges.map((clg) => (
                                  <button
                                    key={clg}
                                    type="button"
                                    onMouseDown={() => {
                                      setCollege(clg);
                                      setCollegeSearch(clg);
                                      setCollegeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                                  >
                                    {clg}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Degree Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Degree *</label>
                          <div className="relative">
                            <select
                              value={degree}
                              onChange={(e) => setDegree(e.target.value)}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold appearance-none cursor-pointer"
                            >
                              {Object.keys(DEGREE_BRANCH_DATA).map((deg) => (
                                <option key={deg} value={deg} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                  {deg}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Branch Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Branch / Department *</label>
                          <div className="relative">
                            <select
                              value={branch}
                              onChange={(e) => setBranch(e.target.value)}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold appearance-none cursor-pointer"
                            >
                              {DEGREE_BRANCH_DATA[degree] && DEGREE_BRANCH_DATA[degree].map((br) => (
                                <option key={br} value={br} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                  {br}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ==========================================
                    STEP 3: LEARNING GOAL
                    ========================================== */}
                {currentStep === 3 && (
                  <div className="space-y-5 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {goalOptions.map((g) => {
                        const isSelected = primaryGoals.includes(g.label);
                        return (
                          <button
                            key={g.id}
                            onClick={() => {
                              setPrimaryGoals(prev => 
                                prev.includes(g.label)
                                  ? prev.filter(x => x !== g.label)
                                  : [...prev, g.label]
                              );
                            }}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-4 relative hover:-translate-y-0.5 ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-500/80 shadow-[0_0_15px_rgba(37,99,235,0.06)]' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                              <Target className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col min-w-0 pr-5">
                              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">{g.label}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-1 font-medium">{g.desc}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white animate-scaleUp shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {primaryGoals.includes('Others') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5 max-w-xl mx-auto border-t border-slate-100 dark:border-slate-800/40 pt-4"
                      >
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Specify your custom goal (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Preparing for a unique corporate assessment"
                          value={customGoal}
                          onChange={(e) => setCustomGoal(e.target.value)}
                          style={{ textTransform: 'none' }}
                          className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all font-semibold"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ==========================================
                    STEP 4: TARGET TIMELINE
                    ========================================== */}
                {currentStep === 4 && (
                  <div className="space-y-3 max-w-xl mx-auto py-2">
                    {timelineOptions.map((time) => {
                      const isSelected = targetTimeline === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setTargetTimeline(time)}
                          style={{ textTransform: 'none' }}
                          className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-center justify-between font-bold text-xs ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-500/80 shadow-[0_0_15px_rgba(37,99,235,0.06)]' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Calendar className={`w-5 h-5 transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="text-slate-900 dark:text-white font-bold">{time}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ==========================================
                    STEP 5: WEEKLY COMMITMENT
                    ========================================== */}
                {currentStep === 5 && (
                  <div className="space-y-3 max-w-xl mx-auto py-2">
                    {commitmentOptions.map((commit) => {
                      const isSelected = weeklyCommitment === commit;
                      return (
                        <button
                          key={commit}
                          onClick={() => setWeeklyCommitment(commit)}
                          style={{ textTransform: 'none' }}
                          className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-center justify-between font-bold text-xs ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-500 dark:border-blue-500/80 shadow-[0_0_15px_rgba(37,99,235,0.06)]' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Clock className={`w-5 h-5 transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="text-slate-900 dark:text-white font-bold">{commit}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ==========================================
                    STEP 6: LEARNING PREFERENCE
                    ========================================== */}
                {currentStep === 6 && (
                  <div className="space-y-3 max-w-xl mx-auto py-2">
                    {preferenceOptions.map((pref) => {
                      const isSelected = learningPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => {
                            setLearningPreferences(prev => 
                              prev.includes(pref)
                                ? prev.filter(x => x !== pref)
                                : [...prev, pref]
                            );
                          }}
                          style={{ textTransform: 'none' }}
                          className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-center justify-between font-bold text-xs ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-500/80 shadow-[0_0_15px_rgba(37,99,235,0.06)]' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <BookOpen className={`w-5 h-5 transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="text-slate-900 dark:text-white font-bold">{pref}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Buttons Panel (Card Footer) */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-5 flex flex-row items-center justify-between gap-4">
            {/* Left section: Secure shield */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold shrink-0">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-600 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider hidden md:inline leading-none">
                Data Fully Encrypted
              </span>
            </div>

            {/* Center section: Pagination indicators */}
            <div className="flex flex-col items-center gap-1.5 select-none shrink-0">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">
                STEP {currentStep} OF 6
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div 
                    key={num}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      num === currentStep 
                        ? 'w-4.5 bg-blue-600 dark:bg-blue-500' 
                        : num < currentStep 
                        ? 'w-1.5 bg-blue-400 dark:bg-blue-800' 
                        : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right section: CTA buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {currentStep > 1 && (
                <button
                  onClick={handleBackStep}
                  disabled={loading}
                  className="h-[52px] px-5 bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30 disabled:opacity-30 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer select-none active:scale-95"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleNextStep}
                disabled={isContinueDisabled() || loading}
                style={{ textTransform: 'none' }}
                className={`h-[52px] px-6 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all select-none active:scale-95 duration-200 ${
                  (isContinueDisabled() || loading)
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-600 cursor-not-allowed shadow-none border border-slate-200/50 dark:border-slate-800/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 shadow-lg hover:shadow-xl hover:translate-y-[-1px] cursor-pointer'
                }`}
              >
                <span>{loading ? 'Bootstrapping...' : (currentStep === 6 ? 'Complete Onboarding →' : 'Continue →')}</span>
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </button>
            </div>
          </div>

        </div>

      </main>


    </div>
  );
}
