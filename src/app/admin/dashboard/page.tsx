'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Activity, Users, Database, FileText, CheckCircle2, TrendingUp, ArrowRight, Server, Clock, Cpu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole, Question } from '@/lib/admin/types';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Sync current role from localStorage
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) setCurrentRole(matched);
      } catch (e) {
        console.warn(e);
      }
    }

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isMarcus = session.user.email === 'marcus.w@aptitude-ai.com';
        const role = isMarcus ? 'editor' : 'admin';
        const matched = USER_ROLES.find(r => r.role === role);
        if (matched) {
          setCurrentRole(matched);
          localStorage.setItem('aptitude_current_role', JSON.stringify(matched));
        }
      }
    };
    syncSession();

    // Sync questions
    const storedQuestions = localStorage.getItem('aptitude_questions');
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (e) {
        setQuestions(SAMPLE_QUESTIONS);
      }
    } else {
      setQuestions(SAMPLE_QUESTIONS);
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const totalQuestions = questions.length;
  const publishedQuestions = questions.filter(q => q.status === 'Published').length;
  const draftQuestions = questions.filter(q => q.status === 'Draft' || !q.status).length;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="dashboard" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Page Title */}
            <div className="border-b border-slate-200/60 dark:border-slate-900 pb-5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Command Dashboard</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Real-time operational status, taxonomy growth metrics, and global analytics overview.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm dark:hover:shadow-blue-900/5 transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Total Stored Questions</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{totalQuestions}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm dark:hover:shadow-emerald-900/5 transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Published Questions</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-1">{publishedQuestions}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm dark:hover:shadow-amber-900/5 transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Active Student Sessions</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tight mt-1">1,482</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm dark:hover:shadow-purple-900/5 transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">System Latency</span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-400 tracking-tight mt-1">14ms</span>
                </div>
              </div>
            </div>

            {/* Main Visual Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Operational Metrics Panel */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">System Performance Curve</h3>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 uppercase tracking-wider">LIVE TELEMETRY</span>
                </div>

                 {/* Aesthetic Inline Graph */}
                <div className="h-72 pt-10 flex items-end justify-between gap-2 px-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800 rounded-xl p-4 relative overflow-visible">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-40">
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                  </div>

                  {/* High Fidelity Bars representing growth */}
                  <div className="w-full flex items-end justify-around h-full z-10">
                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all rounded-t-md w-full h-16 shadow-md shadow-blue-500/10 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">24%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">MON</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all rounded-t-md w-full h-28 shadow-md shadow-blue-500/10 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">42%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">TUE</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all rounded-t-md w-full h-36 shadow-md shadow-blue-500/10 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">55%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">WED</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all rounded-t-md w-full h-44 shadow-md shadow-blue-500/10 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">70%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">THU</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all rounded-t-md w-full h-52 shadow-md shadow-blue-500/15 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">85%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">FRI</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all rounded-t-md w-full h-48 shadow-md shadow-blue-500/15 cursor-pointer group relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">78%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">SAT</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-8">
                      <div className="bg-gradient-to-t from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all rounded-t-md w-full h-56 shadow-md shadow-emerald-500/15 cursor-pointer group relative animate-pulse">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 font-bold shadow-md border border-slate-800 whitespace-nowrap">98%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500">SUN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log Feed */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Staging Audit Logs</h3>
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">REALTIME</span>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex flex-col text-xs leading-normal">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Sarah Connor (Admin)</span>
                      <span className="text-slate-500 dark:text-slate-400">Synced question catalog to localStorage.</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">2 minutes ago</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="flex flex-col text-xs leading-normal">
                      <span className="font-bold text-slate-800 dark:text-slate-100">System Compiler</span>
                      <span className="text-slate-500 dark:text-slate-400">Recompiled LaTeX formula engine successfully.</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">15 minutes ago</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="flex flex-col text-xs leading-normal">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Marcus Wright (Editor)</span>
                      <span className="text-slate-500 dark:text-slate-400">Saved draft for percentage sequence V-4432-E.</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">45 minutes ago</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex flex-col text-xs leading-normal">
                      <span className="font-bold text-slate-800 dark:text-slate-100">Security Guard</span>
                      <span className="text-slate-500 dark:text-slate-400">Completed full sandbox workspace build encryption.</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">2 hours ago</span>
                    </div>
                  </div>
                </div>

                <a
                  href="/admin/directory"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all mt-4 cursor-pointer"
                >
                  <span>Go to Question Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
