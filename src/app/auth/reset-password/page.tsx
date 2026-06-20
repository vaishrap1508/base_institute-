'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Layers, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { siteConfig } from '@/config/site';
import { supabase } from '@/lib/supabase';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dynamic branding logo configuration
  const [logoText, setLogoText] = useState(siteConfig.logoText);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('aptitude_landing_page_settings');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.header_logo_text) setLogoText(parsed.header_logo_text);
        } catch (_) {}
      }
    }

    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_page_settings')
          .select('header_logo_text')
          .eq('id', 'current')
          .single();

        if (data && !error) {
          if (data.header_logo_text) setLogoText(data.header_logo_text);

          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('aptitude_landing_page_settings');
            let parsed = {};
            if (localData) {
              try { parsed = JSON.parse(localData); } catch (_) {}
            }
            localStorage.setItem('aptitude_landing_page_settings', JSON.stringify({
              ...parsed,
              header_logo_text: data.header_logo_text
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch branding from Supabase:", err);
      }
    };

    fetchBranding();
  }, []);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid password recovery request: missing token parameter.');
    }
  }, [token]);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrorMsg('Unable to reset password: recovery token is missing.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    // Complexity checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMsg('Password does not meet the complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to update your password.');
      } else {
        showNotice(data.message || 'Password updated successfully!', 'success');
        setTimeout(() => {
          router.push('/login?reset=true');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 sm:p-12 relative font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-300">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      
      {/* Floating System Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 max-w-sm animate-scaleUp ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="p-1 rounded-md bg-white/40 shrink-0">
            {notification.type === 'success' ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          </div>
          <span className="text-xs font-bold leading-normal">{notification.text}</span>
        </div>
      )}

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <Layers className="w-5 h-5" />
        </div>
        <span className="font-extrabold tracking-tight text-xs text-slate-800 dark:text-slate-200">{logoText}</span>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-10 space-y-6 animate-scaleUp z-10 transition-colors duration-300">
        
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Configure New Password</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-normal">
            Enter a secure password to replace your previous credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed animate-fadeIn flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer flex items-center justify-center p-0.5 rounded"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {password && (
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

            <div className="mt-2.5 space-y-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-3 animate-fadeIn">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
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
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold">
                    {rule.satisfied ? (
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
                      </svg>
                    )}
                    <span className={rule.satisfied ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-wide">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-600" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors font-mono selection:bg-blue-100 disabled:opacity-50"
              />
            </div>

            {confirmPassword && (
              <div className={`mt-2 p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-300 animate-fadeIn ${
                password === confirmPassword 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400'
              }`}>
                {password === confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">Password matched</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">Password mismatch</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token || password !== confirmPassword}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-all active:scale-98 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Reset Account Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
      
      {/* Theme Toggle overlay */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-800 dark:text-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
