'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, ShieldCheck, Database, RefreshCw, Cpu, Server, 
  AlertTriangle, AlertOctagon, TrendingUp, Clock, HardDrive, Wifi, Eye
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

export default function SystemHealthPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [timeFilter, setTimeFilter] = useState<'1H' | '24H'>('24H');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const handleRefreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="system-health" userRole={currentRole.role} />

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
                    <span className="text-slate-300 font-bold font-mono text-[11px]">/admin/system-health</span>
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
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#151c2f] pb-5">
              <div>
                <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase leading-none">
                  System Health
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase font-heading mt-1">
                  Monitor Infrastructure
                </h1>
              </div>

              {/* Status Header Badge & Refresh */}
              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2 bg-[#0c1921] border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Operational</span>
                </div>

                <button 
                  onClick={handleRefreshStats}
                  disabled={isRefreshing}
                  className="p-2.5 bg-[#0f1322] hover:bg-[#151c2f] border border-[#151c2f] text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  title="Refresh Diagnostics"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Row 1: Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Database Load */}
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5.5 space-y-4 hover:border-purple-500/10 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Database Load</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    Optimal
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">34%</span>
                  <span className="text-[10px] font-extrabold text-emerald-400">+2%</span>
                </div>

                <div className="w-full bg-[#070a13] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[34%]" />
                </div>
              </div>

              {/* Card 2: API Latency */}
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5.5 space-y-4 hover:border-purple-500/10 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">API Latency</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    Warning
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">124ms</span>
                  <span className="text-[10px] font-extrabold text-amber-400">+18ms</span>
                </div>

                <div className="w-full bg-[#070a13] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[65%]" />
                </div>
              </div>

              {/* Card 3: Storage Usage */}
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5.5 space-y-4 hover:border-purple-500/10 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Storage Usage</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                    Stable
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">68%</span>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Available: 4.2 TB</span>
                </div>

                <div className="w-full bg-[#070a13] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[68%]" />
                </div>
              </div>

            </div>

            {/* Row 2: Server Load & Live Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Server Load (Left 2/3) */}
              <div className="lg:col-span-2 bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between group">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Server Load
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Last 24 hours distribution
                    </p>
                  </div>
                  
                  {/* Toggle Filters */}
                  <div className="flex bg-[#070a13] p-1 rounded-xl border border-[#151c2f] text-[9px] font-black uppercase tracking-wider">
                    <button 
                      onClick={() => setTimeFilter('1H')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${timeFilter === '1H' ? 'bg-[#151c2f] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      1H
                    </button>
                    <button 
                      onClick={() => setTimeFilter('24H')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${timeFilter === '24H' ? 'bg-[#151c2f] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      24H
                    </button>
                  </div>
                </div>

                {/* SVG Graph for Server Load */}
                <div className="relative w-full mt-4 min-h-[160px] flex items-end">
                  <div className="absolute top-2 left-0 text-[9px] font-black text-purple-400 uppercase tracking-widest">
                    Peak: 88%
                  </div>
                  
                  <svg className="w-full h-40" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Area path */}
                    <path 
                      d="M 0 160 Q 60 120 120 150 T 240 160 T 360 80 T 440 140 Q 470 150 500 132 L 500 200 L 0 200 Z" 
                      fill="url(#loadGrad)" 
                    />
                    
                    {/* Stroke path */}
                    <path 
                      d="M 0 160 Q 60 120 120 150 T 240 160 T 360 80 T 440 140 Q 470 150 500 132" 
                      fill="none" 
                      stroke="#a855f7" 
                      strokeWidth="2.5" 
                      className="drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    />
                    
                    {/* Indicator dots */}
                    <circle cx="360" cy="80" r="4.5" fill="#a855f7" />
                    <circle cx="360" cy="80" r="2.5" fill="#fff" />
                  </svg>
                  
                  <div className="absolute bottom-2 right-0 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Current: 34%
                  </div>
                </div>
              </div>

              {/* Live Status (Right 1/3) */}
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between">
                <div className="border-b border-[#151c2f] pb-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Live Status
                  </h3>
                </div>
                
                <div className="space-y-4 py-4 flex-1 flex flex-col justify-center">
                  
                  {/* Status Item 1 */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span>Redis Cache</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
                  </div>

                  {/* Status Item 2 */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7] animate-pulse" />
                      <span>Search Engine</span>
                    </div>
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider">Optimizing</span>
                  </div>

                  {/* Status Item 3 */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span>CDN Distribution</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
                  </div>

                  {/* Status Item 4 */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span>Auth Service</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
                  </div>

                </div>

                <button className="w-full py-2.5 bg-[#151c2f]/45 hover:bg-[#1b233a] border border-[#151c2f] text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center">
                  View All Nodes
                </button>
              </div>

            </div>

            {/* Row 3: Security & System Alerts */}
            <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-[#151c2f] pb-3">
                Security & System Alerts
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                
                {/* Alert Card 1: Critical Errors */}
                <div className="bg-[#070a13]/80 border-l-4 border-emerald-500 p-4.5 rounded-xl flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <AlertOctagon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Critical Errors</span>
                    <span className="text-xs font-bold text-white mt-1 leading-normal">None detected</span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1">Last scan performed 2 minutes ago</span>
                  </div>
                </div>

                {/* Alert Card 2: Warnings */}
                <div className="bg-[#070a13]/80 border-l-4 border-amber-500 p-4.5 rounded-xl flex items-start gap-4 hover:border-amber-400 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Warnings (1 Active)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    </div>
                    <span className="text-xs font-bold text-white mt-1 leading-normal truncate">
                      Higher than usual latency in Asia-East node
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1">Spike observed at 14:22 UTC</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Row 4: Response Time SVG Graph */}
            <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Response Time
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Global edge average response times
                </p>
              </div>

              {/* Emerald/Teal Line SVG */}
              <div className="relative w-full min-h-[160px] flex items-end">
                <svg className="w-full h-40" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00ffcc" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="100" x2="1000" y2="100" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#151c2f" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Area fill */}
                  <path 
                    d="M 0 150 Q 150 80 300 130 T 600 100 T 800 120 Q 900 60 1000 110 L 1000 200 L 0 200 Z" 
                    fill="url(#tealGrad)" 
                  />
                  
                  {/* Line stroke */}
                  <path 
                    d="M 0 150 Q 150 80 300 130 T 600 100 T 800 120 Q 900 60 1000 110" 
                    fill="none" 
                    stroke="#00ffcc" 
                    strokeWidth="2.5" 
                    className="drop-shadow-[0_0_8px_rgba(0,255,204,0.4)]"
                  />
                  
                  {/* Edge node active ping dot */}
                  <circle cx="600" cy="100" r="5" fill="#00ffcc" className="animate-ping" />
                  <circle cx="600" cy="100" r="3" fill="#00ffcc" />
                </svg>
              </div>

              {/* Bottom statistics panel */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#151c2f]/60 text-center uppercase tracking-wider font-heading">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-500">Average</span>
                  <span className="text-lg font-black text-white mt-1">42ms</span>
                </div>
                <div className="flex flex-col items-center border-x border-[#151c2f]/60">
                  <span className="text-[9px] font-black text-slate-500">Peak</span>
                  <span className="text-lg font-black text-white mt-1">118ms</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-500">95th Percentile</span>
                  <span className="text-lg font-black text-white mt-1">84ms</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
