'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, CheckCircle, Clock, UserPlus, Activity, 
  TrendingUp, MoreHorizontal, ChevronDown, Sparkles, 
  Compass, HelpCircle, LogOut, ArrowUpRight, Check,
  Cpu, Layers, ShieldCheck, Database, FileText, ArrowRight
} from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { useAdmin } from '@/app/admin/AdminContext';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const { currentRole, handleRoleChange } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    liveUsers: 0,
    liveUsersLabel: '+0%',
    dailySolves: 0,
    dailySolvesLabel: '+0%',
    newSignups: 0,
    newSignupsLabel: '+0',
    activeSolvers: 0,
    avgSessionTime: '0m 0s'
  });

  const [progressionData, setProgressionData] = useState<Array<{day: string, value: number, height: string, isHigh: boolean}>>([]);
  const [saturationData, setSaturationData] = useState<Array<{topic: string, percent: number, color: string, shadow: string}>>([]);
  const [bottlenecks, setBottlenecks] = useState<Array<{id: string, name: string, difficulty: string, time: string, solveRate: string}>>([]);

  const fetchStats = async () => {
    try {
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const { count: solvesCount } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('is_correct', true);

      const totalSolves = solvesCount || 0;
      const totalUsers = profilesCount || 1;
      
      // Calculate a dynamic session time based on attempts (assuming ~2.5 mins per attempt)
      const avgMinutes = Math.floor((totalSolves * 2.5) / totalUsers);
      const avgSeconds = Math.floor(((totalSolves * 2.5) / totalUsers - avgMinutes) * 60);

      // Simple growth logic based on counts (in reality we would compare with yesterday's counts)
      const nowMs = Date.now();
      const yesterday = new Date(nowMs - 24 * 3600 * 1000).toISOString();
      const { count: usersYesterday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yesterday);
      const { count: solvesYesterday } = await supabase.from('question_attempts').select('*', { count: 'exact', head: true }).gte('created_at', yesterday);
      
      const newU = usersYesterday || 0;
      const newS = solvesYesterday || 0;
      
      const uGrowth = Math.max(1, totalUsers - newU);
      const sGrowth = Math.max(1, totalSolves - newS);

      const liveLabel = `+${Math.round((newU / uGrowth) * 100)}%`;
      const solveLabel = `+${Math.round((newS / sGrowth) * 100)}%`;
      const signLabel = `+${newU}`;

      setStats(prev => ({
        ...prev,
        liveUsers: profilesCount || 0,
        liveUsersLabel: liveLabel,
        dailySolves: totalSolves,
        dailySolvesLabel: solveLabel,
        newSignups: totalUsers,
        newSignupsLabel: signLabel,
        activeSolvers: profilesCount || 0,
        avgSessionTime: `${avgMinutes}m ${avgSeconds}s`
      }));
    } catch (e) {
      console.warn("Error fetching live stats", e);
    }
  };

  const fetchChartData = async () => {
    try {
      // 1. Dynamic User Progression (Strict DB count per day)
      const { data: weekAtts } = await supabase.from('question_attempts').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      weekAtts?.forEach((a: any) => {
        const d = new Date(a.created_at).getDay();
        counts[d]++;
      });
      
      const maxCount = Math.max(...counts, 1);
      
      // Shift so today is the last element
      const todayIdx = new Date().getDay();
      const prog = [];
      for (let i = 6; i >= 0; i--) {
        const idx = (todayIdx - i + 7) % 7;
        const val = counts[idx];
        prog.push({
          day: days[idx],
          value: val,
          height: `${Math.max(14, Math.floor((val / maxCount) * 100))}%`,
          isHigh: i === 0
        });
      }
      
      setProgressionData(prog);

      // 2. Domain Saturation
      const { data: atts } = await supabase.from('question_attempts').select('domain_id, is_correct').limit(2000);
      const domMap: Record<string, { t: number, c: number }> = {};
      atts?.forEach((a: any) => {
        const id = a.domain_id || 'general';
        if (!domMap[id]) domMap[id] = { t: 0, c: 0 };
        domMap[id].t++;
        if (a.is_correct) domMap[id].c++;
      });
      
      const getSat = (keys: string[]) => {
        let t = 0; keys.forEach(k => t += domMap[k]?.t || 0);
        return t > 0 ? Math.floor((t / (atts?.length || 1)) * 100) : 0;
      };

      setSaturationData([
        { topic: 'Quantitative Aptitude', percent: getSat(['q', 'quantitative']), color: 'bg-[#00ffcc]', shadow: 'shadow-[0_0_8px_#00ffcc]' },
        { topic: 'Logical Reasoning', percent: getSat(['l', 'logical']), color: 'bg-purple-500', shadow: 'shadow-[0_0_8px_#a855f7]' },
        { topic: 'Verbal Ability', percent: getSat(['v', 'verbal']), color: 'bg-indigo-500', shadow: 'shadow-[0_0_8px_#6366f1]' },
        { topic: 'Coding & DSA', percent: getSat(['c', 'coding']), color: 'bg-slate-500', shadow: '' }
      ].sort((a, b) => b.percent - a.percent));

      // 3. Bottlenecks (Worst questions)
      // Real DB query for most failed questions
      const { data: failedAtts } = await supabase.from('question_attempts').select('question_id, time_taken_seconds').eq('is_correct', false).limit(100);
      if (!failedAtts || failedAtts.length === 0) {
        setBottlenecks([]);
      } else {
        const counts: Record<string, number> = {};
        const times: Record<string, number[]> = {};
        failedAtts.forEach((a: any) => {
          if (!a.question_id) return;
          counts[a.question_id] = (counts[a.question_id] || 0) + 1;
          if (a.time_taken_seconds) {
            if (!times[a.question_id]) times[a.question_id] = [];
            times[a.question_id].push(a.time_taken_seconds);
          }
        });
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        
        setBottlenecks(sorted.map(s => {
          const qTimes = times[s[0]] || [120];
          const avgSecs = Math.floor(qTimes.reduce((a, b) => a + b, 0) / qTimes.length);
          const m = Math.floor(avgSecs / 60);
          const sec = avgSecs % 60;
          return {
            id: `#Q-${s[0].substring(0, 4)}`,
            name: 'System Designated Complex Problem',
            difficulty: s[1] > 10 ? 'Lethal' : 'Elite',
            time: `${m}m ${sec}s`,
            solveRate: '0.0%'
          };
        }));
      }
    } catch (e) {
      console.warn('Error fetching chart data', e);
    }
  };

  useEffect(() => {
    // Sync current role from localStorage
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) handleRoleChange(matched);
      } catch (e) { localStorage.removeItem('aptitude_current_role'); localStorage.removeItem('aptitude_questions'); }
    }

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isMarcus = session.user.email === 'marcus.w@aptitude-ai.com';
        const role = isMarcus ? 'editor' : 'admin';
        const matched = USER_ROLES.find(r => r.role === role);
        if (matched) {
          handleRoleChange(matched);
          localStorage.setItem('aptitude_current_role', JSON.stringify(matched));
        }
      }
    };
    syncSession();
    fetchStats();
    fetchChartData();

    // Set up Supabase Realtime subscriptions
    const channel = supabase.channel('dashboard-metrics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'question_attempts' }, (payload: any) => {
        // Increment daily solves live
        setStats(prev => ({
          ...prev,
          dailySolves: prev.dailySolves + 1
        }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
        // Increment users live
        setStats(prev => ({
          ...prev,
          liveUsers: prev.liveUsers + 1,
          newSignups: prev.newSignups + 1
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchStats(), fetchChartData()]).then(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    });
  };

  return (
    <>
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
                        {stats.liveUsersLabel}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">
                        {stats.liveUsers.toLocaleString()}
                      </h3>
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
                        {stats.dailySolvesLabel}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">
                        {(stats.dailySolves / 1000).toFixed(1)}k
                      </h3>
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
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">{stats.avgSessionTime}</h3>
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
                        {stats.newSignupsLabel}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight mt-3">
                        {stats.newSignups.toLocaleString()}
                      </h3>
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

                      {progressionData.length > 0 ? progressionData.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div 
                            className={`w-full rounded-lg transition-all duration-500 relative ${
                              d.isHigh 
                                ? 'bg-gradient-to-t from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-400/40' 
                                : 'bg-[#151c2f] hover:bg-slate-700'
                            }`}
                            style={{ height: d.height }}
                          >
                            <span className={`absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md ${
                              d.isHigh 
                                ? 'bg-[#090d16] border border-purple-500/40 text-purple-300' 
                                : 'bg-slate-900 border border-[#151c2f] text-white'
                            }`}>
                              {d.value}%
                            </span>
                          </div>
                          <span className={`text-[9px] uppercase ${d.isHigh ? 'font-black text-purple-400' : 'font-extrabold text-slate-500'}`}>
                            {d.day}
                          </span>
                        </div>
                      )) : (
                        <div className="w-full flex items-center justify-center text-slate-500 text-xs font-bold animate-pulse">Loading trajectory...</div>
                      )}

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
                      
                      {saturationData.length > 0 ? saturationData.map((d, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">{d.topic}</span>
                            <span className="font-black" style={{ color: d.color.replace('bg-', '').replace('[', '').replace(']', '') }}>{d.percent}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${d.color} rounded-full ${d.shadow} transition-all duration-1000`} style={{ width: `${d.percent}%` }} />
                          </div>
                        </div>
                      )) : (
                        <div className="w-full flex flex-col justify-center gap-6">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-1.5 animate-pulse">
                              <div className="flex justify-between">
                                <div className="h-3 w-24 bg-slate-800 rounded" />
                                <div className="h-3 w-8 bg-slate-800 rounded" />
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full" />
                            </div>
                          ))}
                        </div>
                      )}

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
                        {bottlenecks.length > 0 ? bottlenecks.map((b, i) => (
                          <tr key={i} className="hover:bg-[#151c2f]/20 transition-colors duration-150">
                            <td className="py-4 text-xs font-semibold text-slate-500">{b.id}</td>
                            <td className="py-4 text-xs font-bold text-slate-200">{b.name}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                                b.difficulty === 'Lethal' 
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              }`}>
                                {b.difficulty}
                              </span>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-400 text-center">{b.time}</td>
                            <td className="py-4 text-xs font-extrabold text-orange-400 text-center">{b.solveRate}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-500 animate-pulse">Loading bottlenecks...</td>
                          </tr>
                        )}
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
                          <span className="text-sm font-black text-white">+{stats.newSignups.toLocaleString()}</span>
                          <span className="text-[9px] font-extrabold text-emerald-400">+0%</span>
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
                          <span className="text-sm font-black text-white">${((stats.newSignups * 49) / 1000).toFixed(1)}k</span>
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
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Global Accuracy</p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                          <span className="text-sm font-black text-white">{saturationData.length > 0 ? Math.floor(saturationData.reduce((acc, curr) => acc + curr.percent, 0) / saturationData.length) : 0}%</span>
                          <span className="text-[9px] font-extrabold text-emerald-400">+2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Elite Tier card removed to keep right column clean */}

              </div>

            </div>

          </div>
        )}
    </>
  );
}
