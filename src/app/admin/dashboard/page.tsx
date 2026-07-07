'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, CheckCircle, Clock, UserPlus, Activity, 
  TrendingUp, MoreHorizontal, ChevronDown, Sparkles, 
  Compass, HelpCircle, LogOut, ArrowUpRight, Check,
  Cpu, Layers, ShieldCheck, Database, FileText, ArrowRight
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [refreshing, setRefreshing] = useState(false);

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
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="dashboard" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070a13]">
            <div className="w-full max-w-xl bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-white uppercase tracking-wider font-heading">Clearance Protocol Violation</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-[#070a13] border border-[#151c2f] p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-[#151c2f] pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-950/45 text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-200 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-300 font-bold font-mono text-[11px]">/admin/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-purple-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#070a13] custom-scrollbar">
            
            {/* Top Overview and Title Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#151c2f] pb-5">
              <div>
                <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase leading-none">
                  Executive Overview
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase font-heading mt-1">
                  System Performance
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0d1323] hover:bg-[#151c2f] text-slate-300 border border-[#151c2f] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                  <span>Download Report</span>
                </button>
                <button 
                  onClick={handleRefresh}
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/10 cursor-pointer ${refreshing ? 'opacity-85 animate-pulse' : ''}`}
                >
                  <Activity className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>System Refresh</span>
                </button>
              </div>
            </div>

            {/* Layout Grid: 2-Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Column: Metrics Row + Row 2 (Charts) + Table (width: 75% or 3 spans) */}
              <div className="lg:col-span-3 space-y-6 flex flex-col">
                
                {/* 5-Column Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  
                  {/* Card 1: Live Users */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                        <Monitor className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        +12%
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">1,284</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Live Users</p>
                    </div>
                    {/* Teal indicator bar */}
                    <div className="w-full h-1 bg-emerald-500/10 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-3/4 rounded-full" />
                    </div>
                  </div>

                  {/* Card 2: Daily Solves */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all">
                        <CheckCircle className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        +5.2%
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">42.5k</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Daily Solves</p>
                    </div>
                    {/* Mini horizontal bar representation */}
                    <div className="flex items-end justify-between gap-1 h-3 mt-3 w-16">
                      <div className="w-1.5 h-1.5 bg-purple-500/40 rounded-full" />
                      <div className="w-1.5 h-2 bg-purple-500/60 rounded-full" />
                      <div className="w-1.5 h-2.5 bg-purple-500/80 rounded-full" />
                      <div className="w-1.5 h-3 bg-purple-400 rounded-full" />
                      <div className="w-1.5 h-2 bg-purple-500/60 rounded-full" />
                    </div>
                  </div>

                  {/* Card 3: Avg Session Time */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-[#151c2f]">
                        ~0.4s
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">18m 42s</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Session Time</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Tracking Active</span>
                    </div>
                  </div>

                  {/* Card 4: New Signups */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all">
                        <UserPlus className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        +240
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">1,402</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">New Signups</p>
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 mt-3 flex justify-between items-center w-full">
                      <span>Target: 2,000</span>
                      <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 w-2/3" />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: System Health */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-center justify-between border-b border-[#151c2f] pb-1.5 shrink-0">
                      <span className="text-[9px] font-black text-cyan-400 tracking-wider uppercase leading-none">
                        System Health
                      </span>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-3.5 my-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">DB Cluster</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">API Engine</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">S3 Storage</span>
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Row 2: User Progression + Topic Saturation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* User Progression Card (Bar Chart) */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between h-96">
                    <div className="flex justify-between items-center border-b border-[#151c2f] pb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                          User Progression
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Monthly growth trajectory
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#070a13] border border-[#151c2f] rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer">
                        <span>Last 30 Days</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chart visual */}
                    <div className="flex-1 flex items-end justify-between gap-3 pt-6 relative">
                      {/* Grid guideline horizontal lines */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-10">
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                      </div>

                      {/* Bar 1: Mon */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-24 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">24%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Mon</span>
                      </div>

                      {/* Bar 2: Tue */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-36 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">42%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Tue</span>
                      </div>

                      {/* Bar 3: Wed */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-28 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">31%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Wed</span>
                      </div>

                      {/* Bar 4: Thu */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-40 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">55%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Thu</span>
                      </div>

                      {/* Bar 5: Fri - HIGHLIGHTED */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-indigo-600 rounded-lg h-56 transition-all duration-300 relative shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-400/40">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#090d16] border border-purple-500/40 text-purple-300 text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-lg">82%</span>
                        </div>
                        <span className="text-[9px] font-black text-purple-400 uppercase">Fri</span>
                      </div>

                      {/* Bar 6: Sat */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-18 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">18%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Sat</span>
                      </div>

                      {/* Bar 7: Sun */}
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-[#151c2f] hover:bg-slate-700 rounded-lg h-14 transition-all duration-300 relative">
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-[#151c2f] text-white text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md">12%</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase">Sun</span>
                      </div>

                    </div>
                  </div>

                  {/* Topic Saturation Card */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between h-96">
                    <div className="flex justify-between items-center border-b border-[#151c2f] pb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                          Domain Saturation
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Engagement by category
                        </p>
                      </div>
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded-lg cursor-pointer">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Saturation categories */}
                    <div className="flex-1 flex flex-col justify-around py-4">
                      
                      {/* Topic 1 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">Quantitative Aptitude</span>
                          <span className="text-[#00ffcc] font-black">84%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00ffcc] rounded-full shadow-[0_0_8px_#00ffcc] w-[84%]" />
                        </div>
                      </div>

                      {/* Topic 2 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">Logical Reasoning</span>
                          <span className="text-purple-400 font-black">72%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7] w-[72%]" />
                        </div>
                      </div>

                      {/* Topic 3 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">Verbal Ability</span>
                          <span className="text-indigo-400 font-black">48%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-[48%]" />
                        </div>
                      </div>

                      {/* Topic 4 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">Coding & DSA</span>
                          <span className="text-slate-400 font-black">31%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500 rounded-full w-[31%]" />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Bottom Row: Bottleneck Finder Table */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#151c2f] pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                        Bottleneck Finder
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Low-performing curriculum segments
                      </p>
                    </div>
                    
                    <a 
                      href="/admin/directory" 
                      className="flex items-center gap-1 text-[11px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors"
                    >
                      <span>View Full Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#151c2f]">
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-24">ID</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Question Description</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28">Difficulty</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28 text-center">Avg. Time</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28 text-center">Solve %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#151c2f]">
                        {/* Row 1 */}
                        <tr className="hover:bg-[#151c2f]/20 transition-colors duration-150">
                          <td className="py-4 text-xs font-semibold text-slate-500">#C-103</td>
                          <td className="py-4 text-xs font-bold text-slate-200">Generate Parentheses via Combinatorial Backtracking</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              Lethal
                            </span>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-400 text-center">04m 12s</td>
                          <td className="py-4 text-xs font-extrabold text-orange-400 text-center">12.4%</td>
                        </tr>

                        {/* Row 2 */}
                        <tr className="hover:bg-[#151c2f]/20 transition-colors duration-150">
                          <td className="py-4 text-xs font-semibold text-slate-500">#L-202-CA</td>
                          <td className="py-4 text-xs font-bold text-slate-200">Circular Seating Arrangements & Opposites Logic</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Elite
                            </span>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-400 text-center">02m 45s</td>
                          <td className="py-4 text-xs font-extrabold text-orange-400 text-center">18.9%</td>
                        </tr>

                        {/* Row 3 */}
                        <tr className="hover:bg-[#151c2f]/20 transition-colors duration-150">
                          <td className="py-4 text-xs font-semibold text-slate-500">#Q-6201-H</td>
                          <td className="py-4 text-xs font-bold text-slate-200">Modular Exponent Remainders & Unit Digit Cyclicity</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Elite
                            </span>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-400 text-center">03m 02s</td>
                          <td className="py-4 text-xs font-extrabold text-orange-400 text-center">24.1%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Weekly Summary + Recommendations + Elite Tier (width: 25% or 1 span) */}
              <div className="lg:col-span-1 space-y-6 flex flex-col">
                
                {/* Weekly Summary */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-[#151c2f] pb-3.5 font-heading">
                    Weekly Summary
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-8.5 h-8.5 rounded-lg bg-slate-800 border border-[#151c2f] flex items-center justify-center text-slate-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">New Enrollments</p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                          <span className="text-sm font-black text-white">+1,420</span>
                          <span className="text-[9px] font-extrabold text-emerald-400">+20%</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-8.5 h-8.5 rounded-lg bg-[#0e2c28] border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Gross Revenue</p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                          <span className="text-sm font-black text-white">$124.5k</span>
                          <span className="text-[9px] font-extrabold text-emerald-400">+8%</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-8.5 h-8.5 rounded-lg bg-slate-800 border border-[#151c2f] flex items-center justify-center text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Completion Rate</p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                          <span className="text-sm font-black text-white">68.2%</span>
                          <span className="text-[9px] font-extrabold text-emerald-400">+2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#151c2f] pb-3.5">
                    <Compass className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Recommendations
                    </h3>
                  </div>

                  <div className="space-y-4.5">
                    {/* Recommendation 1 */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                        Content Strategy
                      </span>
                      <p className="text-xs text-slate-300 leading-normal font-semibold">
                        Consider subdividing QM-092. Drop-off rate is peaking at the 3-minute mark.
                      </p>
                    </div>

                    {/* Recommendation 2 */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider">
                        Marketing Pivot
                      </span>
                      <p className="text-xs text-slate-300 leading-normal font-semibold">
                        Engagement is highest in the 25-34 demographic on Tuesdays. Sync email drips.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Elite Tier card removed to keep right column clean */}

              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
