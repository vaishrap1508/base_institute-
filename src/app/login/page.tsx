'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import RoleToggle from '@/components/RoleToggle';
import { 
  Layers, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  ChevronRight,
  User,
  GraduationCap,
  Award,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { createClient } from '@/utils/supabase/client';
import { siteConfig } from '@/config/site';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Dynamic branding logo configuration
  const [logoText, setLogoText] = useState(siteConfig.logoText);
  const [logoSubtext, setLogoSubtext] = useState(siteConfig.logoSubtext);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('aptitude_landing_page_settings');
      if (localData) {
        try {
          let parsed = null; try { parsed = JSON.parse(localData); } catch(e) {}
          if (parsed.header_logo_text) setLogoText(parsed.header_logo_text);
          if (parsed.header_logo_subtext) setLogoSubtext(parsed.header_logo_subtext);
        } catch (_) {}
      }
    }

    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_page_settings')
          .select('header_logo_text, header_logo_subtext')
          .eq('id', 'current')
          .single();

        if (data && !error) {
          if (data.header_logo_text) setLogoText(data.header_logo_text);
          if (data.header_logo_subtext) setLogoSubtext(data.header_logo_subtext);

          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('aptitude_landing_page_settings');
            let parsed = {};
            if (localData) {
              try { parsed = JSON.parse(localData); } catch (_) {}
            }
            localStorage.setItem('aptitude_landing_page_settings', JSON.stringify({
              ...parsed,
              header_logo_text: data.header_logo_text,
              header_logo_subtext: data.header_logo_subtext
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch branding from Supabase:", err);
      }
    };

    fetchBranding();
  }, [supabase]);

  const setCookie = (name: string, value: string, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  };

  // Detect if Supabase is offline/placeholder domain to run in Offline Sandbox Mode
  const isOfflineSandbox = typeof window !== 'undefined' && 
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('fxpeswcwjvysarjfyquo') || 
     localStorage.getItem('aptitude_offline_sandbox') === 'true');

  // ==========================================
  // VIEW AND AUTH STATES
  // ==========================================
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreateAccountSuggest, setShowCreateAccountSuggest] = useState(false);
  const [showSandboxModeSuggest, setShowSandboxModeSuggest] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Detect URL search params for verification, resets, or callback errors
  React.useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    const errorParam = searchParams.get('error');

    if (verified === 'true') {
      showNotice('Email verified successfully! You can now log in.', 'success');
      router.replace('/login');
    } else if (reset === 'true') {
      showNotice('Password updated successfully! Log in with your new credentials.', 'success');
      router.replace('/login');
    } else if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
      router.replace('/login');
    }
  }, [searchParams]);

  // Pre-seed some emails on mount so existing credentials work out of the box
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('aptitude_registered_emails');
      if (!existing) {
        localStorage.setItem('aptitude_registered_emails', JSON.stringify([
          'sarah.c@aptitude-ai.com',
          'marcus.w@aptitude-ai.com',
          'sriram_neppalli@university.edu',
          'student@university.edu',
          'admin@university.edu',
          'v.abhinav5494017@gmail.com'
        ]));
      }
    }
  }, []);

  // Trigger temporary floating system notices
  const showNotice = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to request a new verification link.');
      return;
    }
    setResending(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to resend verification email.');
      } else {
        showNotice(data.message || 'Verification email resent successfully.', 'success');
        setShowResendVerification(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'A network error occurred.');
    } finally {
      setResending(false);
    }
  };

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Helper to generate a highly secure random strong password
  const handleGenerateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let generated = '';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '!@#$%^&*';
    
    // Guarantee inclusion of required character sets
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += specials[Math.floor(Math.random() * specials.length)];
    
    for (let i = 0; i < 8; i++) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle
    generated = generated.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    showNotice(`Generated secure password: ${generated}`, 'success');
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  // ==========================================
  // PASSWORD RECOVERY SUBMIT HANDLER
  // ==========================================
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    // Strict constraint: no uppercase characters allowed
    if (/[A-Z]/.test(email)) {
      setErrorMsg('Recovery failed: Email must be written in small letters only.');
      setLoading(false);
      return;
    }

    if (isOfflineSandbox) {
      // Simulate recovery email submission with latency
      setTimeout(() => {
        showNotice(`A secure recovery link has been dispatched to ${email.trim()}.`, 'success');
        setLoading(false);
        setIsForgotPassword(false);
      }, 1000);
    } else {
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            setErrorMsg(data.error || 'Password recovery request failed.');
          } else {
            showNotice(data.message || 'Password reset link sent successfully.', 'success');
            setIsForgotPassword(false);
            setEmail('');
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || 'A network error occurred.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    
    if (isOfflineSandbox) {
      console.warn("Supabase auth is offline. Simulating mock Google Login.");
      const mockGoogleUser = {
        role: 'STUDENT',
        name: 'GOOGLE_USER',
        email: 'google.student@university.edu',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana'
      };
      localStorage.setItem('aptitude_current_role', JSON.stringify(mockGoogleUser));
      setCookie('aptitude_mock_auth', JSON.stringify({
        id: 'mock-google-id',
        email: 'google.student@university.edu',
        name: 'GOOGLE_USER',
        role: 'STUDENT'
      }));
      setCookie('aptitude_onboarding_completed', 'false');
      showNotice('Logged in via mock Google Account (Offline Sandbox Mode)! Redirecting...', 'success');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during Google sign-in.');
      setGoogleLoading(false);
    }
  };

  // ==========================================
  // SIGN IN / SIGN UP SUBMIT HANDLER
  // ==========================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please fill in all credential fields.');
      setLoading(false);
      return;
    }

    // Strict constraint: only small letters allowed for authentication
    if (/[A-Z]/.test(email)) {
      setErrorMsg('Authentication failed: Email must be written in small letters only (no capitals).');
      setLoading(false);
      return;
    }

    // If logging in
    if (!isRegister) {
      if (isOfflineSandbox) {
        console.warn("Supabase auth is offline. Logging in via local offline credentials.");
        const normalizedEmail = email.trim().toLowerCase();

        // Check if it's one of the built-in system mock accounts or registered offline accounts
        const isSarah = normalizedEmail === 'sarah.c@aptitude-ai.com' || normalizedEmail === 'admin@university.edu' || normalizedEmail.includes('admin') || normalizedEmail.includes('abhinav');
        const isMarcus = normalizedEmail === 'marcus.w@aptitude-ai.com';
        const isStudent = normalizedEmail === 'student@university.edu' || normalizedEmail === 'sriram_neppalli@university.edu';
        
        const localProfilesStr = localStorage.getItem('aptitude_mock_profiles') || '{}';
        let localProfiles = []; try { localProfiles = JSON.parse(localProfilesStr); } catch(e) {}
        const customProfile = localProfiles[normalizedEmail];

        const isRegisteredOffline = !!customProfile;

        if (isSarah || isMarcus || isStudent || isRegisteredOffline) {
          if (isRegisteredOffline && customProfile.password !== password) {
            setErrorMsg('Invalid credentials (Offline Sandbox Mode).');
            setLoading(false);
            return;
          }

          const userRole = (isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';
          const name = isSarah ? 'Sarah' : isMarcus ? 'Marcus' : customProfile?.fullName || normalizedEmail.split('@')[0].toUpperCase();

          // Set mock auth cookie
          const mockUser = {
            id: isSarah ? 'sarah-id' : isMarcus ? 'marcus-id' : isStudent ? 'student-id' : (customProfile?.id || 'mock-student-id'),
            email: normalizedEmail,
            name,
            role: userRole
          };
          setCookie('aptitude_mock_auth', JSON.stringify(mockUser));
          
          const registeredEmailsStr = localStorage.getItem('aptitude_registered_emails') || '[]';
          let registeredEmails = [];
          try {
            try { registeredEmails = JSON.parse(registeredEmailsStr); } catch(e) { registeredEmails = []; }
          } catch (_) {}
          
          const isEmailAlreadyRegistered = isStudent || isRegisteredOffline || registeredEmails.includes(normalizedEmail);
          
          if (isEmailAlreadyRegistered) {
            localStorage.setItem('aptitude_onboarding_completed', 'true');
          }
          
          const completedOnboarding = localStorage.getItem('aptitude_onboarding_completed') === 'true' || isEmailAlreadyRegistered;
          setCookie('aptitude_onboarding_completed', completedOnboarding ? 'true' : 'false');

          if (userRole === 'ADMIN') {
            if (isMarcus) {
              const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
              localStorage.setItem('aptitude_current_role', JSON.stringify(editorRole));
              showNotice('Logged in locally as Marcus (Editor)! Redirecting...', 'success');
              setTimeout(() => router.push('/admin/editor'), 1000);
            } else {
              const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
              localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
              showNotice('Logged in locally as Sarah (Admin)! Redirecting...', 'success');
              setTimeout(() => router.push('/admin/dashboard'), 1000);
            }
          } else {
            const studentRole = {
              role: 'STUDENT',
              name,
              email: normalizedEmail,
              avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
            };
            localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
            showNotice('Logged in locally (Offline Sandbox Mode)! Redirecting...', 'success');
            
            setTimeout(() => {
              if (completedOnboarding) {
                router.push('/student/dashboard');
              } else {
                router.push('/onboarding');
              }
            }, 1000);
          }
          setLoading(false);
          return;
        } else {
          setErrorMsg('Account not found in local sandbox directory. Please register first.');
          setLoading(false);
          return;
        }
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('verified') || error.message.toLowerCase().includes('verification')) {
            setShowResendVerification(true);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          deleteCookie('aptitude_mock_auth');
          deleteCookie('aptitude_onboarding_completed');

          const { data: profile } = await supabase
            .from('profiles')
            .select('role, email_verified')
            .eq('id', data.user.id)
            .maybeSingle();

          const isSarah = data.user.email === 'sarah.c@aptitude-ai.com' || data.user.email?.toLowerCase().includes('admin') || data.user.email?.toLowerCase().includes('abhinav');
          const isMarcus = data.user.email === 'marcus.w@aptitude-ai.com';
          const isBypassUser = isSarah || isMarcus;

          // Block unverified non-bypass users from accessing
          if (profile && !profile.email_verified && !isBypassUser) {
            setErrorMsg('Your email address has not been verified yet.');
            setShowResendVerification(true);
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          const userRole = (profile?.role === 'ADMIN' || isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';

          if (userRole === 'ADMIN') {
            if (isMarcus) {
              const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
              localStorage.setItem('aptitude_current_role', JSON.stringify(editorRole));
              router.push('/admin/editor');
            } else {
              const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
              localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
              router.push('/admin/dashboard');
            }
          } else {
            // Log in as standard student
            const studentRole = {
              role: 'STUDENT',
              name: data.user.email?.split('@')[0].toUpperCase() || 'STUDENT',
              email: data.user.email!,
              avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
            };
            localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));

            const normalizedEmail = data.user.email!.trim().toLowerCase();
            const isStudent = normalizedEmail === 'student@university.edu' || normalizedEmail === 'sriram_neppalli@university.edu';
            
            const registeredEmailsStr = localStorage.getItem('aptitude_registered_emails') || '[]';
            let registeredEmails = [];
            try {
              try { registeredEmails = JSON.parse(registeredEmailsStr); } catch(e) { registeredEmails = []; }
            } catch (_) {}
            
            const localProfilesStr = localStorage.getItem('aptitude_mock_profiles') || '{}';
            let localProfiles = []; try { localProfiles = JSON.parse(localProfilesStr); } catch(e) {}
            const customProfile = localProfiles[normalizedEmail];
            const isRegisteredOffline = !!customProfile;

            const isEmailAlreadyRegistered = isStudent || isRegisteredOffline || registeredEmails.includes(normalizedEmail);

            const { data: onboarding } = await supabase
              .from('onboarding_profile')
              .select('onboarding_completed')
              .eq('user_id', data.user.id)
              .maybeSingle();

            const completedOnboarding = onboarding?.onboarding_completed || isEmailAlreadyRegistered;

            if (completedOnboarding) {
              localStorage.setItem('aptitude_onboarding_completed', 'true');
              if (!registeredEmails.includes(normalizedEmail)) {
                registeredEmails.push(normalizedEmail);
                localStorage.setItem('aptitude_registered_emails', JSON.stringify(registeredEmails));
              }
              setCookie('aptitude_onboarding_completed', 'true');
              router.push('/student/dashboard');
            } else {
              setCookie('aptitude_onboarding_completed', 'false');
              router.push('/onboarding');
            }
          }
        }
      } catch (err: any) {
        const isOffline = err.message?.includes('Failed to fetch') || err.message?.includes('fetch failed');
        if (isOffline) {
          console.warn("Supabase auth is offline. Logging in via local offline credentials.");
          const normalizedEmail = email.trim().toLowerCase();

          // Check if it's one of the built-in system mock accounts or registered offline accounts
          const isSarah = normalizedEmail === 'sarah.c@aptitude-ai.com' || normalizedEmail === 'admin@university.edu' || normalizedEmail.includes('admin') || normalizedEmail.includes('abhinav');
          const isMarcus = normalizedEmail === 'marcus.w@aptitude-ai.com';
          const isStudent = normalizedEmail === 'student@university.edu' || normalizedEmail === 'sriram_neppalli@university.edu';
          
          const localProfilesStr = localStorage.getItem('aptitude_mock_profiles') || '{}';
          let localProfiles = []; try { localProfiles = JSON.parse(localProfilesStr); } catch(e) {}
          const customProfile = localProfiles[normalizedEmail];

          const isRegisteredOffline = !!customProfile;

          if (isSarah || isMarcus || isStudent || isRegisteredOffline) {
            if (isRegisteredOffline && customProfile.password !== password) {
              setErrorMsg('Invalid credentials (Offline Sandbox Mode).');
              setLoading(false);
              return;
            }

            const userRole = (isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';
            const name = isSarah ? 'Sarah' : isMarcus ? 'Marcus' : customProfile?.fullName || normalizedEmail.split('@')[0].toUpperCase();

            // Set mock auth cookie
            const mockUser = {
              id: isSarah ? 'sarah-id' : isMarcus ? 'marcus-id' : isStudent ? 'student-id' : (customProfile?.id || 'mock-student-id'),
              email: normalizedEmail,
              name,
              role: userRole
            };
             setCookie('aptitude_mock_auth', JSON.stringify(mockUser));
             
             const registeredEmailsStr = localStorage.getItem('aptitude_registered_emails') || '[]';
             let registeredEmails = [];
             try {
               try { registeredEmails = JSON.parse(registeredEmailsStr); } catch(e) { registeredEmails = []; }
             } catch (_) {}
             
             const isEmailAlreadyRegistered = isStudent || isRegisteredOffline || registeredEmails.includes(normalizedEmail);
             
             if (isEmailAlreadyRegistered) {
               localStorage.setItem('aptitude_onboarding_completed', 'true');
             }
             
             const completedOnboarding = localStorage.getItem('aptitude_onboarding_completed') === 'true' || isEmailAlreadyRegistered;
             setCookie('aptitude_onboarding_completed', completedOnboarding ? 'true' : 'false');
 
             if (userRole === 'ADMIN') {
               if (isMarcus) {
                 const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
                 localStorage.setItem('aptitude_current_role', JSON.stringify(editorRole));
                 showNotice('Logged in locally as Marcus (Editor)! Redirecting...', 'success');
                 setTimeout(() => router.push('/admin/editor'), 1000);
               } else {
                 const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
                 localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
                 showNotice('Logged in locally as Sarah (Admin)! Redirecting...', 'success');
                 setTimeout(() => router.push('/admin/dashboard'), 1000);
               }
             } else {
               const studentRole = {
                 role: 'STUDENT',
                 name,
                 email: normalizedEmail,
                 avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
               };
               localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
               showNotice('Logged in locally (Offline Sandbox Mode)! Redirecting...', 'success');
               
               setTimeout(() => {
                 if (completedOnboarding) {
                   router.push('/student/dashboard');
                 } else {
                   router.push('/onboarding');
                 }
               }, 1000);
             }
            return;
          } else {
            setErrorMsg('Account not found in local sandbox directory. Please register first.');
            setLoading(false);
            return;
          }
        }
        setErrorMsg(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    } else {
      // If registering as a student or other
      if (!fullName) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }

      // Strict strong password validation checks
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      const isLongEnough = password.length >= 8;

      if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setErrorMsg('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setLoading(false);
        return;
      }

      if (isOfflineSandbox) {
        console.warn("Supabase auth is offline. Registering user in local offline session.");
        const normalizedEmail = email.trim().toLowerCase();
        
        const existingStr = localStorage.getItem('aptitude_registered_emails');
        let emails = []; try { emails = existingStr ? JSON.parse(existingStr) : []; } catch(e) {}
        if (!emails.includes(normalizedEmail)) {
          emails.push(normalizedEmail);
          localStorage.setItem('aptitude_registered_emails', JSON.stringify(emails));
        }

        const localProfilesStr = localStorage.getItem('aptitude_mock_profiles') || '{}';
        let localProfiles = []; try { localProfiles = JSON.parse(localProfilesStr); } catch(e) {}
        localProfiles[normalizedEmail] = {
          fullName,
          password
        };
        localStorage.setItem('aptitude_mock_profiles', JSON.stringify(localProfiles));

        const registeredUser = {
          role: 'STUDENT',
          userType: '',
          name: fullName,
          email: normalizedEmail,
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana'
        };
        localStorage.setItem('aptitude_current_role', JSON.stringify(registeredUser));
        localStorage.removeItem('aptitude_onboarding_completed');

        // Set mock cookies
        const mockUser = {
          id: 'mock-registered-id',
          email: normalizedEmail,
          name: fullName,
          role: (normalizedEmail.includes('admin') || normalizedEmail.includes('abhinav')) ? 'ADMIN' : 'STUDENT'
        };
        setCookie('aptitude_mock_auth', JSON.stringify(mockUser));
        setCookie('aptitude_onboarding_completed', 'false');

        showNotice('Account registered locally (Offline Sandbox Mode)! Redirecting to onboarding...', 'success');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, fullName })
        });
        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || 'Registration failed.');
          if (data.error?.toLowerCase().includes('rate') || data.error?.toLowerCase().includes('limit') || data.error?.toLowerCase().includes('security') || data.error?.toLowerCase().includes('unexpected_failure')) {
            setShowSandboxModeSuggest(true);
          }
          setLoading(false);
          return;
        }

        deleteCookie('aptitude_mock_auth');
        deleteCookie('aptitude_onboarding_completed');

        showNotice(data.message || 'Account registered! Please verify your email or sign in.', 'success');
        setIsRegister(false);
        
        // Clear registration fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      } catch (err: any) {
        const isOffline = err.message?.includes('Failed to fetch') || err.message?.includes('fetch failed');
        if (isOffline) {
          console.warn("Supabase auth is offline. Registering user in local offline session.");
          const normalizedEmail = email.trim().toLowerCase();
          
          const existingStr = localStorage.getItem('aptitude_registered_emails');
          let emails = []; try { emails = existingStr ? JSON.parse(existingStr) : []; } catch(e) {}
          if (!emails.includes(normalizedEmail)) {
            emails.push(normalizedEmail);
            localStorage.setItem('aptitude_registered_emails', JSON.stringify(emails));
          }

          const localProfilesStr = localStorage.getItem('aptitude_mock_profiles') || '{}';
          let localProfiles = []; try { localProfiles = JSON.parse(localProfilesStr); } catch(e) {}
          localProfiles[normalizedEmail] = {
            fullName,
            password
          };
          localStorage.setItem('aptitude_mock_profiles', JSON.stringify(localProfiles));

          const registeredUser = {
            role: 'STUDENT',
            userType: '',
            name: fullName,
            email: normalizedEmail,
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana'
          };
          localStorage.setItem('aptitude_current_role', JSON.stringify(registeredUser));
          localStorage.removeItem('aptitude_onboarding_completed');

          // Set mock cookies
          const mockUser = {
            id: 'mock-registered-id',
            email: normalizedEmail,
            name: fullName,
            role: 'STUDENT'
          };
          setCookie('aptitude_mock_auth', JSON.stringify(mockUser));
          setCookie('aptitude_onboarding_completed', 'false');

          showNotice('Account registered locally (Offline Sandbox Mode)! Redirecting to onboarding...', 'success');
          setTimeout(() => {
            router.push('/onboarding');
          }, 1500);
          return;
        }
        setErrorMsg(err.message || 'An unexpected error occurred during registration.');
        if (err.message?.toLowerCase().includes('rate') || err.message?.toLowerCase().includes('limit') || err.message?.toLowerCase().includes('security') || err.message?.toLowerCase().includes('unexpected_failure')) {
          setShowSandboxModeSuggest(true);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-300">
      
      {/* Floating System Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 max-w-sm animate-scaleUp ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="p-1 rounded-md bg-white/40 shrink-0">
            {notification.type === 'success' ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Cpu className="w-4 h-4 text-blue-600" />}
          </div>
          <span className="text-xs font-bold leading-normal">{notification.text}</span>
        </div>
      )}
      {/* ==========================================
          LEFT COLUMN: CURATED DARK VISUAL DECK
          ========================================== */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950 text-white flex-col justify-between p-12 h-full min-h-screen relative overflow-hidden border-r border-slate-900">
        
        {/* Background decorative layers */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 self-start z-10 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-xs text-white">{logoText}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">{logoSubtext}</span>
          </div>
        </Link>

        {/* Center Mission Statements */}
        <div className="space-y-6 z-10 my-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight uppercase">
            Master your <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Aptitude</span> with editorial precision.
          </h2>

        </div>



      </div>

      {/* ==========================================
          RIGHT COLUMN: AUTHENTICATION FORM CARD
          ========================================== */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 min-h-screen relative">
        
        {/* Back link to Home */}
        {/* Back link to Home */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Theme & Role Toggle in the topmost right corner */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <RoleToggle />
          <ThemeToggle />
        </div>

        {/* The Card Form container */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-10 space-y-6 animate-scaleUp z-10 transition-colors duration-300">
                   {/* Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isForgotPassword 
                ? 'Recover Password' 
                : isRegister 
                ? 'Create Account' 
                : 'Welcome Back'}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-normal">
              {isForgotPassword 
                ? 'Request a secure code reset pathway.' 
                : isRegister 
                ? 'Join the aptitude studio catalog.' 
                : 'Please enter your credentials to access the studio.'}
            </p>
          </div>

          {!isForgotPassword && (
            <>
              {/* Social Sign-in Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                style={{ textTransform: 'none' }}
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-2.5 font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500 shrink-0" />
                ) : (
                  /* Inline dynamic colorful Chrome icon */
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3 text-slate-300 dark:text-slate-700 select-none">
                <div className="h-px bg-slate-200/80 dark:bg-slate-800 flex-1" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">OR LOGIN WITH EMAIL</span>
                <div className="h-px bg-slate-200/80 dark:bg-slate-800 flex-1" />
              </div>
            </>
          )}

          {isForgotPassword ? (
            /* PASSWORD RECOVERY FORM */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed animate-fadeIn flex items-center gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Email Address</label>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl h-12 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium selection:bg-blue-100"
                  />
                </div>
                {email && /[A-Z]/.test(email) && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-1 animate-fadeIn">
                    ⚠️ Small letters only! Please use only lowercase letters.
                  </span>
                )}
              </div>

              {/* Submit button with high-end loading feedback */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all active:scale-98 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMsg(null);
                }}
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-2 font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                Back to Login
              </button>

            </form>
          ) : (
            /* STANDARD AUTH FORM */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="space-y-2">
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed animate-fadeIn flex items-center gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                  {showCreateAccountSuggest && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-2.5 animate-fadeIn">
                      <p className="font-semibold text-blue-800">
                        Would you like to create a new account?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(true);
                          setErrorMsg(null);
                          setShowCreateAccountSuggest(false);
                          setEmail('');
                          setPassword('');
                          setConfirmPassword('');
                          setFullName('');
                        }}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                      >
                        <span>Create New Account</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                  {showSandboxModeSuggest && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-2.5 animate-fadeIn">
                      <p className="font-semibold text-blue-800">
                        Supabase Email limit exceeded. Would you like to run in Local Sandbox Mode to bypass this?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('aptitude_offline_sandbox', 'true');
                          setErrorMsg(null);
                          setShowSandboxModeSuggest(false);
                          window.location.reload();
                        }}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 group group-hover:translate-x-0.5 cursor-pointer"
                      >
                        <span>Activate Local Sandbox Mode</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                  {showResendVerification && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-2.5 animate-fadeIn">
                      <p className="font-semibold text-blue-800 font-sans">
                        Need a new verification link?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 group cursor-pointer disabled:opacity-50"
                      >
                        <span>{resending ? 'Resending Link...' : 'Resend Verification Email'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Sign-up Fields */}
              {isRegister && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Full Name</label>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Sarah Connor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ textTransform: 'none' }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Email Address</label>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium selection:bg-blue-100"
                  />
                </div>
                {email && /[A-Z]/.test(email) && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-1 animate-fadeIn">
                    ⚠️ Small letters only! Please use only lowercase letters.
                  </span>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Password</label>
                  {!isRegister ? (
                    <button 
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setErrorMsg(null); }}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleGenerateStrongPassword}
                      className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ⚡ Generate Password
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer flex items-center justify-center p-0.5 rounded"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && password && (
                  <div className="space-y-1 mt-1.5 animate-fadeIn">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Security Strength:</span>
                      <span className={
                        getPasswordStrength(password).score <= 2 ? 'text-rose-500' :
                        getPasswordStrength(password).score <= 4 ? 'text-amber-500' : 'text-emerald-500'
                      }>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                        style={{ width: `${(getPasswordStrength(password).score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {isRegister && (
                  <div className="mt-2.5 space-y-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 animate-fadeIn transition-all duration-300">
                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 select-none">
                      Password Requirements
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                      {[
                        { label: 'Min. 8 characters', satisfied: password.length >= 8 },
                        { label: 'Uppercase (A-Z)', satisfied: /[A-Z]/.test(password) },
                        { label: 'Lowercase (a-z)', satisfied: /[a-z]/.test(password) },
                        { label: 'Number (0-9)', satisfied: /[0-9]/.test(password) },
                        { label: 'Special character (!@#...)', satisfied: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
                      ].map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold transition-all duration-200 animate-fadeIn">
                          {rule.satisfied ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 transform scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="9" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
                            </svg>
                          )}
                          <span className={rule.satisfied ? 'text-emerald-600 dark:text-emerald-400 transition-colors duration-200' : 'text-rose-500 dark:text-rose-400 transition-colors duration-200'}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password field (Only during Registration) */}
              {isRegister && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-wide">Confirm Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ textTransform: 'none' }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100"
                    />
                  </div>

                  {confirmPassword && (
                    <div className={`mt-2 p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 animate-fadeIn ${
                      password === confirmPassword 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5' 
                        : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400 shadow-sm shadow-rose-500/5'
                    }`}>
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">Password matched</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 animate-pulse" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">Password mismatch</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox */}
              {!isRegister && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-0.5 select-none">
                  <input 
                    type="checkbox" 
                    id="keep-signed" 
                    defaultChecked
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="keep-signed" className="cursor-pointer">Keep me signed in for 30 days</label>
                </div>
              )}

              {/* Submit button with high-end loading feedback */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all active:scale-98 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Entering Staging Studio...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Register Account' : 'Enter the Studio'}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Mode Switcher */}
          {!isForgotPassword && (
            <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2.5">
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button 
                    onClick={() => { 
                      setIsRegister(false); 
                      setErrorMsg(null); 
                      setShowCreateAccountSuggest(false); 
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setFullName('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => { 
                      setIsRegister(true); 
                      setErrorMsg(null); 
                      setShowCreateAccountSuggest(false); 
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setFullName('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-800 dark:text-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
