'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  User,
  GraduationCap,
  Award,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';

export default function LoginPage() {
  const router = useRouter();

  // ==========================================
  // VIEW AND AUTH STATES
  // ==========================================
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreateAccountSuggest, setShowCreateAccountSuggest] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Pre-seed some emails on mount so existing credentials work out of the box
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('aptitude_registered_emails');
      if (!existing) {
        localStorage.setItem('aptitude_registered_emails', JSON.stringify([
          'sarah.c@aptitude-ai.com',
          'marcus.w@aptitude-ai.com',
          'sriram_neppalli@university.edu',
          'student@university.edu'
        ]));
      }
    }
  }, []);

  // Trigger temporary floating system notices
  const showNotice = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
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

    // Simulate recovery email submission with latency
    setTimeout(() => {
      showNotice(`A secure recovery link has been dispatched to ${email.trim()}.`, 'success');
      setLoading(false);
      setIsForgotPassword(false);
    }, 1000);
  };

  // ==========================================
  // SIGN IN / SIGN UP SUBMIT HANDLER
  // ==========================================
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Simulate network latency (500ms) for high-end loading feedback
    setTimeout(() => {
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
        const emailKey = email.trim().toLowerCase();
        
        // Retrieve registered emails list
        const registeredEmails = JSON.parse(
          localStorage.getItem('aptitude_registered_emails') || 
          '["sarah.c@aptitude-ai.com", "marcus.w@aptitude-ai.com", "sriram_neppalli@university.edu", "student@university.edu"]'
        );
        
        if (!registeredEmails.includes(emailKey)) {
          setErrorMsg('Account is not created.');
          setShowCreateAccountSuggest(true);
          setLoading(false);
          return;
        }

        // Differentiate role based on credential email (Focus Point)
        if (email.trim() === 'sarah.c@aptitude-ai.com') {
          const adminRole = USER_ROLES.find(r => r.role === 'admin') || USER_ROLES[0];
          localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
          router.push('/admin/dashboard');
        } else if (email.trim() === 'marcus.w@aptitude-ai.com') {
          const editorRole = USER_ROLES.find(r => r.role === 'editor') || USER_ROLES[1];
          localStorage.setItem('aptitude_current_role', JSON.stringify(editorRole));
          router.push('/admin/editor');
        } else {
          // Log in as standard student
          const studentRole = {
            role: 'STUDENT',
            name: email.split('@')[0].toUpperCase(),
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          };
          localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
          
          const completed = localStorage.getItem('aptitude_onboarding_completed');
          if (completed === 'true') {
            router.push('/student/dashboard');
          } else {
            router.push('/onboarding');
          }
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

        const registeredUser = {
          role: 'STUDENT',
          userType: '',
          name: fullName,
          email: email,
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
        };

        localStorage.setItem('aptitude_current_role', JSON.stringify(registeredUser));
        
        // Save new registered email to list
        const registeredEmails = JSON.parse(
          localStorage.getItem('aptitude_registered_emails') || 
          '["sarah.c@aptitude-ai.com", "marcus.w@aptitude-ai.com", "sriram_neppalli@university.edu", "student@university.edu"]'
        );
        const emailKey = email.trim().toLowerCase();
        if (!registeredEmails.includes(emailKey)) {
          registeredEmails.push(emailKey);
          localStorage.setItem('aptitude_registered_emails', JSON.stringify(registeredEmails));
        }
        
        // New account registers always go to onboarding
        localStorage.removeItem('aptitude_onboarding_completed');
        router.push('/onboarding');
      }
      setLoading(false);
    }, 600);
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
            <span className="font-extrabold tracking-tight text-xs text-white">THE LUCID INTELLECTUAL</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Aptitude Arena</span>
          </div>
        </Link>

        {/* Center Mission Statements */}
        <div className="space-y-6 z-10 my-auto">
          <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-900/40 px-3 py-1 rounded-full text-[9px] font-black text-blue-400 tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Staging release v2.4</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight uppercase">
            Master your <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Aptitude</span> with editorial precision.
          </h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
            Join the curated environment where architectural logic meets academic excellence. Your path to professional placement mastery begins here.
          </p>
        </div>

        {/* Footer: Floating Adaptive Curriculum Panel */}
        <div className="glassmorphism rounded-2xl p-4 border border-slate-800/80 z-10 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-900/40 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Adaptive Curriculum</span>
              <span className="text-[9px] text-slate-550 font-bold leading-none mt-0.5 uppercase tracking-wide">Trusted by top-tier faculty</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          RIGHT COLUMN: AUTHENTICATION FORM CARD
          ========================================== */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 min-h-screen relative">
        
        {/* Back link to Home */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>← Back to home</span>
        </Link>

        {/* Theme Toggle and Staging clearance indicator for user */}
        <div className="absolute top-6 right-6 sm:right-12 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
              Staging Sandbox Secure
            </span>
          </div>
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
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 leading-normal">
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
                onClick={() => showNotice("OAuth setup: Redirecting to Google Staging Clearance...", "info")}
                style={{ textTransform: 'none' }}
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-2.5 font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                {/* Inline dynamic colorful Chrome icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3 text-slate-350 dark:text-slate-750 select-none">
                <div className="h-px bg-slate-200/80 dark:bg-slate-800 flex-1" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-550">OR LOGIN WITH EMAIL</span>
                <div className="h-px bg-slate-200/80 dark:bg-slate-800 flex-1" />
              </div>
            </>
          )}

          {isForgotPassword ? (
            /* PASSWORD RECOVERY FORM */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              
              {/* Error Message */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed animate-fadeIn flex items-center gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-600" />
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium selection:bg-blue-100"
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
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all active:scale-98 mt-2"
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
                  <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed animate-fadeIn flex items-center gap-2">
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
                </div>
              )}

              {/* Dynamic Sign-up Fields */}
              {isRegister && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Sarah Connor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ textTransform: 'none' }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-600" />
                  <input 
                    type="email" 
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-medium selection:bg-blue-100"
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
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Password</label>
                  {!isRegister ? (
                    <button 
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setErrorMsg(null); }}
                      className="text-[10px] font-bold text-slate-455 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-600" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ textTransform: 'none' }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-305 cursor-pointer flex items-center justify-center p-0.5 rounded"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && password && (
                  <div className="space-y-1 mt-1.5 animate-fadeIn">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 dark:text-slate-550 uppercase tracking-wide">Security Strength:</span>
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
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 block leading-normal mt-1 animate-fadeIn font-semibold">
                    Password must be at least 8 characters, containing uppercase, numbers & symbols.
                  </span>
                )}
              </div>

              {/* Confirm Password field (Only during Registration) */}
              {isRegister && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-600" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ textTransform: 'none' }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {!isRegister && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-0.5 select-none">
                  <input 
                    type="checkbox" 
                    id="keep-signed" 
                    defaultChecked
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
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
            <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
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
