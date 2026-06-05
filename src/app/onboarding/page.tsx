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
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { INDIAN_STATES, INDIAN_COLLEGES } from '@/data/indianColleges';

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

  // ==========================================
  // onboarding states
  // ==========================================
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
      
      {/* Decorative grids matching the content creator theme */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-35 dark:opacity-15 animate-fadeIn" />

      {/* System notices */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 max-w-sm animate-scaleUp ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-205 border-emerald-200 dark:border-emerald-900' 
            : notification.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-205 border-rose-200 dark:border-rose-900'
            : 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-205 border-blue-200 dark:border-blue-900'
        }`}>
          <div className="p-1 rounded-md bg-white/50 shrink-0">
            {notification.type === 'success' ? <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </div>
          <span className="text-xs font-bold leading-normal">{notification.text}</span>
        </div>
      )}

      {/* Light-palette Brand Header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 sm:px-12 py-4 flex items-center justify-between shadow-xs transition-colors duration-300">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-xs text-slate-900 dark:text-white">THE LUCID INTELLECTUAL</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Aptitude & Verbal Studio</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              SECURE ONBOARDING HUD
            </span>
          </div>
        </div>
      </header>

      {/* Stepper Wizard Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col justify-center items-center gap-6 z-10">
        
        {/* Horizontal HUD Stepper (Light theme) */}
        {currentStep <= 6 && (
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs select-none text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors duration-300">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isActive = num === currentStep;
              const isCompleted = num < currentStep;
              return (
                <React.Fragment key={num}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-[9.5px] transition-all duration-300 ${
                      isCompleted 
                        ? 'border-blue-600 bg-blue-600 text-white font-black shadow-xs'
                        : isActive 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-extrabold scale-105 shadow-inner' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-550'
                    }`}>
                      {num}
                    </span>
                    <span className={`hidden md:inline font-bold text-[9px] ${isActive ? 'text-slate-805 dark:text-slate-100' : isCompleted ? 'text-blue-650 dark:text-blue-400' : 'text-slate-400 dark:text-slate-550'}`}>
                      {num === 1 ? 'Profile' : num === 2 ? (userType === 'other' ? 'Professional' : 'Academic') : num === 3 ? 'Goal' : num === 4 ? 'Timeline' : num === 5 ? 'Commit' : 'Preference'}
                    </span>
                  </div>
                  {num < 6 && <div className={`h-[1px] flex-1 mx-2 transition-colors duration-300 ${num < currentStep ? 'bg-blue-300 dark:bg-blue-800' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Wizard Panel Card (Light Palette) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-6 sm:p-8 min-h-[460px] flex flex-col justify-between gap-6 relative overflow-hidden transition-all duration-300">
          
          {/* Validation Banner */}
          {validationError && (
            <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-150 dark:border-rose-900 p-3 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed animate-fadeIn">
              ⚠️ {validationError}
            </div>
          )}

          {/* ==========================================
              STEP 1: BASIC PROFILE
              ========================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Choose Your Username</h3>
                <p className="text-xs text-slate-450 font-medium">Please choose a unique username to personalize your aptitude tracking experience.</p>
              </div>

              <div className="space-y-4">
                <div className={`space-y-1.5 transition-transform duration-300 ${shakeField ? 'animate-shake' : ''}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455" />
                    <input 
                      type="text" 
                      placeholder="e.g. sriram_neppalli"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      style={{ textTransform: 'none' }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-all font-mono"
                    />
                  </div>
                  {username && isUsernameTakenOrSimilar(username).taken && (
                    <div className="space-y-2 mt-2.5 animate-fadeIn">
                      <span className="text-[10px] text-rose-500 font-bold block">
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
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <span className="text-[9px] text-slate-455 block leading-normal mt-1">This is how you will be identified in progress and performance leaderboard tracking.</span>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 2: EDUCATION DETAILS OR PROFESSIONAL DETAILS
              ========================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Education Information</h3>
                <p className="text-xs text-slate-450 font-medium">Add academic records to qualify for corresponding placement templates.</p>
              </div>

              {/* User Type selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col gap-2 relative ${
                      userType === 'student'
                        ? 'border-blue-600 bg-blue-50/50 text-slate-900 dark:bg-blue-950/20 dark:text-blue-400 shadow-sm font-black'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xl">🎓</span>
                    <span className="text-xs font-bold tracking-tight">Student</span>
                    <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium leading-none">High school or college student</span>
                    {userType === 'student' && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white animate-scaleUp">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
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
                    className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col gap-2 relative ${
                      userType === 'other'
                        ? 'border-blue-600 bg-blue-50/50 text-slate-900 dark:bg-blue-950/20 dark:text-blue-400 shadow-sm font-black'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">💼</span>
                    <span className="text-xs font-bold tracking-tight">Other</span>
                    <span className="text-[9.5px] text-slate-400 dark:text-slate-550 font-medium leading-none">Professional or job seeker</span>
                    {userType === 'other' && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white animate-scaleUp">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Conditional Education Fields */}
              <div 
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-in-out origin-top ${
                  userType === 'student' 
                    ? 'max-h-[600px] opacity-100 scale-y-100 pointer-events-auto mt-4' 
                    : 'max-h-0 opacity-0 scale-y-0 pointer-events-none overflow-hidden'
                }`}
              >
                {/* State Autocomplete Selector */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">State *</label>
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 pr-10 text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:border-blue-600 transition-all font-semibold"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 pointer-events-none" />
                    
                    <div 
                      ref={stateContainerRef}
                      className={`absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-30 py-1.5 scrollbar-thin scrollbar-thumb-slate-300 transition-all duration-200 origin-top ${
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

                {/* Graduation Year Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Graduation Year *</label>
                  <div className="relative">
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 pr-10 text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:border-blue-600 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      {['2024', '2025', '2026', '2027', '2028', '2029', '2030'].map((yr) => (
                        <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 pointer-events-none" />
                  </div>
                </div>

                {/* College Autocomplete Selector */}
                <div className="space-y-1.5 sm:col-span-2 relative">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">College / University *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-455 z-10 pointer-events-none" />
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
                        // Allow click to execute before closing
                        setTimeout(() => setCollegeDropdownOpen(false), 200);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:border-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {loadingColleges ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin pointer-events-none" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 pointer-events-none" />
                    )}

                    {collegeDropdownOpen && filteredColleges.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-30 py-1.5 scrollbar-thin scrollbar-thumb-slate-300">
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
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Degree *</label>
                  <div className="relative">
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 pr-10 text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:border-blue-600 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      {Object.keys(DEGREE_BRANCH_DATA).map((deg) => (
                        <option key={deg} value={deg} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {deg}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 pointer-events-none" />
                  </div>
                </div>

                {/* Branch Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Branch / Department *</label>
                  <div className="relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 pr-10 text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:border-blue-600 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      {DEGREE_BRANCH_DATA[degree] && DEGREE_BRANCH_DATA[degree].map((br) => (
                        <option key={br} value={br} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {br}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 3: LEARNING GOAL
              ========================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">What is your primary goal?</h3>
                <p className="text-xs text-slate-455 font-medium">Select the target destination of your analytical preparations.</p>
              </div>

              {/* Selectable goal cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
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
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-905 dark:bg-blue-950/20 dark:text-blue-400 shadow-sm font-black' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-705 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-[11.5px] font-bold tracking-tight">{g.label}</span>
                        <span className="text-[9.5px] text-slate-450 dark:text-slate-500 leading-normal mt-0.5 font-medium">{g.desc}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {primaryGoals.includes('Others') && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Specify your custom goal (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Preparing for a unique corporate assessment"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-all font-semibold"
                  />
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 4: TARGET TIMELINE
              ========================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">When do you want to achieve your goal?</h3>
                <p className="text-xs text-slate-450 font-medium">This aligns chronological milestone metrics in your planner.</p>
              </div>

              <div className="space-y-2.5">
                {timelineOptions.map((time) => {
                  const isSelected = targetTimeline === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setTargetTimeline(time)}
                      style={{ textTransform: 'none' }}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between font-bold text-xs ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/40 text-slate-905 dark:bg-blue-950/20 dark:text-blue-400 shadow-2xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-650 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-4.5 h-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{time}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-blue-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 5: WEEKLY COMMITMENT
              ========================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">How much time can you dedicate each week?</h3>
                <p className="text-xs text-slate-450 font-medium">We calibrate streak milestones and questions quotas accordingly.</p>
              </div>

              <div className="space-y-2.5">
                {commitmentOptions.map((commit) => {
                  const isSelected = weeklyCommitment === commit;
                  return (
                    <button
                      key={commit}
                      onClick={() => setWeeklyCommitment(commit)}
                      style={{ textTransform: 'none' }}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between font-bold text-xs ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/40 text-slate-905 dark:bg-blue-950/20 dark:text-blue-400 shadow-2xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-650 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4.5 h-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{commit}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-blue-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 6: LEARNING PREFERENCE
              ========================================== */}
          {currentStep === 6 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-scaleUp">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">How do you prefer to learn?</h3>
                <p className="text-xs text-slate-455 font-medium">Select your pedagogical preference for practicing aptitude.</p>
              </div>

              <div className="space-y-2.5">
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
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between font-bold text-xs ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/40 text-slate-905 dark:bg-blue-950/20 dark:text-blue-400 shadow-2xs font-black' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-655 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className={`w-4.5 h-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{pref}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500' : 'border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper Buttons Panel */}
          <div className="border-t border-slate-100 pt-5 flex justify-between items-center select-none">
            {/* Back button */}
            {currentStep > 1 ? (
              <button
                onClick={handleBackStep}
                disabled={loading}
                className="py-2.5 px-5 bg-transparent hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-550 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer select-none"
              >
                Back
              </button>
            ) : (
              <div className="w-[60px]" />
            )}

            {/* Step indicators */}
            <span className="text-[10px] font-black text-slate-400 tracking-wider">
              STEP {currentStep} OF 6
            </span>

            {/* Next / Complete button */}
            <button
              onClick={handleNextStep}
              disabled={isContinueDisabled() || loading}
              style={{ textTransform: 'none' }}
              className={`py-2.5 px-5 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all select-none active:scale-98 ${
                (isContinueDisabled() || loading)
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              <span>{loading ? 'Bootstrapping...' : (currentStep === 6 ? 'Go to Dashboard' : 'Continue')}</span>
              {loading ? (
                <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : currentStep === 6 ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <ArrowRight className="w-4 h-4 shrink-0" />
              )}
            </button>
          </div>

        </div>

      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200 py-6 px-6 sm:px-12 bg-white flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-450 gap-4">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Operational Security: SSL Sandboxed</span>
        </div>
        <span className="font-medium">© 2026 Aptitude AI Platform. All rights reserved.</span>
      </footer>

    </div>
  );
}
